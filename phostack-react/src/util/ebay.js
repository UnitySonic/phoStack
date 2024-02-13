export async function getEbayItems({ signal, params, getAccessTokenSilently }) {
  try {
    const baseUrl = `${
      import.meta.env.VITE_EXPRESS_BACKEND_URL
    }/ebay-proxy/items`;
    const url = new URL(baseUrl);

    // Set query parameters
    Object.keys(params).forEach((key) =>
      url.searchParams.append(key, params[key])
    );
    const accessToken = await getAccessTokenSilently();

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${accessToken}`,
      },
      signal: signal,
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

export async function getEbayItem({ signal, itemId, getAccessTokenSilently }) {
  const url = `${
    import.meta.env.VITE_EXPRESS_BACKEND_URL
  }/ebay-proxy/items/${itemId}`;
  const accessToken = await getAccessTokenSilently();
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${accessToken}`,
    },
    signal: signal,
  });

  if (!response.ok) {
    const error = new Error('An error occurred while fetching ebay params');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const data = await response.json();

  return data;
}

export async function getEbayParams({ signal, orgID, getAccessTokenSilently }) {
  const url = `${
    import.meta.env.VITE_EXPRESS_BACKEND_URL
  }/catalog-param/${orgID}`;

  const accessToken = await getAccessTokenSilently();
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${accessToken}`,
    },
    signal: signal,
  });

  if (!response.ok) {
    const error = new Error('An error occurred while fetching ebay params');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const data = await response.json();

  return data;
}

export async function saveEbayParams({
  orgID,
  queryParams,
  getAccessTokenSilently,
}) {
  const url = `${
    import.meta.env.VITE_EXPRESS_BACKEND_URL
  }/catalog-param/${orgID}`;
  const accessToken = await getAccessTokenSilently();

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(queryParams),
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = new Error(
      'An error occurred while fetching ebay query params'
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const data = await response.json();

  return data;
}
