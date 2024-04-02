const { pool } = require('../../db');

const saveApplicationLogToDb = async (applicationLog = {}) => {
  const { applicationId, applicationStatus, reason } = applicationLog;
  let connection;
  try {
    connection = await pool.getConnection();
    connection.beginTransaction();

    await connection.execute(
      'INSERT INTO `DriverApplicationLog` (applicationId, applicationStatus, reason) \
      VALUES (?,?,?)',
      [applicationId, applicationStatus, reason]
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

const getApplicationLogsFromDb = async (params = {}) => {
  const {
    offset = 0,
    limit = 10000,
    userId = null,
    orgId = null,
    applicationStatus = null,
  } = params;

  const numericOffset = +offset;
  const numericLimit = +limit;
  const conditions = [];
  const values = [];

  if (userId) {
    conditions.push('D.userId = ?');
    values.push(userId);
  }
  if (orgId) {
    conditions.push('D.orgId = ?');
    values.push(orgId);
  }
  if (applicationStatus) {
    conditions.push('L.applicationStatus = ?');
    values.push(applicationStatus);
  }

  let whereClause = '';
  if (conditions.length > 0) {
    whereClause = 'WHERE ' + conditions.join(' AND ');
  }

  let connection;
  try {
    connection = await pool.getConnection();
    connection.beginTransaction();

    const [results] = await connection.query(
      `SELECT 
      U.firstName,
      U.lastName,
      U.email,
      O.orgName, 
      L.logId, 
      L.applicationId, 
      L.applicationStatus, 
      L.reason, 
      L.createdAt, 
      D.userId, 
      D.orgId, 
      D.employeeCode 
      FROM DriverApplicationLog L 
      JOIN DriverApplication D
      on L.applicationId = D.applicationId
      JOIN Organization O 
      ON D.orgId = O.orgId
      JOIN User U
      ON D.userId = U.userId
      ${whereClause} LIMIT ? OFFSET ?`,
      [...values, numericLimit, numericOffset]
    );

    await connection.commit();
    return results;
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

module.exports = { saveApplicationLogToDb, getApplicationLogsFromDb };
