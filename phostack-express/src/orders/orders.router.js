const express = require('express');
const orderRouter = express.Router();
const { saveOrder, fetchOrders, changeOrder, fetchOrder} = require('./orders.controller');

orderRouter.route('/').get(fetchOrders).post(saveOrder);
orderRouter.route('/:orderId').patch(changeOrder).get(fetchOrder)

module.exports = orderRouter;
