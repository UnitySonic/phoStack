const { getPool } = require('../utils/db');

const getBehaviors = async (params = {}) => {
  let connection;
  try {
    const pool = await getPool();
    connection = await pool.getConnection();
    connection.beginTransaction();

    const [results] = await connection.query(
      `SELECT * from Behavior
      WHERE behaviorStatus = 'active'`
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

const getSpeedingBehaviorsForUser = async (userId) => {
  let connection;
  try {
    const pool = await getPool();
    connection = await pool.getConnection();
    connection.beginTransaction();

    const [rows] = await connection.query(
      `select * from User_Organization 
      WHERE UserId = ?
      AND memberStatus = 'active'`,
      [userId]
    );

    const organizationIds = rows.map((row) => row.orgId);
    const orgIdsQueryString = organizationIds.join(',');

    const [results] = await connection.query(
      `SELECT * FROM Behavior 
      WHERE behaviorStatus = 'active' 
      AND LOWER(behaviorName) LIKE 'speeding%'
      AND (orgId in (${orgIdsQueryString}) OR userId = ?);`,
      [userId]
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

const getSpeedingBehaviors = async (params = {}) => {
  let connection;
  try {
    const pool = await getPool();
    connection = await pool.getConnection();
    connection.beginTransaction();

    const [results] = await connection.query(
      `SELECT * FROM Behavior 
      WHERE behaviorStatus = 'active' 
      AND LOWER(behaviorName) LIKE 'speeding%'`
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

const getBehaviorsByOrgId = async (orgId) => {
  let connection;
  try {
    const pool = await getPool();
    connection = await pool.getConnection();
    connection.beginTransaction();

    const [results] = await connection.query(
      `SELECT * from Behavior \
      WHERE orgId = ? AND behaviorStatus = 'active'`,
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

const getBehaviorsByUserId = async (userId) => {
  let connection;
  try {
    const pool = await getPool();
    connection = await pool.getConnection();
    connection.beginTransaction();

    const [results] = await connection.query(
      `SELECT * from Behavior \
      WHERE userId = ? and behaviorStatus = 'active'`,
      [userId]
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

module.exports = {
  getBehaviorsByOrgId,
  getBehaviorsByUserId,
  getBehaviors,
  getSpeedingBehaviorsForUser,
  getSpeedingBehaviors
};
