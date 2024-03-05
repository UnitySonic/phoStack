const express = require('express');
const pointsLogsRouter = express.Router();
const { fetchPointsLogs } = require('./logs.points.controller');

pointsLogsRouter.route('/').get(fetchPointsLogs);

module.exports = pointsLogsRouter;