const { pool } = require('../db');

const getBehaviorsFromDb = async (params) => {
    const { offset = 0, limit = 1000 } = params;
    const numericOffset = +offset;
    const numericLimit = +limit;
  
    let connection;
    try {
      connection = await pool.getConnection();
      connection.beginTransaction();
  
      const [results] = await connection.query(
        'SELECT Organization.orgName, Behavior.behaviorName, Behavior.pointValue, \
        Behavior.behaviorDescription, Behavior.behaviorStatus, Behavior.createdAt \
        FROM Behavior INNER JOIN Organization ON Behavior.orgId=Organization.orgId',
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

  const getBehaviorsByOrgId = async (orgId) => {  
    let connection;
    try {
      connection = await pool.getConnection();
      connection.beginTransaction();
  
      const [results] = await connection.query(
        'SELECT * from Behavior \
        WHERE orgId = ?',
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
  }

  const saveBehavior = async (behavior) => {
    const {
      orgId,
      pointValue,
      behaviorName,
      behaviorDescription,
      behaviorStatus
    } = behavior;
  
    let connection;
    try {
      connection = await pool.getConnection();
      connection.beginTransaction();
  
      await connection.execute(
        'INSERT INTO `Behavior` (orgId, pointValue, behaviorName, behaviorDescription, behaviorStatus) \
        VALUES (?,?,?,?,?)',
        [orgId, pointValue, behaviorName, behaviorDescription, behaviorStatus]
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
  }

  module.exports = {
    getBehaviorsFromDb,
    getBehaviorsByOrgId,
    saveBehavior
  };