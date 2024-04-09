require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'local'}` });
const express = require('express');
const app = express();
const cors = require('cors');
const { errorHandler } = require('./middleware/error.middleware');
const { notFoundHandler } = require('./middleware/not-found.middleware');
const {
  validateAccessToken,
  checkRequiredPermissions,
  getManagementClient,
} = require('./middleware/auth0.middleware');
const ebayRouter = require('./ebay/ebay.router');
const catalogRouter = require('./catalog/catalog.router');
const usersRouter = require('./users/users.router');
const organizationsRouter = require('./organizations/organizations.router');
const applicationsRouter = require('./applications/applications.router');
const orderRouter = require('./orders/orders.router');
const applicationLogsRouter = require('./audit-logs/applications/logs.applications.router');
const LoginLogsRouter = require('./audit-logs/login/logs.login.router');
const pictureRouter = require('./profile-picture/picture.router');
const behaviorRouter = require('./behaviors/behaviors.router');
const pointsLogsRouter = require('./audit-logs/points/logs.points.router');
const carEventsRouter = require('./car-events/car-events.router');
const cartRouter = require('./carts/carts.router');
const reportsRouter = require('./reports/reports.router')

const { logger } = require('./logger');
const { pool } = require('./db');

const whitelist = ['https://team24.cpsc4911.com', 'http://localhost:5173'];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use((req, res, next) => {
  logger.info(`Received a ${req.method} request for ${req.url}`);
  next();
});

/* --- UNPROTECTED ROUTES --- */

app.get('/', (req, res) => {
  res.send('hello there');
});
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'OK!' });
});

app.get('/about', async (req, res) => {
  try {
    const [rows, fields] = await pool.execute('SELECT * FROM about;');
    res.json({
      about: rows,
    });
  } catch (error) {
    console.error('Error retrieving users: ', error);
    res.status(500).send('Error retrieving users from database');
  }
});

/* --- PROTECTED ROUTES --- */
app.use(validateAccessToken);

app.use('/users', usersRouter);
app.use('/ebay-proxy', ebayRouter);
app.use('/catalog-param', catalogRouter);
app.use('/organizations', organizationsRouter);
app.use('/applications', applicationsRouter);
app.use('/orders', orderRouter);
app.use('/behaviors', behaviorRouter);
app.use('/pictures', pictureRouter);
app.use('/logs/applications', applicationLogsRouter);
app.use('/logs/login', LoginLogsRouter);
app.use('/logs/points', pointsLogsRouter);
app.use('/car-events', carEventsRouter);
app.use('/carts', cartRouter)
app.use('/reports', reportsRouter)

app.get('/admin', checkRequiredPermissions(['read:test']), async (req, res) => {
  const managementClient = await getManagementClient();
  const userId = req.auth.payload.sub;

  const response = await managementClient.users.get({ id: userId });
  const userProfile = response.data;
  console.log(userProfile);

  const updatedUserMetadata = {
    user_metadata: {
      org_code: 'AMAZON',
    },
  };

  const response2 = await managementClient.users.update(
    { id: userId },
    updatedUserMetadata
  );
  console.log(response2.data);
  // const auth = req.auth
  // console.log(auth)
  // console.log(auth)

  // const response = await managementClient.users.getAll()
  // users = response?.data
  // console.log(users);

  // const userId = 'auth0|65b9a896724a3409a69ff940';
  // const adminRoleId = 'rol_rr5bJm6onsB9hZAW'
  // const roles = [adminRoleId]

  // const response = await managementClient.users.assignRoles({ id: userId }, { roles });

  // console.log(response)

  res.json({
    message: 'this is an admin path',
  });
});

app.use(errorHandler);
app.use(notFoundHandler);

const port = process.env.PORT;
app.listen(port, () => console.log(`listening on port ${port}`));
