import { useState, useMemo, useEffect } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  FormControlLabel,
  Checkbox,
  Stack,
  Autocomplete,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
} from '@mui/material';

import { queryClient } from '../util/http';
import { useAuth0 } from '@auth0/auth0-react';
import { fetchSalesReport } from '../util/reports';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchOrganizations } from '../util/organizations';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { mkConfig, generateCsv, download } from 'export-to-csv';
import { fetchDrivers } from '../util/users';
import { useNavigate } from 'react-router-dom';

const valueFormatter = (value) => `$${value}`;

const colors = [
  '#123740',
  '#549aab',
  '#f1802d',
  '#8400ff',
  '#0028ff',
  '#391954',
  '#01084f',
  '#37bd79',
  '#308fac',
  '#f4e604',
  '#a7e237',
  '#e60049',
  '#0bb4ff',
  '#50e991',
  '#e6d800',
  '#9b19f5',
  '#ffa300',
  '#dc0ab4',
  '#b3d4ff',
  '#00bfa0',
];

const chartSetting2 = {
  yAxis: [
    {
      label: '',
    },
  ],
  series: [
    {
      dataKey: 'total',
      label: 'Sales By Driver',
      valueFormatter,
      color: '#8400ff',
    },
  ],
  height: 500,
};

const SalesBySponsorReportPgae = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [organization, setOrganization] = useState(null);
  const [driver, setDriver] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [type, setType] = useState('summary');
  const [salesType, setSalesType] = useState('driver');
  const navigate = useNavigate();

  const params = {
    orderStatus: null,
    startDate: startDate ? dayjs(startDate).format('YYYY-MM-DD') : null,
    endDate: endDate ? dayjs(endDate).format('YYYY-MM-DD') : null,
    orgId: organization ? organization.id : null,
    orderFor: driver ? driver.id : null,
    type: type,
    reportFor: 'driver',
  };

  const {
    data = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['sales-report'],
    queryFn: ({ signal }) =>
      fetchSalesReport({ signal, params, getAccessTokenSilently }),
  });

  useEffect(() => {
    refetch();
  }, [organization, startDate, endDate, type, driver, refetch]);

  const { data: organizationsData = [] } = useQuery({
    queryKey: ['organizations'],
    queryFn: ({ signal }) =>
      fetchOrganizations({ signal, getAccessTokenSilently }),
  });

  const organizations = useMemo(() => {
    return (
      organizationsData?.map((org) => ({
        id: org.orgId,
        label: org.orgName,
      })) || []
    );
  }, [organizationsData]);

  const handleOrganizationChange = (event, newValue) => {
    setOrganization(newValue);
  };

  const { data: driversData = [] } = useQuery({
    queryKey: ['users', 'drivers'],
    queryFn: ({ signal }) =>
      fetchDrivers({
        signal,
        getAccessTokenSilently,
      }),
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

  const handleSalesTypeChange = (event) => {
    if (event.target.value === 'sponsor') {
      navigate('/admin/reporting/sales');
    }
  };

  const csvConfig = mkConfig({
    fieldSeparator: ',',
    decimalSeparator: '.',
    useKeysAsHeaders: true,
  });

  const handleExportData = async (event) => {
    const csv = generateCsv(csvConfig)(data);
    download(csvConfig)(csv);
  };

  return (
    <>
      <Typography variant='h4' component='h1' sx={{ marginBottom: '1rem' }}>
        Sales Report
      </Typography>
      <FormControl fullWidth>
        <InputLabel id='sales-type-label'>Sales Type</InputLabel>
        <Select
          labelId='sales-type-label'
          id='sales-type-select'
          value={salesType}
          label='salesType'
          onChange={handleSalesTypeChange}
        >
          <MenuItem value={'sponsor'}>Sponsor</MenuItem>
          <MenuItem value={'driver'}>Driver</MenuItem>
        </Select>
      </FormControl>
      <Autocomplete
        required
        options={organizations}
        getOptionLabel={(option) => option.label}
        getOptionKey={(option) => option.id}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        value={organization}
        onChange={handleOrganizationChange}
        renderInput={(params) => (
          <TextField {...params} label='Organization' variant='outlined' />
        )}
        sx={{ marginBottom: '1rem', marginTop: '1rem' }}
      />
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
      <>
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
      </>
      <FormControl fullWidth>
        <InputLabel id='report-type-label'>Type</InputLabel>
        <Select
          labelId='report-type-label'
          id='report-type-select'
          value={type}
          label='Type'
          onChange={(event) => setType(event.target.value)}
          sx={{ marginBottom: '1rem' }}
        >
          <MenuItem value={'summary'}>Summary</MenuItem>
          <MenuItem value={'detail'}>Detail</MenuItem>
        </Select>
      </FormControl>

      <Button
        variant='contained'
        color='primary'
        type='submit'
        sx={{ marginBottom: '2rem' }}
        onClick={handleExportData}
        startIcon={<FileDownloadIcon />}
      >
        Export To CSV
      </Button>

      {type === 'detail' &&
        data.length > 0 &&
        data
          .filter((driver) => driver?.data?.length > 0)
          .map((driver) => {
            const chartSetting = {
              yAxis: [
                {
                  label: '',
                },
              ],
              series: [
                {
                  dataKey: 'total',
                  label: 'Sales By Month, Year',
                  valueFormatter,
                  color: colors[Math.floor(Math.random() * colors.length)],
                },
              ],
              height: 500,
            };
            return (
              <div key={driver.userId}>
                <p>
                  {driver.firstName} {driver.lastName} | {driver.email}
                </p>
                <BarChart
                  dataset={driver.data}
                  xAxis={[
                    {
                      scaleType: 'band',
                      dataKey: 'date',
                      tickPlacement: 'middle',
                      tickLabelPlacement: 'middle',
                    },
                  ]}
                  {...chartSetting}
                />
              </div>
            );
          })}

      {type === 'summary' && data.length > 0 && (
        <>
          <BarChart
            dataset={data}
            xAxis={[
              {
                scaleType: 'band',
                dataKey: 'email',
                tickPlacement: 'middle',
                tickLabelPlacement: 'middle',
                tickLabelStyle: {
                  angle: 90,
                  textAnchor: 'start',
                  fontSize: 12,
                },
              },
            ]}
            {...chartSetting2}
          />
        </>
      )}
    </>
  );
};

export default SalesBySponsorReportPgae;
