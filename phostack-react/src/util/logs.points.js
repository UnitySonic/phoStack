export async function fetchPointLogs({ signal, params, getAccessTokenSilently }) {
  const baseUrl = `${
    import.meta.env.VITE_EXPRESS_BACKEND_URL
  }/logs/points`;
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
    const error = new Error('An error occurred while fetching points logs');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const data = await response.json();

  return data;
}

export async function savePointLog({ signal, pointLogData, getAccessTokenSilently }) {
  const baseUrl = `${
    import.meta.env.VITE_EXPRESS_BACKEND_URL
  }/logs/points`;
  
  const accessToken = await getAccessTokenSilently();
  
  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${accessToken}`,
    },
    signal: signal,
    body: JSON.stringify(pointLogData),
  });

  if (!response.ok) {
    const error = new Error('An error occurred while saving point log');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const data = await response.json();

  return data;
}