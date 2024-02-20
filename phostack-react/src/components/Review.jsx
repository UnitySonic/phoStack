import * as React from 'react';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Grid from '@mui/material/Grid';

const products = [
  {
    name: 'Product 1',
    desc: 'A nice thing',
    price: '999',
  },
 
];

function convertPriceToCents(priceString) {
  // Remove any non-digit characters from the price string
  const cleanPriceString = priceString.replace(/[^\d.]/g, '');

  // Convert the cleaned price string to cents
  const priceInCents = parseFloat(cleanPriceString) * 100;

  // Round the price to the nearest integer
  return Math.round(priceInCents);
}




export default function Review({reviewData, formData} )  {
  const addresses = [formData.address1, formData.city, formData.state, formData.zip, formData.country];
  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        Order summary
      </Typography>
      <List disablePadding>
        {products.map((product) => (
          <ListItem key={product.name} sx={{ py: 1, px: 0 }}>
            <ListItemText primary={reviewData.title}/>
            <Typography variant="body2">{convertPriceToCents(reviewData.price)}</Typography>
          </ListItem>
        ))}
        <ListItem sx={{ py: 1, px: 0 }}>
          <ListItemText primary="Total" />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {convertPriceToCents(reviewData.price)}
          </Typography>
        </ListItem>
      </List>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Shipping
          </Typography>
          <Typography gutterBottom>{formData.firstName}    {formData.lastName}</Typography>
          <Typography gutterBottom>{addresses.join(', ')}</Typography>
        </Grid>
        <Grid item container direction="column" xs={12} sm={6}>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
