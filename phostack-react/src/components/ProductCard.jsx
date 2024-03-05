import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate } from 'react-router-dom';
import { Link} from "react-router-dom"

const ProductCard = ({ imageUrl, title, price, productId, quantity }) => {
  const navigate = useNavigate();

  const handleBuyButtonClick = () => {
    console.log('Buy button clicked');
    navigate(`/purchase/${productId}`, {
      state: {
        imageUrl,
        title,
        price,
        productId,
        quantity,
      }
    }); // Navigate to '/purchase/:productId' route with props as state
  };

  

  const handleAddToCardButtonClick = (event) => {
    console.log('Add to Card button clicked');
  };
  return (
    <Card
      sx={{
        maxWidth: 300,
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
        height: '100%',
      }}
    >
      <Link to={`/catalog/${productId}`} style={{ textDecoration: 'none' }}>
        <CardMedia
          component='img'
          height='200'
          image={imageUrl}
          alt={title}
          sx={{ objectFit: 'contain' }} // Adjust image fit within the card
        />
      </Link>
      <CardContent sx={{ textAlign: 'center', height: '100%' }}>
        <Typography
          variant='subtitle1'
          component='div'
          sx={{
            height: 60,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
          gutterBottom
        >
          {title}
        </Typography>
        <Typography variant='body1' color='text.secondary' gutterBottom>
          Point Cost: {price}
        </Typography>
        <Button
          variant='contained'
          color='primary'
          startIcon={<AddShoppingCartIcon />}
          sx={{ mt: 1 }}
          onClick={handleAddToCardButtonClick}
        >
          Add to Cart
        </Button>
        <Button
          variant='contained'
          color='secondary'
          startIcon={<ShoppingCartIcon />}
          sx={{ mt: 1, ml: 1 }}
          onClick={handleBuyButtonClick}
        >
          Buy
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
