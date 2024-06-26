import { Button } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  const handleLogin = async () => {
    await loginWithRedirect({
      appState: {
        returnTo: '/',
      },
    });
  };

  return (
    <Button variant='contained' color='secondary' onClick={handleLogin}>
      Log In
    </Button>
  );
};

export default LoginButton;
