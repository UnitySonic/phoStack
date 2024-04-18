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
import { useNavigate } from "react-router-dom";
import InvoiceLedger from '../components/InvoiceLedger';
import AddIcon from '@mui/icons-material/Add';



function InvoicePage() {
    const { getAccessTokenSilently } = useAuth0();
    const [invoiceType, setInvoiceType] = useState('');
    const [isIndividualType, setIsIndividualType] = useState(false);
    const [organization, setOrganization] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [getInvoice, setGetInvoice] = useState(false);
    const [params, setParams] = useState({});

    // Get all organizations
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

    const handleInvoiceTypeChange = (event) => {
        setInvoiceType(event.target.value);
        setGetInvoice(false);
        event.target.value === "individual" ? setIsIndividualType(true) : setIsIndividualType(false);
    }

    const handleGenerateInvoice = (event) => {
        setGetInvoice(true);
        if(isIndividualType)
        {
            setParams({
                orgId: organization.id,
                startDate: startDate ? dayjs(startDate).format('YYYY-MM-DD') : null,
                endDate: endDate ? dayjs(endDate).format('YYYY-MM-DD') : null,
                orderStatus: "completed",
              });
        }
        else
        {
            setParams({
                orgId: null,
                startDate: startDate ? dayjs(startDate).format('YYYY-MM-DD') : null,
                endDate: endDate ? dayjs(endDate).format('YYYY-MM-DD') : null,
                orderStatus: "completed",
              });
        }
    }

    return(
        <>
            <Typography variant='h4' component='h1' sx={{ marginBottom: '1rem' }}>
                Invoice Report
            </Typography>
            <FormControl fullWidth>
                <InputLabel id='sales-type-label'>Invoice Type</InputLabel>
                <Select
                labelId='sales-type-label'
                id='sales-type-select'
                value={invoiceType}
                label='invoiceType'
                onChange={handleInvoiceTypeChange}
                >
                <MenuItem value={'all'}>All Sponsors</MenuItem>
                <MenuItem value={'individual'}>Individual Sponsor</MenuItem>
                </Select>
            </FormControl>
            {invoiceType && isIndividualType && <Autocomplete
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
            />}
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
            {invoiceType && startDate && endDate && <Button
                variant='contained'
                color='primary'
                onClick={handleGenerateInvoice}
                startIcon={<AddIcon />}
            >
                Generate Invoice
            </Button>}
            <>            
                {getInvoice && params.orgId != null && <InvoiceLedger
                    params={params}
                />}
                                
                {getInvoice && params.orgId === null && organizationsData.map((org) => {
                    const orgParams = {
                        ...params, // Copy existing params
                        orgId: org.orgId // Modify orgId with the current organization's orgId
                    };
                    return (
                        <InvoiceLedger
                            key={org.orgId} // Ensure unique key for each rendered InvoiceLedger
                            params={orgParams} // Pass modified parameters to InvoiceLedger
                        />
                    );
                })}
            </>
        </>
    );

}
export default InvoicePage;