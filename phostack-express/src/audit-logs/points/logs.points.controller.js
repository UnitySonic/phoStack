const { getPointsLogsFromDb, savePointLogToDb } = require('./logs.points.service');

const fetchPointsLogs = async (req, res) => {
  try {
    const results = await getPointsLogsFromDb(req.query);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};

const recordPointLog = async (req, res) => {
  try {
    const results = await savePointLogToDb(req.body);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};

module.exports = { fetchPointsLogs, recordPointLog };