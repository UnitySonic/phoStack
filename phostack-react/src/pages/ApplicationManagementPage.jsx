import { useAuth0 } from '@auth0/auth0-react';
import { useQuery, keepPreviousData, useMutation } from '@tanstack/react-query';
import { fetchApplications, changeApplication } from '../util/applications';
import CustomAlert from '../components/UI/CustomAlert';
import { useMemo, useState } from 'react';
import { queryClient } from '../util/http';
import { Button, Box, Typography } from '@mui/material';
import useUser from '../hooks/useUser';
import ReasonConfirmModal from '../components/UI/ReasonConfirmModal';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';

const ApplicationManagementPage = () => {
  const { getAccessTokenSilently } = useAuth0();
  const { user } = useUser();
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [actionType, setActionType] = useState('');
  const [openModal, setOpenModal] = useState(false);

  const queryParams = {
    orgId: user?.orgId,
  };

  const {
    data: { applications = [], total } = {},
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
        accessorKey: 'firstName',
        header: 'First Name',
        size: 150,
      },
      {
        accessorKey: 'lastName',
        header: 'Last Name',
        size: 150,
      },
      {
        accessorKey: 'employeeCode',
        header: 'Employee Code',
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

  const handleAction = (action, row) => {
    setSelectedRow(row);
    setActionType(action);
    setOpenModal(true);
  };

  const handleConfirmAction = async (reason) => {
    mutate({
      applicationId: selectedRow?.original?.applicationId,
      applicationData: { applicationStatus: actionType, reason },
      getAccessTokenSilently,
    });
    setOpenModal(false);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedRow(null);
    setActionType('');
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
        key='approve'
        onClick={() => handleAction('approved', row)}
        disabled={row?.original?.applicationStatus !== 'new'}
      >
        <ListItemIcon>
          <CheckCircleIcon fontSize='small' />
        </ListItemIcon>
        <ListItemText>Approve</ListItemText>
      </MenuItem>,
      <MenuItem
        key='rejected'
        onClick={() => handleAction('rejected', row)}
        disabled={row?.original?.applicationStatus !== 'new'}
      >
        <ListItemIcon>
          <CancelIcon fontSize='small' />
        </ListItemIcon>
        <ListItemText>Reject</ListItemText>
      </MenuItem>,
    ],
  });

  return (
    <>
      {showErrorAlert && (
        <CustomAlert
          type='error'
          message={`Application ${actionType} failed!`}
          onClose={() => setShowErrorAlert(false)}
        />
      )}
      {showSuccessAlert && (
        <CustomAlert
          type='success'
          message={`Application ${actionType} success`}
          onClose={() => setShowSuccessAlert(false)}
        />
      )}
      <Box mb={3}>
        <Typography variant='h4' component='h1'>
          Applications
        </Typography>
      </Box>
      <MaterialReactTable table={table} />
      <ReasonConfirmModal
        open={openModal}
        handleClose={handleCloseModal}
        handleConfirm={handleConfirmAction}
      />
    </>
  );
};

export default ApplicationManagementPage;
