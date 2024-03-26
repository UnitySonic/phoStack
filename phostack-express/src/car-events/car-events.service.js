const { pool } = require('../db');

const getCarEvents = async (params = {}) => {
  const {
    offset = 0,
    limit = 1000000,
    userId = null,
    startDate = '1970-01-01',
    endDate = new Date().toISOString().slice(0, 10),
  } = params;

  const numericOffset = +offset;
  const numericLimit = +limit;
  const conditions = [];
  const values = [];

  if (userId) {
    conditions.push('carEventUserId = ?');
    values.push(userId);
  }

  conditions.push(
    'DATE(carEventCreatedAt) >= ? AND DATE(carEventCreatedAt) <= ?'
  );
  values.push(startDate, endDate);

  let whereClause = '';
  if (conditions.length > 0) {
    whereClause = 'WHERE ' + conditions.join(' AND ');
  }

  let connection;
  try {
    connection = await pool.getConnection();
    connection.beginTransaction();

    const [results] = await connection.query(
      `SELECT * FROM CarEvent
      ${whereClause} ORDER BY carEventId DESC LIMIT ? OFFSET ?`,
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

module.exports = {
  getCarEvents,
};
