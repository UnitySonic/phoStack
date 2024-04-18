const { pool } = require('../../db');

const savePointLogToDb = async (pointLog = {}) => {
  const {
    behaviorId,
    pointGivenBy,
    pointGivenTo,
    orderId,
    orgId,
    pointChange,
  } = pointLog;
  let connection;
  try {
    connection = await pool.getConnection();
    connection.beginTransaction();

    await connection.execute(
      'INSERT INTO `PointLog` (behaviorId, pointGivenBy, pointGivenTo, orderId, orgId, pointChange, pointBalance) \
      VALUES (?,?,?,?,?,?, (SELECT pointValue from User_Organization WHERE orgId = ? and userId = ?))',
      [
        behaviorId,
        pointGivenBy,
        pointGivenTo,
        orderId,
        orgId,
        pointChange,
        orgId,
        pointGivenTo,
      ]
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

const getPointsLogsFromDb = async (params) => {
  const {
    offset = 0,
    limit = 100000,
    behaviorId = null,
    orgId = null,
    orderId = null,
    pointGivenBy = null,
    pointGivenTo = null,
    startDate = '1970-01-01',
    endDate = new Date().toISOString().slice(0, 10),
  } = params;

  const numericOffset = +offset;
  const numericLimit = +limit;
  const conditions = [];
  const values = [];

  if (behaviorId) {
    conditions.push('P.behaviorId = ?');
    values.push(userId);
  }
  if (orgId) {
    conditions.push('P.orgId = ?');
    values.push(orgId);
  }
  if (orderId) {
    conditions.push('P.orderId = ?');
    values.push(orderId);
  }
  if (pointGivenBy) {
    conditions.push('P.pointGivenBy = ?');
    values.push(pointGivenBy);
  }
  if (pointGivenTo) {
    conditions.push('P.pointGivenTo = ?');
    values.push(pointGivenTo);
  }

  conditions.push('DATE(P.createdAt) >= ? AND DATE(P.createdAt) <= ?');
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
      `SELECT 
        P.logId,
        P.behaviorId,
        P.orderId,
        P.orgId,
        P.pointGivenBy,
        P.pointGivenTo,
        P.createdAt,
        P.pointBalance,
        U.firstName as pointGivenToFirstName,
        U.lastName as pointGivenToLastName,
        U.email as pointGivenToEmail,
        U.userId as pointGivenToUserId,
        UR.firstName as pointGivenByFirstName,
        UR.lastName as pointGivenByLastName,
        UR.email as pointGivenByEmail,
        UR.userId as pointGivenByUserId,
        B.pointValue,
        B.behaviorName,
        B.behaviorDescription,
        B.behaviorStatus,
        O.orderTotal,
        ORG.orgName
      FROM 
          PointLog P
      LEFT JOIN 
          Behavior B ON P.behaviorId = B.behaviorId
      LEFT JOIN 
          OrderInfo O ON P.orderId = O.orderId
      LEFT JOIN 
        Organization ORG ON ORG.orgId = P.orgId
      LEFT JOIN
        User U ON U.userId = P.pointGivenTo
      LEFT JOIN
        User UR on UR.userId = P.pointGivenBy
      ${whereClause} ORDER BY logId DESC LIMIT ? OFFSET ?`,
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

module.exports = { savePointLogToDb, getPointsLogsFromDb };
