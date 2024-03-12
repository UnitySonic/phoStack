export async function saveOrder({ orderData, getAccessTokenSilently }) {
  const url = `${import.meta.env.VITE_EXPRESS_BACKEND_URL}/orders`;
  const accessToken = await getAccessTokenSilently();

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(orderData),
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = new Error('An error occurred while saving order data');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return await response.json();
}

export async function fetchOrders({ signal, params, getAccessTokenSilently }) {
  const baseUrl = `${import.meta.env.VITE_EXPRESS_BACKEND_URL}/orders`;
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
    const error = new Error('An error occurred while fetching orders');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const data = await response.json();

  return data;
}

export async function changeOrder({
  orderId,
  orderData,
  getAccessTokenSilently,
}) {
  const url = `${import.meta.env.VITE_EXPRESS_BACKEND_URL}/orders/${orderId}`;
  const accessToken = await getAccessTokenSilently();

  const response = await fetch(url, {
    method: 'PATCH',
    body: JSON.stringify(orderData),
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = new Error('An error occurred while changing order data');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const data = await response.json();

  return data;
}
