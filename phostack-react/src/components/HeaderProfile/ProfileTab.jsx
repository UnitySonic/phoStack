import PropTypes from 'prop-types';
import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';

// assets
import {
  EditOutlined,
  ProfileOutlined,
  LogoutOutlined,
  LoginOutlined,
  UserOutlined,
  WalletOutlined,
} from '@ant-design/icons';

// ==============================|| HEADER PROFILE - PROFILE TAB ||============================== //

const ProfileTab = ({ handleLogout }) => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  const navigate = useNavigate();

  const handleLogin = async () => {
    await loginWithRedirect({
      appState: {
        returnTo: '/',
      },
    });
  };

  const handleSignUp = async () => {
    await loginWithRedirect({
      appState: {
        returnTo: '/',
      },
      authorizationParams: {
        screen_hint: 'signup',
      },
    });
  };

  const handleEditProfileClick = () => {
    navigate('/profile');
  };

  const handleViewProfileClick = () => {
    navigate('/profile');
  };

  const theme = useTheme();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const handleListItemClick = (event, index) => {
    setSelectedIndex(index);
  };

  return (
    <List
      component='nav'
      sx={{
        p: 0,
        '& .MuiListItemIcon-root': {
          minWidth: 32,
          color: theme.palette.grey[500],
        },
      }}
    >
      {isAuthenticated && (
        <>
          <ListItemButton
            selected={selectedIndex === 0}
            onClick={(event) => {
              handleListItemClick(event, 0);
              handleEditProfileClick(event);
            }}
          >
            <ListItemIcon>
              <EditOutlined />
            </ListItemIcon>
            <ListItemText primary='Edit Profile' />
          </ListItemButton>

          <ListItemButton
            selected={selectedIndex === 1}
            onClick={(event) => {
              handleListItemClick(event, 1);
              handleViewProfileClick(event);
            }}
          >
            <ListItemIcon>
              <UserOutlined />
            </ListItemIcon>
            <ListItemText primary='View Profile' />
          </ListItemButton>

          <ListItemButton
            selected={selectedIndex === 3}
            onClick={(event) => handleListItemClick(event, 3)}
          >
            <ListItemIcon>
              <ProfileOutlined />
            </ListItemIcon>
            <ListItemText primary='Social Profile' />
          </ListItemButton>
          <ListItemButton
            selected={selectedIndex === 4}
            onClick={(event) => handleListItemClick(event, 4)}
          >
            <ListItemIcon>
              <WalletOutlined />
            </ListItemIcon>
            <ListItemText primary='Billing' />
          </ListItemButton>
          <ListItemButton selected={selectedIndex === 2} onClick={handleLogout}>
            <ListItemIcon>
              <LogoutOutlined />
            </ListItemIcon>
            <ListItemText primary='Logout' />
          </ListItemButton>
        </>
      )}

      {!isAuthenticated && (
        <>
          <ListItemButton selected={selectedIndex === 5} onClick={handleLogin}>
            <ListItemIcon>
              <LoginOutlined />
            </ListItemIcon>
            <ListItemText primary='Login' />
          </ListItemButton>
          <ListItemButton selected={selectedIndex === 6} onClick={handleSignUp}>
            <ListItemIcon>
              <LoginOutlined />
            </ListItemIcon>
            <ListItemText primary='Signup' />
          </ListItemButton>
        </>
      )}
    </List>
  );
};

ProfileTab.propTypes = {
  handleLogout: PropTypes.func,
};

export default ProfileTab;
