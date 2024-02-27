require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'local'}` });
const {
  getApplicationsFromDb,
  saveApplicationToDb,
  modifyApplicationInDb,
  getApplicationFromDb,
} = require('./applications.service');

const {
  saveApplicationLogToDb,
} = require('../audit-logs/applications/logs.applications.service');

const { modifyUserInDb, changeUserType } = require('../users/users.service');

const saveApplication = async (req, res, next) => {
  const userId = req.auth.payload.sub;
  const { firstName, lastName, orgId } = req.body;
  try {
    const result = await getApplicationsFromDb({ userId });
    const userApplications = result?.applications;

    const isApproved = userApplications.some(
      (application) => application.applicationStatus == 'approved'
    );
    const isNew = userApplications.some(
      (application) =>
        application.orgId == orgId && application.applicationStatus == 'new'
    );

    if (isApproved || isNew) {
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

    const isApprovedToBeDriver =
      application.applicationStatus == 'new' && applicationStatus == 'approved';

    if (isApprovedToBeDriver) {
      await changeUserType(application.userId, {
        userType: 'DriverUser',
        orgId: application.orgId,
        pointValue: 0,
      });
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
