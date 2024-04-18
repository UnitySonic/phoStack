import { useAuth0 } from '@auth0/auth0-react';
import { makeRandomOrders } from '../util/orders';
import { useMutation } from '@tanstack/react-query';
import { Button, Typography } from '@mui/material';

const Util = () => {
  const { getAccessTokenSilently } = useAuth0();

  const { mutate } = useMutation({
    mutationFn: makeRandomOrders,
  });

  const handleMakeRandomOrders = () => {
    mutate({ getAccessTokenSilently });
  };

  return (
    <>
      <Typography variant='h4' component='h1' sx={{ marginBottom: '1rem' }}>
        Util Page
      </Typography>
      <Button
        variant='contained'
        color='primary'
        type='submit'
        sx={{ marginBottom: '2rem', marginRight: '2rem' }}
        onClick={handleMakeRandomOrders}
      >
        Make Random Orders For Each Driver
      </Button>
    </>
  );
};

export default Util;
