import { useAuth0 } from '@auth0/auth0-react';
import { useQuery, keepPreviousData, useMutation } from '@tanstack/react-query';
import { fetchDriversByOrgId } from '../util/users';
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
import VisibilityIcon from '@mui/icons-material/Visibility';

const DriversManagementPage = () => {
  const { getAccessTokenSilently } = useAuth0();
  const { user } = useUser();
  const { viewAs } = user;
  const orgId = viewAs?.selectedOrgId;
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
    queryKey: ['users', 'drivers', { orgId }],
    queryFn: ({ signal }) =>
      fetchDriversByOrgId({
        signal,
        orgId,
        getAccessTokenSilently,
      }),
    placeholderData: keepPreviousData,
  });

  const { mutate, isPending, isSaveError, saveError, isSuccess } = useMutation({
    mutationFn: changeUser,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['users', 'drivers'],
      });
      setShowSuccessAlert(true);
    },
    onError: (error) => {
      setShowErrorAlert(true);
    },
  });

  const { mutate: mutateView } = useMutation({
    mutationFn: changeUser,
    onSuccess: () => {
      queryClient.invalidateQueries();
      navigate('/');
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
        accessorKey: 'userStatus',
        header: 'Status',
        size: 150,
      },
      {
        accessorFn: (originalRow) =>
          originalRow?.organizations?.find((org) => org.orgId == orgId)
            ?.pointValue,
        id: 'points',
        header: 'Total Points',
      },
      {
        accessorFn: (originalRow) => new Date(originalRow?.createdAt),
        id: 'createdAt',
        header: 'Join Date',
        filterVariant: 'date-range',
        Cell: ({ cell }) => cell.getValue().toLocaleDateString(),
      },
    ],
    [orgId]
  );

  const handleAddNewDriver = () => {
    navigate('/drivers/new');
  };

  const handlePoints = (row) => {
    navigate('/drivers-management/' + data[row.index].userId + '/points');
  };

  const handleDriverActivate = (row) => {
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

  const handleDriverDeactivate = (row) => {
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

  const handleViewAs = (row) => {
    const { userId: viewAsUserId } = row.original;
    if (viewAsUserId && user.userId) {
      mutateView({
        userId: user.userId,
        userData: { viewAs: viewAsUserId },
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
      <MenuItem key='points' onClick={() => handlePoints(row)}>
        <ListItemIcon>
          <PlusOneIcon fontSize='small' />
        </ListItemIcon>
        <ListItemText>Manage Points</ListItemText>
      </MenuItem>,
      <MenuItem
        key='activate'
        onClick={() => handleDriverActivate(row)}
        disabled={row?.original?.userStatus === 'active'}
      >
        <ListItemIcon>
          <VerifiedIcon fontSize='small' />
        </ListItemIcon>
        <ListItemText>Activate</ListItemText>
      </MenuItem>,
      <MenuItem
        key='deactivate'
        onClick={() => handleDriverDeactivate(row)}
        disabled={row?.original?.userStatus === 'inactive'}
      >
        <ListItemIcon>
          <DoNotDisturbIcon fontSize='small' />
        </ListItemIcon>
        <ListItemText>Deactivate</ListItemText>
      </MenuItem>,
      <MenuItem
        key='viewAs'
        onClick={() => handleViewAs(row)}
        disabled={row?.original?.userStatus === 'inactive'}
      >
        <ListItemIcon>
          <VisibilityIcon fontSize='small' />
        </ListItemIcon>
        <ListItemText>View As</ListItemText>
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
          Drivers Management
        </Typography>
      </Box>
      <MaterialReactTable table={table} />
      <Grid container justifyContent='flex-end' mt={3}>
        <Button
          variant='contained'
          color='primary'
          onClick={handleAddNewDriver}
          startIcon={<AddIcon />}
        >
          New Driver
        </Button>
      </Grid>
    </>
  );
};

export default DriversManagementPage;
