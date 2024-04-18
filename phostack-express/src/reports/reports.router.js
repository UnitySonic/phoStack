const express = require('express');
const reportsRouter = express.Router();
const {
  fetchSalesReport,
  fetchSalesReportData,
  fetchPointsReport
} = require('./reports.controller');

reportsRouter.route('/sales').get(fetchSalesReport)
reportsRouter.route('/sales-data').get(fetchSalesReportData)
reportsRouter.route('/points').get(fetchPointsReport)

module.exports = reportsRouter;