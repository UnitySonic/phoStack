const { getLoginLogsFromAuth0 } = require('./logs.login.service');
const {
  getSponsorsByOrgId,
  getDriversByOrgId,
} = require('../../users/users.service');

const { getUserFromDbById } = require('../../users/users.service');

const fetchLoginLogs = async (req, res) => {
  try {
    const results = await getLoginLogsFromAuth0(req.query);
    const data = await Promise.all(
      results.map(async (result) => {
        const user = await getUserFromDbById(result.user_id);
        const { orgId, orgName } = user || {};
        return {
          ...result,
          orgId,
          orgName,
        };
      })
    );
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};

const fetchLoginLogsForOrg = async (req, res) => {
  const { orgId } = req.params;

  try {
    const sponsors = await getSponsorsByOrgId(orgId);
    const drivers = await getDriversByOrgId(orgId);
    const sponsorIds = sponsors.map((sponsor) => sponsor.userId);
    const driverIds = drivers.map((driver) => driver.userId);
    const ids = [...sponsorIds, ...driverIds];

    const results = await getLoginLogsFromAuth0(req.query);
    const data = results.filter((row) => ids.includes(row.user_id));
    const newData = await Promise.all(
      data.map(async (result) => {
        const user = await getUserFromDbById(result.user_id);
        const { orgId, orgName } = user || {};
        return {
          ...result,
          orgId,
          orgName,
        };
      })
    );
    res.json(newData)
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};

module.exports = { fetchLoginLogs, fetchLoginLogsForOrg };
