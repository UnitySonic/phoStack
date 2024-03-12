const express = require('express');
const ebayRouter = express.Router();
const {
  getEbayAccessToken,
  getEbayItems,
  getEbayItem,
} = require('./ebay.service');
const { getCatalogParamByOrgId } = require('../catalog/catalog.service');

ebayRouter.post('/token', async (req, res) => {
  try {
    const token = await getEbayAccessToken();
    res.json({ token });
  } catch (e) {
    res.status(500).json({ message: 'Someone went wrong when fetching token' });
  }
});

ebayRouter.get('/items/:id', async (req, res, next) => {
  try {
    const data = await getEbayItem(req.params.id);
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Internal Error' });
  }
});

ebayRouter.get('/items', async (req, res, next) => {
  const { orgId, limit, offset } = req.query;
  const ebayQueryParams = {
    q: 'iphone',
    limit,
    offset,
  };
  try {
    const catalogParamsResults = await getCatalogParamByOrgId(orgId);
    const found = catalogParamsResults.length > 0;
    if (found) {
      const queryParams = catalogParamsResults[0];
      const {
        CatalogParamSearch,
        CatalogParamMinPrice,
        CatalogParamMaxPrice,
        CatalogParamCategories,
      } = queryParams;

      if (CatalogParamSearch) {
        ebayQueryParams['q'] = CatalogParamSearch;
      } else if (CatalogParamCategories) {
        delete ebayQueryParams.q;
      }

      let filterString = 'priceCurrency:USD';

      if (CatalogParamMinPrice && CatalogParamMaxPrice) {
        filterString += `,price:[${CatalogParamMinPrice}..${CatalogParamMaxPrice}]`;
      } else if (CatalogParamMinPrice) {
        filterString += `,price:[${CatalogParamMinPrice}]`;
      } else if (CatalogParamMaxPrice) {
        filterString += `,price:[..${CatalogParamMaxPrice}]`;
      }

      ebayQueryParams['filter'] = filterString;

      if (CatalogParamCategories) {
        ebayQueryParams['category_ids'] = CatalogParamCategories;
      }
    }

    console.log(ebayQueryParams);
    const data = await getEbayItems(ebayQueryParams);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Error' });
  }
});

ebayRouter.all('/*', async (req, res) => {
  const accessToken = await getEbayAccessToken();
  const { method, originalUrl, headers, body } = req;
  // Construct eBay API URL by removing the /ebay prefix
  const url = `https://api.ebay.com${originalUrl.replace('/ebay-proxy', '')}`;

  const requestOptions = {
    method,
    headers: {
      ...headers,
      authorization: `Bearer ${accessToken}`,
    },
    body: method !== 'GET' && body ? JSON.stringify(body) : undefined,
  };

  try {
    const response = await fetch(url, requestOptions);
    const responseData = await response.json();
    res.status(response.status).json(responseData);
  } catch (error) {
    console.error('Error proxying request to eBay API:', error);
    res.status(500).json({ error: 'Failed to proxy request to eBay API' });
  }
});

module.exports = ebayRouter;
