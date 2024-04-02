import { useAuth0 } from '@auth0/auth0-react';
import { useQuery } from '@tanstack/react-query';
import { getUser } from '../util/users';

const useUser = (userToGet = null) => {
  const { getAccessTokenSilently, user: auth0User } = useAuth0();
  const userId = userToGet ?? auth0User?.sub;

  const {
    data: user = {},
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
  } = useQuery({
    queryKey: ['users', { userId }],
    queryFn: ({ signal }) =>
      getUser({ signal, userId, getAccessTokenSilently }),
    enabled: !!userId,
  });

  return {
    user,
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
  };
};

export default useUser;
