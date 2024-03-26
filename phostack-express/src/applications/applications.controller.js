require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'local'}` });
const {
  getApplicationsFromDb,
  saveApplicationToDb,
  modifyApplicationInDb,
  getApplicationFromDb,
} = require('./applications.service');

const {
  addOrganizationToUser,
  getUserFromDbById,
} = require('../users/users.service');
const {
  saveApplicationLogToDb,
} = require('../audit-logs/applications/logs.applications.service');

const { modifyUserInDb, changeUserType } = require('../users/users.service');

const saveApplication = async (req, res, next) => {
  const { firstName, lastName, orgId, userId} = req.body;
  try {
    const user = await getUserFromDbById(userId);
    const userAlreadyInOrganization = user?.organizations?.find(
      (org) => org.orgId == orgId
    );
    if (userAlreadyInOrganization) {
      console.log(
        `Failed to created application. User ${userId} already in orgId: ${orgId}`
      );
      return res.status(403).json({ message: 'Forbidden' });
    }
    const result = await getApplicationsFromDb({ userId });
    const userApplications = result?.applications;

    const applicationForOrgAlreadyExistsOrApproved = userApplications.some(
      (application) =>
        application.orgId == orgId &&
        (application.applicationStatus == 'new' ||
          application.applicationStatus == 'approved')
    );

    if (applicationForOrgAlreadyExistsOrApproved) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await modifyUserInDb(userId, { firstName, lastName });
    const r = await saveApplicationToDb(userId, req.body);
    await saveApplicationLogToDb({
      applicationId: r.insertId,
      applicationStatus: 'new',
      reason: 'new',
    });
    res.status(200).json({ message: 'success' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};

const fetchApplications = async (req, res) => {
  try {
    const result = await getApplicationsFromDb(req.query);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};

const changeApplication = async (req, res) => {
  const { reason = null, applicationStatus = null } = req.body;
  try {
    const application = await getApplicationFromDb(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Not found!' });
    }
    const cannotCancel =
      application.applicationStatus != 'new' && applicationStatus == 'canceled';

    if (cannotCancel) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const user = await getUserFromDbById(application.userId);
    const userAlreadyInOrganization = user?.organizations?.find(
      (org) => org.orgId == application.orgId
    );

    const isApprovedToBeDriver =
      application.applicationStatus != 'approved' &&
      applicationStatus == 'approved' && !userAlreadyInOrganization;

    if (isApprovedToBeDriver) {
      await changeUserType(application.userId, {
        userType: 'DriverUser',
      });
      const hasNoOrganization = user?.organizations?.length == 0;
      if (hasNoOrganization) {
        await modifyUserInDb(application.userId, {
          selectedOrgId: application.orgId,
        });
      }
      await addOrganizationToUser(application.userId, application.orgId);
    }

    await modifyApplicationInDb(application.applicationId, req.body);
    await saveApplicationLogToDb({
      applicationId: application.applicationId,
      applicationStatus,
      reason,
    });
    return res.status(200).json({ message: 'success' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};

module.exports = {
  saveApplication,
  fetchApplications,
  changeApplication,
};
