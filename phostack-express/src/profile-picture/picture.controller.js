

const {
    getPictureFromDb,
    savePictureToDb,
} = require('./picture.service');

const { modifyUserInDb, changeUserType } = require('../users/users.service');

const savePicture = async (req, res) => {
    try {
       
        await savePictureToDb(req);
        res.status(200).json({ message: 'success' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Error' });
    }
};

const fetchPicture = async (req, res) => {
    try {
       
        const result = await getPictureFromDb(req.params.userId);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Error' });
    }
};


module.exports = {
    savePicture,
    fetchPicture,
};
