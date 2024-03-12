import { useAuth0 } from '@auth0/auth0-react';
import { useQuery, keepPreviousData, useMutation } from '@tanstack/react-query';
import { fetchApplicationLogs } from '../util/logs.applications';
import { useMemo, useState } from 'react';
import useUser from '../hooks/useUser';
import CustomAlert from '../components/UI/CustomAlert';

import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { mkConfig, generateCsv, download } from 'export-to-csv';

import { Button, Box, Typography } from '@mui/material';

import { useNavigate } from 'react-router-dom';

import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';

const DriverApplicationsAuditLogsPage = () => {
  const { getAccessTokenSilently } = useAuth0();
  const { user, isLoading: userIsLoading } = useUser();
  const { viewAs = {} } = user;
  const { userId, userType, selectedOrgId: orgId} = viewAs;
  const navigate = useNavigate();
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  let params = {};

  if (userType && userType == 'SponsorUser') {
    params = {
      orgId,
    };
  }

  const {
    data = [],
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['logs', 'applications', { params }],
    queryFn: ({ signal }) =>
      fetchApplicationLogs({
        params,
        signal,
        getAccessTokenSilently,
      }),
  });

  const columns = useMemo(
    () => [
      {
        accessorKey: 'orgName',
        header: 'Organization',
        size: 150,
      },
      {
        accessorKey: 'email',
        header: 'User',
        size: 150,
      },
      {
        accessorKey: 'applicationStatus',
        header: 'status',
        size: 150,
      },
      {
        accessorKey: 'reason',
        header: 'Reason',
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
    const csv = generateCsv(csvConfig)(data);
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
          Driver Application Logs
        </Typography>
      </Box>
      {!userIsLoading && <MaterialReactTable table={table} />}
    </>
  );
};

export default DriverApplicationsAuditLogsPage;
