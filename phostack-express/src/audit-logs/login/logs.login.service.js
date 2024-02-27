const { getManagementClient } = require('../../middleware/auth0.middleware');

const getLoginLogsFromAuth0 = async (params) => {
  try {
    const managementClient = await getManagementClient();
    const response = await managementClient.logs.getAll(params)
    const {data} = response;
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = { getLoginLogsFromAuth0 };
