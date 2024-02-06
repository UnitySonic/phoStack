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

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('hello');
});

app.use(validateAccessToken);

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
