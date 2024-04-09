const { pool } = require('../db');

const getSalesReportData = async (params = {}) => {
  const {
    offset = 0,
    limit = 10000,
    orderFor = null,
    orderBy = null,
    orgId = null,
    orderStatus = null,
    startDate = '1970-01-01',
    endDate = new Date().toISOString().slice(0, 10),
  } = params;

  const conditions = [];
  const values = [];

  if (orderFor) {
    conditions.push('O.orderFor = ?');
    values.push(orderFor);
  }
  if (orderBy) {
    conditions.push('O.orderBy = ?');
    values.push(orderBy);
  }
  if (orgId) {
    conditions.push('O.orgId = ?');
    values.push(orgId);
  }
  if (orderStatus) {
    conditions.push('O.orderStatus = ?');
    values.push(orderStatus);
  }

  conditions.push('DATE(O.createdAt) >= ? AND DATE(O.createdAt) <= ?');
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
      `Select COUNT(DISTINCT O.orderId) as total
      FROM OrderInfo O
      LEFT JOIN OrderInfo_Item OI
      ON OI.orderId = O.orderId
      LEFT JOIN Organization Org 
      ON Org.orgId = O.orgId
      LEFT JOIN User U  
      ON U.userId = O.orderFor
      ${whereClause}`,
      values
    );

    const [rows] = await connection.query(
      `Select
      O.orderId,
      O.orderStatus,
      O.createdAt,
      O.orderTotal,
      O.orgId,
      O.dollarPerPoint as orderDollarPerPoint,
      OI.itemId,
      OI.quantity,
      Org.orgName,
      U.userId,
      U.firstName,
      U.lastName,
      U.userType
      FROM OrderInfo O
      LEFT JOIN OrderInfo_Item OI
      ON OI.orderId = O.orderId
      LEFT JOIN Organization Org 
      ON Org.orgId = O.orgId
      LEFT JOIN User U  
      ON U.userId = O.orderFor
      ${whereClause} ORDER BY O.orderId DESC LIMIT ? OFFSET ?`,
      [...values, +limit, +offset]
    );
    await connection.commit();

    return {
      total: countResult[0].total,
      offset: +offset,
      limit: +limit,
      rows,
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

const getSalesReportByMonthYear = async (params = {}) => {
  const {
    orderFor = null,
    orderBy = null,
    orgId = null,
    orderStatus = null,
    startDate = '1970-01-01',
    endDate = new Date().toISOString().slice(0, 10),
  } = params;

  const conditions = [];
  const values = [];

  if (orderFor) {
    conditions.push('O.orderFor = ?');
    values.push(orderFor);
  }
  if (orderBy) {
    conditions.push('O.orderBy = ?');
    values.push(orderBy);
  }
  if (orgId) {
    conditions.push('O.orgId = ?');
    values.push(orgId);
  }
  if (orderStatus) {
    conditions.push('O.orderStatus = ?');
    values.push(orderStatus);
  }

  conditions.push('DATE(O.createdAt) >= ? AND DATE(O.createdAt) <= ?');
  values.push(startDate, endDate);

  let whereClause = '';
  if (conditions.length > 0) {
    whereClause = 'WHERE ' + conditions.join(' AND ');
  }

  let connection;
  try {
    connection = await pool.getConnection();
    connection.beginTransaction();

    const [rows] = await connection.query(
      `
      SELECT 
      CONCAT( 
          CASE MONTH(createdAt)
              WHEN 1 THEN 'Jan'
              WHEN 2 THEN 'Feb'
              WHEN 3 THEN 'Mar'
              WHEN 4 THEN 'Apr'
              WHEN 5 THEN 'May'
              WHEN 6 THEN 'Jun'
              WHEN 7 THEN 'Jul'
              WHEN 8 THEN 'Aug'
              WHEN 9 THEN 'Sep'
              WHEN 10 THEN 'Oct'
              WHEN 11 THEN 'Nov'
              WHEN 12 THEN 'Dec'
          END,
          ' ',
          YEAR(createdAt)
      ) AS date,
      SUM(dollarPerPoint * orderTotal) AS total
  FROM 
      OrderInfo O
  ${whereClause}
  GROUP BY 
      YEAR(createdAt), MONTH(createdAt)
  HAVING
      total > 0
  ORDER BY 
      YEAR(createdAt) ASC, MONTH(createdAt) ASC;
      `,
      [...values]
    );
    
    await connection.commit();

    return rows
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

const getSalesReportByOrg = async (params = {}) => {
  const {
    orderFor = null,
    orderBy = null,
    orgId = null,
    orderStatus = null,
    startDate = '1970-01-01',
    endDate = new Date().toISOString().slice(0, 10),
  } = params;

  const conditions = [];
  const values = [];

  if (orderFor) {
    conditions.push('O.orderFor = ?');
    values.push(orderFor);
  }
  if (orderBy) {
    conditions.push('O.orderBy = ?');
    values.push(orderBy);
  }
  if (orgId) {
    conditions.push('O.orgId = ?');
    values.push(orgId);
  }
  if (orderStatus) {
    conditions.push('O.orderStatus = ?');
    values.push(orderStatus);
  }

  conditions.push('DATE(O.createdAt) >= ? AND DATE(O.createdAt) <= ?');
  values.push(startDate, endDate);

  let whereClause = '';
  if (conditions.length > 0) {
    whereClause = 'WHERE ' + conditions.join(' AND ');
  }

  let connection;
  try {
    connection = await pool.getConnection();
    connection.beginTransaction();

    const [rows] = await connection.query(
      `
      SELECT 
      Org.orgName,
      O.orgId,
      SUM(O.dollarPerPoint * O.orderTotal) AS total
  FROM 
      OrderInfo O
  JOIN 
      Organization Org ON O.orgId = Org.orgId
  ${whereClause}
  GROUP BY 
      O.orgId
  ORDER BY 
      total DESC;
      `,
      [...values]
    );
    await connection.commit();

    return rows
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

const getSalesReportPerDriverPerYearPerMonth = async (params = {}) => {
  const {
    orderFor = null,
    orderBy = null,
    orgId = null,
    orderStatus = null,
    startDate = '1970-01-01',
    endDate = new Date().toISOString().slice(0, 10),
  } = params;

  const conditions = [];
  const values = [];

  if (orderFor) {
    conditions.push('O.orderFor = ?');
    values.push(orderFor);
  }
  if (orderBy) {
    conditions.push('O.orderBy = ?');
    values.push(orderBy);
  }
  if (orgId) {
    conditions.push('O.orgId = ?');
    values.push(orgId);
  }
  if (orderStatus) {
    conditions.push('O.orderStatus = ?');
    values.push(orderStatus);
  }

  conditions.push('DATE(O.createdAt) >= ? AND DATE(O.createdAt) <= ?');
  values.push(startDate, endDate);

  let whereClause = '';
  if (conditions.length > 0) {
    whereClause = 'WHERE ' + conditions.join(' AND ');
  }

  let connection;
  try {
    connection = await pool.getConnection();
    connection.beginTransaction();

    const [rows] = await connection.query(
      `
      SELECT 
      orderFor as userId,
      firstName,
      lastName,
      email,
      YEAR(O.createdAt) AS year,
      MONTH(O.createdAt) AS month,
      SUM(dollarPerPoint * orderTotal) AS total
  FROM 
      OrderInfo O
  JOIN
    User U
  ON 
    U.userId = O.orderFor
  ${whereClause}
  GROUP BY 
      userId,firstName, lastName, email, year, month
  HAVING total > 0
  ORDER BY 
      userId, year, month;
      `,
      [...values]
    );
    
    await connection.commit();

    return rows
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

const getSalesSummaryReportByDriver = async (params = {}) => {
  const {
    orderFor = null,
    orderBy = null,
    orgId = null,
    orderStatus = null,
    startDate = '1970-01-01',
    endDate = new Date().toISOString().slice(0, 10),
  } = params;

  const conditions = [];
  const values = [];

  if (orderFor) {
    conditions.push('O.orderFor = ?');
    values.push(orderFor);
  }
  if (orderBy) {
    conditions.push('O.orderBy = ?');
    values.push(orderBy);
  }
  if (orgId) {
    conditions.push('O.orgId = ?');
    values.push(orgId);
  }
  if (orderStatus) {
    conditions.push('O.orderStatus = ?');
    values.push(orderStatus);
  }

  conditions.push('DATE(O.createdAt) >= ? AND DATE(O.createdAt) <= ?');
  values.push(startDate, endDate);

  let whereClause = '';
  if (conditions.length > 0) {
    whereClause = 'WHERE ' + conditions.join(' AND ');
  }

  let connection;
  try {
    connection = await pool.getConnection();
    connection.beginTransaction();

    const [rows] = await connection.query(
      `
      SELECT 
      orderFor as userId,
      firstName,
      lastName,
      email,
      SUM(dollarPerPoint * orderTotal) AS total
  FROM 
      OrderInfo O
  JOIN
    User U
  ON 
    U.userId = O.orderFor
  ${whereClause}
  GROUP BY 
    userId, firstName, lastName, email
  HAVING total > 0
  ORDER BY 
      total desc
      `,
      [...values]
    );
    await connection.commit();

    return rows
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
  getSalesReportData,
  getSalesReportByMonthYear,
  getSalesReportByOrg,
  getSalesReportPerDriverPerYearPerMonth,
  getSalesSummaryReportByDriver
};
