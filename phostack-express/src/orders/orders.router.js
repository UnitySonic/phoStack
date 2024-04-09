const express = require('express');
const orderRouter = express.Router();
const {
  saveOrder,
  fetchOrders,
  changeOrder,
  fetchOrder,
  seedRandomOrders,
} = require('./orders.controller');

orderRouter.route('/').get(fetchOrders).post(saveOrder);
orderRouter.route('/test').get(seedRandomOrders);
orderRouter.route('/:orderId').patch(changeOrder).get(fetchOrder);

module.exports = orderRouter;
