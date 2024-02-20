const express = require('express');
const organizationRouter = express.Router();
const {
  fetchOrganizations,
  createOrganization,
  patchOrganization,
} = require('./organizations.controller');

organizationRouter.route('/').get(fetchOrganizations).post(createOrganization);
organizationRouter.route('/:orgId').patch(patchOrganization);
module.exports = organizationRouter;
