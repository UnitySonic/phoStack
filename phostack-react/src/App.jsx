import './App.css';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import RootLayout from './pages/RootLayout';
import ErrorPage from './pages/ErrorPage';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import { Auth0ProviderWithNavigate } from './auth0-provider-with-navigate';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './util/http.js';
import ProtectedPage  from './pages/ProtectedPage.jsx';

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
      { path: 'protected', element: <ProtectedPage /> },
    ],
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
