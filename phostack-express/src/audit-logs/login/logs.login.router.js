const express = require('express');
const LoginLogsRouter = express.Router();
const { fetchLoginLogs } = require('./logs.login.controller');

LoginLogsRouter.route('/').get(fetchLoginLogs);

module.exports = LoginLogsRouter;