export async function fetchSalesReport({
  signal,
  params,
  getAccessTokenSilently,
}) {
  const baseUrl = `${import.meta.env.VITE_EXPRESS_BACKEND_URL}/reports/sales`;
  const url = new URL(baseUrl);

  Object.keys(params).forEach((key) => {
    if (params[key] !== null) {
      url.searchParams.append(key, params[key]);
    }
  });

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
    const error = new Error('An error occurred while fetching sales report');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const data = await response.json();

  return data;
}

export async function fetchSalesReportData({
  signal,
  params,
  getAccessTokenSilently,
}) {
  const baseUrl = `${
    import.meta.env.VITE_EXPRESS_BACKEND_URL
  }/reports/sales-data`;
  const url = new URL(baseUrl);

  Object.keys(params).forEach((key) => {
    if (params[key] !== null) {
      url.searchParams.append(key, params[key]);
    }
  });

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
    const error = new Error('An error occurred while fetching sales report');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const data = await response.json();

  return data;
}

export async function fetchPointsReportData({
  signal,
  params,
  getAccessTokenSilently,
}) {
  const baseUrl = `${import.meta.env.VITE_EXPRESS_BACKEND_URL}/reports/points`;
  const url = new URL(baseUrl);

  Object.keys(params).forEach((key) => {
    if (params[key] !== null) {
      url.searchParams.append(key, params[key]);
    }
  });

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
    const error = new Error('An error occurred while fetching points report');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const data = await response.json();

  return data;
}
