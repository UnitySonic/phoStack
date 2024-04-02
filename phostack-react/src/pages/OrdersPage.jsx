import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Box,
  Button,
} from '@mui/material';

import { useAuth0 } from '@auth0/auth0-react';
import { useQuery, keepPreviousData, useMutation } from '@tanstack/react-query';
import { changeOrder, fetchOrders } from '../util/orders';
import CustomAlert from '../components/UI/CustomAlert';
import { useState } from 'react';
import { queryClient } from '../util/http';
import useUser from '../hooks/useUser';
import Pagination from '@mui/material/Pagination';

const OrdersPage = () => {
  const { getAccessTokenSilently } = useAuth0();
  const { user } = useUser();
  const { viewAs = {} } = user;
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  const [page, setPage] = useState(1);
  const limit = 3;

  let queryParams = {
    orgId: viewAs?.selectedOrgId,
    orderFor: viewAs?.userId,
    offset: (page - 1) * limit,
    limit,
  };

  const { data: { orders = [], total } = {} } = useQuery({
    queryKey: ['orders', { queryParams }],
    queryFn: ({ signal }) =>
      fetchOrders({
        signal,
        params: queryParams,
        getAccessTokenSilently,
      }),
    placeholderData: keepPreviousData,
  });

  const maxPage = Math.ceil(total / limit);
  const currentPage = Math.min(page, maxPage);

  const { mutate } = useMutation({
    mutationFn: changeOrder,
    onSuccess: () => {
      queryClient.invalidateQueries();
      setShowSuccessAlert(true);
    },
    onError: (error) => {
      setShowErrorAlert(true);
    },
  });

  const handleCancelOrder = (orderId) => {
    mutate({
      orderId,
      orderData: { orderStatus: 'canceled' },
      getAccessTokenSilently,
    });
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <>
      {showErrorAlert && (
        <CustomAlert
          type='error'
          message='Something went wrong!'
          onClose={() => setShowErrorAlert(false)}
        />
      )}
      {showSuccessAlert && (
        <CustomAlert
          type='success'
          message='Success!'
          onClose={() => setShowSuccessAlert(false)}
        />
      )}
      <Container maxWidth='md'>
        <Typography variant='h4' component='h1' gutterBottom>
          My Orders
        </Typography>
        <List>
          {orders.map((order) => (
            <Box key={order.id} border={1} borderRadius={8} p={2} mb={2}>
              <ListItemText secondary={`Order Number: ${order.orderId}`} />
              <ListItemText
                secondary={`Order Total: ${order.orderTotal} Points`}
              />
              <ListItemText
                secondary={`Order Placed: ${new Date(
                  order.createdAt
                ).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}`}
              />
              <ListItemText
                secondary={`Shipping Address: 
                ${order.shipping.addressFirstName} ${order.shipping.addressLastName} 
                ${order.shipping.addressLineOne} 
                ${order.shipping.addressLineTwo} 
                ${order.shipping.addressCity}, ${order.shipping.addressState} ${order.shipping.addressZip}`}
              />
              <ListItemText secondary={`Status: ${order.orderStatus}`} />
              <Divider />
              <List>
                {order.items.map((item) => (
                  <ListItem key={item.itemId}>
                    <ListItemAvatar>
                      <Avatar
                        style={{
                          width: 150,
                          height: 150,
                          borderRadius: 8,
                          marginRight: '1rem',
                        }}
                        alt={item.title}
                        src={item?.image?.imageUrl}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={item.title}
                      secondary={`Point Cost: ${Math.round(
                        parseFloat(item.price) / (order?.dollarPerPoint || 0.01)
                      )} | Quantity: ${item.quantity}`}
                    />
                  </ListItem>
                ))}
              </List>
              {order.orderStatus === 'processing' && (
                <Button
                  variant='outlined'
                  color='error'
                  onClick={() => handleCancelOrder(order.orderId)}
                >
                  Cancel Order
                </Button>
              )}
            </Box>
          ))}
        </List>
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
      </Container>
    </>
  );
};

export default OrdersPage;
