let ebayAccessTokenData = null;

async function getEbayAccessToken() {
  // Check if token is already stored in the variable
  if (ebayAccessTokenData) {
    const tokenData = JSON.parse(ebayAccessTokenData);
    // Check if token has not expired
    if (tokenData.expires_at > Date.now()) {
      return tokenData.access_token;
    }
  }

  const url = 'https://api.ebay.com/identity/v1/oauth2/token';
  const bodyParams = new URLSearchParams({
    grant_type: 'client_credentials',
    scope: 'https://api.ebay.com/oauth/api_scope',
  });

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      authorization: `Basic ${process.env.EBAY_AUTH_TOKEN}`,
    },
    body: bodyParams.toString(),
  };

  try {
    const response = await fetch(url, requestOptions);
    if (!response.ok) {
      throw new Error('Failed to get access token');
    }
    const data = await response.json();

    // Calculate token expiry time (current time + expires_in)
    const expiresAt = Date.now() + data.expires_in * 1000;

    // Store token and expiry time in the variable
    ebayAccessTokenData = JSON.stringify({
      access_token: data.access_token,
      expires_at: expiresAt,
    });

    return data.access_token;
  } catch (error) {
    console.error('Error fetching access token:', error);
    return null;
  }
}

async function getEbayItem(itemId) {
  try { 
    const url = `${
      process.env.EBAY_API_BASE_URL
    }/buy/browse/v1/item/${itemId}`;
    const ebayAccessToken = await getEbayAccessToken()
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${ebayAccessToken}`,
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch ebay item');
    }
    const data = await response.json();
    return data;
  } catch (errpr) {
    console.error(error)
    throw error;
  }
}

async function getEbayItems(params) {
  try {
    const baseUrl = `${
      process.env.EBAY_API_BASE_URL
    }/buy/browse/v1/item_summary/search`;
    const url = new URL(baseUrl);

    // Set query parameters
    Object.keys(params).forEach((key) =>
      url.searchParams.append(key, params[key])
    );

    const ebayAccessToken = await getEbayAccessToken()

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${ebayAccessToken}`,
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch eBay items');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching eBay items:', error);
    throw error;
  }
}

module.exports = {
  getEbayAccessToken,
  getEbayItems,
  getEbayItem
};
