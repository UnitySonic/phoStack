import ProductCard from '../components/ProductCard';
import { useQuery } from '@tanstack/react-query';
import Alert from '@mui/material/Alert';
import Spinner from '../components/UI/Spinner';
import AlertTitle from '@mui/material/AlertTitle';
import { useState, useMemo, useEffect } from 'react';
import Pagination from '@mui/material/Pagination';
import { Grid, Box } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import { getEbayItems } from '../util/ebay';
import { getCartId } from '../util/cart';
import useUser from '../hooks/useUser';
import priceConvert from '../util/priceConvert';

function CatalogPage() {
  const { getAccessTokenSilently } = useAuth0();
  const [page, setPage] = useState(1);
  const limit = 40;

  const { user } = useUser();
  const { viewAs } = user;
  const orgId = viewAs?.selectedOrgId;
  const userId = viewAs?.userId;
  const userOrganizations = viewAs?.organizations || [];
  const selectedOrganization = userOrganizations.find(org => org.orgId == orgId);
  const userPointValue = selectedOrganization?.pointValue;

  let queryParams = {
    orgId,
    offset: (page - 1) * limit,
    limit,
  };

  const {
    data: ebayData,
    isLoading: ebayIsLoading,
    isError: ebayIsError,
    error: ebayError,
  } = useQuery({
    queryKey: ['ebay_products', queryParams],
    queryFn: ({ signal }) =>
      getEbayItems({ signal, params: queryParams, getAccessTokenSilently }),
  });

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





  //price Conversion


  //end price conversion

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  let content;

  if (ebayIsLoading || cartIdIsLoading) {
    return <Spinner />;
  }


  if (ebayIsError) {
    content = (
      <Alert severity='error'>
        <AlertTitle>Error</AlertTitle>
        {error.info?.message ||
          'Failed to fetch products data, please try again later.'}
      </Alert>
    );
  }

  if (ebayData && ebayData.total > 0) {
    const maxPage = Math.ceil(Math.min(ebayData.total, 3000) / limit);
    const currentPage = Math.min(page, maxPage);
    content = (
      <Box>
        <Grid container spacing={3}>
          {ebayData.itemSummaries.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.itemId}>
              <ProductCard
                imageUrl={product?.thumbnailImages?.[0]?.imageUrl}
                title={product?.title}
                price={priceConvert(
                  product?.price?.value,
                  selectedOrganization?.dollarPerPoint
                )}
                userPointValue={userPointValue}
                productId={product?.itemId}
                quantity={
                  product?.estimatedAvailabilities?.[0]
                    ?.estimatedAvailableQuantity || 1
                }
                cartId={cartId}
              />
            </Grid>
          ))}
        </Grid>
        <Box display='flex' justifyContent='center' mt={3}>
          <Pagination
            count={maxPage}
            page={currentPage}
            onChange={handlePageChange}
            variant='outlined'
            shape='rounded'
            color='primary'
          />
        </Box>
      </Box>
    );
  } else {
    content = (
      <Alert severity='error'>
        <AlertTitle>Error</AlertTitle>
        {'No more items'}
      </Alert>
    );
  }
  return <>{content}</>;
}

export default CatalogPage;
