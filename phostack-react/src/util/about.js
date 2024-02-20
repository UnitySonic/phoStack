export async function fetchAbout() {
    // Get our team members from the database
    const baseUrl = `${
    import.meta.env.VITE_EXPRESS_BACKEND_URL
    }/about`;
    const url = new URL(baseUrl);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
        'content-type': 'application/json'
        },
    });

    if (!response.ok) {
        const error = new Error('An error occurred while fetching the about page');
        error.code = response.status;
        error.info = await response.json();
        throw error;
    }

    const { about } = await response.json();

    return about;
}