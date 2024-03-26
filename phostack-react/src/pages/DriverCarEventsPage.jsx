import { useAuth0 } from '@auth0/auth0-react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchCarEvents } from '../util/car-events';
import { useMemo } from 'react';
import useUser from '../hooks/useUser';
import { Box, Typography } from '@mui/material';
import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';

const DriverCarEventsPage = () => {
  const { getAccessTokenSilently } = useAuth0();
  const { user } = useUser();
  const { viewAs } = user;

  const params = {
    userId: viewAs?.userId,
  };

  const { data = [] } = useQuery({
    queryKey: ['car-events', { params }],
    queryFn: ({ signal }) =>
      fetchCarEvents({
        signal,
        params,
        getAccessTokenSilently,
      }),
    placeholderData: keepPreviousData,
    refetchInterval: 5000,
  });

  const columns = useMemo(
    () => [
      {
        accessorKey: 'carEventId',
        header: 'eventId',
        size: 150,
      },
      {
        accessorKey: 'carEventUserId',
        header: 'userId',
        size: 150,
      },
      {
        accessorKey: 'carEventSpeed',
        header: 'Speed',
        size: 150,
      },
      {
        accessorKey: 'carEventSpeedLimit',
        header: 'speedLimit',
        size: 150,
      },
      {
        accessorFn: (originalRow) => new Date(originalRow?.carEventCreatedAt),
        id: 'createdAt',
        header: 'Date',
        filterVariant: 'date-range',
        Cell: ({ cell }) => cell.getValue().toLocaleDateString(),
      },
    ],
    []
  );

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
  });

  return (
    <>
      <Box mb={3}>
        <Typography variant='h4' component='h1'>
          Car Events
        </Typography>
      </Box>
      <MaterialReactTable table={table} />
    </>
  );
};

export default DriverCarEventsPage;
