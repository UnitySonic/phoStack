import { useAuth0 } from '@auth0/auth0-react';
import { useQuery, keepPreviousData, useMutation} from '@tanstack/react-query';
import AddIcon from '@mui/icons-material/Add';
import { useMemo, useState} from 'react';
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
import { fetchBehaviors, fetchBehaviorsByOrgId } from '../util/behavior';

const BehaviorsPage = () => {
    const { getAccessTokenSilently } = useAuth0();
    const { user } = useUser();
    const orgId = user?.orgId;
    const userType = user?.userType;
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
      queryKey: ['behaviors', { orgId }],
      queryFn: ({ signal }) =>
      fetchBehaviorsByOrgId({
        orgId,
        signal,
        getAccessTokenSilently,
      }),
      placeholderData: keepPreviousData,
    });

    const columns = useMemo(
      () => [
        {
          accessorKey: 'behaviorName',
          header: 'Name',
          size: 125,
        },
        {
          accessorKey: 'pointValue',
          header: 'Points',
          size: 50,
        },
        {
          accessorKey: 'behaviorStatus',
          header: 'Status',
          size: 100,
        },
        // TODO: FIX SPACING IN TABLE TO HANDLE OVERFLOW
        {
          accessorKey: 'behaviorDescription',
          header: 'Description'        
        },
        {
          accessorFn: (originalRow) => new Date(originalRow?.createdAt),
          id: 'createdAt',
          header: 'Created',
          filterVariant: 'date-range',
          Cell: ({ cell }) => cell.getValue().toLocaleDateString(),
        },
      ],
      []
    );
  
    const handleAddNewBehavior = () => {
      navigate('/behaviors/new');
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
            Behaviors
          </Typography>
        </Box>
        <MaterialReactTable table={table} />
        {userType === 'SponsorUser' && (
          <Grid container justifyContent='flex-end' mt={3}>
            <Button
              variant='contained'
              color='primary'
              onClick={handleAddNewBehavior}
              startIcon={<AddIcon />}
            >
              New Behavior
            </Button>
          </Grid>
        )}
      </>
    );
}
export default BehaviorsPage;