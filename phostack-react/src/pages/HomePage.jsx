import LoginButton from '../components/buttons/LoginButton';
import LogoutButton from '../components/buttons/LogoutButton';
import SignupButton from '../components/buttons/SignupButton';
import Dashboard from '../components/dashboards/Dashboard';
import { Link, json } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import useUser from '../hooks/useUser';
import SponsorDashboard from '../components/dashboards/SponsorDashboard';
import { Typography } from '@mui/material';
import AdminDashboard from '../components/dashboards/AdminDashboard';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { useState } from 'react';
import { queryClient } from '../util/http';
import { useMutation, useQuery } from '@tanstack/react-query';
import { changeUser } from '../util/users';
import DriverSelectOrganization from '../components/DriverSelectOrganization';

function HomePage() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const { user } = useUser();
  const viewAs = user?.viewAs;

  let username = 'DefaultUser';
  if (!isAuthenticated) {
    return (
      <>
        <h1>Sign up for PhoStack!</h1>
        <h2>Who we are:</h2>
        <p>
          Learn more about us by clicking this link:
          <div>
            <Link to='about' relative='path'>
              Read more
            </Link>
          </div>
        </p>
        <h3>Business Friendly</h3>
        <p>Easily access tools to manage drivers</p>
        <h3>Driver Incentives</h3>
        <p>Drivers can purchase items with points</p>
        <h3>View statistics from our dashboard</h3>
        <p>Sign in to access dashboard</p>
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
          <DriverSelectOrganization />
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
    }
    //swap these back
    else if (userType == 'AdminUser') {
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
