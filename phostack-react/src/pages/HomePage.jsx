import LoginButton from '../components/buttons/LoginButton';
import LogoutButton from '../components/buttons/LogoutButton';
import SignupButton from '../components/buttons/SignupButton';
import { useAuth0 } from '@auth0/auth0-react';

function HomePage() {
  const { isAuthenticated } = useAuth0();

  return (
    <>
      <p>This is the home page</p>

      {!isAuthenticated && (
        <>
          <SignupButton />
          <LoginButton />
        </>
      )}
      {isAuthenticated && (
        <>
          <LogoutButton />
        </>
      )}
    </>
  );
}

export default HomePage;
