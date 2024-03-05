import { useAuth0 } from '@auth0/auth0-react';
import { useQuery } from '@tanstack/react-query';
import { getUser } from '../util/users';

const useUser = () => {
  const { getAccessTokenSilently, user: auth0User } = useAuth0();
  const userId = auth0User?.sub;
  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['users', { userId }],
    queryFn: ({ signal }) =>
      getUser({ signal, userId, getAccessTokenSilently }),
    enabled: !!userId,
  });

  
  return { user, isLoading, isError, error };
};

export default useUser;
