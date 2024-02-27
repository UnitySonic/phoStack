const { getApplicationLogsFromDb } = require('./logs.applications.service');

const fetchApplicationLogs = async (req, res) => {
  try {
    const results = await getApplicationLogsFromDb(req.query);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};

module.exports = { fetchApplicationLogs };
