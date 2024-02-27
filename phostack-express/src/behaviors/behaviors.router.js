const express = require('express');
const behaviorRouter = express.Router();
const {
  fetchBehaviors,
  fetchBehaviorsByOrgId,
  createBehavior
} = require('./behaviors.controller');

behaviorRouter.route('/').get(fetchBehaviors).post(createBehavior);
behaviorRouter.route('/:orgId').get(fetchBehaviorsByOrgId)

module.exports = behaviorRouter;