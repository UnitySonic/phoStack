import { Outlet, useNavigation } from 'react-router-dom';
import Spinner from '../components/UI/Spinner';
import { useAuth0 } from '@auth0/auth0-react';
import Footer from '../components/Footer';
import MainNav from '../components/MainNav';

function RootLayout() {
  const { isLoading } = useAuth0();

  if (isLoading) {
    return <Spinner />;
  }

  // const navigation = useNavigation();

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
    >
      <div style={{ display: 'flex', flex: 1 }}>
        <MainNav />
        <div style={{ flex: 1, marginTop: '64px', padding: '25px 25px 0px 25px' }}>
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default RootLayout;
