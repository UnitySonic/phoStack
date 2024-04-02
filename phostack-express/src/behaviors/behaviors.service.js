const { pool } = require('../db');

const getBehaviorsFromDb = async (params = {}) => {
    const { offset = 0, limit = 10000 } = params;
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

  editBehavior = async (behaviorId, behavior) => {
    const {
      orgId = null,
      userId = null,
      pointValue = null,
      behaviorName = null,
      behaviorDescription = null,
      behaviorStatus = null,
      createdAt = null
    } = behavior;

    let connection;
    try {
      connection = await pool.getConnection();
      connection.beginTransaction();

      // Retrieve current behavior information
      const [currentBehaviorResults] = await connection.execute(
        'SELECT * FROM Behavior WHERE behaviorId = ? LIMIT 1',
        [behaviorId]
      );

      if(currentBehaviorResults.length === 0) {
        throw new Error('Behavior not found');
      }

      const currentBehavior = currentBehaviorResults[0];

      const updateFields = [];
      const updateValues = [];
  
      if (orgId !== null) {
        updateFields.push('orgId = ?');
        updateValues.push(orgId);
      }
      if (userId !== null) {
        updateFields.push('userId = ?');
        updateValues.push(userId);
      }
      if (pointValue !== null) {
        updateFields.push('pointValue = ?');
        updateValues.push(pointValue);
      }
      if (behaviorName !== null) {
        updateFields.push('behaviorName = ?');
        updateValues.push(behaviorName);
      }
      if (behaviorDescription !== null) {
        updateFields.push('behaviorDescription = ?');
        updateValues.push(behaviorDescription);
      }
      if (behaviorStatus !== null) {
        updateFields.push('behaviorStatus = ?');
        updateValues.push(behaviorStatus);
      }
      if (createdAt !== null) {
        updateFields.push('createdAt = ?');
        updateValues.push(createdAt);
      }

      if (updateFields.length > 0) {
        const updateQuery = `UPDATE Behavior SET ${updateFields.join(
          ', '
        )} WHERE behaviorId = ?`;
        updateValues.push(behaviorId);
  
        await connection.execute(updateQuery, updateValues);
        await connection.commit();
      }
    }
    catch (error) {
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
    saveBehavior,
    editBehavior
  };