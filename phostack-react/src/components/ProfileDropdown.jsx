import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useAuth0 } from '@auth0/auth0-react';
import LoginButton from './buttons/LoginButton';
import LogoutButton from './buttons/LogoutButton';
import SignupButton from './buttons/SignupButton';

const ProfileDropdown = () => {
  const { isAuthenticated, logout } = useAuth0();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Avatar
        aria-controls='profile-menu'
        aria-haspopup='true'
        onClick={handleClick}
        sx={{ cursor: 'pointer' }}
      >
        {/* Display profile picture */}
      </Avatar>
      <Menu
        id='profile-menu'
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {isAuthenticated ? (
          <MenuItem
            onClick={() => {
              handleClose();
              logout();
            }}
          >
            Sign Out
          </MenuItem>
        ) : (
          <MenuItem onClick={handleClose}>Sign In</MenuItem>
        )}
      </Menu>
    </>
  );
};

export default ProfileDropdown;
