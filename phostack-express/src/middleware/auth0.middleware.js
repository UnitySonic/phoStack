const {
  auth,
  claimCheck,
  InsufficientScopeError,
} = require('express-oauth2-jwt-bearer');
const { ManagementClient } = require('auth0');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'local'}` });

const validateAccessToken = auth({
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  audience: process.env.AUTH0_AUDIENCE,
});

const checkRequiredPermissions = (requiredPermissions) => {
  return (req, res, next) => {
    const permissionCheck = claimCheck((payload) => {
      const permissions = payload.permissions || [];

      const hasPermissions = requiredPermissions.every((requiredPermission) =>
        permissions.includes(requiredPermission)
      );

      if (!hasPermissions) {
        throw new InsufficientScopeError();
      }

      return hasPermissions;
    });

    permissionCheck(req, res, next);
  };
};

const getToken = async () => {
  try {
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
      client_secret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
      audience: process.env.AUTH0_MANAGEMENT_AUDIENCE,
    });

    const response = await fetch(
      `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get token');
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error(error);
  }
};

let managementClientInstance = null;
let authToken = null;
let tokenExpirationTime = null;

const getManagementClient = async () => {
  if (!managementClientInstance || isTokenExpired()) {
    authToken = await getToken();
    managementClientInstance = new ManagementClient({
      domain: process.env.AUTH0_DOMAIN,
      token: authToken,
    });
    tokenExpirationTime = decodeToken(authToken).exp * 1000;
  }
  return managementClientInstance;
};

const isTokenExpired = () => {
  if (!authToken || !tokenExpirationTime) {
    return true;
  }
  return Date.now() >= tokenExpirationTime;
};

const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

module.exports = {
  validateAccessToken,
  checkRequiredPermissions,
  getToken,
  getManagementClient,
};
