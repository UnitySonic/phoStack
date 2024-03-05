const { pool } = require('../db');

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
  } = orderData;
  let connection;
  try {
    connection = await pool.getConnection();
    connection.beginTransaction();



    const [addressInfoInsertResult] = await connection.execute(
      'INSERT INTO ShippingAddress (addressFirstName, addressLastName, addressLineOne, addressLineTwo, addressCity, addressState, addressZip, addressCountry) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [addressFirstName, addressLastName, addressLineOne, addressLineTwo, addressCity, addressState, addressZip, addressCountry]
    );


    const addressId = addressInfoInsertResult.insertId
    const [orgInfoInsertResult] = await connection.execute(
      'INSERT INTO OrderInfo (orderStatus, orderBy, orderFor, orderTotal, orgId, addressId) VALUES (?, ?, ?, ?, ?, ?)',
      [orderStatus, orderBy, orderFor, orderTotal, orgId, addressId]
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

module.exports = { saveOrderToDb };
