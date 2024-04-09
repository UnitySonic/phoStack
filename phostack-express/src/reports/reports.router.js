const express = require('express');
const reportsRouter = express.Router();
const {
  fetchSalesReport,
  fetchSalesReportData
} = require('./reports.controller');

reportsRouter.route('/sales').get(fetchSalesReport)
reportsRouter.route('/sales-data').get(fetchSalesReportData)

module.exports = reportsRouter;