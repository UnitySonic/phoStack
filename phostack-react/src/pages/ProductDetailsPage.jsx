import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth0 } from '@auth0/auth0-react';
import { getEbayItem } from '../util/ebay';
import { useMemo, useEffect, useState } from 'react';
import {
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
} from '@mui/material';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Divider from '@mui/material/Divider';
import { fetchOrganizations } from '../util/organizations';
import Spinner from '../components/UI/Spinner';
import useUser from '../hooks/useUser';
import CustomAlert from '../components/UI/CustomAlert';
import priceConvert from '../util/priceConvert';
import { addToCart } from '../util/cart';
import { queryClient } from '../util/http';
import { getCartId } from '../util/cart';

function ProductDetailsPage() {
  const { getAccessTokenSilently } = useAuth0();
  const [organization, setOrganization] = useState(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  const params = useParams();
  const navigate = useNavigate();
  const itemId = params.id;

  const { user } = useUser();
  const { viewAs } = user;
  const orgId = viewAs?.selectedOrgId;
  const userOrganizations = viewAs?.organizations || [];
  const selectedOrganization = userOrganizations.find(
    (org) => org.orgId == orgId
  );
  const userId = viewAs?.userId


  let cartIdQueryParams = {
    orgId,
    userId,
  }

  const {
    data: cartId,
    isLoading: cartIdIsLoading,
    isError: cartIsIdError,
    error: cartIdError,
  } = useQuery({
    queryKey: ['cartId', cartIdQueryParams],
    queryFn: ({ signal }) =>
      getCartId({ signal, params: cartIdQueryParams, getAccessTokenSilently }),
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['ebay_products', { itemId }],
    queryFn: ({ signal }) =>
      getEbayItem({ signal, itemId, getAccessTokenSilently }),
  });

  const { mutate, isPending, isSaveError, saveError, isSuccess } = useMutation({
    mutationFn: addToCart,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['users', 'drivers'],
      });
      setShowSuccessAlert(true);
    },
    onError: (error) => {
      console.error('Mutation Error:', error);
      setShowErrorAlert(true);
    },
  });



  // Settings for react-slick slider
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
  };

  const imageUrl = data?.image?.imageUrl;
  const title = data?.title;
  const priceUSD = data?.price?.value;

  const productId = data?.itemId;
  const quantity =
    data?.estimatedAvailabilities?.[0]?.estimatedAvailableQuantity;

  const handleBuyButtonClick = () => {
    console.log('Buy button clicked');
    const price = priceConvert(priceUSD, selectedOrganization.dollarPerPoint);

    if (selectedOrganization?.pointValue < price) {
      setShowErrorAlert(true);
    } else {

      navigate(`/purchase/${productId}`, {
        state: {
          cart: {
            [productId]: [{
              imageUrl,
              title,
              price,
              quantity,
              productId,
            }]
          },
          clearCartFlag: false,
          cartId: undefined
        }
      }); // Navigate to '/purchase/:productId' route with props as state
    }
  };

  const handleAddToCartButtonClick = (event) => {

    const itemData = {
      productId: productId,
      quantity: 1 // Initial quantity when adding to cart
    };


    mutate({ cartId, itemData, getAccessTokenSilently })


  };

  if (isLoading) {
    return <Spinner />;
  }

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
      <Grid container spacing={3} sx={{ marginBottom: '20px' }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia
              component='img'
              height='auto'
              image={data?.image?.imageUrl}
              alt={data?.title}
            />
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          {/* Product details */}
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                {data?.title}
              </Typography>
              <Typography variant='body1' gutterBottom>
                {data?.shortDescription}
              </Typography>
              <Typography variant='body1' gutterBottom>
                Point Cost:{' '}
                {!isLoading && selectedOrganization
                  ? priceConvert(priceUSD, selectedOrganization.dollarPerPoint)
                  : 'Loading...'}
              </Typography>
              <Divider />
              <Typography variant='body1' gutterBottom>
                Condition: {data?.condition}
              </Typography>
              {data?.conditionDescription && (
                <Typography variant='body1' gutterBottom>
                  {data?.conditionDescription}
                </Typography>
              )}
              <Typography variant='body1' gutterBottom>
                Estimated Available Quantity:{' '}
                {data?.estimatedAvailabilities?.[0]?.estimatedAvailableQuantity}
              </Typography>
              <Typography variant='body1' gutterBottom>
                itemId: {data?.itemId}
              </Typography>
              <Button variant='contained' color='primary' sx={{ mr: 1 }} onClick={handleAddToCartButtonClick}>
                Add to Cart
              </Button>
              <Button
                variant='contained'
                color='secondary'
                onClick={handleBuyButtonClick}
              >
                Buy
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <div dangerouslySetInnerHTML={{ __html: data?.description }} />
    </>
  );
}

export default ProductDetailsPage;
