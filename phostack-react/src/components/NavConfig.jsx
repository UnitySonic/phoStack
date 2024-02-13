import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InventoryIcon from '@mui/icons-material/Inventory';
import AccountCircle from '@mui/icons-material/AccountCircle'
import Home from '@mui/icons-material/Home'
import Settings from '@mui/icons-material/Settings'
import { Link } from 'react-router-dom';
import FilterListIcon from '@mui/icons-material/FilterList';
import InfoIcon from '@mui/icons-material/Info';

const role = 'sponsor';

// Define the links based on the user's role
const linksByRole = {
  admin: [
    { text: 'Home', icon: <Home />, to: '/' },
    { text: 'Settings', icon: <Settings />, to: '/admin/settings' },
  ],
  driver: [
    { text: 'Dashboard', icon: <Home />, to: '/driver/dashboard' },
    { text: 'Profile', icon: <AccountCircle />, to: '/driver/profile' },
  ],
  sponsor: [
    { text: 'Home', icon: <Home />, to: '/' },
    { text: 'Catalog', icon: <InventoryIcon />, to: '/catalog' },
    { text: 'Catalog Settings', icon: <FilterListIcon />, to: '/catalog-settings' },
    { text: 'About', icon: <InfoIcon />, to: '/about'}
  ],
};

const userLinks = linksByRole[role] || [];

const NavConfig = () => (
  <>
    {userLinks.map((link, index) => (
      <ListItemButton key={index} component={Link} to={link.to}>
        <ListItemIcon>{link.icon}</ListItemIcon>
        <ListItemText primary={link.text} />
      </ListItemButton>
    ))}
  </>
);

export default NavConfig;
