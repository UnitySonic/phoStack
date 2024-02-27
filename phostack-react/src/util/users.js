export async function getUser({ signal, userId, getAccessTokenSilently }) {
  const url = `${import.meta.env.VITE_EXPRESS_BACKEND_URL}/users/${userId}`;

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
    const error = new Error('An error occurred while fetching user');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return await response.json();
}

export async function fetchDriversByOrgId({
  signal,
  orgId,
  getAccessTokenSilently,
}) {
  const url = `${
    import.meta.env.VITE_EXPRESS_BACKEND_URL
  }/users/drivers/${orgId}`;

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
    const error = new Error('An error occurred while fetching drivers');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return await response.json();
}

export async function createNewSponsorUser({
  orgId,
  userData,
  getAccessTokenSilently,
}) {
  const url = `${
    import.meta.env.VITE_EXPRESS_BACKEND_URL
  }/users/sponsors/${orgId}`;
  const accessToken = await getAccessTokenSilently();

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(userData),
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = new Error('An error occurred while saving new sponsor user');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return await response.json();
}

export async function createNewDriverUser({
  orgId,
  userData,
  getAccessTokenSilently,
}) {
  const url = `${
    import.meta.env.VITE_EXPRESS_BACKEND_URL
  }/users/drivers/${orgId}`;
  const accessToken = await getAccessTokenSilently();

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(userData),
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = new Error('An error occurred while saving new driver user');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return await response.json();
}

export async function createNewAdminUser({
  userData,
  getAccessTokenSilently,
}) {
  const url = `${
    import.meta.env.VITE_EXPRESS_BACKEND_URL
  }/users/admins`;
  const accessToken = await getAccessTokenSilently();

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(userData),
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = new Error('An error occurred while saving new driver user');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return await response.json();
}

export async function fetchDrivers({
  signal,
  getAccessTokenSilently,
}) {
  const url = `${
    import.meta.env.VITE_EXPRESS_BACKEND_URL
  }/users/drivers`;

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
    const error = new Error('An error occurred while fetching drivers');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return await response.json();
}

export async function fetchSponsors({
  signal,
  getAccessTokenSilently,
}) {
  const url = `${
    import.meta.env.VITE_EXPRESS_BACKEND_URL
  }/users/sponsors`;

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
    const error = new Error('An error occurred while fetching drivers');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return await response.json();
}

export async function changeUser({
  userId,
  userData,
  getAccessTokenSilently,
}) {
  const url = `${
    import.meta.env.VITE_EXPRESS_BACKEND_URL
  }/users/${userId}`;
  const accessToken = await getAccessTokenSilently();

  const response = await fetch(url, {
    method: 'PATCH',
    body: JSON.stringify(userData),
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = new Error('An error occurred while chaning application data');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const data = await response.json();

  return data;
}

export async function fetchAdmins({
  signal,
  getAccessTokenSilently,
}) {
  const url = `${
    import.meta.env.VITE_EXPRESS_BACKEND_URL
  }/users/admins`;

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
    const error = new Error('An error occurred while fetching drivers');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return await response.json();
}

export async function changePassword({
  userId,
  passwordData,
  getAccessTokenSilently,
}) {
  const url = `${
    import.meta.env.VITE_EXPRESS_BACKEND_URL
  }/users/${userId}/password`;
  const accessToken = await getAccessTokenSilently();

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(passwordData),
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = new Error('An error occurred while saving new driver user');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return await response.json();
}