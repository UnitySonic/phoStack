import { useAuth0 } from '@auth0/auth0-react';
import { useQuery } from '@tanstack/react-query';
import { fetchLoginLogs, fetchLoginLogsForOrg } from '../util/logs.login';
import { useMemo } from 'react';
import useUser from '../hooks/useUser';

import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { mkConfig, generateCsv, download } from 'export-to-csv';

import { Button, Box, Typography } from '@mui/material';

import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';

const TYPE_TO_STRING = {
  s: 'Success Login',
  f: 'Failed Login',
  fp: 'Failed Login',
};

const LoginAuditLogsPage = () => {
  const { getAccessTokenSilently } = useAuth0();
  const { user, isLoading: userIsLoading } = useUser();
  const { userId, userType, orgId} = user || {};

  const params = {
    q: `(type: "s" OR "f" OR "fp")`,
    fields: 'date,type,client_id,user_name,user_id',
    include_fields: true,
  };

  let qKey = ['logs', 'login', { params }];
  let queryFunction = ({ signal }) =>
    fetchLoginLogs({
      params,
      signal,
      getAccessTokenSilently,
    });

  if (userType && userType == 'SponsorUser') {
    qKey = ['logs', 'login', orgId, { params }];
    queryFunction = ({ signal }) =>
      fetchLoginLogsForOrg({
        params,
        orgId,
        signal,
        getAccessTokenSilently,
      });
  }

  const { data = [] } = useQuery({
    queryKey: qKey,
    queryFn: queryFunction,
    enabled: !!user
  });
  console.log(data);

  const columns = useMemo(
    () => [
      {
        accessorFn: (originalRow) => TYPE_TO_STRING[originalRow?.type],
        id: 'type',
        header: 'Type',
        size: 150,
      },
      {
        accessorKey: 'orgName',
        header: 'Organization',
        size: 150,
      },
      {
        accessorKey: 'user_name',
        header: 'User',
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
    const rowData = rows.map((row) => ({
      type: TYPE_TO_STRING[row?.original?.type],
      organization: row?.original?.orgName,
      user: row?.original?.user_name,
      userId: row?.original?.user_id,
      date: row?.original?.date,
    }));
    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  const handleExportData = () => {
    const rowData = data.map((row) => ({
      type: TYPE_TO_STRING[row?.type],
      organization: row?.orgName,
      user: row?.user_name,
      userId: row?.user_id,
      date: row?.date,
    }));
    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  const table = useMaterialReactTable({
    columns,
    data,
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
          Login Logs
        </Typography>
      </Box>
      {!userIsLoading && <MaterialReactTable table={table} />}
    </>
  );
};

export default LoginAuditLogsPage;
