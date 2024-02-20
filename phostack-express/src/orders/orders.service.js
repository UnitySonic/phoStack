const { pool } = require('../db');

const saveOrderToDb = async (orderData) => {
    const {
      orderStatus = "processing",
      orderBy,
      orderFor,
      orderTotal,
      itemID,
      quantity

    } = orderData;
    let connection;
    try {
      connection = await pool.getConnection();
      connection.beginTransaction();

      const missingFields = [];
      if (!orderBy) {
        missingFields.push("'orderBy'");
      }
      if (!orderFor) {
        missingFields.push("'orderFor'");
      }
      if (!itemID) {
        missingFields.push("'itemID'");
      }
      if (quantity === undefined) {
        missingFields.push("'quantity'");
      }

      if (missingFields.length > 0) {
        const missingFieldsMsg = missingFields.join(", ");
        throw new Error(`Missing required field(s) in orderData: ${missingFieldsMsg}`);
      }
  
      const [insertResult] = await connection.execute(
        'INSERT INTO OrderInfo (orderStatus, orderBy, orderFor, orderTotal) VALUES (?, ?, ?, ?)',
      [orderStatus, orderBy, orderFor, orderTotal],
      );

      const orderID = insertResult.insertId;
      await connection.execute(
      'INSERT INTO OrderInfo_Item (orderId, itemId, quantity) VALUES (?, ?, ?)',
          [orderID, itemID, quantity], // Change 'insertID' to 'insertId'
      );

      await connection.execute(
        'INSERT INTO PointLog (pointGivenBy, pointGivenTo, orderID) VALUES (?, ?, ?)',
          [orderBy, orderFor, orderID], // Change 'insertID' to 'insertId'

      )

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

  module.exports = { saveOrderToDb }
  