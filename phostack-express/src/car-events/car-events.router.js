const express = require('express');
const carEventsRouter = express.Router();
const {
  fetchCarEvents
} = require('./car-events.controller');

carEventsRouter.route('/').get(fetchCarEvents)

module.exports = carEventsRouter;