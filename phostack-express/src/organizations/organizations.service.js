const { pool } = require('../db');

const getOrganizationsFromDb = async (params) => {
  const { offset = 0, limit = 1000 } = params;
  const numericOffset = +offset;
  const numericLimit = +limit;

  let connection;
  try {
    connection = await pool.getConnection();
    connection.beginTransaction();

    const [results] = await connection.query(
      `SELECT * FROM Organization LIMIT ? OFFSET ?`,
      [numericLimit, numericOffset]
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

const getOrganizationFromDb = async (orgId) => {
  let connection;
  try {
    connection = await pool.getConnection();
    connection.beginTransaction();

    const [results] = await connection.query(
      `SELECT * FROM Organization WHERE orgId = ?`,
      [orgId]
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

const saveOrganization = async (organization) => {
  const {
    orgName,
    orgDescription,
    dollarPerPoint = 0.01,
    orgStatus = 'active',
  } = organization;

  let connection;
  try {
    connection = await pool.getConnection();
    connection.beginTransaction();

    await connection.execute(
      'INSERT INTO `Organization` (orgName, orgDescription, dollarPerPoint, orgStatus) \
      VALUES (?,?,?,?)',
      [orgName, orgDescription, dollarPerPoint, orgStatus]
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

const modifyOrganization = async (orgId, organization) => {
  const {
    orgName = null,
    orgDescription = null,
    dollarPerPoint = null,
    orgStatus = null,
  } = organization;

  let connection;
  try {
    connection = await pool.getConnection();
    connection.beginTransaction();

    const updateFields = [];
    const updateValues = [];

    if (orgName) {
      updateFields.push('orgName = ?');
      updateValues.push(orgName);
    }
    if (orgDescription) {
      updateFields.push('orgDescription = ?');
      updateValues.push(orgDescription);
    }
    if (dollarPerPoint) {
      updateFields.push('dollarPerPoint = ?');
      updateValues.push(dollarPerPoint);
    }
    if (orgStatus) {
      updateFields.push('orgStatus = ?');
      updateValues.push(orgStatus);
    }

    if (updateFields.length > 0) {
      const updateQuery = `UPDATE Organization SET ${updateFields.join(
        ', '
      )} WHERE orgId = ?`;
      updateValues.push(orgId);

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
  getOrganizationsFromDb,
  getOrganizationFromDb,
  saveOrganization,
  modifyOrganization,
};
