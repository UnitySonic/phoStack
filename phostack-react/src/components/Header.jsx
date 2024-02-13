import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import LoginButton from './buttons/LoginButton';
import LogoutButton from './buttons/LogoutButton';
import SignupButton from './buttons/SignupButton';

const Header = () => {
  const { isAuthenticated } = useAuth0();

  return (
    <>
      <AppBar position="static" sx={{ marginBottom: '20px' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              PhoStack
            </Link>
          </Typography>
          <Box sx={{ display: 'flex', gap: '8px' }}>
            <Button component={Link} to="/" color="inherit">
              Home
            </Button>
            <Button component={Link} to="/catalog" color="inherit">
              Catalog
            </Button>
            {isAuthenticated ? (
              <LogoutButton />
            ) : (
              <>
                <LoginButton />
                <SignupButton />
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default Header;
