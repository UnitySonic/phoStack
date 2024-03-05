import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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

function ProductDetailsPage() {
  const { getAccessTokenSilently } = useAuth0();
  const [organization, setOrganization] = useState(null);

  const params = useParams();
  const navigate = useNavigate();
  const itemId = params.id;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['ebay_products', { itemId }],
    queryFn: ({ signal }) =>
      getEbayItem({ signal, itemId, getAccessTokenSilently }),
  });

  const {
    data: organizationsData = [],
    isLoading: organizationsDataIsLoading,
    isError: organizationsDataIsError,
    error: organizationsDataError,
  } = useQuery({
    queryKey: ['organizations'],
    queryFn: ({ signal1 }) =>
      fetchOrganizations({ signal1, getAccessTokenSilently }),
  });


  const organizations = useMemo(() => {
    return (
      organizationsData
        ?.filter((org) => org.orgStatus === 'active')
        .map((org) => ({
          id: org.orgId,
          label: org.orgName,
          point: org.dollarPerPoint,

        })) || []
    );
  }, [organizationsData]);

  useEffect(() => {
    if (organizations?.length > 0) {
      setOrganization(organizations[2]);
    }
  }, [organizations]);



  //price Conversion

  const priceConvert = (priceString, dollarPerPoint) => {
    // Remove any non-digit characters from the price string
    const cleanPriceString = priceString.replace(/[^\d.]/g, '');

    // Convert the cleaned price string to cents
    const priceInCents = parseFloat(cleanPriceString);

 


    return (Math.round(priceInCents / dollarPerPoint))
  }

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
  const priceUSD = data?.price?.value

  const productId =  data?.itemId;
  const quantity =  data ?.estimatedAvailabilities?.[0]?.estimatedAvailableQuantity 

  const handleBuyButtonClick = () => {
    console.log('Buy button clicked');
    const price = priceConvert(priceUSD, organization.point);
  
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



  if (isLoading || organizationsDataIsLoading) {
    return <Spinner />;
  }

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
                Point Cost: {!organizationsDataIsLoading && organization ? priceConvert(priceUSD, organization.point) : 'Loading...'}
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
              <Button variant='contained' color='secondary' onClick={handleBuyButtonClick}>
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
