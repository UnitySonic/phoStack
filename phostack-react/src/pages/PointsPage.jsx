import { useState, useMutation, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useQuery } from '@tanstack/react-query';
import CustomAlert from '../components/UI/CustomAlert';
import { getUser } from '../util/users';
import Button from '@mui/material/Button';
import { TextField } from '@mui/material';
import { changeUser } from '../util/users';


function PointsPage() {
 // Inside your functional component
  const { getAccessTokenSilently } = useAuth0();
  const { id } = useParams(); // Correctly extract driverId from useParams
  const userId = id;
  const [pointAdjustment, setPointAdjustment] = useState('');

  // Get the driver information using id from URL
  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['getDriver', { userId }],
    queryFn: ({ signal }) =>
      getUser({ signal, userId, getAccessTokenSilently }),
    enabled: !!userId,
  });

  // Render loading state while data is loading
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Handle error state
  if (isError) {
    return <CustomAlert severity="error" message={error.message} />;
  }
  const handlePointChange = (event) => 
  {
    setPointAdjustment(event.target.value);
  }

  // NEXT SPRINT TODO: Make this a mutate
  const HandleSubmit = async (event) =>
  {
    // Update driver point value
    try{
      const userData = {pointValue: pointAdjustment};
      event.preventDefault();
      // Update driver point value with form value
      const { data, error, isLoading } = await changeUser({userId, userData, getAccessTokenSilently});
    } catch (error) {
      // Handle errors
      console.error("Error:", error);
    }
  }

  if(user)
  {
    return (
      <>
        <h1>The Driver you have currently selected is: </h1>
        <h3>{user.firstName} {user.lastName}</h3>
      {/* NEXT SPRINT TODO: Update this if user submits form with new pointValue */}
        <h2>Current Points: {user.pointValue}</h2>
        <form onSubmit={HandleSubmit}>
          <TextField
            halfwidth='true'
            margin='normal'
            label='Points'
            value={pointAdjustment}
            onChange={handlePointChange}
            required
          />
          <br />
          <Button type='submit' variant='contained' color='primary'>
            Set Points
          </Button>
        </form>
      </>
    );
  }
}

export default PointsPage;