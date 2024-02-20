const express = require('express');
const orderRouter = express.Router();
const { saveOrder } = require('./orders.controller');

orderRouter.route('/').post(saveOrder);
module.exports = orderRouter;
