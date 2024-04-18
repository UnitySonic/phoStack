const express = require('express');
const invoiceRouter = express.Router();
const {
    fetchInvoice,
} = require('./invoice.controller');

invoiceRouter.route('').get(fetchInvoice)

module.exports = invoiceRouter;