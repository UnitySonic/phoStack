import ProductCard from '../components/ProductCard';
import { useQuery } from '@tanstack/react-query';
import Alert from '@mui/material/Alert';
import Spinner from '../components/UI/Spinner';
import AlertTitle from '@mui/material/AlertTitle';
import { useState } from 'react';
import Pagination from '@mui/material/Pagination';
import { Grid, Box } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import { getEbayItems } from '../util/ebay';
function CatalogPage() {
  const { getAccessTokenSilently } = useAuth0();
  const [page, setPage] = useState(1);
  const limit = 40;

  const orgID = 3;
  let queryParams = {
    orgID,
    offset: (page - 1) * limit,
    limit,
    // filter: 'price:[10..50],priceCurrency:USD'
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['ebay_products', queryParams],
    queryFn: ({ signal }) =>
      getEbayItems({ signal, params: queryParams, getAccessTokenSilently }),
  });



  const handlePageChange = (event, value) => {
    setPage(value);
  };

  let content;

  if (isLoading) {
    return <Spinner />;
  }

  if (isError) {
    content = (
      <Alert severity='error'>
        <AlertTitle>Error</AlertTitle>
        {error.info?.message ||
          'Failed to fetch products data, please try again later.'}
      </Alert>
    );
  }

  if (data && data.total > 0) {
    const maxPage = Math.ceil(Math.min(data.total, 3000) / limit);
    const currentPage = Math.min(page, maxPage);
    content = (
      <Box>
        <Grid container spacing={3}>
          {data.itemSummaries.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.itemId}>
              <ProductCard
                imageUrl={product?.thumbnailImages?.[0]?.imageUrl}
                title={product?.title}
                price={product?.price?.value}
                productId={product?.itemId}
                quantity={product?.estimatedAvailabilities?.[0]?.estimatedAvailableQuantity || 1}
                
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
