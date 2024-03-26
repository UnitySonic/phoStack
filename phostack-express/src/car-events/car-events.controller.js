const {
  getCarEvents
} = require('./car-events.service');

const fetchCarEvents = async (req, res) => {
  try {
    const result = await getCarEvents(req.query);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};


module.exports = {
  fetchCarEvents
}