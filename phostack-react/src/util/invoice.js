export async function fetchInvoice({ signal, params, getAccessTokenSilently }) {
    const baseUrl = `${import.meta.env.VITE_EXPRESS_BACKEND_URL}/invoice`;
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
    console.log("Invoice Information: ", data);
  
    return data;
  }