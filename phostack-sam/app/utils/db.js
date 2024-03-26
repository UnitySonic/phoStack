const mysql = require('mysql2/promise');
const { getSecret } = require('./secretsManager');

let pool = null;

const getPool = async () => {
  const DB_SECRETS = await getSecret();
  const { username, password, host } = DB_SECRETS;
  if (pool) {
    return pool;
  }

  pool = mysql.createPool({
    host: host,
    user: username,
    password: password,
    database: 'PhoStack',
    waitForConnections: true,
    connectionLimit: 1000,
    maxIdle: 1000,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    dateStrings: true,
    typeCast: function (field, next) {
      if (field.type === 'DECIMAL' || field.type === 'NEWDECIMAL') {
        return parseFloat(field.string());
      }
      return next();
    },
  });

  return pool;
};

module.exports = {
  getPool,
};
