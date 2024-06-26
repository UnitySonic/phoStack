import * as React from 'react';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Grid from '@mui/material/Grid';
import { getEbayItem } from '../util/ebay';
import useUser from '../hooks/useUser';
import { useAuth0 } from '@auth0/auth0-react';

const products = [
  {
    name: 'Product 1',
    desc: 'A nice thing',
    price: '999',
  },
];

export default function Review({ reviewData, formData, userPointValue }) {
  console.log("PointValue", userPointValue)
  const addresses = [
    formData.address1,
    formData.city,
    formData.state,
    formData.zip,
    formData.country,
  ];



  const totalCost = Object.values(reviewData).reduce((total, itemsArray) => {
    // Calculate subtotal for each item in the array
    const subtotal = itemsArray.reduce((subtotal, item) => {
      return subtotal + item.price * item.quantity;
    }, 0);

    // Add subtotal for this array to the total
    return total + subtotal;
  }, 0);
  return (
    <React.Fragment>
      <Typography variant='h6' gutterBottom>
        Order summary
      </Typography>
      <List disablePadding>
        {Object.entries(reviewData).map(([productId, product]) => (
          <ListItem key={productId} sx={{ py: 1, px: 0 }}>
            <ListItemText primary={product[0].title} />
            <Typography variant='body2'>
              {product[0].price * product[0].quantity} {/* Price * Quantity */}
            </Typography>
          </ListItem>
        ))}
        <ListItem sx={{ py: 1, px: 0 }}>
          <ListItemText primary='Total' />
          <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
            {totalCost}
          </Typography>
        </ListItem>
        <ListItem sx={{ py: 1, px: 0 }}>
          <ListItemText primary='Points Balance After Purchase:' />
          <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
            {userPointValue - totalCost}
          </Typography>
        </ListItem>
      </List>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant='h6' gutterBottom sx={{ mt: 2 }}>
            Shipping
          </Typography>
          <Typography gutterBottom>
            {formData.firstName} {formData.lastName}
          </Typography>
          {/* Render other shipping details */}
        </Grid>
        {/* Additional grid items if needed */}
      </Grid>
    </React.Fragment>
  );
}
