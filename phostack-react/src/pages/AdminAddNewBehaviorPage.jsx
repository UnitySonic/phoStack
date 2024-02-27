import { useState, useMemo, useEffect } from 'react';
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
  Autocomplete
} from '@mui/material';
import CustomAlert from '../components/UI/CustomAlert';
import useUser from '../hooks/useUser';
import { queryClient } from '../util/http';
import { useMutation, useQuery } from '@tanstack/react-query';
import { saveBehavior } from '../util/behavior';
import { useAuth0 } from '@auth0/auth0-react';
import { fetchOrganizations } from '../util/organizations';

const AddNewBehaviorPage = () => {
  const { user } = useUser();
  const { getAccessTokenSilently } = useAuth0();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [organization, setOrganization] = useState(null);
  const [behaviorPointValue, setBehaviorPointValue] = useState(0);
  const [status, setStatus] = useState('active');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  const {
    data: organizationsData = [],
    isLoading: organizationsDataIsLoading,
    isError: organizationsDataIsError,
    error: organizationsDataError,
  } = useQuery({
    queryKey: ['organizations'],
    queryFn: ({ signal }) =>
      fetchOrganizations({ signal, getAccessTokenSilently }),
  });

  const organizations = useMemo(() => {
    return (
      organizationsData?.map((org) => ({
        id: org.orgId,
        label: org.orgName,
      })) || []
    );
  }, [organizationsData]);

  useEffect(() => {
    if (organizations?.length > 0) {
      setOrganization(organizations[0]);
    }
  }, [organizations]);

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
      orgId: organization.id,
      pointValue: behaviorPointValue,
      behaviorName: name,
      behaviorDescription: description,
      behaviorStatus: status
    };
    mutate({ behaviorData, getAccessTokenSilently });
  };

  const handleOrganizationChange = (event, newValue) => {
    setOrganization(newValue);
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
        <Autocomplete
          required
          options={organizations}
          getOptionLabel={(option) => option.label}
          getOptionKey={(option) => option.id}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          value={organization}
          onChange={handleOrganizationChange}
          renderInput={(params) => (
            <TextField {...params} label='Organization' variant='outlined' />
          )}
          sx={{ marginBottom: '6px', marginTop: '1rem' }}
        />
        <FormControl fullWidth margin='normal'>
          <InputLabel htmlFor='behaviorPointValue'>Behavior Point Value</InputLabel>
          <Input
            id='behaviorPointValue'
            type='number'
            value={behaviorPointValue}
            onChange={(e) => setBehaviorPointValue(e.target.value)}
          //   startAdornment={<InputAdornment position='start'></InputAdornment>}
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