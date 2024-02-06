import { useAuth0 } from '@auth0/auth0-react';
import { useQuery } from '@tanstack/react-query';

function ProtectedPage() {
  const { getAccessTokenSilently, user} = useAuth0();

  const fetchData = async () => {
    const accessToken = await getAccessTokenSilently();
    console.log(accessToken)
    const url = `${import.meta.env.VITE_EXPRESS_BACKEND_URL}/admin`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = new Error('An error occurred while fetching the events');
      error.code = response.status;
      error.info = await response.json();
      throw error;
    }

    const { message } = await response.json();

    return message;
  };

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['message'],
    queryFn: fetchData,
  });

  return (
    <>
      <p>This is the admin page</p>
      <p>Message for the server:</p>
      <h1>{data}</h1>
      {console.log(user)}
    </>
  );
}

export default ProtectedPage;
