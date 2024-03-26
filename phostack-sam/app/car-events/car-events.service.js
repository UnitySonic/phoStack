const { getPool } = require('../utils/db');

const getLastCarEventChecked = async () => {
  try {
    const pool = await getPool();
    const [results] = await pool.query(
      `SELECT lastCarEventChecked FROM Util WHERE utilId = 1`
    );
    if (results.length === 0) {
      return 0;
    }
    return results[0].lastCarEventChecked;
  } catch (error) {
    throw error;
  }
};

const saveLastCarEventChecked = async (lastChecked) => {
  try {
    const pool = await getPool();
    const [results] = await pool.execute(
      `UPDATE Util
      SET lastCarEventChecked = ?
      WHERE utilId = 1`,
      [lastChecked]
    );
    if (results.affectedRows === 0) {
      // If no rows were affected, meaning utilId does not exist, perform INSERT
      await pool.execute(
        `INSERT INTO Util (utilId, lastCarEventChecked) VALUES (?, ?)`,
        [1, lastChecked]
      );
    }
  } catch (error) {
    throw error;
  }
};

const getCarEvents = async (params = {}) => {
  const { idOffset = 0, limit = 1000000 } = params;
  let connection;
  try {
    const pool = await getPool();
    connection = await pool.getConnection();
    connection.beginTransaction();

    const [results] = await connection.query(
      `SELECT * FROM CarEvent 
      WHERE carEventId > ? 
      ORDER BY carEventId ASC
      LIMIT ?`,
      [+idOffset, +limit]
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

const getPrevCarEvent = async (userId) => {
  const pool = await getPool();
  try {
    const [rows, fields] = await pool.execute(
      `SELECT * FROM CarEvent 
      WHERE carEventUserId = ?
      ORDER BY carEventCreatedAt DESC 
      LIMIT 1`,
      [userId]
    );

    if (rows.length == 0) {
      return {
        userId,
        speed: 0,
        speedLimit: 25,
        createdAt: new Date(Date.now())
          .toISOString()
          .slice(0, 19)
          .replace('T', ' '),
      };
    }

    return {
      userId,
      speed: rows[0].carEventSpeed,
      speedLimit: rows[0].carEventSpeedLimit,
      createdAt: rows[0].carEventCreatedAt,
    };
  } catch (error) {
    throw error;
  }
};

const saveCarEventToDb = async (carEvent = {}) => {
  const { userId, speed, createdAt, speedLimit } = carEvent;
  let connection;
  try {
    const pool = await getPool();
    connection = await pool.getConnection();
    connection.beginTransaction();

    const [result] = await connection.execute(
      'INSERT INTO `CarEvent` (carEventUserId, carEventSpeed, carEventSpeedLimit, carEventCreatedAt) \
      VALUES (?,?,?,?)',
      [userId, speed, speedLimit, createdAt]
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

module.exports = {
  getPrevCarEvent,
  saveCarEventToDb,
  getCarEvents,
  getLastCarEventChecked,
  saveLastCarEventChecked,
};
