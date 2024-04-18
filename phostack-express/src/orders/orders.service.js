const { pool } = require('../db');
const { getEbayItem, getEbayItems } = require('../ebay/ebay.service');
const { getRandomTimestamp, getRandomElement } = require('../utils');
const { getUsersFromDb } = require('../users/users.service');

const saveOrderToDb = async (orderData = {}) => {
  const {
    orderStatus = 'processing',
    orderBy,
    orderFor,
    orderInfo,
    orgId,
    addressFirstName,
    addressLastName,
    addressLineOne,
    addressLineTwo,
    addressCity,
    addressState,
    addressZip,
    addressCountry,
    dollarPerPoint,
    createdAt = new Date().toISOString().slice(0, 19).replace('T', ' '),
  } = orderData;
  let connection;
  try {
    connection = await pool.getConnection();
    connection.beginTransaction();

    const [addressInfoInsertResult] = await connection.execute(
      'INSERT INTO ShippingAddress (addressFirstName, addressLastName, addressLineOne, addressLineTwo, addressCity, addressState, addressZip, addressCountry) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        addressFirstName,
        addressLastName,
        addressLineOne,
        addressLineTwo,
        addressCity,
        addressState,
        addressZip,
        addressCountry,
      ]
    );
    let orderTotal = 0;
    for (const item of Object.values(orderInfo)) {
      orderTotal += item[0].price;
    }
    const addressId = addressInfoInsertResult.insertId;
    const [orgInfoInsertResult] = await connection.execute(
      'INSERT INTO OrderInfo (orderStatus, orderBy, orderFor, orderTotal, orgId, addressId, dollarPerPoint, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        orderStatus,
        orderBy,
        orderFor,
        orderTotal,
        orgId,
        addressId,
        dollarPerPoint,
        createdAt,
      ]
    );

    const orderId = orgInfoInsertResult.insertId;
    for (const item of Object.values(orderInfo)) {
      await connection.execute(
        'INSERT INTO OrderInfo_Item (orderId, itemId, quantity) VALUES (?, ?, ?)',
        [orderId, item[0].productId, item[0].quantity]
      );
    }

    const [rows, fields] = await connection.execute(
      'SELECT pointValue FROM User_Organization WHERE userId = ? AND orgId = ?',
      [orderFor, orgId]
    );
    const pointValue = rows[0].pointValue;

    if (pointValue < orderTotal) {
      throw new Error('Insufficient Points to complete Order. Desync?');
    } else {
      await connection.execute(
        'UPDATE User_Organization Set pointValue = (pointValue - ?) Where userId = ? AND orgId = ?',
        [orderTotal, orderFor, orgId]
      );

      await connection.execute(
        `INSERT INTO PointLog (pointGivenBy, pointGivenTo, orderId, orgId, pointBalance, pointChange, createdAt) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderBy,
          orderFor,
          orderId,
          orgId,
          pointValue - orderTotal,
          -orderTotal,
          createdAt
        ]
      );
    }

    await connection.commit();
    return orderId;
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

const getOrderFromDb = async (orderId) => {
  let connection;
  try {
    connection = await pool.getConnection();
    connection.beginTransaction();

    const [rows] = await connection.execute(
      `Select
      O.orderId,
      O.orderStatus,
      O.createdAt,
      O.orderBy,
      O.orderFor,
      O.orderTotal,
      O.orgId,
      O.addressId,
      O.dollarPerPoint as orderDollarPerPoint,
      S.*, 
      OI.*,
      Org.orgName,
      Org.orgDescription,
      Org.dollarPerPoint as orgDollarPerPoint,
      Org.orgStatus,
      U.userId as orderByUserId,
      U.firstName as orderByFirstName,
      U.lastName as orderByLastName,
      U.userType as orderByUserType,
      U.email as orderByEmail,
      U.picture as orderByPicture,
      U.userStatus as orderByUserStatus,
      U.selectedOrgId as orderBySelectedOrgId,
      U.createdAt as orderByCreatedAt,
      U2.userId as orderForUserId,
      U2.firstName as orderForFirstName,
      U2.lastName as orderForLastName,
      U2.userType as orderForUserType,
      U2.email as orderForEmail,
      U2.picture as orderForPicture,
      U2.userStatus as orderForUserStatus,
      U2.selectedOrgId as orderForSelectedOrgId,
      U2.createdAt as orderForCreatedAt
      FROM OrderInfo O
      LEFT JOIN ShippingAddress S 
      ON O.addressId = S.addressId
      LEFT JOIN OrderInfo_Item OI
      ON OI.orderId = O.orderId
      LEFT JOIN Organization Org 
      ON Org.orgId = O.orgId
      LEFT JOIN User U  
      ON U.userId = O.orderBy
      LEFT JOIN User U2 
      ON U2.userId = O.orderFor
      WHERE O.orderId = ?`,
      [orderId]
    );
    await connection.commit();

    const orders = {};

    await Promise.all(
      rows.map(async (row) => {
        try {
          const ebayItem = await getEbayItem(row.itemId);
          const orderExists = orders[row.orderId];
          if (orderExists) {
            orders[row.orderId]?.items.push({
              quantity: row.quantity,
              itemId: row.itemId,
              title: ebayItem?.title,
              price: ebayItem?.price?.value,
              image: ebayItem?.image,
              description: ebayItem?.shortDescription,
            });
          } else {
            orders[row.orderId] = {
              orderId: row.orderId,
              orderTotal: row.orderTotal,
              orderStatus: row.orderStatus,
              dollarPerPoint: row.orderDollarPerPoint,
              orderBy: {
                userId: row.orderByUserId,
                firstName: row.orderByFirstName,
                lastName: row.orderByLastName,
                userType: row.orderByUserType,
                email: row.orderByEmail,
                picture: row.orderByPicture,
                userStatus: row.orderByUserStatus,
                selectedOrgId: row.orderBySelectedOrgId,
                createdAt: row.orderByCreatedAt,
              },
              orderFor: {
                userId: row.orderForUserId,
                firstName: row.orderForFirstName,
                lastName: row.orderForLastName,
                userType: row.orderForUserType,
                email: row.orderForEmail,
                picture: row.orderForPicture,
                userStatus: row.orderForUserStatus,
                selectedOrgId: row.orderForSelectedOrgId,
                createdAt: row.orderForCreatedAt,
              },
              organization: {
                orgId: row.orgId,
                orgName: row.orgName,
                orgDescription: row.orgDescription,
                orgStatus: row.orgStatus,
                dollarPerPoint: row.orgDollarPerPoint,
              },
              createdAt: row.createdAt,
              shipping: {
                addressFirstName: row.addressFirstName,
                addressLastName: row.addressLastName,
                addressLineOne: row.addressLineOne,
                addressLineTwo: row.addressLineTwo,
                addressCity: row.addressCity,
                addressState: row.addressState,
                addressZip: row.addressZip,
                addressCountry: row.addressCountry,
              },
              items: [
                {
                  quantity: row.quantity,
                  itemId: row.itemId,
                  title: ebayItem?.title,
                  price: ebayItem?.price?.value,
                  image: ebayItem?.image,
                  description: ebayItem?.shortDescription,
                },
              ],
            };
          }
        } catch (error) {}
      })
    );

    return orders[orderId];
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

const getOrdersFromDb = async (params = {}) => {
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

  const numericOffset = +offset;
  const numericLimit = +limit;
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
      LEFT JOIN ShippingAddress S 
      ON O.addressId = S.addressId
      LEFT JOIN OrderInfo_Item OI
      ON OI.orderId = O.orderId
      LEFT JOIN Organization Org 
      ON Org.orgId = O.orgId
      LEFT JOIN User U  
      ON U.userId = O.orderBy
      LEFT JOIN User U2 
      ON U2.userId = O.orderFor ${whereClause}`,
      values
    );

    const [rows] = await connection.query(
      `Select
      O.orderId,
      O.orderStatus,
      O.createdAt,
      O.orderBy,
      O.orderFor,
      O.orderTotal,
      O.orgId,
      O.addressId,
      O.dollarPerPoint as orderDollarPerPoint,
      S.*, 
      OI.*,
      Org.orgName,
      Org.orgDescription,
      Org.dollarPerPoint as orgDollarPerPoint,
      Org.orgStatus,
      U.userId as orderByUserId,
      U.firstName as orderByFirstName,
      U.lastName as orderByLastName,
      U.userType as orderByUserType,
      U.email as orderByEmail,
      U.picture as orderByPicture,
      U.userStatus as orderByUserStatus,
      U.selectedOrgId as orderBySelectedOrgId,
      U.createdAt as orderByCreatedAt,
      U2.userId as orderForUserId,
      U2.firstName as orderForFirstName,
      U2.lastName as orderForLastName,
      U2.userType as orderForUserType,
      U2.email as orderForEmail,
      U2.picture as orderForPicture,
      U2.userStatus as orderForUserStatus,
      U2.selectedOrgId as orderForSelectedOrgId,
      U2.createdAt as orderForCreatedAt
      FROM OrderInfo O
      LEFT JOIN ShippingAddress S 
      ON O.addressId = S.addressId
      LEFT JOIN OrderInfo_Item OI
      ON OI.orderId = O.orderId
      LEFT JOIN Organization Org 
      ON Org.orgId = O.orgId
      LEFT JOIN User U  
      ON U.userId = O.orderBy
      LEFT JOIN User U2 
      ON U2.userId = O.orderFor
      ${whereClause} ORDER BY O.orderId DESC LIMIT ? OFFSET ?`,
      [...values, numericLimit, numericOffset]
    );
    await connection.commit();

    return {
      total: countResult[0].total,
      offset,
      limit,
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

const modifyOrderInDb = async (orderId, order = {}) => {
  const {
    orderStatus = null,
    orderBy = null,
    orderFor = null,
    orderTotal = null,
    orgId = null,
  } = order;

  let connection;
  try {
    connection = await pool.getConnection();
    connection.beginTransaction();

    const updateFields = [];
    const updateValues = [];

    if (orderStatus) {
      updateFields.push('orderStatus = ?');
      updateValues.push(orderStatus);
    }
    if (orderBy) {
      updateFields.push('orderBy = ?');
      updateValues.push(orderBy);
    }
    if (orderFor) {
      updateFields.push('orderFor = ?');
      updateValues.push(orderFor);
    }
    if (orderTotal) {
      updateFields.push('orderTotal = ?');
      updateValues.push(orderTotal);
    }
    if (orgId) {
      updateFields.push('orgId = ?');
      updateValues.push(orgId);
    }

    if (updateFields.length > 0) {
      const updateQuery = `UPDATE OrderInfo SET ${updateFields.join(
        ', '
      )} WHERE orderId = ?`;
      updateValues.push(orderId);

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

const createRandomOrders = async (params = {}) => {
  try {
    const ebayItems = await getEbayItems({
      q: 'iphone',
      limit: 100,
      offset: 0,
    });

    const startDate = new Date('2023-01-01');

    const drivers = await getUsersFromDb({
      filters: { userType: 'DriverUser' },
    });

    // Loop through each driver
    for (const driver of drivers) {
      const org = getRandomElement(driver.organizations);

      // Loop through each month
      for (let month = 0; month < 12; month++) {
        // Set start and end date for the current month
        const monthStart = new Date(startDate);
        monthStart.setMonth(startDate.getMonth() + month);
        monthStart.setDate(1);
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthStart.getMonth() + 1);
        monthEnd.setDate(0);

        for (let i = 0; i < 2; i++) {
          const randomTimestamp = getRandomTimestamp(monthStart, monthEnd);
          const randomItem = getRandomElement(ebayItems.itemSummaries);

          const order = {
            orderStatus: 'completed',
            orderBy: driver.userId,
            orderFor: driver.userId,
            orderInfo: {
              0: [
                {
                  productId: randomItem['itemId'],
                  quantity: 1,
                  price: randomItem['price']['value'] / org.dollarPerPoint,
                },
              ],
            },
            createdAt: randomTimestamp,
            orgId: org.orgId,
            addressFirstName: driver.firstName,
            addressLastName: driver.lastName,
            addressLineOne: '101 test lane',
            addressLineTwo: null,
            addressCity: 'Clemson',
            addressState: 'SC',
            addressZip: '29603',
            addressCountry: 'USA',
            dollarPerPoint: org.dollarPerPoint,
          };
          await saveOrderToDb(order);
        }
      }
    }

    return {
      message: 'created',
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = {
  createRandomOrders,
  saveOrderToDb,
  getOrdersFromDb,
  modifyOrderInDb,
  getOrderFromDb,
};
