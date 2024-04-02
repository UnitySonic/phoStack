const express = require('express');
const cartRouter = express.Router();
const { addToCart, modifyCart, getCart, getCartId, clearCart, } = require('./carts.controller');



cartRouter.route('/cartId').get(getCartId);

cartRouter.route('/:cartId')
  .get(getCart)
  .post(addToCart)
  .patch(modifyCart)
  .delete(clearCart);

module.exports = cartRouter;