import { useState, useMemo, useEffect } from 'react';
import {
  TextField,
  Button,
  Typography,
  Autocomplete,
  Divider,
} from '@mui/material';
import { changeUser } from '../util/users';
import { queryClient } from '../util/http';
import { useMutation, useQuery } from '@tanstack/react-query';
import useUser from '../hooks/useUser';
import { useAuth0 } from '@auth0/auth0-react';
import CustomAlert from '../components/UI/CustomAlert';
import { fetchOrganizations } from '../util/organizations';
import { useParams } from 'react-router-dom';

const AdminDriverAddOrganizationsPage = () => {
  const { getAccessTokenSilently } = useAuth0();
  const params = useParams();
  const userId = params.userId;
  const { user: driver } = useUser(userId);
  const [initialPoints, setInitialPoints] = useState(0);
  const [organization, setOrganization] = useState(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  const { data: organizationsData = [] } = useQuery({
    queryKey: ['organizations'],
    queryFn: ({ signal }) =>
      fetchOrganizations({ signal, getAccessTokenSilently }),
  });

  const organizations = useMemo(() => {
    return (
      organizationsData
        ?.filter(
          (orgData) =>
            !driver?.organizations?.find((o) => o.orgId === orgData.orgId)
        )
        .map((org) => ({
          id: org.orgId,
          label: org.orgName,
        })) || []
    );
  }, [organizationsData, driver]);

  const { mutate } = useMutation({
    mutationFn: changeUser,
    onSuccess: () => {
      queryClient.invalidateQueries();
      setShowSuccessAlert(true);
      setOrganization(null);
    },
    onError: (error) => {
      setShowErrorAlert(true);
    },
  });

  const handleOrganizationChange = (event, newValue) => {
    setOrganization(newValue);
  };
  const handleInitialPointsChange = (event) => {
    const newValue = event.target.value;
    setInitialPoints(newValue === '' ? '' : Number(newValue));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const orgId = organization?.id;
    const userData = {
      organizations: [orgId],
      points: {
        orgId: orgId,
        amount: initialPoints,
        type: 'replace',
      },
    };
    if (orgId) {
      mutate({ userId, userData, getAccessTokenSilently });
    } else {
      setShowErrorAlert(true);
    }
  };

  return (
    <>
      {showErrorAlert && (
        <CustomAlert
          type='error'
          message='Something went wrong!'
          onClose={() => setShowErrorAlert(false)}
        />
      )}
      {showSuccessAlert && (
        <CustomAlert
          type='success'
          message='Success!'
          onClose={() => setShowSuccessAlert(false)}
        />
      )}
      <Typography variant='h4' component='h1'>
        Add Driver To Organization
      </Typography>
      <Typography variant='h6' component='h2' color='textSecondary'>
        {driver?.firstName} {driver?.lastName} | {driver?.email}
      </Typography>
      <form onSubmit={handleSubmit}>
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
        <TextField
          fullWidth
          margin='normal'
          label='Initial Points'
          type='number'
          value={initialPoints}
          onChange={handleInitialPointsChange}
          required
        />
        <Button variant='contained' color='primary' type='submit'>
          Submit
        </Button>
      </form>
    </>
  );
};

export default AdminDriverAddOrganizationsPage;
