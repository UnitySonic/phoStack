export async function fetchOrganizations({ signal, getAccessTokenSilently }) {

  const url = `${import.meta.env.VITE_EXPRESS_BACKEND_URL}/organizations`;

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
    const error = new Error('An error occurred while fetching organizations');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const data = await response.json();

  console.log(data)

  return data;
}


export async function fetchOrganization({ signal, orgID, getAccessTokenSilently }) {

  const url = `${import.meta.env.VITE_EXPRESS_BACKEND_URL}/organizations/${orgID}`;


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
    const error = new Error('An error occurred while fetching organizations');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const data = await response.json();

  console.log(data)

  return data;
}

export async function changeOrganization({
  orgId,
  orgData,
  getAccessTokenSilently,
}) {

  console.log(orgId);
  const url = `${
    import.meta.env.VITE_EXPRESS_BACKEND_URL
  }/organizations/${orgId}`;
  const accessToken = await getAccessTokenSilently();

  const response = await fetch(url, {
    method: 'PATCH',
    body: JSON.stringify(orgData),
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

export async function saveOrganization({
  orgData,
  getAccessTokenSilently,
}) {
  const url = `${import.meta.env.VITE_EXPRESS_BACKEND_URL}/organizations`;
  const accessToken = await getAccessTokenSilently();

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(orgData),
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = new Error('An error occurred while saving organization data');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return await response.json();
}

export async function fetchAllOrganizations({ signal, getAccessTokenSilently }) {

  const url = `${import.meta.env.VITE_EXPRESS_BACKEND_URL}/organizations/`;


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
    const error = new Error('An error occurred while fetching organizations');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const data = await response.json();

  console.log(data)

  return data;
}