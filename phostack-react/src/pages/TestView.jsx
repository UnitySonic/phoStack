import { useAuth0 } from '@auth0/auth0-react';
import useUser from '../hooks/useUser';
import { useState, useEffect} from 'react';
import { queryClient } from '../util/http';
import { useMutation } from '@tanstack/react-query';
import { changeUser } from '../util/users';
import { Switch } from '@mui/material';

const TestView = () => {
  const { user } = useUser();
  const { viewAs } = user;
  const { getAccessTokenSilently } = useAuth0();

  const { mutate: mutateView } = useMutation({
    mutationFn: changeUser,
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  const [checked, setChecked] = useState(user?.userId !== viewAs?.userId);

  useEffect(() => {
    setChecked(user?.userId !== viewAs?.userId);
  }, [user, viewAs]);


  const handleChange = () => {
    setChecked((prev) => {
      if (prev) {
        mutateView({
          userId: user?.userId,
          userData: { viewAs: user?.userId },
          getAccessTokenSilently,
        });
      }
      return !prev;
    });
  };

  return (
    <>
      <Switch
        checked={checked}
        onChange={handleChange}
        inputProps={{ 'aria-label': 'toggle switch' }}
      />
      {checked && `View As: ${viewAs?.email} | ${viewAs?.userType}`}
      <div>
        You Are Signed In As: {user?.email} | {user?.userType}
      </div>
      <div>You are viewing As: {viewAs?.email} | {viewAs?.userType}</div>
    </>
  );
};

export default TestView;
