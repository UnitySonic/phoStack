import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Paper from '@mui/material/Paper';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import AddressForm from '../components/AddressForm';
import Review from '../components/Review';
import { useAuth0 } from '@auth0/auth0-react';
import useUser from '../hooks/useUser';
import { saveOrder } from '../util/orders';
import { queryClient } from '../util/http';
import { useQuery, useMutation } from '@tanstack/react-query';
import { modifyCart } from '../util/cart';
import { clearCart } from '../util/cart';

function Checkout() {
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const productInfo = useLocation();
  const { cart, clearCartFlag, cartId } = productInfo.state;
  console.log(cart)



  const { getAccessTokenSilently } = useAuth0();
  const { user = {}, isLoading: isUserLoading } = useUser();
  const { viewAs } = user;
  const orgId = viewAs?.selectedOrgId;
  const userOrganizations = viewAs?.organizations || [];
  const selectedOrganization = userOrganizations.find(
    (org) => org.orgId == orgId
  );
  const dollarPerPoint = selectedOrganization?.dollarPerPoint

  const { mutate, isPending, isSaveError, saveError } = useMutation({
    mutationFn: saveOrder,
    onSuccess: () => {
      queryClient.invalidateQueries();
      setShowSuccessAlert(true);
    },
    onError: (error) => {
      setShowErrorAlert(true);
    },
  });

  const { mutate: clearMutate, isPending: clearIsPending, isSaveError: clearIsSaveError, saveError: clearSaveError, isSuccess: clearIsSuccess } = useMutation({
    mutationFn: clearCart,
    onSuccess: () => {
      setShowSuccessAlert(true);
      queryClient.removeQueries(['cart'])
    },
    onError: (error) => {
      setShowErrorAlert(true);
    },
  });



  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });

  const handleAddressFormSubmit = (data) => {

    setFormData(data);
  };

  const handleNext = () => {
    if (isFormDataValid()) {
      setActiveStep(activeStep + 1);
    }

    if (activeStep === 1) {
      const copyOfCart = { ...cart }
      const orderData = {
        orderStatus: 'processing',
        orderBy: user?.userId,
        orderFor: viewAs?.userId,
        orderInfo: copyOfCart,
        orgId,
        addressFirstName: formData.firstName,
        addressLastName: formData.lastName,
        addressLineOne: formData.address1,
        addressLineTwo: formData.address2,
        addressCity: formData.city,
        addressState: formData.state,
        addressZip: formData.zip,
        addressCountry: formData.country,
        dollarPerPoint: selectedOrganization?.dollarPerPoint,
      };
      mutate({ orderData, getAccessTokenSilently });

      if (clearCartFlag === true) {
        console.log("Hi I'm running")
        clearMutate({ cartId, getAccessTokenSilently })
      }
    }
  };

  function getStepContent(step, locData) {
    switch (step) {
      case 0:
        return (
          <AddressForm
            onNext={handleAddressFormSubmit}
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 1:
        return (
          <Review
            reviewData={locData}
            formData={formData}
            userPointValue={selectedOrganization?.pointValue}
            dollarPerPoint={dollarPerPoint}
          />
        );
      default:
        return null;
    }
  }

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const isFormDataValid = () => {
    const { address1, firstName, lastName, city, state, zip, country } =
      formData;
    return (
      address1.trim() !== '' &&
      firstName.trim() !== '' &&
      lastName.trim() !== '' &&
      city.trim() !== '' &&
      state.trim() !== '' &&
      zip.trim() !== '' &&
      country.trim() !== ''
    );
  };



  if (isUserLoading) {
    return <div>Loading...</div>; // Display loading indicator while user data is being fetched
  }

  return (
    <React.Fragment>
      <CssBaseline />
      <AppBar position='absolute' color='default' elevation={0}>
        <Toolbar>
          <Typography variant='h6' color='inherit' noWrap>
            Company name
          </Typography>
        </Toolbar>
      </AppBar>
      <Container component='main' maxWidth='sm' sx={{ mb: 4 }}>
        <Paper
          variant='outlined'
          sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
        >
          <Typography component='h1' variant='h4' align='center'>
            Checkout
          </Typography>
          <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
            {['Shipping address', 'Review your order'].map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {activeStep === 2 ? (
            <React.Fragment>
              <Typography variant='h5' gutterBottom>
                Thank you for your order.
              </Typography>
              <Typography variant='subtitle1'>
                Your order has been placed! We have emailed your order
                confirmation, and will send you an update when your order has
                shipped.
              </Typography>
            </React.Fragment>
          ) : (
            <React.Fragment>
              {getStepContent(activeStep, cart)}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                {activeStep !== 0 && (
                  <Button onClick={handleBack} sx={{ mt: 3, ml: 1 }}>
                    Back
                  </Button>
                )}
                <Button
                  variant='contained'
                  onClick={handleNext}
                  sx={{ mt: 3, ml: 1 }}
                  disabled={!isFormDataValid()}
                >
                  {activeStep === 1 ? 'Place order' : 'Next'}
                </Button>
              </Box>
            </React.Fragment>
          )}
        </Paper>
      </Container>
    </React.Fragment>
  );
}

export default Checkout;
