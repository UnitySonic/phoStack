const axios = require('axios').default;

async function getToken(secrets) {
  const { AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_AUDIENCE } =
    secrets;
  try {
    const response = await axios.post(
      `https://${AUTH0_DOMAIN}/oauth/token`,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: AUTH0_CLIENT_ID,
        client_secret: AUTH0_CLIENT_SECRET,
        audience: AUTH0_AUDIENCE,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Handler that will be called during the execution of a PostUserRegistration flow.
 *
 * @param {Event} event - Details about the context and user that has registered.
 * @param {PostUserRegistrationAPI} api - Methods and utilities to help change the behavior after a signup.
 */
exports.onExecutePostUserRegistration = async (event, api) => {
  const { created_at, email, picture, user_id } = event.user;
  const user = {
    createdAt: new Date(created_at).toISOString().slice(0, 19).replace('T', ' '),
    email,
    picture,
    userId: user_id,
    userType: 'NewUser'
  }
  try {
    const url = `${event.secrets.EXPRESS_API}/users`;
  
    const accessToken = await getToken(event.secrets);
  
    const response = await axios.post(url, user, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });
  
    if (!response.status === 200) {
      throw new Error('Failed to save new user');
    }
  } catch (error) {
    console.error('Error saving new user', error);
    throw error;
  }
};
