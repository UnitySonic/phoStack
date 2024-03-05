const express = require('express');
const LoginLogsRouter = express.Router();
const { fetchLoginLogs, fetchLoginLogsForOrg } = require('./logs.login.controller');

LoginLogsRouter.route('/').get(fetchLoginLogs);
LoginLogsRouter.route('/:orgId').get(fetchLoginLogsForOrg);

module.exports = LoginLogsRouter;