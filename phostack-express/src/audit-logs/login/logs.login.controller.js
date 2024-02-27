const { getLoginLogsFromAuth0 } = require('./logs.login.service');

const fetchLoginLogs = async (req, res) => {
  try {
    const results = await getLoginLogsFromAuth0({
      q: `type: "s" OR "f" OR "fp"`,

    });
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};

module.exports = { fetchLoginLogs };