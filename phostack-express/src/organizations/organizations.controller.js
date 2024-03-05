const {
  getOrganizationsFromDb,
  getOrganizationFromDb,
  saveOrganization,
  modifyOrganization,
} = require('./organizations.service');

const fetchOrganizations = async (req, res) => {
  try {
    const organizations = await getOrganizationsFromDb(req.query);
    res.json(organizations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};

const fetchOrganization = async (req, res) => {
  try {
    const organization = await getOrganizationFromDb(req.params.orgId);
    res.json(organization);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};

const createOrganization = async (req, res) => {
  console.log(req.body)
  try {
    await saveOrganization(req.body);
    res.status(200).json({ message: 'success' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};

const patchOrganization = async (req, res) => {
  const { orgId } = req.params;
  try {
    await modifyOrganization(orgId, req.body);
    res.status(200).json({ message: 'success' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};

module.exports = {
  fetchOrganizations,
  fetchOrganization,
  createOrganization,
  patchOrganization
};
