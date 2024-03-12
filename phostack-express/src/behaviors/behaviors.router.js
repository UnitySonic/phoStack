const express = require('express');
const behaviorRouter = express.Router();
const {
  fetchBehaviors,
  fetchBehaviorsByOrgId,
  createBehavior,
  patchBehavior
} = require('./behaviors.controller');

behaviorRouter.route('/').get(fetchBehaviors).post(createBehavior);
behaviorRouter.route('/:orgId').get(fetchBehaviorsByOrgId);
behaviorRouter.route('/:behaviorId').patch(patchBehavior);

module.exports = behaviorRouter;