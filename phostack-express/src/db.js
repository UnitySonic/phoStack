const mysql = require('mysql2/promise');
require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'local'}` });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: 'admin',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 1000,
  maxIdle: 1000, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
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

module.exports = {
  pool,
};
