import { useState, useMemo } from 'react';
import {
  InputLabel,
  MenuItem,
  Select,
  Button,
  Typography,
  Autocomplete,
  TextField,
} from '@mui/material';
import { fetchOrganizations } from '../util/organizations';
import { useMutation, useQuery } from '@tanstack/react-query';
import { seedRandomUser } from '../util/users';
import { queryClient } from '../util/http';
import { useAuth0 } from '@auth0/auth0-react';
import CustomAlert from '../components/UI/CustomAlert';

const SeedUserData = () => {
  const [userType, setUserType] = useState('DriverUser');
  const [organization, setOrganization] = useState(null);
  const { getAccessTokenSilently } = useAuth0();
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  const handleUserChange = (event) => {
    setUserType(event.target.value);
  };

  const handleOrganizationChange = (event, newValue) => {
    setOrganization(newValue);
  };
  const { mutate, isPending, isSaveError, saveError } = useMutation({
    mutationFn: seedRandomUser,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['users'],
      });
      setShowSuccessAlert(true);
    },
    onError: (error) => {
      setShowErrorAlert(true);
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    const orgId = organization?.id;
    const userData = {
      userType,
      orgId,
    };
    mutate({ userData, getAccessTokenSilently });
  };

  const { data: organizationsData = [] } = useQuery({
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

  return (
    <>
      {showErrorAlert && (
        <CustomAlert
          type='error'
          message='User created failed!'
          onClose={() => setShowErrorAlert(false)}
        />
      )}
      {showSuccessAlert && (
        <CustomAlert
          type='success'
          message='User created sucessfully!'
          onClose={() => setShowSuccessAlert(false)}
        />
      )}
      <Typography variant='h4' component='h1'>
        Seed New Random User
      </Typography>
      <form onSubmit={handleSubmit}>
        <InputLabel id='user-type-label'>User Type</InputLabel>
        <Select
          labelId='user-type-label'
          id='user-type-select'
          value={userType}
          onChange={handleUserChange}
        >
          <MenuItem value='DriverUser'>DriverUser</MenuItem>
          <MenuItem value='SponsorUser'>SponsorUser</MenuItem>
        </Select>
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
        <Button variant='contained' color='primary' type='submit'>
          Submit
        </Button>
      </form>
    </>
  );
};

export default SeedUserData;
