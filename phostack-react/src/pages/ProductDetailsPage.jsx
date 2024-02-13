import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth0 } from '@auth0/auth0-react';
import { getEbayItem } from '../util/ebay';
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

function ProductDetailsPage() {
  const { getAccessTokenSilently } = useAuth0();

  const params = useParams();
  const navigate = useNavigate();
  const itemId = params.id;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['ebay_products', { itemId }],
    queryFn: ({ signal }) =>
      getEbayItem({ signal, itemId, getAccessTokenSilently }),
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

  return (
    <>
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
                Price: ${data?.price?.value}
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
              <Button variant='contained' color='primary' sx={{ mr: 1 }}>
                Add to Cart
              </Button>
              <Button variant='contained' color='secondary'>
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
