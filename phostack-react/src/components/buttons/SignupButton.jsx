import { Button } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';

const SignupButton = () => {
  const { loginWithRedirect } = useAuth0();

  const handleSignUp = async () => {
    await loginWithRedirect({
      appState: {
        returnTo: '/',
      },
      authorizationParams: {
        screen_hint: 'signup',
      },
    });
  };

  return (
    <Button variant='contained' color='secondary' onClick={handleSignUp}>
      Sign Up
    </Button>
  );
};

export default SignupButton;
