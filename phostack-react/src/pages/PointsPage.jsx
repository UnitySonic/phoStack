import { useState, useEffect, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import CustomAlert from '../components/UI/CustomAlert';
import { getUser } from '../util/users';
import Button from '@mui/material/Button';
import { TextField } from '@mui/material';
import { changeUser } from '../util/users';
import FormControl from '@mui/material/FormControl';
import { queryClient } from '../util/http';
import InputLabel from '@mui/material/InputLabel';
import Input from '@mui/material/Input';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import TextareaAutosize from'@mui/material/TextareaAutosize';
import MenuItem from '@mui/material/MenuItem';
import { fetchBehaviorsByOrgId } from '../util/behavior';
import { useNavigate } from 'react-router-dom';



function PointsPage() {
 // Inside your functional component
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const [pointAdjustment, setPointAdjustment] = useState('');
  const [selectedBehavior, setSelectedBehavior] = useState('');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  // If the sponsor decides on an AdHoc behavior
  const [adHocDescription, setAdHocDescription] = useState('');
  const [adHocName, setAdHocName] = useState('');
  const [adHocPointValue, setAdHocPointValue] = useState(0);


  const { id } = useParams(); // Correctly extract driverId from useParams
  const userId = id;
  var isLoading;
  var isError;
  const { mutate, isPending, isSaveError, saveError } = useMutation({
    mutationFn: changeUser,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['pointAdjustment'],
      });
      setSelectedBehavior('');
      setShowSuccessAlert(true);
      // Go back to driver management page
      navigate('/drivers-management/');
    },
    onError: (error) => {
      setShowErrorAlert(true);
    },
  });

  // Get the driver information using id from URL
  const {
    data: user,
  } = useQuery({
    queryKey: ['getDriver', { userId }],
    queryFn: ({ signal }) =>
      getUser({ signal, userId, getAccessTokenSilently }),
    enabled: !!userId,
  });

  // Get all of the organizations behaviors
  const orgId = user?.orgId;
  const {
    data: behaviors = [],
    refetch: behaviorsRefetch,
    isRefetching: behaviorsIsRefetching, 
  } = useQuery({
    queryKey: ['behaviors', { orgId }],
    queryFn: ({ signal }) =>
    fetchBehaviorsByOrgId({
      orgId,
      signal,
      getAccessTokenSilently,
    }),
    placeholderData: keepPreviousData,
  });

  // Render loading state while data is loading
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Handle error state
  if (isError) {
    return <CustomAlert severity="error" message={isError.message} />;
  }

  const handleBehaviorChange = (event) => {
    const selectedBehaviorName = event.target.value;
    const selectedBehavior = behaviors.find(
      (behavior) => behavior.behaviorName === selectedBehaviorName
    );

    if (selectedBehavior) {
      setPointAdjustment(selectedBehavior.pointValue);
    }
    setSelectedBehavior(selectedBehaviorName);
  };

  const HandleSubmit = (e) => {
    e.preventDefault();
    const newPointValue = user?.pointValue + pointAdjustment;
    mutate({ userId, userData: { pointValue: newPointValue }, getAccessTokenSilently });
  };

  const HandleAdHocSubmit = (e) => {
    e.preventDefault();
    const newPointValue = user?.pointValue + parseInt(adHocPointValue);
    mutate({ userId, userData: { pointValue: newPointValue }, getAccessTokenSilently });
  };

  if(user)
  {
    return (
      <>
      {showErrorAlert && (
        <CustomAlert
          type='error'
          message='Failed to create behavior'
          onClose={() => setShowErrorAlert(false)}
        />
      )}
      {showSuccessAlert && (
        <CustomAlert
          type='success'
          message='Create behavior success!'
          onClose={() => setShowSuccessAlert(false)}
        />
      )}
        <h1>Currently Select Driver: {user?.firstName} {user?.lastName}</h1>
        <h3>Current Points: {user?.pointValue}</h3>

        <FormControl fullWidth margin='normal'>
          <InputLabel htmlFor='behavior'>Behavior</InputLabel>
          <Select
            id='behavior'
            value={selectedBehavior}
            onChange={handleBehaviorChange}
          >
            <MenuItem value='Custom'>Custom</MenuItem>
            {behaviors.map((behavior) => (
              <MenuItem key={behavior.behaviorId} value={behavior.behaviorName}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span>{behavior.behaviorName}</span>
                  <div style={{ marginLeft: '10px' }}>
                    <Chip
                      label={behavior.pointValue + " points"}
                      style={{ backgroundColor: behavior.pointValue >= 0 ? '#12DD11' : '#F62E10' }}
                    />
                  </div>
                </div>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {selectedBehavior === 'Custom' && (
          <form onSubmit={HandleAdHocSubmit}>
            <TextField
              label='Name'
              variant='outlined'
              value={adHocName}
              onChange={(e) => setAdHocName(e.target.value)}
              fullWidth
              required
            />
            <TextareaAutosize
              aria-label='Custom Description'
              placeholder='Description'
              value={adHocDescription}
              onChange={(e) => setAdHocDescription(e.target.value)}
              minRows={3}
              style={{ width: '100%', marginTop: '1rem', padding: '8px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <FormControl fullWidth margin='normal'>
              <InputLabel htmlFor='behaviorPointValue'>Behavior Point Value</InputLabel>
              <Input
                id='adHocPointValue'
                type='number'
                value={adHocPointValue}
                onChange={(e) => setAdHocPointValue(e.target.value)}
              />
            </FormControl>
            <Button type='submit' variant='contained' color='primary'>
              Apply Custom Behavior
            </Button>
          </form>
        )}
        {selectedBehavior !== 'Custom' && (
          <form onSubmit={HandleSubmit}>
            <br />
            <Button type='submit' variant='contained' color='primary'>
              Apply Behavior
            </Button>
          </form>
        )}
      </>
    );
  }
}

export default PointsPage;