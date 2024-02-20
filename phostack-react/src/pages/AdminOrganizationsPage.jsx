import { useAuth0 } from '@auth0/auth0-react';
import { useQuery, keepPreviousData, useMutation } from '@tanstack/react-query';
import { fetchOrganizations, changeOrganization } from '../util/organizations';
import AddIcon from '@mui/icons-material/Add';
import { useMemo, useState } from 'react';
import useUser from '../hooks/useUser';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import VerifiedIcon from '@mui/icons-material/Verified';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import { queryClient } from '../util/http';
import CustomAlert from '../components/UI/CustomAlert';

import { Button, Box, Typography, Grid } from '@mui/material';

import { useNavigate } from 'react-router-dom';

import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';

const AdminOrganizationsPage = () => {
  const { getAccessTokenSilently } = useAuth0();
  const { user } = useUser();
  const navigate = useNavigate();
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  const {
    data = [],
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['organizations'],
    queryFn: ({ signal }) =>
      fetchOrganizations({
        signal,
        getAccessTokenSilently,
      }),
    placeholderData: keepPreviousData,
  });

  const { mutate, isPending, isSaveError, saveError, isSuccess } = useMutation({
    mutationFn: changeOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['organizations'],
      });
      setShowSuccessAlert(true);
    },
    onError: (error) => {
      setShowErrorAlert(true);
    },
  });

  const columns = useMemo(
    () => [
      {
        accessorKey: 'orgId',
        header: 'Org Number',
        size: 150,
      },
      {
        accessorKey: 'orgName',
        header: 'Name',
        size: 150,
      },
      {
        accessorKey: 'dollarPerPoint',
        header: 'DollarPerPoint',
        size: 150,
      },
      {
        accessorKey: 'orgStatus',
        header: 'Status',
        size: 150,
      },
      {
        accessorFn: (originalRow) => new Date(originalRow?.createdAt),
        id: 'createdAt',
        header: 'Join Date',
        filterVariant: 'date-range',
        Cell: ({ cell }) => cell.getValue().toLocaleDateString(), 
      },
    ],
    []
  );

  const handleAddNewOrganization = () => {
    navigate('/admin/organizations/new');
  };

  const handleOrgActivate = (row) => {
    const { orgId } = row.original;
    if (orgId) {
      mutate({
        orgId,
        orgData: { orgStatus: 'active' },
        getAccessTokenSilently,
      });
    } else {
      setShowErrorAlert(true);
    }
  };

  const handleOrgDeactivate = (row) => {
    const { orgId } = row.original;
    if (orgId) {
      mutate({
        orgId,
        orgData: { orgStatus: 'inactive' },
        getAccessTokenSilently,
      });
    } else {
      setShowErrorAlert(true);
    }
  };

  const table = useMaterialReactTable({
    columns,
    data,
    paginationDisplayMode: 'pages',
    muiPaginationProps: {
      color: 'primary',
      shape: 'rounded',
      variant: 'outlined',
    },
    initialState: { density: 'compact' },
    enableRowActions: true,
    renderRowActionMenuItems: ({ row }) => [
      <MenuItem
        key='activate'
        onClick={() => handleOrgActivate(row)}
        disabled={row?.original?.orgStatus === 'active'}
      >
        <ListItemIcon>
          <VerifiedIcon fontSize='small' />
        </ListItemIcon>
        <ListItemText>Activate</ListItemText>
      </MenuItem>,
      <MenuItem
        key='deactivate'
        onClick={() => handleOrgDeactivate(row)}
        disabled={row?.original?.orgStatus === 'inactive'}
      >
        <ListItemIcon>
          <DoNotDisturbIcon fontSize='small' />
        </ListItemIcon>
        <ListItemText>Deactivate</ListItemText>
      </MenuItem>,
    ],
  });

  return (
    <>
      {showErrorAlert && (
        <CustomAlert
          type='error'
          message={`Something went wrong!`}
          onClose={() => setShowErrorAlert(false)}
        />
      )}
      {showSuccessAlert && (
        <CustomAlert
          type='success'
          message={`Success!`}
          onClose={() => setShowSuccessAlert(false)}
        />
      )}
      <Box mb={3}>
        <Typography variant='h4' component='h1'>
          Organizations Management
        </Typography>
      </Box>
      <MaterialReactTable table={table} />
      <Grid container justifyContent='flex-end' mt={3}>
        <Button
          variant='contained'
          color='primary'
          onClick={handleAddNewOrganization}
          startIcon={<AddIcon />}
        >
          New Organization
        </Button>
      </Grid>
    </>
  );
};

export default AdminOrganizationsPage;
