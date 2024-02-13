import { Box, Typography } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';

const Footer = () => {
  return (
    <Box
      component='footer'
      sx={{
        backgroundColor: '#1976d2', // Matching the primary color of the header
        padding: '30px 0',
        textAlign: 'center',
        borderTop: '1px solid #ddd',
        marginTop: '20px',
      }}
    >
      <Typography variant='body2' color='text.secondary'>
        Made with <FavoriteIcon fontSize='small' color='error' />
      </Typography>
    </Box>
  );
};

export default Footer;
