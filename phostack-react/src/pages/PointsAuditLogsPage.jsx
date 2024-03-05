import { useAuth0 } from '@auth0/auth0-react';
import { useQuery } from '@tanstack/react-query';
import { fetchPointLogs } from '../util/logs.points';
import { useMemo } from 'react';
import useUser from '../hooks/useUser';

import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { mkConfig, generateCsv, download } from 'export-to-csv';

import { Button, Box, Typography } from '@mui/material';

import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';

const PointsAuditLogsPage = () => {
  const { getAccessTokenSilently } = useAuth0();
  const { user, isLoading: userIsLoading } = useUser();
  const { userType, orgId } = user || {};

  let params = {};

  if (userType && userType == 'SponsorUser') {
    params = {
      orgId,
    };
  }

  const { data = [] } = useQuery({
    queryKey: ['logs', 'points', { params }],
    queryFn: ({ signal }) =>
      fetchPointLogs({
        params,
        signal,
        getAccessTokenSilently,
      }),
  });

  const newData = useMemo(() => {
    return data.map((d) => {
      if (d.orderId) {
        return {
          organization: d.orgName,
          driver: d.pointGivenToEmail,
          pointValue: d.orderTotal,
          reason: `Order: ${d.orderId}`,
          date: d.createdAt,
        };
      } else if (d.behaviorId) {
        return {
          organization: d.orgName,
          driver: d.pointGivenToEmail,
          pointValue: d.pointValue,
          reason: `${d.behaviorName} : ${d.behaviorDescription}`,
          date: d.createdAt,
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
        accessorKey: 'driver',
        header: 'Driver',
        size: 150,
      },
      {
        accessorKey: 'pointValue',
        header: 'Points',
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
        Cell: ({ cell }) => cell.getValue().toLocaleDateString(),
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
      <Box mb={3}>
        <Typography variant='h4' component='h1'>
          Point Logs
        </Typography>
      </Box>
      {!userIsLoading && <MaterialReactTable table={table} />}
    </>
  );
};

export default PointsAuditLogsPage;
