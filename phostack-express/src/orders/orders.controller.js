const { saveOrderToDb } = require('./orders.service');

const saveOrder = async (req, res) => {
  try {
    await saveOrderToDb(req.body);
    res.status(200).json({ message: 'Success' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
};

module.exports = {
  saveOrder,
};
