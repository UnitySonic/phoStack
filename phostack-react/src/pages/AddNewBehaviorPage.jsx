/*
README: THIS PAGE IS CURRENTLY NOT BEING USED BECAUSE BEHAVIOR FUNCTIONALITY IS OUT OF SCOPE OF THE ADMIN
*/

import { useState } from 'react';
import {
  TextField,
  TextareaAutosize,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  Input,
  InputAdornment,
  Typography,
} from '@mui/material';
import CustomAlert from '../components/UI/CustomAlert';
import useUser from '../hooks/useUser';
import { queryClient } from '../util/http';
import { useMutation } from '@tanstack/react-query';
import { saveBehavior } from '../util/behavior';
import { useAuth0 } from '@auth0/auth0-react';

const AddNewBehaviorPage = () => {
  const { user } = useUser();
  const { getAccessTokenSilently } = useAuth0();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [behaviorPointValue, setBehaviorPointValue] = useState(0);
  const [status, setStatus] = useState('active');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  const { mutate, isPending, isSaveError, saveError } = useMutation({
    mutationFn: saveBehavior,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['behaviors'],
      });
      setShowSuccessAlert(true);
      setName('');
      setDescription('');
    },
    onError: (error) => {
      setShowErrorAlert(true);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const behaviorData = {
      orgId: user?.orgId,
      pointValue: behaviorPointValue,
      behaviorName: name,
      behaviorDescription: description,
      behaviorStatus: status
    };
    mutate({ behaviorData, getAccessTokenSilently });
  };

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
      <Typography variant='h4' component='h1' sx={{ marginBottom: '1rem' }}>
        Add Behavior
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label='Name'
          variant='outlined'
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          required
        />
        <TextareaAutosize
          aria-label='Description'
          placeholder='Description'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          minRows={3}
          style={{ width: '100%', marginTop: '1rem', padding: '8px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <FormControl fullWidth margin='normal'>
          <InputLabel htmlFor='behaviorPointValue'>Behavior Point Value</InputLabel>
          <Input
            id='behaviorPointValue'
            type='number'
            value={behaviorPointValue}
            onChange={(e) => setBehaviorPointValue(e.target.value)}
          />
        </FormControl>
        <FormControl variant='outlined' fullWidth style={{ marginTop: '1rem' }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            label='Status'
          >
            <MenuItem value='active'>Active</MenuItem>
            <MenuItem value='inactive'>Inactive</MenuItem>
          </Select>
        </FormControl>
        <Button
          type='submit'
          variant='contained'
          color='primary'
          style={{ marginTop: '1rem' }}
        >
          Submit
        </Button>
      </form>
    </>
  );
}
export default AddNewBehaviorPage;