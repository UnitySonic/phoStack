import { useAuth0 } from '@auth0/auth0-react';
import { useQuery, keepPreviousData, useMutation } from '@tanstack/react-query';
import { fetchAdmins } from '../util/users';
import AddIcon from '@mui/icons-material/Add';
import { useMemo, useState } from 'react';
import useUser from '../hooks/useUser';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import PlusOneIcon from '@mui/icons-material/PlusOne';
import VerifiedIcon from '@mui/icons-material/Verified';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import { queryClient } from '../util/http';
import { changeUser } from '../util/users';
import CustomAlert from '../components/UI/CustomAlert';

import { Button, Box, Typography, Grid } from '@mui/material';

import { useNavigate } from 'react-router-dom';

import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';

const AdminManagementPage = () => {
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
    queryKey: ['users', 'admins'],
    queryFn: ({ signal }) =>
      fetchAdmins({
        signal,
        getAccessTokenSilently,
      }),
    placeholderData: keepPreviousData,
  });

  const { mutate, isPending, isSaveError, saveError, isSuccess } = useMutation({
    mutationFn: changeUser,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['users', 'admins'],
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
        accessorKey: 'email',
        header: 'Email',
        size: 150,
      },
      {
        accessorFn: (originalRow) =>
          `${originalRow.firstName} ${originalRow.lastName}`,
        id: 'name',
        header: 'Name',
      },
      {
        accessorKey: 'userStatus',
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

  const handleAddNewAdmin = () => {
    navigate('/admin/admins/new');
  };

  const handleAdminActivate = (row) => {
    const { userId } = row.original;
    if (userId) {
      mutate({
        userId,
        userData: { userStatus: 'active' },
        getAccessTokenSilently,
      });
    } else {
      setShowErrorAlert(true);
    }
  };

  const handleAdminDeactivate = (row) => {
    const { userId } = row.original;
    if (userId) {
      mutate({
        userId,
        userData: { userStatus: 'inactive' },
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
        onClick={() => handleAdminActivate(row)}
        disabled={row?.original?.userStatus === 'active'}
      >
        <ListItemIcon>
          <VerifiedIcon fontSize='small' />
        </ListItemIcon>
        <ListItemText>Activate</ListItemText>
      </MenuItem>,
      <MenuItem
        key='deactivate'
        onClick={() => handleAdminDeactivate(row)}
        disabled={row?.original?.userStatus === 'inactive'}
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
          Admins Management
        </Typography>
      </Box>
      <MaterialReactTable table={table} />
      <Grid container justifyContent='flex-end' mt={3}>
        <Button
          variant='contained'
          color='primary'
          onClick={handleAddNewAdmin}
          startIcon={<AddIcon />}
        >
          New Admin
        </Button>
      </Grid>
    </>
  );
};

export default AdminManagementPage;
