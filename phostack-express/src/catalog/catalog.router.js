const express = require('express');
const catalogRouter = express.Router();
const {
  getCatalogParamByOrgId,
  saveCatalogParamByOrgId,
} = require('./catalog.service');

catalogRouter
  .route('/:orgID')
  .get(async (req, res, next) => {
    const orgID = req.params.orgID;
    try {
      const results = await getCatalogParamByOrgId(orgID);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: 'Internal Error' });
    }
  })
  .post(saveCatalogParamByOrgId);

module.exports = catalogRouter;
