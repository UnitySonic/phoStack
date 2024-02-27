const express = require('express');
const applicationLogsRouter = express.Router();
const { fetchApplicationLogs } = require('./logs.applications.controller');

applicationLogsRouter.route('/').get(fetchApplicationLogs);

module.exports = applicationLogsRouter;
