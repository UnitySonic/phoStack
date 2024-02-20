const express = require('express');
const applicationsRouter = express.Router();
const {
  saveApplication,
  fetchApplications,
  changeApplication,
} = require('./applications.controller');

applicationsRouter.route('/').get(fetchApplications).post(saveApplication);
applicationsRouter.route('/:id').patch(changeApplication);

module.exports = applicationsRouter;
