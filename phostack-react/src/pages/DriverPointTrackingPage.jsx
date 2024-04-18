import { useState, useMemo, useEffect } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Autocomplete,
} from '@mui/material';

import useUser from '../hooks/useUser';
import { useAuth0 } from '@auth0/auth0-react';
import { fetchPointLogs } from '../util/logs.points';
import { fetchPointsReportData } from '../util/reports';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { mkConfig, generateCsv, download } from 'export-to-csv';
import { fetchDrivers, fetchDriversByOrgId } from '../util/users';
import CircularProgress from '@mui/material/CircularProgress';
import RefreshIcon from '@mui/icons-material/Refresh';
import { LineChart } from '@mui/x-charts/LineChart';

import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';

const COLORS = [
  '#4e79a7',
  '#f28e2c',
  '#e15759',
  '#76b7b2',
  '#59a14f',
  '#edc949',
  '#af7aa1',
  '#ff9da7',
  '#9c755f',
  '#bab0ab',
];

const DriverPointTrackingPage = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [driver, setDriver] = useState(null);
  const [limit, setLimit] = useState(100000);
  const { user } = useUser();
  const { viewAs = {} } = user;
  const { userType, selectedOrgId: orgId } = viewAs;

  let queryFunction = ({ signal }) =>
    fetchDrivers({
      signal,
      getAccessTokenSilently,
    });

  let params = {
    pointGivenTo: driver ? driver.id : null,
    startDate: startDate ? dayjs(startDate).format('YYYY-MM-DD') : null,
    endDate: endDate ? dayjs(endDate).format('YYYY-MM-DD') : null,
    limit,
  };

  if (userType && userType == 'SponsorUser') {
    params = {
      pointGivenTo: driver ? driver.id : null,
      orgId,
      startDate: startDate ? dayjs(startDate).format('YYYY-MM-DD') : null,
      endDate: endDate ? dayjs(endDate).format('YYYY-MM-DD') : null,
      limit,
    };
    queryFunction = ({ signal }) =>
      fetchDriversByOrgId({
        signal,
        orgId,
        getAccessTokenSilently,
      });
  }

  const { data: driversData = [] } = useQuery({
    queryKey: ['users', 'drivers'],
    queryFn: queryFunction,
  });

  const drivers = useMemo(() => {
    return (
      driversData?.map((driver) => ({
        id: driver.userId,
        label: `${driver.firstName} ${driver.lastName} | ${driver.email}`,
      })) || []
    );
  }, [driversData]);

  const handleDriverChange = (event, newValue) => {
    setDriver(newValue);
  };

  let reportParams = {
    driver: driver ? driver.id : null,
    startDate: startDate ? dayjs(startDate).format('YYYY-MM-DD') : null,
    endDate: endDate ? dayjs(endDate).format('YYYY-MM-DD') : null,
  };

  if (userType && userType == 'SponsorUser') {
    reportParams = {
      driver: driver ? driver.id : null,
      startDate: startDate ? dayjs(startDate).format('YYYY-MM-DD') : null,
      endDate: endDate ? dayjs(endDate).format('YYYY-MM-DD') : null,
      orgId,
    };
  }

  const {
    data: reportData = {},
    refetch: reportRefetch,
    isFetching: reportIsFetching,
    isFetched: reportIsFetched,
  } = useQuery({
    queryKey: ['points-report'],
    queryFn: ({ signal }) =>
      fetchPointsReportData({
        signal,
        params: reportParams,
        getAccessTokenSilently,
      }),
    enabled: !!driver,
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  useEffect(() => {
    reportRefetch();
  }, [driver, reportRefetch, startDate, endDate]);

  const organizations = reportData?.[driver?.id]?.organizations || {};
  const reportDataGraphs = [];
  for (const orgName in organizations) {
    reportDataGraphs.push({
      id: orgName,
      series: [
        {
          data: organizations[orgName].map((d) => d.pointBalance),
          label: orgName,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        },
      ],
      xLabels: organizations[orgName].map((d) => d.date),
    });
  }

  const {
    data = [],
    refetch,
    isFetching,
    isFetched,
  } = useQuery({
    queryKey: ['logs', 'points', { params }],
    queryFn: ({ signal }) =>
      fetchPointLogs({
        params,
        signal,
        getAccessTokenSilently,
      }),
    placeholderData: keepPreviousData,
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  const newData = useMemo(() => {
    return data.map((d) => {
      if (d.orderId) {
        return {
          driverName: `${d.pointGivenToFirstName} ${d.pointGivenToLastName}`,
          driverEmail: d.pointGivenToEmail,
          pointBalance: d.pointBalance,
          organization: d.orgName,
          pointValue: -d.orderTotal,
          reason: `Order Placed | orderId: ${d.orderId}`,
          date: d.createdAt.slice(0, 19).replace(' ', 'T') + 'Z',
        };
      } else if (d.behaviorId) {
        return {
          driverName: `${d.pointGivenToFirstName} ${d.pointGivenToLastName}`,
          driverEmail: d.pointGivenToEmail,
          pointBalance: d.pointBalance,
          organization: d.orgName,
          pointValue: d.pointValue,
          reason: `${d.behaviorName} : ${d.behaviorDescription}`,
          date: d.createdAt.slice(0, 19).replace(' ', 'T') + 'Z',
        };
      }
    });
  }, [data]);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'organization',
        header: 'Organization',
        size: 150,
      },
      {
        accessorKey: 'driverEmail',
        header: 'Driver Email',
        size: 150,
      },
      {
        accessorKey: 'driverName',
        header: 'Driver Name',
        size: 150,
      },
      {
        accessorKey: 'pointValue',
        header: 'Points Change',
        size: 150,
      },
      {
        accessorKey: 'pointBalance',
        header: 'Total Points',
        size: 150,
      },
      {
        accessorKey: 'reason',
        header: 'Reason',
        size: 150,
      },
      {
        accessorFn: (originalRow) => new Date(originalRow?.date),
        id: 'date',
        header: 'Date',
        filterVariant: 'date-range',
        Cell: ({ cell }) =>
          cell.getValue()
            ? cell.getValue().toISOString().slice(0, 19).replace('T', ' ')
            : '',
      },
    ],
    []
  );

  const csvConfig = mkConfig({
    fieldSeparator: ',',
    decimalSeparator: '.',
    useKeysAsHeaders: true,
  });

  const handleExportRows = (rows) => {
    const rowData = rows.map((row) => row.original);
    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  const handleExportData = () => {
    const csv = generateCsv(csvConfig)(newData);
    download(csvConfig)(csv);
  };

  const handleGenerateButtonClicked = () => {
    refetch();
    reportRefetch();
  };

  const table = useMaterialReactTable({
    columns,
    data: newData,
    enableRowSelection: true,
    paginationDisplayMode: 'pages',
    muiPaginationProps: {
      color: 'primary',
      shape: 'rounded',
      variant: 'outlined',
    },
    initialState: { density: 'compact' },
    renderTopToolbarCustomActions: ({ table }) => (
      <Box
        sx={{
          display: 'flex',
          gap: '16px',
          padding: '8px',
          flexWrap: 'wrap',
        }}
      >
        <Button
          //export all data that is currently in the table (ignore pagination, sorting, filtering, etc.)
          onClick={handleExportData}
          startIcon={<FileDownloadIcon />}
        >
          Export All Data
        </Button>
        <Button
          disabled={table.getPrePaginationRowModel().rows.length === 0}
          //export all rows, including from the next page, (still respects filtering and sorting)
          onClick={() =>
            handleExportRows(table.getPrePaginationRowModel().rows)
          }
          startIcon={<FileDownloadIcon />}
        >
          Export All Rows
        </Button>
        <Button
          disabled={table.getRowModel().rows.length === 0}
          //export all rows as seen on the screen (respects pagination, sorting, filtering, etc.)
          onClick={() => handleExportRows(table.getRowModel().rows)}
          startIcon={<FileDownloadIcon />}
        >
          Export Page Rows
        </Button>
        <Button
          disabled={
            !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
          }
          //only export selected rows
          onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
          startIcon={<FileDownloadIcon />}
        >
          Export Selected Rows
        </Button>
      </Box>
    ),
  });

  return (
    <>
      <Typography variant='h4' component='h1' sx={{ marginBottom: '1rem' }}>
        Driver Point Tracking Report
      </Typography>
      <Autocomplete
        required
        options={drivers}
        getOptionLabel={(option) => option.label}
        getOptionKey={(option) => option.id}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        value={driver}
        onChange={handleDriverChange}
        renderInput={(params) => (
          <TextField {...params} label='Driver' variant='outlined' />
        )}
        sx={{ marginBottom: '1rem', marginTop: '1rem' }}
      />
      <div>
        <DatePicker
          label='Start Date'
          value={startDate}
          onChange={(newValue) => setStartDate(newValue)}
          sx={{ marginBottom: '1rem', marginRight: '1rem' }}
        />
        <DatePicker
          label='End Date'
          value={endDate}
          onChange={(newValue) => setEndDate(newValue)}
          sx={{ marginBottom: '1rem' }}
        />
      </div>
      <TextField
        fullWidth
        label='Limit'
        type='number'
        value={limit}
        onChange={(event) => setLimit(+event.target.value)}
        InputLabelProps={{
          shrink: true,
        }}
        sx={{ marginBottom: '1rem' }}
      />
      <Button
        variant='contained'
        color='primary'
        type='submit'
        sx={{ marginBottom: '2rem', marginRight: '2rem' }}
        onClick={handleGenerateButtonClicked}
        startIcon={<RefreshIcon />}
      >
        Refetch
      </Button>
      {!isFetching && isFetched && <MaterialReactTable table={table} />}
      {isFetching && <CircularProgress />}
      {!reportIsFetching &&
        reportIsFetched &&
        !isFetching &&
        driver &&
        reportDataGraphs.length > 0 &&
        reportDataGraphs.map((graph) => (
          <div key={graph.id}>
            <LineChart
              width={1000}
              height={600}
              series={[...graph.series]}
              xAxis={[{ scaleType: 'point', data: graph.xLabels }]}
            />
          </div>
        ))}
    </>
  );
};

export default DriverPointTrackingPage;
