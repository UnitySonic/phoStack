const express = require('express');
const organizationRouter = express.Router();
const {
  fetchOrganizations,
  fetchOrganization,
  createOrganization,
  patchOrganization,
} = require('./organizations.controller');

organizationRouter.route('/').get(fetchOrganizations).post(createOrganization);
organizationRouter.route('/:orgId').get(fetchOrganization).patch(patchOrganization);
module.exports = organizationRouter;
