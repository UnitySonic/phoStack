import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
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
import BehaviorsPage from './pages/BehaviorsPage.jsx';
import AddNewBehaviorPage from './pages/AddNewBehaviorPage.jsx';
import EditBehaviorPage from './pages/EditBehaviorPage.jsx';
import AddNewSponsorUserPage from './pages/AddNewSponsorUserPage.jsx';
import PointsPage from './pages/PointsPage.jsx';
import CartPage from './pages/Cart.jsx';

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
import ProfilePicturePage from './pages/profilePicture.jsx';
import DriverApplicationsAuditLogsPage from './pages/DriverApplicationsAuditLogsPage.jsx';
import PasswordResetPage from './pages/PasswordResetPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import LoginAuditLogsPage from './pages/LoginAuditLogsPage.jsx';
import PasswordAuditLogsPage from './pages/PasswordAuditLogsPage.jsx';
import PointsAuditLogsPage from './pages/PointsAuditLogsPage.jsx';
import TestView from './pages/TestView.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import SeedUserData from './pages/SeedUserData.jsx';
import DriverCarEventsPage from './pages/DriverCarEventsPage.jsx';

import store from './store/index.js';
import { alpha } from '@mui/material/styles';

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
  direction: 'ltr',
  breakpoints: {
    values: {
      xs: 0,
      sm: 768,
      md: 1024,
      lg: 1266,
      xl: 1536,
    },
  },
});

theme.customShadows = {
  button: `0 2px #0000000b`,
  text: `0 -1px 0 rgb(0 0 0 / 12%)`,
  z1: `0px 2px 8px ${alpha(theme.palette.grey[900], 0.15)}`,
};

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
        path: 'logs/applications',
        element: (
          <AuthenticationGuard component={DriverApplicationsAuditLogsPage} />
        ),
      },
      {
        path: 'password-reset',
        element: <AuthenticationGuard component={PasswordResetPage} />,
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
        path: 'behaviors',
        element: <AuthenticationGuard component={BehaviorsPage} />,
      },
      {
        path: 'behaviors/new',
        element: <AuthenticationGuard component={AddNewBehaviorPage} />,
      },
      {
        path: 'behaviors/:behaviorId/edit',
        element: <AuthenticationGuard component={EditBehaviorPage} />,
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
        path: 'profiletest',
        element: <AuthenticationGuard component={ProfilePicturePage} />,
      },
      {
        path: 'purchase/:productID',
        element: <AuthenticationGuard component={Checkout} />,
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
      {
        path: 'profile',
        element: <AuthenticationGuard component={ProfilePage} />,
      },
      {
        path: 'logs/login',
        element: <AuthenticationGuard component={LoginAuditLogsPage} />,
      },
      {
        path: 'logs/password',
        element: <AuthenticationGuard component={PasswordAuditLogsPage} />,
      },
      {
        path: 'logs/points',
        element: <AuthenticationGuard component={PointsAuditLogsPage} />,
      },
      {
        path: 'view',
        element: <AuthenticationGuard component={TestView} />,
      },
      {
        path: 'orders',
        element: <AuthenticationGuard component={OrdersPage} />,
      },
      {
        path: "cart",
        element: <AuthenticationGuard component = {CartPage}/>,
      },
      {
        path: 'users/seed',
        element: <AuthenticationGuard component={SeedUserData} />,
      },
      {
        path: 'car-events',
        element: <AuthenticationGuard component={DriverCarEventsPage} />,
      },
    ],
  },
]);

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <RouterProvider router={router} />
          </LocalizationProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
