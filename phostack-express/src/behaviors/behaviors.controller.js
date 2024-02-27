const {
    getBehaviorsFromDb,
    getBehaviorsByOrgId,
    saveBehavior
  } = require('./behaviors.service');

const fetchBehaviors = async (req, res) => {
  try {
    const behaviors = await getBehaviorsFromDb(req.query);
    res.status(200).json(behaviors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};


const fetchBehaviorsByOrgId = async (req, res) => {
  try {
    const behaviors = await getBehaviorsByOrgId(req.params.orgId);
    res.status(200).json(behaviors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};

const createBehavior = async (req, res, next) => {
  try {
    await saveBehavior(req.body);
    res.status(200).json({ message: 'success' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};

module.exports = {
    fetchBehaviors,
    fetchBehaviorsByOrgId,
    createBehavior
  };