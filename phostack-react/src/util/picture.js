export async function savePicture({
    pictureData,
    getAccessTokenSilently,
}) {  
    const url = `${import.meta.env.VITE_EXPRESS_BACKEND_URL
        }/pictures`;
    const accessToken = await getAccessTokenSilently();
        
 

    const response = await fetch(url, {
        method: 'POST',
        body: pictureData,
        headers: {
            'Authorization': `Bearer ${accessToken}`
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

export async function fetchPicture({userId, getAccessTokenSilently }) {
  

    const baseUrl = `${import.meta.env.VITE_EXPRESS_BACKEND_URL
        }/pictures/${userId}`;
    const url = new URL(baseUrl);
    


  

    const accessToken = await getAccessTokenSilently();
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${accessToken}`,
        },
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

