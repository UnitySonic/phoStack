export async function addToCart({ cartId, itemData, getAccessTokenSilently }) {
  const url = `${import.meta.env.VITE_EXPRESS_BACKEND_URL}/carts/${cartId}`;
  const accessToken = await getAccessTokenSilently();

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(itemData),
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

export async function getCartItems({ signal, params, getAccessTokenSilently }) {
  const baseUrl = `${import.meta.env.VITE_EXPRESS_BACKEND_URL}/carts/${params.cartId}`;
  const url = new URL(baseUrl);



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
    const error = new Error('An error occurred while fetching cart items');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const data = await response.json();

  return data;
}


export async function getCartId({ signal, params, getAccessTokenSilently }) {
  const baseUrl = `${import.meta.env.VITE_EXPRESS_BACKEND_URL}/carts/cartId`;
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
    const error = new Error('An error occurred while fetching cartId');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const data = await response.json();

  return data;
}

export async function clearCart({
  cartId,
  getAccessTokenSilently,
}) {
  const url = `${import.meta.env.VITE_EXPRESS_BACKEND_URL}/carts/${cartId}`;
  const accessToken = await getAccessTokenSilently();
 

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = new Error('An error occurred while changing cart data');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const data = await response.json();

  return data;
}

export async function modifyCart({
  cartInfo,
  getAccessTokenSilently,
}) {
  const url = `${import.meta.env.VITE_EXPRESS_BACKEND_URL}/carts/${cartInfo.cartId}`;
  const accessToken = await getAccessTokenSilently();
  

  const response = await fetch(url, {
    method: 'PATCH',
    body: JSON.stringify(cartInfo),
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = new Error('An error occurred while changing cart data');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const data = await response.json();

  return data;
}
