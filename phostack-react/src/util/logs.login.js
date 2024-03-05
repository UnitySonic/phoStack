export async function fetchLoginLogs({ signal, params, getAccessTokenSilently }) {
  const baseUrl = `${
    import.meta.env.VITE_EXPRESS_BACKEND_URL
  }/logs/login`;
  const url = new URL(baseUrl);

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
    const error = new Error('An error occurred while fetching ebay params');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const data = await response.json();

  return data;
}

export async function fetchLoginLogsForOrg({ signal, orgId, params, getAccessTokenSilently }) {
  const baseUrl = `${
    import.meta.env.VITE_EXPRESS_BACKEND_URL
  }/logs/login/${orgId}`;
  const url = new URL(baseUrl);

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
    const error = new Error('An error occurred while fetching ebay params');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const data = await response.json();

  return data;
}