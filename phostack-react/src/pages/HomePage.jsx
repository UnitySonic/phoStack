import Dashboard from '../components/dashboards/Dashboard';
import { Link, json } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import useUser from '../hooks/useUser';
import SponsorDashboard from '../components/dashboards/SponsorDashboard';
import AdminDashboard from '../components/dashboards/AdminDashboard';
import DriverSelectOrganization from '../components/DriverSelectOrganization';
import SignupButton from '../components/buttons/SignupButton';
import LoginButton from '../components/buttons/LoginButton';
import { Avatar } from '@mui/material';
import { useState } from 'react';
import ImageToggle from '../components/ImageToggle';

function HomePage() {
  const { isAuthenticated } = useAuth0();
  const { user } = useUser();
  const viewAs = user?.viewAs;

  const imageURLS = {
    catalog: 'https://phostackbucket.s3.amazonaws.com/Catalog.PNG',
    catalogsettings:
      'https://phostackbucket.s3.amazonaws.com/CatalogSettings.PNG',
    drivermanage:
      'https://phostackbucket.s3.amazonaws.com/Driver+Management.PNG',
    drivermanage2:
      'https://phostackbucket.s3.amazonaws.com/DriverManagement2.PNG',
    logs: 'https://phostackbucket.s3.amazonaws.com/Logs.PNG',
  };

  if (!isAuthenticated) {
    return (
      <>
        <h1>Sign up for PhoStack!</h1>
        <SignupButton></SignupButton> <LoginButton></LoginButton>
        <h1>Phostack is a driver rewards platform with powerful features</h1>
        <div style={{ marginBottom: '20px' }}>
          <h2>Catalog:</h2>
          <h3>
            Drivers can access a catalog and purchase items from websites like
            ebay
          </h3>
          <div style={{ marginBottom: '100px' }}>
            <ImageToggle
              src={imageURLS.catalog}
              initialState={false}
            ></ImageToggle>
          </div>

          <h3>
            Sponsors on phostack can customize the types of items that appear on
            the catalog, and their point cost
          </h3>
          <ImageToggle
            src={imageURLS.catalogsettings}
            initialState={false}
          ></ImageToggle>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <h2>Checkout:</h2>
          <h3>
            Drivers can place orders through our checkout system. It even has
            email notifications!
          </h3>
        </div>
        <div style={{ marginBottom: '100px' }}>
          <h2>Driver Management:</h2>
          <h3>
            Sponsors can manage multiple drivers at once, and troubleshoot
            issues!
          </h3>
          <h3>
            {' '}
            With our powerful view feature, you can see things from your drivers
            perspective!Y
          </h3>
          <div style={{ marginBottom: '100px' }}>
            <ImageToggle
              src={imageURLS.drivermanage}
              initialState={false}
            ></ImageToggle>
          </div>
          <ImageToggle
            src={imageURLS.drivermanage2}
            initialState={false}
          ></ImageToggle>
        </div>
        <p>
          Learn more about us by clicking this link:
          <div>
            <Link to='about' relative='path'>
              Read more
            </Link>
          </div>
        </p>
        <h1>Sign up for PhoStack Today!</h1>
        <SignupButton></SignupButton> <LoginButton></LoginButton>
      </>
    );
  }
  if (isAuthenticated) {
    const {
      firstName = '',
      lastName = '',
      userType,
      userId,
      picture,
      email,
    } = viewAs || {};

    if (userType == 'DriverUser') {
      return (
        <>
          <h2>Welcome, {viewAs.firstName}</h2>
          {/* <DriverSelectOrganization /> */}
          <Dashboard />
        </>
      );
    } else if (userType == 'SponsorUser') {
      return (
        <>
          <p>Welcome, {viewAs.firstName}</p>
          <SponsorDashboard />
        </>
      );
    } else if (userType == 'AdminUser') {
      return (
        <>
          <p>Welcome, {viewAs.firstName}</p>
          <AdminDashboard />
        </>
      );
    }
  }
}
export default HomePage;
