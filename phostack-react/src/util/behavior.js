/* Fetches all of the behaviors for all organizations */
export async function fetchBehaviors({ signal, getAccessTokenSilently }) {
  const url = `${import.meta.env.VITE_EXPRESS_BACKEND_URL}/behaviors`;

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
    const error = new Error('An error occurred while fetching behaviors');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const data = await response.json();

  return data;
}

/* Fetches behaviors for a single organization */
export async function fetchBehaviorsByOrgId({ signal, orgId,getAccessTokenSilently }) {
  const url = `${import.meta.env.VITE_EXPRESS_BACKEND_URL}/behaviors/${orgId}`;

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
    const error = new Error('An error occurred while fetching behaviors');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const data = await response.json();

  return data;
}

/* Fetches active behaviors for an organization */
export async function fetchActiveBehaviorsByOrgId({ signal, orgId,getAccessTokenSilently }) {
  const behaviors = await fetchBehaviorsByOrgId({signal, orgId, getAccessTokenSilently});

  // Filter data
  const activeBehaviors = behaviors.filter(behavior => {
    return behavior.behaviorStatus === "active";
  });
  return activeBehaviors;
}

/* Saves a single behavior */
export async function saveBehavior({  behaviorData,
  getAccessTokenSilently,}) {
  const url = `${import.meta.env.VITE_EXPRESS_BACKEND_URL}/behaviors`;
  const accessToken = await getAccessTokenSilently();

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(behaviorData),
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

/* Changes a behavior */
export async function changeBehavior({
  behaviorId,
  behaviorData,
  getAccessTokenSilently,
}) {
  const url = `${
    import.meta.env.VITE_EXPRESS_BACKEND_URL
  }/behaviors/${behaviorId}`;
  const accessToken = await getAccessTokenSilently();

  const response = await fetch(url, {
    method: 'PATCH',
    body: JSON.stringify(behaviorData),
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = new Error('An error occurred while chaning behavior data');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const data = await response.json();

  return data;
}