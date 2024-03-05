import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InventoryIcon from '@mui/icons-material/Inventory';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Home from '@mui/icons-material/Home';
import Settings from '@mui/icons-material/Settings';
import { Link } from 'react-router-dom';
import FilterListIcon from '@mui/icons-material/FilterList';
import InfoIcon from '@mui/icons-material/Info';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import ListIcon from '@mui/icons-material/List';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PsychologyIcon from '@mui/icons-material/Psychology';
import useUser from '../hooks/useUser';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AddReactionIcon from '@mui/icons-material/AddReaction';
import BusinessIcon from '@mui/icons-material/Business';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import PeopleIcon from '@mui/icons-material/People';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AddModeratorIcon from '@mui/icons-material/AddModerator';
import SummarizeIcon from '@mui/icons-material/Summarize';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LoginIcon from '@mui/icons-material/Login';
import PasswordIcon from '@mui/icons-material/Password';
import NumbersIcon from '@mui/icons-material/Numbers';


const SHOW_ALL = false;

const linksByRole = {
  AdminUser: [
    { text: 'Home', icon: <Home />, to: '/' },
    { text: 'Profile', icon: <AccountCircleIcon />, to: '/profile' },
    {
      text: 'Admins',
      icon: <AdminPanelSettingsIcon />,
      to: '/admin/admins-management',
    },
    {
      text: 'Organizations',
      icon: <BusinessIcon />,
      to: '/admin/organizations-management',
    },
    {
      text: 'Sponsors',
      icon: <PeopleIcon />,
      to: '/admin/sponsors-management',
    },
    {
      text: 'Drivers',
      icon: <DirectionsCarIcon />,
      to: '/admin/drivers-management',
    },
    {
      text: 'Add Admin User',
      icon: <AddModeratorIcon />,
      to: '/admin/admins/new',
    },
    {
      text: 'Add Organization',
      icon: <AddBusinessIcon />,
      to: '/admin/organizations/new',
    },
    {
      text: 'Add Sponsor User',
      icon: <PersonAddIcon />,
      to: '/admin/sponsors/new',
    },
    {
      text: 'Add Driver User',
      icon: <AddReactionIcon />,
      to: 'admin/drivers/new',
    },
    {
      text: 'Application Logs',
      icon: <SubscriptionsIcon />,
      to: 'logs/applications',
    },
    {
      text: 'Login Logs',
      icon: <LoginIcon />,
      to: 'logs/login',
    },
    {
      text: 'Password Logs',
      icon: <PasswordIcon />,
      to: 'logs/password',
    },
    {
      text: 'Point Logs',
      icon: <NumbersIcon />,
      to: 'logs/points',
    },
    { text: 'About', icon: <InfoIcon />, to: '/about' },
  ],
  DriverUser: [
    { text: 'Home', icon: <Home />, to: '/' },
    { text: 'Profile', icon: <AccountCircleIcon />, to: '/profile' },
    { text: 'Catalog', icon: <InventoryIcon />, to: '/catalog' },
    { text: 'Behaviors', icon: <PsychologyIcon />, to: '/behaviors' },
    { text: 'About', icon: <InfoIcon />, to: '/about' },
  ],
  SponsorUser: [
    { text: 'Home', icon: <Home />, to: '/' },
    { text: 'Profile', icon: <AccountCircleIcon />, to: '/profile' },
    { text: 'Catalog', icon: <InventoryIcon />, to: '/catalog' },
    {
      text: 'Catalog Settings',
      icon: <FilterListIcon />,
      to: '/catalog-settings',
    },
    {
      text: 'Apps Management',
      icon: <ListIcon />,
      to: '/applications-management',
    },
    {
      text: 'Drivers Management',
      icon: <DirectionsCarIcon />,
      to: '/drivers-management',
    },
    {
      text: 'Behaviors',
      icon: <PsychologyIcon />,
      to: '/behaviors',
    },
    {
      text: 'Application Logs',
      icon: <SubscriptionsIcon />,
      to: 'logs/applications',
    },
    {
      text: 'Login Logs',
      icon: <LoginIcon />,
      to: 'logs/login',
    },
    {
      text: 'Password Logs',
      icon: <PasswordIcon />,
      to: 'logs/password',
    },
    {
      text: 'Point Logs',
      icon: <NumbersIcon />,
      to: 'logs/points',
    },
    { text: 'About', icon: <InfoIcon />, to: '/about' },
  ],
  NewUser: [
    { text: 'Applications', icon: <ListIcon />, to: '/applications' },
    {
      text: 'New Application',
      icon: <HowToRegIcon />,
      to: '/applications/new',
    },
    { text: 'About', icon: <InfoIcon />, to: '/about' },
  ],
  TestUser: [
    { text: 'Home', icon: <Home />, to: '/' },
    { text: 'Applications', icon: <ListIcon />, to: '/applications' },
    {
      text: 'New Application',
      icon: <HowToRegIcon />,
      to: '/applications/new',
    },
    { text: 'Catalog', icon: <InventoryIcon />, to: '/catalog' },
    {
      text: 'Catalog Settings',
      icon: <FilterListIcon />,
      to: '/catalog-settings',
    },
    {
      text: 'Apps Management',
      icon: <ListIcon />,
      to: '/applications-management',
    },
    {
      text: 'Drivers Management',
      icon: <DirectionsCarIcon />,
      to: '/drivers-management',
    },
    {
      text: 'Admins',
      icon: <AdminPanelSettingsIcon />,
      to: '/admin/admins-management',
    },
    {
      text: 'Organizations',
      icon: <BusinessIcon />,
      to: '/admin/organizations-management',
    },
    {
      text: 'Sponsors',
      icon: <PeopleIcon />,
      to: '/admin/sponsors-management',
    },
    {
      text: 'Drivers',
      icon: <DirectionsCarIcon />,
      to: '/admin/drivers-management',
    },
    {
      text: 'Add Admin User',
      icon: <AddModeratorIcon />,
      to: '/admin/admins/new',
    },
    {
      text: 'Add Organization',
      icon: <AddBusinessIcon />,
      to: '/admin/organizations/new',
    },
    {
      text: 'Add Sponsor User',
      icon: <PersonAddIcon />,
      to: '/admin/sponsors/new',
    },
    {
      text: 'Add Driver User',
      icon: <AddReactionIcon />,
      to: 'admin/drivers/new',
    },
    { text: 'About', icon: <InfoIcon />, to: '/about' },
  ],
};

const NavConfig = () => {
  const { user } = useUser();
  const userType = SHOW_ALL ? 'TestUser' : user?.userType;
  const userLinks = linksByRole[userType] || [
    { text: 'Home', icon: <Home />, to: '/' },
  ];

  return (
    <>
      {userLinks.map((link, index) => (
        <ListItemButton key={index} component={Link} to={link.to}>
          <ListItemIcon>{link.icon}</ListItemIcon>
          <ListItemText primary={link.text} />
        </ListItemButton>
      ))}
    </>
  );
};

export default NavConfig;
