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

import { createTheme, ThemeProvider } from '@mui/material';

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
        element: <About />
      },
      {
        path: 'protected',
        element: <AuthenticationGuard component={ProtectedPage} />,
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
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
