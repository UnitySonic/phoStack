const { pool } = require('../db');
const { getEbayItem } = require('../ebay/ebay.service');

const addCartItemToDb = async (cartId, itemData = {}) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Check if the cart item already exists
    const [existingRows] = await connection.execute(
      'SELECT quantity FROM CartItem WHERE cartId = ? AND itemId = ?',
      [cartId, itemData.productId]
    );

    if (existingRows.length > 0) {
      // If the cart item already exists, update the quantity by adding the new quantity
      const currentQuantity = existingRows[0].quantity;
      const newQuantity = currentQuantity + itemData.quantity;

      await connection.execute(
        'UPDATE CartItem SET quantity = ? WHERE cartId = ? AND itemId = ?',
        [newQuantity, cartId, itemData.productId]
      );
    } else {
      // If the cart item doesn't exist, insert a new row
      await connection.execute(
        'INSERT INTO CartItem (cartId, itemId, quantity) VALUES (?, ?, ?)',
        [cartId, itemData.productId, itemData.quantity]
      );
    }

    // Commit the transaction
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



const modifyCartItemInDb = async (cartId, itemData = {}) => {
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    console.log("Hello from modify Cart Service");

    // Loop through each itemData object using for...of loop
    for (const item of Object.values(itemData)) {
      const itemId = item[0].productId;
      const quantity = item[0].quantity;

      // If quantity is 0, delete the cartId/itemId pair
      if (quantity === 0) {
        await connection.execute(
          'DELETE FROM CartItem WHERE cartId = ? AND itemId = ?',
          [cartId, itemId]
        );
      } else {
        // Otherwise, update the quantity
        await connection.execute(
          'INSERT INTO CartItem (cartId, itemId, quantity) VALUES (?, ?, ?) ' +
          'ON DUPLICATE KEY UPDATE quantity = ?',
          [cartId, itemId, quantity, quantity]
        );
      }
    }

    // Commit the transaction
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



const getCartItemFromDb = async (cartId) => {
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      'SELECT itemId, quantity FROM CartItem WHERE cartId = ?',
      [cartId]
    );

    // Return array of cart items
    return rows;
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


const getCartIdFromDb = async (userInfo = {}) => {
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      'SELECT cartId FROM Cart WHERE userId = ? AND orgId = ?',
      [userInfo.userId, userInfo.orgId]
    );

    // Check if any rows were returned
    if (rows.length > 0) {
      // Extract and return the cartId from the first row

      return rows[0].cartId;
    } else {
      const [cartInsertResult] = await connection.execute(
        'INSERT INTO Cart (userId, orgId) VALUES(?,?)', [userInfo.userId, userInfo.orgId]
      )
      const newCartId = cartInsertResult.insertId

      return newCartId

    }
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

const clearCartFromDb = async (cartId) => {
  let connection;
  console.log("trying to clear carst")

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [result] = await connection.execute(
      'DELETE FROM CartItem Where cartId = ?', [cartId]
    )
    await connection.commit()

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
};


module.exports = {
  addCartItemToDb,
  modifyCartItemInDb,
  getCartItemFromDb,
  getCartIdFromDb,
  clearCartFromDb,
}