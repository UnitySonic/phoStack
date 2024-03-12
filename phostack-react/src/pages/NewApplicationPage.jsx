import { useState, useEffect, useMemo } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import { useAuth0 } from '@auth0/auth0-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchOrganizations } from '../util/organizations';
import { saveApplication } from '../util/applications';
import { queryClient } from '../util/http';
import CustomAlert from '../components/UI/CustomAlert';
import useUser from '../hooks/useUser';

const NewApplicationPage = () => {
  const { getAccessTokenSilently } = useAuth0();
  const { user } = useUser();
  const { viewAs = {}} = user;
  const { userId } = viewAs;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [organization, setOrganization] = useState(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  const { mutate, isPending, isSaveError, saveError } = useMutation({
    mutationFn: saveApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setShowSuccessAlert(true);
    },
    onError: (error) => {
      setShowErrorAlert(true);
    },
  });

  useEffect(() => {
    if (viewAs) {
      setFirstName(viewAs?.firstName || '');
      setLastName(viewAs?.lastName || '');
    }
  }, [viewAs]);

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
      organizationsData
        ?.filter((org) => org.orgStatus === 'active')
        .map((org) => ({
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

  const handleFirstNameChange = (event) => {
    setFirstName(event.target.value);
  };

  const handleLastNameChange = (event) => {
    setLastName(event.target.value);
  };

  const handleEmployeeCodeChange = (event) => {
    setEmployeeCode(event.target.value);
  };

  const handleOrganizationChange = (event, newValue) => {
    setOrganization(newValue);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (userId) {
      const applicationData = {
        firstName,
        lastName,
        employeeCode,
        orgId: organization.id,
        userId,
      };
      mutate({ applicationData, getAccessTokenSilently });
    } else {
      setShowErrorAlert(true);
    }
  };

  return (
    <>
      {showErrorAlert && (
        <CustomAlert
          type='error'
          message='Application submission failed!'
          onClose={() => setShowErrorAlert(false)}
        />
      )}
      {showSuccessAlert && (
        <CustomAlert
          type='success'
          message='Application submitted successfully!'
          onClose={() => setShowSuccessAlert(false)}
        />
      )}
      <form onSubmit={handleSubmit}>
        <TextField
          required
          label='First Name'
          variant='outlined'
          value={firstName}
          onChange={handleFirstNameChange}
          fullWidth
          margin='normal'
        />
        <TextField
          required
          label='Last Name'
          variant='outlined'
          value={lastName}
          onChange={handleLastNameChange}
          fullWidth
          margin='normal'
        />
        <TextField
          required
          label='Employee Code'
          variant='outlined'
          value={employeeCode}
          onChange={handleEmployeeCodeChange}
          fullWidth
          margin='normal'
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
          sx={{ marginBottom: '16px', marginTop: '16px' }}
        />
        <Button type='submit' variant='contained' color='primary'>
          Submit
        </Button>
      </form>
    </>
  );
};

export default NewApplicationPage;
