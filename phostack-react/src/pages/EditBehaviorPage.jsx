import { useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
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
import { changeBehavior } from '../util/behavior';

const EditBehaviorPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const viewAsUser = user?.viewAs;
  const { getAccessTokenSilently } = useAuth0();
  const { behaviorId } = useParams();
  const location = useLocation();
  const { behaviorName, behaviorDescription, pointValue, behaviorStatus } = location.state;
  const [name, setName] = useState(behaviorName);
  const [description, setDescription] = useState(behaviorDescription);
  const [behaviorPointValue, setBehaviorPointValue] = useState(pointValue);
  const [status, setStatus] = useState(behaviorStatus);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  const { mutate, isPending, isSaveError, saveError } = useMutation({
    mutationFn: changeBehavior,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['behaviors'],
      });
      navigate('/behaviors');
    },
    onError: (error) => {
      setShowErrorAlert(true);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const behaviorData = {
      pointValue: behaviorPointValue,
      behaviorName: name,
      behaviorDescription: description,
      behaviorStatus: status
    };
    mutate({
        behaviorId,
        behaviorData,
        getAccessTokenSilently,
      });
  };

  return (
    <>
      {showErrorAlert && (
        <CustomAlert
          type='error'
          message='Failed to edit behavior'
          onClose={() => setShowErrorAlert(false)}
        />
      )}
      <Typography variant='h4' component='h1' sx={{ marginBottom: '1rem' }}>
        Edit Behavior
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
export default EditBehaviorPage;