const { getPool } = require('../utils/db');

const getUsersFromDb = async (params) => {
  const { offset = 0, limit = 1000, filters = {} } = params;
  const numericOffset = +offset;
  const numericLimit = +limit;
  let connection;
  try {
    const pool = await getPool();
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

const modifyUserInDb = async (userId, user) => {
  const {
    firstName = null,
    lastName = null,
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
    const pool = await getPool();
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

module.exports = {
  getUsersFromDb,
  modifyUserInDb
};
