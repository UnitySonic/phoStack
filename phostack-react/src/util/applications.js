export async function saveApplication({
  applicationData,
  getAccessTokenSilently,
}) {
  const url = `${
    import.meta.env.VITE_EXPRESS_BACKEND_URL
  }/applications`;
  const accessToken = await getAccessTokenSilently();

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(applicationData),
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = new Error(
      'An error occurred while saving application data'
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return await response.json();
}

export async function fetchApplications({ signal, params, getAccessTokenSilently }) {
  const baseUrl = `${
    import.meta.env.VITE_EXPRESS_BACKEND_URL
  }/applications`;
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
    const error = new Error('An error occurred while fetching ebay params');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const data = await response.json();

  return data;
}

export async function changeApplication({
  applicationId,
  applicationData,
  getAccessTokenSilently,
}) {
  const url = `${
    import.meta.env.VITE_EXPRESS_BACKEND_URL
  }/applications/${applicationId}`;
  const accessToken = await getAccessTokenSilently();

  const response = await fetch(url, {
    method: 'PATCH',
    body: JSON.stringify(applicationData),
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = new Error(
      'An error occurred while chaning application data'
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const data = await response.json();

  return data;
}