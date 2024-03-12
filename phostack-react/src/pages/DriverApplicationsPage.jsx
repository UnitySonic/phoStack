import { useAuth0 } from '@auth0/auth0-react';
import { useQuery, keepPreviousData, useMutation } from '@tanstack/react-query';
import { fetchApplications, changeApplication } from '../util/applications';
import CustomAlert from '../components/UI/CustomAlert';
import AddIcon from '@mui/icons-material/Add';
import { useMemo, useState } from 'react';
import { queryClient } from '../util/http';
import useUser from '../hooks/useUser';

import { Button, Box, Typography, Grid, MenuItem } from '@mui/material';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import CancelIcon from '@mui/icons-material/Cancel';

import { useNavigate } from 'react-router-dom';

import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';

const DriverApplicationsPage = () => {
  const { getAccessTokenSilently } = useAuth0();
  const { user } = useUser();
  const { viewAs = {} } = user;
  const { userId } = viewAs;
  const navigate = useNavigate();
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  const queryParams = {
    userId,
  };

  const {
    data: { applications = [] } = {},
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['applications', { queryParams }],
    queryFn: ({ signal }) =>
      fetchApplications({
        signal,
        params: queryParams,
        getAccessTokenSilently,
      }),
    placeholderData: keepPreviousData,
  });

  const { mutate, isPending, isSaveError, saveError, isSuccess } = useMutation({
    mutationFn: changeApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['applications', { queryParams }],
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
        accessorKey: 'applicationId',
        header: 'Application Number',
        size: 150,
      },
      {
        accessorKey: 'employeeCode',
        header: 'Employee Code',
        size: 150,
      },
      {
        accessorKey: 'orgName',
        header: 'Organization',
        size: 150,
      },
      {
        accessorKey: 'applicationStatus',
        header: 'Status',
        size: 150,
      },
      {
        accessorFn: (originalRow) => new Date(originalRow?.createdAt),
        id: 'createdAt',
        header: 'Date',
        filterVariant: 'date-range',
        Cell: ({ cell }) => cell.getValue().toLocaleDateString(),
      },
    ],
    []
  );

  const handleCancel = (row) => {
    const { applicationId } = row.original;
    mutate({
      applicationId,
      applicationData: { applicationStatus: 'canceled' },
      getAccessTokenSilently,
    });
  };

  const handleAdd = () => {
    navigate('/applications/new');
  };

  const table = useMaterialReactTable({
    columns,
    data: applications,
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
        key='cancel'
        onClick={() => handleCancel(row)}
        disabled={row.original.applicationStatus !== 'new'}
      >
        <ListItemIcon>
          <CancelIcon fontSize='small' />
        </ListItemIcon>
        <ListItemText>Cancel</ListItemText>
      </MenuItem>,
    ],
  });

  return (
    <>
      {showErrorAlert && (
        <CustomAlert
          type='error'
          message='Application cancel failed!'
          onClose={() => setShowErrorAlert(false)}
        />
      )}
      {showSuccessAlert && (
        <CustomAlert
          type='success'
          message='Application cancel success!'
          onClose={() => setShowSuccessAlert(false)}
        />
      )}
      <Box mb={3}>
        <Typography variant='h4' component='h1'>
          Applications
        </Typography>
      </Box>
      <MaterialReactTable table={table} />
      <Grid container justifyContent='flex-end' mt={3}>
        <Button
          variant='contained'
          color='primary'
          onClick={handleAdd}
          startIcon={<AddIcon />}
        >
          New Application
        </Button>
      </Grid>
    </>
  );
};

export default DriverApplicationsPage;
