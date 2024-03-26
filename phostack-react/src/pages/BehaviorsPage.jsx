import { useAuth0 } from '@auth0/auth0-react';
import { useQuery, keepPreviousData, useMutation} from '@tanstack/react-query';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
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
import { changeBehavior, fetchBehaviorsByOrgId, fetchActiveBehaviorsByOrgId } from '../util/behavior';

const BehaviorsPage = () => {
    const { getAccessTokenSilently } = useAuth0();
    const { user } = useUser();
    const viewAsUser = user?.viewAs;
    const orgId = viewAsUser?.selectedOrgId;
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
      {
        if(viewAsUser?.userType === "SponsorUser")
        {
          return fetchBehaviorsByOrgId({
            orgId,
            signal,
            getAccessTokenSilently,
          });
        }
        else if(viewAsUser?.userType === "DriverUser")
        {
          return fetchActiveBehaviorsByOrgId({
            orgId,
            signal,
            getAccessTokenSilently,
          });
        }
      },
      placeholderData: keepPreviousData,
    });

    // Mutate
    const { mutate, isPending, isSaveError, saveError, isSuccess } = useMutation({
      mutationFn: changeBehavior,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['behaviors'],
        });
        setShowSuccessAlert(true);
      },
      onError: (error) => {
        setShowErrorAlert(true);
      }
    });

    const columns = useMemo(
      () => {
        const defaultColumns = [
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
        ];
        // If viewAsUser is a sponsor, include behaviorStatus in columns
        if (viewAsUser?.userType === "SponsorUser") {
          defaultColumns.push({
            accessorKey: 'behaviorStatus',
            header: 'Status',
            size: 100,
          });
        }

        return defaultColumns;
      },
      [viewAsUser?.userType]
    );
  
    const handleAddNewBehavior = () => {
      navigate('/behaviors/new');
    };
  
    const handleBehaviorActivate = (row) => {
      const { behaviorId } = row.original;
      if (behaviorId) {
        mutate({
          behaviorId,
          behaviorData: { behaviorStatus: 'active' },
          getAccessTokenSilently,
        });
      } else {
        setShowErrorAlert(true);
      }
    };
  
    const handleBehaviorDeactivate = (row) => {
      const { behaviorId } = row.original;
      if (behaviorId) {
        mutate({
          behaviorId,
          behaviorData: { behaviorStatus: 'inactive' },
          getAccessTokenSilently,
        });
      } else {
        setShowErrorAlert(true);
      }
    };

    const handleBehaviorEdit = (row) => {
      const { behaviorId, behaviorName, behaviorDescription, pointValue, behaviorStatus  } = row.original;

      // Pass existing behavior information
      navigate('/behaviors/' + behaviorId + '/edit', { state: { behaviorName, behaviorDescription, pointValue, behaviorStatus }});
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
      // Show behavior options if viewAsUser is of type sponsor
      enableRowActions: viewAsUser?.userType==="SponsorUser" ? true : false,
      renderRowActionMenuItems: ({ row }) => [
        <MenuItem
          key='activate'
          onClick={() => handleBehaviorActivate(row)}
          disabled={row?.original?.userStatus === 'active'}
        >
          <ListItemIcon>
            <VerifiedIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText>Activate</ListItemText>
        </MenuItem>,
        <MenuItem
          key='deactivate'
          onClick={() => handleBehaviorDeactivate(row)}
          disabled={row?.original?.userStatus === 'inactive'}
        >
          <ListItemIcon>
            <DoNotDisturbIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText>Deactivate</ListItemText>
        </MenuItem>,
        <MenuItem
        key='edit'
        onClick={() => handleBehaviorEdit(row)}
      >
        <ListItemIcon>
          <EditIcon fontSize='small' />
        </ListItemIcon>
        <ListItemText>Edit</ListItemText>
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
        {viewAsUser?.userType === 'SponsorUser' && (
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