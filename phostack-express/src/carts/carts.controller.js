const {
  addCartItemToDb,
  modifyCartItemInDb,
  getCartItemFromDb,
  getCartIdFromDb,
  clearCartFromDb,
} = require('./carts.service');
const { getEbayItem } = require('../ebay/ebay.service');



const addToCart = async (req, res) => {
  try {
    await addCartItemToDb(req.params.cartId, req.body);
    res.status(200).json({ message: 'Success' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};


const getCartId = async (req, res) => {
  try {
    const data = await getCartIdFromDb(req.query);
    const { rows, total, offset, limit } = data;
    const cartItems = {};



    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};


const getCart = async (req, res) => {
  try {
    const data = await getCartItemFromDb(req.params.cartId);

    const { rows, total, offset, limit } = data;
    const cartItems = {};


    await Promise.all(
      data.map(async (row) => {
        const ebayItem = await getEbayItem(row.itemId);



        // Check if the itemId is already in the cartItems dictionary
        if (!cartItems[row.itemId]) {
          // If not, initialize it with an empty array
          cartItems[row.itemId] = [];
        }

        // Push item information to the array for the corresponding itemId
        cartItems[row.itemId].push({
          quantity: row.quantity,
          productId: row.itemId,
          title: ebayItem?.title,
          price: ebayItem?.price?.value,
          imageUrl: ebayItem?.image?.imageUrl,
          description: ebayItem?.shortDescription,
        });
      })
    );

    res.status(200).json(cartItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};

const modifyCart = async (req, res) => {

  try {
    await modifyCartItemInDb(req.body.cartId, req.body.cartData);
    res.status(200).json({ message: 'Success' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};

const clearCart = async (req, res) => {

  try {
    await clearCartFromDb(req.params.cartId);
    res.status(200).json({ message: 'Success' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};



module.exports = {
  addToCart,
  getCart,
  modifyCart,
  getCartId,
  clearCart,
};
