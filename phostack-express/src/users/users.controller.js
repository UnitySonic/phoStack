const {
  saveUserToDb,
  getUsersFromDb,
  getUserFromDbById,
  modifyUserInDb,
  getDriversByOrgId,
  createNewUser,
  getDrivers,
  getSponsors,
  getAdmins,
  changePassword,
  seedRandomUser,
} = require('./users.service');

const saveUser = async (req, res, next) => {
  console.log(req.body);
  try {
    await saveUserToDb(req.body);
    res.status(200).json({ message: 'success' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};

const fetchUsers = async (req, res) => {
  try {
    const users = await getUsersFromDb(req.query);
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};

const fetchUser = async (req, res) => {
  try {
    const mainUser = await getUserFromDbById(req.params.id);
    const viewAsUser = await getUserFromDbById(mainUser?.viewAs);
    if (!mainUser || !viewAsUser) {
      return res.status(404).json({ message: 'Not Found' });
    }
    const user = {
      ...mainUser,
      viewAs: viewAsUser,
    };

    return res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};

const changeUser = async (req, res) => {
  try {
    await modifyUserInDb(req.params.id, req.body);
    res.status(200).json({ message: 'success' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};

const fetchDriversByOrgId = async (req, res) => {
  const orgId = req.params.orgId;
  try {
    const drivers = await getUsersFromDb({
      filters: { userType: 'DriverUser', orgId },
    });
    res.status(200).json(drivers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};

const fetchSponsors = async (req, res) => {
  try {
    const sponsors = await getUsersFromDb({
      filters: { userType: 'SponsorUser' },
    });
    res.status(200).json(sponsors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};

const fetchDrivers = async (req, res) => {
  try {
    const drivers = await getUsersFromDb({
      filters: { userType: 'DriverUser' },
    });
    res.status(200).json(drivers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};

const fetchAdmins = async (req, res) => {
  try {
    const admins = await getUsersFromDb({ filters: { userType: 'AdminUser' } });
    res.status(200).json(admins);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};

const addNewSponsorUser = async (req, res) => {
  const { orgId } = req.params;
  try {
    await createNewUser({
      ...req.body,
      organizations: [orgId],
    });
    res.status(200).json({ message: 'success' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};

const addNewDriverUser = async (req, res) => {
  const { orgId } = req.params;
  try {
    await createNewUser({
      ...req.body,
      organizations: [orgId],
    });
    res.status(200).json({ message: 'success' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};

const addNewAdminUser = async (req, res) => {
  try {
    await createNewUser(req.body);
    res.status(200).json({ message: 'success' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};

const changeUserPassword = async (req, res) => {
  try {
    await changePassword(req.params.id, req.body);
    res.status(200).json({ message: 'success' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};

const seedData = async (req, res) => {
  try {
    await seedRandomUser(req.body);
    res.status(200).json({ message: 'success' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};

module.exports = {
  saveUser,
  fetchUsers,
  fetchUser,
  changeUser,
  fetchDriversByOrgId,
  addNewSponsorUser,
  addNewDriverUser,
  fetchDrivers,
  fetchSponsors,
  fetchAdmins,
  addNewAdminUser,
  changeUserPassword,
  seedData,
};
