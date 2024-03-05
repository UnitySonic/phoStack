require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'local'}` });
const { pool } = require('../db');
const { getManagementClient } = require('../middleware/auth0.middleware');

const saveUserToDb = async (user) => {
  const {
    userId = null,
    firstName = null,
    lastName = null,
    userType = null,
    email = null,
    picture = null,
    orgId = null,
    pointValue = null,
    userStatus = 'active',
  } = user;

  let connection;
  try {
    connection = await pool.getConnection();
    connection.beginTransaction();

    await connection.execute(
      'INSERT INTO `User` (userId, firstName, lastName, userType, email, picture, userStatus) \
      VALUES (?,?,?,?,?,?,?)',
      [userId, firstName, lastName, userType, email, picture, userStatus]
    );

    let sql = [
      'INSERT INTO `NewUser` (userId) \
      VALUES (?)',
      [userId],
    ];
    if (userType === 'DriverUser') {
      sql = [
        'INSERT INTO `DriverUser` (userId, orgId, pointValue) \
        VALUES (?,?,?)',
        [userId, orgId, pointValue],
      ];
    } else if (userType === 'AdminUser') {
      sql = [
        'INSERT INTO `AdminUser` (userId) \
        VALUES (?)',
        [userId],
      ];
    } else if (userType === 'SponsorUser') {
      sql = [
        'INSERT INTO `SponsorUser` (userId, orgId) \
        VALUES (?,?)',
        [userId, orgId],
      ];
    }
    await connection.execute(sql[0], sql[1]);
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

const getUserSubTypeInfo = async (connection, userId, userType) => {
  if (userType === "NewUser" || userType === "AdminUser") {
    const [results] = await connection.execute(
      `SELECT * FROM ${userType} WHERE userId = ? LIMIT 1`,
      [userId]
    );
    return results?.[0];
  }

  const [results] = await connection.execute(
    `SELECT U.*, O.orgName FROM ${userType} U JOIN Organization O on O.orgId = U.orgId WHERE userId = ? LIMIT 1`,
    [userId]
  );
  return results?.[0];
};

const getUsersFromDb = async (params) => {
  const { offset = 0, limit = 1000 } = params;
  const numericOffset = +offset;
  const numericLimit = +limit;
  let connection;
  try {
    connection = await pool.getConnection();
    connection.beginTransaction();
    const [results] = await connection.query(
      `SELECT * FROM User LIMIT ? OFFSET ?`,
      [numericLimit, numericOffset]
    );

    const users = await Promise.all(
      results.map(async (user) => {
        const subTypeInfo = await getUserSubTypeInfo(
          connection,
          user.userId,
          user.userType
        );
        return { ...user, ...subTypeInfo };
      })
    );
    await connection.commit();
    return users;
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
      'SELECT * FROM User WHERE userId = ? LIMIT 1',
      [userId]
    );

    if (results.length === 0) {
      return null;
    }

    const user = results[0];

    const subTypeInfo = await getUserSubTypeInfo(
      connection,
      user.userId,
      user.userType
    );

    await connection.commit();

    return { ...user, ...subTypeInfo };
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

const modifyUserInDb = async (userId, user) => {
  const {
    firstName = null,
    lastName = null,
    userType = null,
    email = null,
    picture = null,
    orgId = null,
    pointValue = null,
    userStatus = null,
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

    if (updateFields.length > 0) {
      const updateQuery = `UPDATE User SET ${updateFields.join(
        ', '
      )} WHERE userId = ?`;
      updateValues.push(userId);

      await connection.execute(updateQuery, updateValues);
    }

    // Check if userType is changing
    if (userType && userType !== currentUser.userType) {
      // Delete user from current subtype table
      await connection.execute(
        `DELETE FROM ${currentUser.userType} WHERE userId = ?`,
        [userId]
      );

      // Insert user into new subtype table
      if (userType === 'DriverUser') {
        await connection.execute(
          'INSERT INTO DriverUser (userId, orgId, pointValue) VALUES (?,?,?)',
          [userId, orgId, pointValue]
        );
      } else if (userType === 'AdminUser') {
        await connection.execute('INSERT INTO AdminUser (userId) VALUES (?)', [
          userId,
        ]);
      } else if (userType === 'SponsorUser') {
        await connection.execute(
          'INSERT INTO SponsorUser (userId, orgId) VALUES (?,?)',
          [userId, orgId]
        );
      } else if (userType === 'NewUser') {
        await connection.execute('INSERT INTO NewUser (userId) VALUES (?)', [
          userId,
        ]);
      }

      // Update userType in User table
      await connection.execute(
        'UPDATE User SET userType = ? WHERE userId = ?',
        [userType, userId]
      );
    }

    //Update Driver points
    if (pointValue && !userType && currentUser.userType === 'DriverUser') {
      await connection.execute(
        'UPDATE DriverUser SET pointValue = ? WHERE userId = ?',
        [pointValue, userId]
      );
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

const changeUserType = async (userId, user) => {
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
      'select D.userId, orgId, U.userStatus, \
      pointValue, firstName, lastName, \
      userType, email, \
      createdAt, picture from DriverUser D \
      JOIN User U on D.userId = U.UserId \
      where orgId = ?',
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
      `select S.userId, orgId, U.userStatus,\
      firstName, lastName, \
      userType, email, \
      createdAt, picture from SponsorUser S \
      JOIN User U on S.userId = U.UserId \
      where orgId = ?`,
      [orgId]
    );
    return rows;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

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

const createNewUserInAuth0 = async (user) => {
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

const createNewUser = async (user) => {
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
  getSponsorsByOrgId
};
