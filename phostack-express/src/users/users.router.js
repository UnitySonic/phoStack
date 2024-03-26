const express = require('express');
const usersRouter = express.Router();
const {
  saveUser,
  fetchUsers,
  fetchUser,
  changeUser,
  fetchDriversByOrgId,
  addNewSponsorUser,
  addNewDriverUser,
  fetchDrivers,
  fetchSponsors,
  fetchAdmins,
  addNewAdminUser,
  changeUserPassword,
  seedData
} = require('./users.controller');

usersRouter.route('/admins').get(fetchAdmins).post(addNewAdminUser);
usersRouter.route('/drivers').get(fetchDrivers);
usersRouter.route('/sponsors').get(fetchSponsors);
usersRouter
  .route('/drivers/:orgId')
  .get(fetchDriversByOrgId)
  .post(addNewDriverUser);
usersRouter.route('/sponsors/:orgId').post(addNewSponsorUser);
usersRouter.route('/:id').get(fetchUser).patch(changeUser);
usersRouter.route('/').get(fetchUsers).post(saveUser);
usersRouter.route('/:id/password').post(changeUserPassword);
usersRouter.route('/seed').post(seedData);

module.exports = usersRouter;
