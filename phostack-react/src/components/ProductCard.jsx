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
import { Link } from "react-router-dom"
import CustomAlert from "./UI/CustomAlert"
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query';
import { addToCart } from '../util/cart';
import { useAuth0 } from '@auth0/auth0-react';



const ProductCard = ({ imageUrl, title, price, userPointValue, productId, quantity, cartId }) => {
  const navigate = useNavigate();
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const { getAccessTokenSilently } = useAuth0();





  const handleBuyButtonClick = () => {

    if (userPointValue < price) {
      setShowErrorAlert(true)
    }
    else {
      console.log('Buy button clicked');

      navigate(`/purchase/${productId}`, {
        state: {
          cart: {
            [productId]: [{
              imageUrl,
              title,
              price,
              quantity,
            }]
          },
          clearCartFlag: false,
          cartId: cartId
        }
      }); // Navigate to '/purchase/:productId' route with props as state
    }
  };



  const { mutate, isPending, isSaveError, saveError, isSuccess } = useMutation({
    mutationFn: addToCart,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['users', 'drivers'],
      });
      setShowSuccessAlert(true);
    },
    onError: (error) => {
      //setShowErrorAlert(true);
    },
  });


  const handleAddToCartButtonClick = (event) => {
    // Create a new cart item object
    const itemData = {
      productId: productId,
      quantity: 1 // Initial quantity when adding to cart
    };


    mutate({ cartId, itemData, getAccessTokenSilently })

  };

  return (
    <>
      {showErrorAlert && (
        <CustomAlert
          type='error'
          message='You do not have enough points to purchase this item'
          onClose={() => setShowErrorAlert(false)}
        />
      )}
      {
        showSuccessAlert && (
          <CustomAlert
            type="success"
            message="Added to Cart"
            onClose={() => setShowSuccessAlert(false)}
          />
        )
      }
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
            onClick={handleAddToCartButtonClick}
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
    </>
  );
};

export default ProductCard;
