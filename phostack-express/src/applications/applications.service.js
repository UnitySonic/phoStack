const { pool } = require('../db');

const getApplicationsFromDb = async (params) => {
  const {
    offset = 0,
    limit = 1000,
    userId = null,
    orgId = null,
    applicationStatus = null,
    startDate = '1970-01-01',
    endDate = new Date().toISOString().slice(0, 10),
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
    conditions.push('D.applicationStatus = ?');
    values.push(applicationStatus);
  }

  conditions.push('DATE(D.createdAt) >= ? AND DATE(D.createdAt) <= ?');
  values.push(startDate, endDate);

  let whereClause = '';
  if (conditions.length > 0) {
    whereClause = 'WHERE ' + conditions.join(' AND ');
  }

  let connection;
  try {
    connection = await pool.getConnection();
    connection.beginTransaction();

    const [countResult] = await connection.query(
      `SELECT COUNT(*) AS total FROM DriverApplication D 
      JOIN User U on D.userId = U.userId 
      JOIN Organization O on O.orgId = D.orgId ${whereClause}`,
      values
    );

    const [results] = await connection.query(
      `SELECT D.applicationId, D.userId, D.orgId, D.applicationStatus, D.employeeCode, D.createdAt, U.firstName, U.lastName, O.orgName 
      FROM DriverApplication D JOIN User U on D.userId = U.userId 
      JOIN Organization O on O.orgId = D.orgId 
      ${whereClause} ORDER BY D.createdAt DESC LIMIT ? OFFSET ?`,
      [...values, numericLimit, numericOffset]
    );

    await connection.commit();
    return {
      total: countResult[0].total,
      offset,
      limit,
      applications: results,
    };
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

const getApplicationFromDb = async (applicationId) => {
  let connection;
  try {
    connection = await pool.getConnection();
    connection.beginTransaction();

    const [results] = await connection.execute(
      `SELECT D.applicationId, D.userId, D.orgId, D.applicationStatus, D.employeeCode, D.createdAt, U.firstName, U.lastName, O.orgName 
      FROM DriverApplication D JOIN User U on D.userId = U.userId 
      JOIN Organization O on O.orgId = D.orgId where applicationId = ?`,
      [applicationId]
    );
    await connection.commit();
    
    return results?.[0] || null;
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
}

const saveApplicationToDb = async (userId, application) => {
  const { orgId, applicationStatus = 'new', employeeCode = null } = application;
  let connection;
  try {
    connection = await pool.getConnection();
    connection.beginTransaction();

    const [result] = await connection.execute(
      'INSERT INTO `DriverApplication` (userId, orgId, applicationStatus, employeeCode) \
      VALUES (?,?,?,?)',
      [userId, orgId, applicationStatus, employeeCode]
    );
    await connection.commit();
    return result;
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

const modifyApplicationInDb = async (applicationid, application) => {
  const { applicationStatus = null, employeeCode = null } = application;

  let connection;
  try {
    connection = await pool.getConnection();
    connection.beginTransaction();

    const updateFields = [];
    const updateValues = [];

    if (applicationStatus) {
      updateFields.push('applicationStatus = ?');
      updateValues.push(applicationStatus);
    }
    if (employeeCode) {
      updateFields.push('employeeCode = ?');
      updateValues.push(employeeCode);
    }

    if (updateFields.length > 0) {
      const updateQuery = `UPDATE DriverApplication SET ${updateFields.join(
        ', '
      )} WHERE applicationId = ?`;
      updateValues.push(applicationid);

      await connection.execute(updateQuery, updateValues);
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
  getApplicationsFromDb,
  getApplicationFromDb,
  saveApplicationToDb,
  modifyApplicationInDb
};
