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
  scp: 'Success Change Password',
  fcp: 'Failed Change Password',
  fcpr: 'Failed Change Password Request',
  fcph: 'Failed Post Change Password Hook',
};

const PasswordAuditLogsPage = () => {
  const { getAccessTokenSilently } = useAuth0();
  const { user, isLoading: userIsLoading } = useUser();
  const { viewAs = {} } = user;
  const { userId, userType, selectedOrgId: orgId } = viewAs;

  let params = {
    q: `(type: "scp" OR "fcp" OR "fcpr" OR "fcph")`,
    fields: 'date,type,client_id,user_name,user_id',
    include_fields: true,
  };

  let qKey = ['logs', 'password', { params }];
  let queryFunction = ({ signal }) =>
    fetchLoginLogs({
      params,
      signal,
      getAccessTokenSilently,
    });

  if (userType && userType == 'SponsorUser') {
    qKey = ['logs', 'password', orgId, { params }];
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
    enabled: !!user,
  });

  console.log(data)

  const columns = useMemo(
    () => [
      {
        accessorFn: (originalRow) => TYPE_TO_STRING[originalRow?.type],
        id: 'type',
        header: 'Type',
        size: 150,
      },
      {
        accessorFn: (originalRow) =>
          originalRow?.organizations?.map((org) => org.orgName).join(', '),
        id: 'organizations',
        header: 'Organizations',
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
      organizations: row?.original?.organizations
        ?.map((org) => org.orgName)
        .join(', '),
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
      organizations: row?.organizations?.map((org) => org.orgName).join(', '),
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
          Password Change Logs
        </Typography>
      </Box>
      {!userIsLoading && <MaterialReactTable table={table} />}
    </>
  );
};

export default PasswordAuditLogsPage;
