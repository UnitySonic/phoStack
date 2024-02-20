

export async function saveOrder({
    orderData,
    getAccessTokenSilently,
  }) {
    const url = `${
      import.meta.env.VITE_EXPRESS_BACKEND_URL
    }/orders`;
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
      const error = new Error(
        'An error occurred while saving order data'
      );
      error.code = response.status;
      error.info = await response.json();
      throw error;
    }
  
    return await response.json();
  }
  