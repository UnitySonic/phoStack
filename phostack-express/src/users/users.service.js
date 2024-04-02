require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'local'}` });
const { pool } = require('../db');
const { getManagementClient } = require('../middleware/auth0.middleware');

const saveUserToDb = async (user = {}) => {
  const {
    userId = null,
    firstName = null,
    lastName = null,
    userType = null,
    email = null,
    picture = null,
    userStatus = 'active',
    organizations = null,
    selectedOrgId = null,
  } = user;

  let connection;
  try {
    connection = await pool.getConnection();
    connection.beginTransaction();

    await connection.execute(
      'INSERT INTO `User` (userId, firstName, lastName, userType, email, picture, userStatus, viewAs, selectedOrgId) \
      VALUES (?,?,?,?,?,?,?,?,?)',
      [
        userId,
        firstName,
        lastName,
        userType,
        email,
        picture,
        userStatus,
        userId,
        selectedOrgId,
      ]
    );

    if (organizations && organizations.length > 0) {
      const placeholders = organizations.map(() => '(?, ?)').join(', ');
      const organizationValues = organizations.flatMap((orgId) => [
        userId,
        orgId,
      ]);

      const query = `INSERT INTO \`User_Organization\` (userId, orgId) VALUES ${placeholders}`;

      await connection.execute(query, organizationValues);
    }

    await connection.commit();
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const getUsersFromDb = async (params = {}) => {
  const { offset = 0, limit = 10000, filters = {} } = params;
  const numericOffset = +offset;
  const numericLimit = +limit;
  let connection;
  try {
    connection = await pool.getConnection();
    connection.beginTransaction();

    // Constructing WHERE clause based on filters
    let whereClause = '';
    const filterKeys = Object.keys(filters);
    if (filterKeys.length > 0) {
      whereClause = '';
      filterKeys.forEach((key, index) => {
        let sqlKey = key;
        if (key == 'orgId') {
          sqlKey = 'O.orgId';
        }
        whereClause += `${sqlKey} = ?`;
        if (index < filterKeys.length - 1) {
          whereClause += ' AND ';
        }
      });
    }

    const query = `
      SELECT U.*, 
      UO.createdAt as joinDate, 
      UO.pointValue, 
      O.orgId, 
      O.orgName, 
      O.orgDescription, 
      O.dollarPerPoint, 
      O.orgStatus,
      O.createdAt as orgCreatedAt
      FROM User U
      LEFT JOIN User_Organization UO ON U.userId = UO.userId
      LEFT JOIN Organization O ON UO.orgId = O.orgId
      WHERE (memberStatus = 'active' OR memberStatus IS NULL)
      ${whereClause ? `AND ${whereClause}` : whereClause}
      LIMIT ?, ?`;

    const [results] = await connection.query(query, [
      ...Object.values(filters),
      numericOffset,
      numericLimit,
    ]);

    const usersWithOrgs = results.reduce((acc, user) => {
      const existingUser = acc.find((u) => u.userId === user.userId);
      const orgData = {
        orgId: user.orgId,
        orgName: user.orgName,
        orgDescription: user.orgDescription,
        dollarPerPoint: user.dollarPerPoint,
        orgStatus: user.orgStatus,
        joinDate: user.joinDate,
        pointValue: user.pointValue,
      };

      const userData = {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        email: user.email,
        createdAt: user.createdAt,
        picture: user.picture,
        userStatus: user.userStatus,
        selectedOrgId: user.selectedOrgId,
        viewAs: user.viewAs,
      };

      if (existingUser) {
        existingUser.organizations.push(orgData);
      } else {
        acc.push({
          ...userData,
          organizations: user.orgId ? [orgData] : [],
        });
      }
      return acc;
    }, []);

    await connection.commit();
    return usersWithOrgs;
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const getUserFromDbById = async (userId) => {
  let connection;
  try {
    connection = await pool.getConnection();
    connection.beginTransaction();

    const [results] = await connection.execute(
      `SELECT U.*, 
      UO.createdAt as joinDate, 
      UO.pointValue,
      O.orgId, 
      O.orgName, 
      O.orgDescription, 
      O.dollarPerPoint, 
      O.orgStatus, 
      O.createdAt as orgCreatedAt
      FROM User U
      LEFT JOIN User_Organization UO ON U.userId = UO.userId
      LEFT JOIN Organization O ON UO.orgId = O.orgId
      WHERE (memberStatus = 'active' OR memberStatus IS NULL) AND U.userId = ?`,
      [userId]
    );

    if (results.length === 0) {
      throw new Error('User not found');
    }

    await connection.commit();

    const userWithOrgs = {
      userId: results[0].userId,
      firstName: results[0].firstName,
      lastName: results[0].lastName,
      userType: results[0].userType,
      email: results[0].email,
      createdAt: results[0].createdAt,
      picture: results[0].picture,
      userStatus: results[0].userStatus,
      selectedOrgId: results[0].selectedOrgId,
      viewAs: results[0].viewAs,
      createdAt: results[0].createdAt,

      organizations: results[0].orgId
        ? results.map((row) => ({
            orgId: row.orgId,
            orgName: row.orgName,
            orgDescription: row.orgDescription,
            dollarPerPoint: row.dollarPerPoint,
            orgStatus: row.orgStatus,
            createdAt: row.orgCreatedAt,
            joinDate: row.joinDate,
            pointValue: row.pointValue,
          }))
        : [],
    };

    return userWithOrgs;
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const modifyUserInDb = async (userId, user = {}) => {
  const {
    firstName = null,
    lastName = null,
    userType = null,
    email = null,
    picture = null,
    userStatus = null,
    selectedOrgId = null,
    viewAs = null,
    points = null,
    organizations = null,
  } = user;

  let connection;
  try {
    connection = await pool.getConnection();
    connection.beginTransaction();

    // Retrieve current user information
    const [currentUserResults] = await connection.execute(
      'SELECT * FROM User WHERE userId = ? LIMIT 1',
      [userId]
    );

    if (currentUserResults.length === 0) {
      throw new Error('User not found');
    }

    const currentUser = currentUserResults[0];

    const statusChanged = userStatus && currentUser.userStatus != userStatus;
    if (statusChanged) {
      await changeBlockStatusInAuth0(userId, userStatus == 'inactive');
    }

    const updateFields = [];
    const updateValues = [];

    if (firstName !== null) {
      updateFields.push('firstName = ?');
      updateValues.push(firstName);
    }
    if (lastName !== null) {
      updateFields.push('lastName = ?');
      updateValues.push(lastName);
    }
    if (email !== null) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (picture !== null) {
      updateFields.push('picture = ?');
      updateValues.push(picture);
    }
    if (userStatus !== null) {
      updateFields.push('userStatus = ?');
      updateValues.push(userStatus);
    }
    if (selectedOrgId !== null) {
      updateFields.push('selectedOrgId = ?');
      updateValues.push(selectedOrgId);
    }
    if (viewAs !== null) {
      updateFields.push('viewAs = ?');
      updateValues.push(viewAs);
    }

    if (updateFields.length > 0) {
      const updateQuery = `UPDATE User SET ${updateFields.join(
        ', '
      )} WHERE userId = ?`;
      updateValues.push(userId);

      await connection.execute(updateQuery, updateValues);
    }

    // Check if userType is changing
    if (userType && userType !== currentUser.userType) {
      await connection.execute(
        'UPDATE User SET userType = ? WHERE userId = ?',
        [userType, userId]
      );

      await assignRoleInAuth0({ userId, userType });
    }

    if (organizations && organizations.length > 0) {
      const placeholders = organizations.map(() => '(?, ?)').join(', ');
      const organizationValues = organizations.flatMap((orgId) => [
        userId,
        orgId,
      ]);

      const query = `INSERT INTO \`User_Organization\` (userId, orgId) VALUES ${placeholders}`;

      await connection.execute(query, organizationValues);
    }

    if (points !== null) {
      const { orgId, amount, type } = points;
      let replacementStr = '?';
      if (type === 'add') {
        replacementStr = '(pointValue + ?)';
      }
      const q = `UPDATE User_Organization
      SET pointValue = ${replacementStr}
      WHERE userId = ? AND orgId = ?`;

      await connection.execute(q, [amount, userId, orgId]);
    }
    await connection.commit();
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const changeUserType = async (userId, user = {}) => {
  const { userType } = user;
  try {
    await modifyUserInDb(userId, user);
    const managementClient = await getManagementClient();
    let newRole;
    if (userType === 'NewUser') {
      newRole = process.env.USER_ROLE_ID;
    } else if (userType === 'DriverUser') {
      newRole = process.env.DRIVER_ROLE_ID;
    } else if (userType === 'SponsorUser') {
      newRole = process.env.SPONSOR_ROLE_ID;
    } else if (userType === 'AdminUser') {
      newRole = process.env.ADMIN_ROLE_ID;
    }
    const roles = [newRole];
    const response = await managementClient.users.assignRoles(
      { id: userId },
      { roles }
    );
    console.log(response);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getDriversByOrgId = async (orgId) => {
  try {
    const [rows, fields] = await pool.execute(
      `SELECT U.* FROM User_Organization UO
      JOIN User U 
      ON UO.userId = U.userId
      WHERE orgId = ? AND memberStatus = 'active' AND userType = 'DriverUser'`,
      [orgId]
    );
    return rows;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getSponsorsByOrgId = async (orgId) => {
  try {
    const [rows, fields] = await pool.execute(
      `SELECT U.*, UO.orgId FROM User_Organization UO
      JOIN User U 
      ON UO.userId = U.userId
      WHERE orgId = ? AND memberStatus = 'active' AND userType = 'SponsorUser'`,
      [orgId]
    );
    return rows;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getDrivers = async () => {
  try {
    const [rows, fields] = await pool.execute(
      'select D.userId, D.orgId, O.orgName, O.orgStatus, O.orgDescription, \
      O.dollarPerPoint, U.userStatus, \
      D.pointValue, U.firstName, U.lastName, \
      userType, U.email, \
      U.createdAt, picture from DriverUser D \
      JOIN User U on D.userId = U.UserId \
      JOIN Organization O on O.orgId = D.orgId',
      []
    );

    return rows;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getSponsors = async () => {
  try {
    const [rows, fields] = await pool.execute(
      `SELECT \
      U.userId, \ 
      U.firstName, \ 
      U.lastName, \
      U.userType, \
      U.email, \
      U.createdAt, \
      U.picture, \
      U.userStatus, \
      O.orgId, \
      O.orgName, \
      O.orgDescription, \
      O.dollarPerPoint, \
      O.orgStatus \
      FROM SponsorUser S \
      JOIN User U on S.userId = U.userId \
      JOIN Organization O ON S.orgId = O.orgId \
      ORDER BY O.orgName, U.lastName, U.firstName;`,
      []
    );
    return rows;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getAdmins = async () => {
  try {
    const [rows, fields] = await pool.execute(
      `select \
      U.userId, \ 
      U.firstName, \ 
      U.lastName, \
      U.userType, \
      U.email, \
      U.createdAt, \ 
      U.picture, \ 
      U.userStatus \ 
      from AdminUser A \
      JOIN User U \
      on A.userId = U.userId;`,
      []
    );
    return rows;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const createNewUserInAuth0 = async (user = {}) => {
  const { email, password } = user;
  try {
    const managementClient = await getManagementClient();
    const response = await managementClient.users.create({
      connection: 'Username-Password-Authentication',
      email,
      password,
    });
    return response?.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const assignRoleInAuth0 = async ({ userId, userType }) => {
  try {
    if (userType === 'NewUser') {
      newRole = process.env.USER_ROLE_ID;
    } else if (userType === 'DriverUser') {
      newRole = process.env.DRIVER_ROLE_ID;
    } else if (userType === 'SponsorUser') {
      newRole = process.env.SPONSOR_ROLE_ID;
    } else if (userType === 'AdminUser') {
      newRole = process.env.ADMIN_ROLE_ID;
    }
    const roles = [newRole];
    const managementClient = await getManagementClient();
    await managementClient.users.assignRoles({ id: userId }, { roles });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const createNewUser = async (user = {}) => {
  const { email, password, userType } = user;

  try {
    const createdUser = await createNewUserInAuth0({ email, password });
    const userId = createdUser?.user_id;
    await assignRoleInAuth0({ userId, userType });
    await saveUserToDb({ ...user, userId });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const changeBlockStatusInAuth0 = async (userId, blocked = true) => {
  try {
    const managementClient = await getManagementClient();
    const response = await managementClient.users.update(
      { id: userId },
      {
        blocked,
      }
    );
    return response?.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const changePassword = async (userId, { password }) => {
  try {
    const managementClient = await getManagementClient();
    const response = await managementClient.users.update(
      { id: userId },
      {
        password,
      }
    );
    console.log(response);
    return response?.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const addOrganizationToUser = async (userId, orgId) => {
  try {
    connection = await pool.getConnection();
    connection.beginTransaction();

    await connection.execute(
      'INSERT INTO `User_Organization` (userId, orgId) \
      VALUES (?,?)',
      [userId, orgId]
    );

    await connection.commit();
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

/****************TESTING ******************************************************/
const {
  getOrganizationsFromDb,
} = require('../organizations/organizations.service');

const getRandomUsers = async (params = {}) => {
  try {
    const baseUrl = 'https://randomuser.me/api';
    const url = new URL(baseUrl);
    Object.keys(params).forEach((key) =>
      url.searchParams.append(key, params[key])
    );
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    const data = await response.json();
    return data?.results;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

const seedRandomUser = async (params = {}) => {
  const { userType = 'DriverUser', orgId = null } = params;
  try {
    const results = await getRandomUsers({ results: 1 });
    const fakeUser = results[0];
    const organizations = await getOrganizationsFromDb({});
    let organization =
      organizations.length > 0
        ? organizations[Math.floor(Math.random() * organizations.length)]
        : {};
    if (orgId) {
      organization = organizations.find((org) => org.orgId == orgId) || {};
    }

    let email = `${fakeUser?.name.first}.${fakeUser?.name?.last}@phostack.com`;
    if (userType === 'DriverUser' || userType === 'SponsorUser') {
      email =
        `${fakeUser?.name?.first}.${fakeUser?.name?.last}@${organization.orgName}.com`.toLowerCase();
    }

    const user = {
      firstName: fakeUser?.name?.first,
      lastName: fakeUser?.name.last,
      userType,
      email,
      picture: fakeUser?.picture?.large,
      password: 'Password123*',
    };
    if (userType === 'DriverUser' || userType === 'SponsorUser') {
      user['organizations'] = [organization?.orgId];
      user['selectedOrgId'] = organization?.orgId;
    }
    await createNewUser(user);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  saveUserToDb,
  getUsersFromDb,
  getUserFromDbById,
  modifyUserInDb,
  changeUserType,
  getDriversByOrgId,
  createNewUser,
  getDrivers,
  getSponsors,
  getAdmins,
  changePassword,
  getSponsorsByOrgId,
  addOrganizationToUser,
  seedRandomUser,
};
