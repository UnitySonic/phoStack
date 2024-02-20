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
import { queryClient } from '../util/http';
import CustomAlert from '../components/UI/CustomAlert';
import useUser from '../hooks/useUser';
import { useMutation } from '@tanstack/react-query';
import { useAuth0 } from '@auth0/auth0-react';
import { saveOrganization } from '../util/organizations';

const AdminNewOrganizationPage = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dollarPerPoint, setDollarPerPoint] = useState(0.01);
  const [status, setStatus] = useState('active');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  const { mutate, isPending, isSaveError, saveError } = useMutation({
    mutationFn: saveOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['organizations'],
      });
      queryClient.invalidateQueries({
        queryKey: ['users', 'drivers'],
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
    const orgData = {
      orgName: name,
      orgDescription: description,
      dollarPerPoint,
      orgStatus: status,
    };
    mutate({ orgData, getAccessTokenSilently });
  };

  return (
    <>
      {showErrorAlert && (
        <CustomAlert
          type='error'
          message='Failed to create organization'
          onClose={() => setShowErrorAlert(false)}
        />
      )}
      {showSuccessAlert && (
        <CustomAlert
          type='success'
          message='Create organization success!'
          onClose={() => setShowSuccessAlert(false)}
        />
      )}
      <Typography variant='h4' component='h1' sx={{ marginBottom: '1rem' }}>
        Add Organization
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
          <InputLabel htmlFor='dollarPerPoint'>Dollar Per Point</InputLabel>
          <Input
            id='dollarPerPoint'
            type='number'
            value={dollarPerPoint}
            onChange={(e) => setDollarPerPoint(e.target.value)}
            startAdornment={<InputAdornment position='start'>$</InputAdornment>}
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
};

export default AdminNewOrganizationPage;
