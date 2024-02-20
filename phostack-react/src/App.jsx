import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import RootLayout from './pages/RootLayout';
import ErrorPage from './pages/ErrorPage';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import About from './pages/About';
import { Auth0ProviderWithNavigate } from './auth0-provider-with-navigate';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './util/http.js';
import ProtectedPage from './pages/ProtectedPage.jsx';
import AuthenticationGuard from './components/AuthenticationGuard.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import CssBaseline from '@mui/material/CssBaseline';
import CatalogSettingsPage from './pages/CatalogSettingsPage.jsx';
import ProductDetailsPage from './pages/ProductDetailsPage.jsx';
import NewApplicationPage from './pages/NewApplicationPage.jsx';
import Checkout from './pages/Checkout';
import DriverApplicationsPage from './pages/DriverApplicationsPage.jsx';
import ApplicationManagementPage from './pages/ApplicationManagementPage.jsx';
import DriversManagementPage from './pages/DriversManagementPage.jsx';
import AddNewSponsorUserPage from './pages/AddNewSponsorUserPage.jsx';
import PointsPage from './pages/PointsPage.jsx';

import AddNewDriverUserPage from './pages/AddNewDriverUserPage.jsx';
import AdminOrganizationsPage from './pages/AdminOrganizationsPage.jsx';
import AdminNewOrganizationPage from './pages/AdminNewOrganizationPage.jsx';
import { createTheme, ThemeProvider } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import AdminDriversManagementPage from './pages/AdminDriversManagementPage.jsx';
import AdminAddNewDriverUserPage from './pages/AdminAddNewDriverUserPage.jsx';
import AdminSponsorsManagementPage from './pages/AdminSponsorsManagementPage.jsx';
import AdminAddNewSponsorUserPage from './pages/AdminAddNewSponsorUserPage.jsx';
import AdminManagementPage from './pages/AdminManagementPage.jsx';
import AdminAddNewAdminUserPage from './pages/AdminAddNewAdminUserPage.jsx';

const theme = createTheme({
  palette: {
    mode: 'light', // Use light mode
    primary: {
      main: '#1976d2', // Beautiful primary color
    },
    secondary: {
      main: '#388e3c', // Beautiful secondary color
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif', // Customize font family
  },
});

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Auth0ProviderWithNavigate>
        <RootLayout />
      </Auth0ProviderWithNavigate>
    ),
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'about',
        element: <About />,
      },
      {
        path: 'protected',
        element: <AuthenticationGuard component={ProtectedPage} />,
      },
      {
        path: 'admin/admins-management',
        element: <AuthenticationGuard component={AdminManagementPage} />,
      },
      {
        path: 'admin/admins/new',
        element: <AuthenticationGuard component={AdminAddNewAdminUserPage} />,
      },
      {
        path: 'admin/organizations-management',
        element: <AuthenticationGuard component={AdminOrganizationsPage} />,
      },
      {
        path: 'admin/organizations/new',
        element: <AuthenticationGuard component={AdminNewOrganizationPage} />,
      },
      {
        path: 'admin/drivers-management',
        element: <AuthenticationGuard component={AdminDriversManagementPage} />,
      },
      {
        path: 'admin/sponsors-management',
        element: (
          <AuthenticationGuard component={AdminSponsorsManagementPage} />
        ),
      },
      {
        path: 'admin/sponsors/new',
        element: <AuthenticationGuard component={AdminAddNewSponsorUserPage} />,
      },
      {
        path: 'admin/drivers/new',
        element: <AuthenticationGuard component={AdminAddNewDriverUserPage} />,
      },
      {
        path: 'applications-management',
        element: <AuthenticationGuard component={ApplicationManagementPage} />,
      },
      {
        path: 'drivers-management',
        element: <AuthenticationGuard component={DriversManagementPage} />,
      },
      {
        path: 'drivers-management/:id/points',
        element: <AuthenticationGuard component={PointsPage} />,
      },
      {
        path: 'drivers/new',
        element: <AuthenticationGuard component={AddNewDriverUserPage} />,
      },
      {
        path: 'applications',
        element: <AuthenticationGuard component={DriverApplicationsPage} />,
      },
      {
        path: 'applications/new',
        element: <AuthenticationGuard component={NewApplicationPage} />,
      },
      {

        path: 'purchase/:productID',
        element:  <AuthenticationGuard component={Checkout}/>,
      },
      {
        path: 'sponsors/new',
        element: <AuthenticationGuard component={AddNewSponsorUserPage} />,
      },
      {
        path: 'catalog',
        element: <AuthenticationGuard component={CatalogPage} />,
      },
      {
        path: 'catalog/:id',
        element: <AuthenticationGuard component={ProductDetailsPage} />,
      },
      {
        path: 'catalog-settings',
        element: <AuthenticationGuard component={CatalogSettingsPage} />,
      },
    ],
  },
]);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <RouterProvider router={router} />
        </LocalizationProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
