const { pool } = require('../db');
const { getEbayItem } = require('../ebay/ebay.service');

const saveOrderToDb = async (orderData) => {
  const {
    orderStatus = 'processing',
    orderBy,
    orderFor,
    orderTotal,
    itemID,
    quantity = 1,
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

    const addressId = addressInfoInsertResult.insertId;
    const [orgInfoInsertResult] = await connection.execute(
      'INSERT INTO OrderInfo (orderStatus, orderBy, orderFor, orderTotal, orgId, addressId, dollarPerPoint) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        orderStatus,
        orderBy,
        orderFor,
        orderTotal,
        orgId,
        addressId,
        dollarPerPoint,
      ]
    );

    const orderID = orgInfoInsertResult.insertId;
    await connection.execute(
      'INSERT INTO OrderInfo_Item (orderId, itemId, quantity) VALUES (?, ?, ?)',
      [orderID, itemID, quantity] // Change 'insertID' to 'insertId'
    );

    await connection.execute(
      'INSERT INTO PointLog (pointGivenBy, pointGivenTo, orderID, orgId) VALUES (?, ?, ?, ?)',
      [orderBy, orderFor, orderID, orgId] // Change 'insertID' to 'insertId'
    );

    const [rows, fields] = await connection.execute(
      'SELECT pointValue FROM User WHERE userId = ?',
      [orderFor]
    );
    const pointValue = rows[0].pointValue;

    if (pointValue < orderTotal) {
      throw new Error('Insufficient Points to complete Order. Desync?');
    } else {
      await connection.execute(
        'UPDATE User Set pointValue = ? Where userId = ?',
        [pointValue - orderTotal, orderFor]
      );
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
      U.pointValue as orderByPointValue,
      U.selectedOrgId as orderBySelectedOrgId,
      U.createdAt as orderByCreatedAt,
      U2.userId as orderForUserId,
      U2.firstName as orderForFirstName,
      U2.lastName as orderForLastName,
      U2.userType as orderForUserType,
      U2.email as orderForEmail,
      U2.picture as orderForPicture,
      U2.userStatus as orderForUserStatus,
      U2.pointValue as orderForPointValue,
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
              pointValue: row.orderByPointValue,
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
              pointValue: row.orderForPointValue,
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

const getOrdersFromDb = async (params) => {
  const {
    offset = 0,
    limit = 1000,
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
      U.pointValue as orderByPointValue,
      U.selectedOrgId as orderBySelectedOrgId,
      U.createdAt as orderByCreatedAt,
      U2.userId as orderForUserId,
      U2.firstName as orderForFirstName,
      U2.lastName as orderForLastName,
      U2.userType as orderForUserType,
      U2.email as orderForEmail,
      U2.picture as orderForPicture,
      U2.userStatus as orderForUserStatus,
      U2.pointValue as orderForPointValue,
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
      ${whereClause} ORDER BY O.createdAt DESC LIMIT ? OFFSET ?`,
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

const modifyOrderInDb = async (orderId, order) => {
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

module.exports = {
  saveOrderToDb,
  getOrdersFromDb,
  modifyOrderInDb,
  getOrderFromDb,
};
