const express = require('express');
const pointsLogsRouter = express.Router();
const { fetchPointsLogs, recordPointLog } = require('./logs.points.controller');

pointsLogsRouter.route('/').get(fetchPointsLogs).post(recordPointLog);


module.exports = pointsLogsRouter;