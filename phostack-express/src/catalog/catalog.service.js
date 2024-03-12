const { pool } = require('../db');

const saveCatalogParamByOrgId = async (req, res, next) => {
  console.log(req.body);
  const orgID = req.params.orgID;
  const {
    CatalogParamSearch,
    CatalogParamMinPrice,
    CatalogParamMaxPrice,
    CatalogParamCategories,
  } = req.body;
  try {
    await pool.execute(
      'INSERT INTO `CatalogParam` (CatalogParamSearch, CatalogParamMinPrice, CatalogParamMaxPrice, CatalogParamCategories, OrganizationOrgID) VALUES (?, ?, ?, ?, ?)',
      [
        CatalogParamSearch,
        CatalogParamMinPrice,
        CatalogParamMaxPrice,
        CatalogParamCategories,
        orgID,
      ]
    );
    return res
      .status(200)
      .json({ message: 'Catalog Param saved successfully' });
  } catch (error) {
    console.log(
      'Error in catalog.catalog.service.saveCatalogParamByOrgId',
      error
    );
    res.status(500).json({ message: 'Internal Error' });
  }
};

const getCatalogParamByOrgId = async (orgId) => {
  try {
    const [results, fields] = await pool.execute(
      'SELECT * FROM `CatalogParam` WHERE `OrganizationOrgID` = ? ORDER BY CatalogParamCreatedAt DESC LIMIT 1',
      [orgId]
    );
    return results;
  } catch (error) {
    console.error(
      'Error in catalog.catalog.service.getCatalogParamByOrgId',
      error
    );
    throw error;
  }
};

module.exports = {
  getCatalogParamByOrgId,
  saveCatalogParamByOrgId,
};
