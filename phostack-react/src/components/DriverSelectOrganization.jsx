import { useAuth0 } from '@auth0/auth0-react';
import useUser from '../hooks/useUser';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { useState } from 'react';
import { queryClient } from '../util/http';
import { useMutation } from '@tanstack/react-query';
import { changeUser } from '../util/users';

const DriverSelectOrganization = () => {
  const { getAccessTokenSilently } = useAuth0();
  const { user } = useUser();
  const { viewAs } = user;

  const orgId = viewAs?.selectedOrgId;
  const userOrganizations = viewAs?.organizations || [];
  const autocompleteOrganizations = userOrganizations.map((org) => ({
    id: org.orgId,
    label: org.orgName,
  }));
  const selectedOrganization = userOrganizations.find(
    (org) => org.orgId == orgId
  );

  const initalOrganization = selectedOrganization
    ? { id: selectedOrganization.orgId, label: selectedOrganization.orgName }
    : null;

  const [organizationSelect, setOrganizationSelect] =
    useState(initalOrganization);

  const { mutate, isPending, isSaveError, saveError } = useMutation({
    mutationFn: changeUser,
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  const handleOrganizationChange = (event, newValue) => {
    setOrganizationSelect(newValue);
    mutate({
      userId: viewAs?.userId,
      userData: { selectedOrgId: newValue.id },
      getAccessTokenSilently,
    });
  };

  return (
    <Autocomplete
      required
      options={autocompleteOrganizations}
      getOptionLabel={(option) => option.label}
      getOptionKey={(option) => option.id}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      value={organizationSelect}
      onChange={handleOrganizationChange}
      renderInput={(params) => (
        <TextField {...params} label='Organization' variant='outlined' sx={{ minWidth: 150 }} />
      )}
    />
  );
};

export default DriverSelectOrganization;
