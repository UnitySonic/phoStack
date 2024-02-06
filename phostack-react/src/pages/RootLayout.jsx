import { Outlet, useNavigation } from 'react-router-dom';
import PageLoader from '../components/UI/PageLoader';
import { useAuth0 } from '@auth0/auth0-react';

function RootLayout() {
  const { isLoading } = useAuth0();

  if (isLoading) {
    return (
        <PageLoader />
    );
  }

  // const navigation = useNavigation();

  return (
    <>
      <main>
        <p>This is the root layout</p>
        {/* {navigation.state === 'loading' && <p>Loading...</p>} */}
        <Outlet />
      </main>
    </>
  );
}

export default RootLayout;