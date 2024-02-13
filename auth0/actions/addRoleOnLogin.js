const axios = require("axios").default;

const getToken = async (clientSecret) => {
  try {
    const options = {
      method: 'POST',
      url: 'https://dev-2awtbu1bbrbmb57l.us.auth0.com/oauth/token',
      headers: {'content-type': 'application/x-www-form-urlencoded'},
      data: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: '7t9xv9epvjHh9uccbIHD1cls9PoXIImj',
        client_secret: clientSecret,
        audience: 'https://dev-2awtbu1bbrbmb57l.us.auth0.com/api/v2/'
      })
    };

    const response = await axios.request(options);
    return response.data.access_token;
  } catch (error) {
    console.error(error);
  }
}

/**
* Handler that will be called during the execution of a PostLogin flow.
*
* @param {Event} event - Details about the user and the context in which they are logging in.
* @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
*/
exports.onExecutePostLogin = async (event, api) => {
  const userHasRoles = event.authorization && event.authorization.roles && event.authorization.roles.length > 0;
  if (userHasRoles) return;
  
  const token = await getToken(event.secrets.CLIENT_SECRET)
  const ManagementClient = require("auth0").ManagementClient;
  const managementClient = new ManagementClient({
    domain: 'dev-2awtbu1bbrbmb57l.us.auth0.com',
    token
  });

  const USER_ROLE_ID = 'rol_UwqoIltKG95epPAF'
  const params = { id : event.user.user_id }
  const data = { roles: [USER_ROLE_ID]}

  try {
    await managementClient.users.assignRoles(params, data);
  } catch (e) {
    console.log(e)
  }
};


/**
* Handler that will be invoked when this action is resuming after an external redirect. If your
* onExecutePostLogin function does not perform a redirect, this function can be safely ignored.
*
* @param {Event} event - Details about the user and the context in which they are logging in.
* @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
*/
// exports.onContinuePostLogin = async (event, api) => {
// };
