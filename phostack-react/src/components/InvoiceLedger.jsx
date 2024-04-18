import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { useAuth0 } from '@auth0/auth0-react';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { mkConfig, generateCsv, download } from 'export-to-csv';

import { fetchOrders } from '../util/orders';

import { useQuery, keepPreviousData, useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Button, Box, Typography } from '@mui/material';
import Masonry from '@mui/lab/Masonry';
import { fetchInvoice } from '../util/invoice';


export default function InvoiceLedger({params}) {
  const MAX_ITEM_TITLE_LENGTH = 20;
  const MAX_ORDER_NAME = 10;
  const COMMISION_PERCENTAGE = 0.01;

  const [grandOrgSalesTotal, setGrandOrgSalesTotal] = useState(0);
  const [orderTotals, setOrderTotals] = useState({});


    const { getAccessTokenSilently } = useAuth0();


    // Gets the per driver sales totals and commision
    const getDriverTotals = (orders) => {
      let driverOrderTotals = orders.reduce((acc, order) => {
        acc[order.orderFor.firstName + " " + order.orderFor.lastName] = 
          (acc[order.orderFor.firstName + " " + order.orderFor.lastName] || 0) +
          (order.orderTotal * (order.dollarPerPoint || 0.01));
        return acc;
      }, {});
      setOrderTotals(driverOrderTotals);
    };

    // Gets the grand sales totals and commision for an organization
    const getSalesTotals = (orders) => 
    {
        let orgTotalSales = 0;

        orders.forEach((order) => {
          orgTotalSales += (order.orderTotal * (order.dollarPerPoint || 0.01));
        });
    
        setGrandOrgSalesTotal(orgTotalSales);
    };
  
    const { data: { orders = [], total } = {} } = useQuery({
      queryKey: ['orders', { params }],
      queryFn: ({ signal }) =>
        fetchInvoice({
          signal,
          params: params,
          getAccessTokenSilently,
        }),

      placeholderData: keepPreviousData,
    });

    useEffect(() => {
      getSalesTotals(orders);
      getDriverTotals(orders);
    }, [orders]);

    const csvConfig = mkConfig({
      fieldSeparator: ',',
      decimalSeparator: '.',
      useKeysAsHeaders: true,
    });

    const handleExportData = () => {
      const rowData = orders.map((row) => ({
        ID: row?.orderId,
        orderDate: row?.createdAt,
        user: row?.orderFor.firstName + " " + row?.orderFor.lastName,
        total: (row?.orderTotal * row.dollarPerPoint || 0.01).toFixed(2),
        commision: ((row?.orderTotal * row.dollarPerPoint || 0.01) * COMMISION_PERCENTAGE).toFixed(2),
      }));


      Object.entries(orderTotals).forEach(([driverName, driverTotal]) => {
        rowData.push({ ID: "Driver", orderDate: "", user: driverName, total: driverTotal.toFixed(2), commision: (driverTotal * COMMISION_PERCENTAGE).toFixed(2) });
      });

      rowData.push({ID: "Organization", orderDate: "", user: orders[0]?.organization.orgName || "NULL ORG", total: grandOrgSalesTotal, commision: (grandOrgSalesTotal * COMMISION_PERCENTAGE).toFixed(2) })
      const csv = generateCsv(csvConfig)(rowData);
      download(csvConfig)(csv);
    };

    return (
      <>
      {orders[0] && (
        <>
          <div>
          </div>
          <Button
          variant='contained'
          color='primary'
          type='submit'
          sx={{ marginTop: '3rem' }}
          onClick={handleExportData}
          startIcon={<FileDownloadIcon />}
        >
          Export To CSV
        </Button>
          <Masonry
            columns={6}
            spacing={0}
            className="masonry-grid"
            columnClassName="masonry-column"
          >
            <div className="invoice-title" style={{textAlign: "center",  border: '1px dashed #000', backgroundColor: 'pink' }}>
              <p>ID</p>
            </div>
            <div className="invoice-title" style={{ textAlign: "center", border: '1px dashed #000', backgroundColor: 'pink' }}>
              <p>Order Date</p>
            </div>
            <div className="invoice-title" style={{ textAlign: "center", border: '1px dashed #000', backgroundColor: 'pink' }}>
              <p>Order By</p>
            </div>
            <div className="invoice-title" style={{ textAlign: "center", border: '1px dashed #000', backgroundColor: 'pink' }}>
              <p>Quantity</p>
            </div>
            <div className="invoice-title" style={{ textAlign: "center", border: '1px dashed #000', backgroundColor: 'pink' }}>
              <p>Total</p>
            </div>
            <div className="invoice-title" style={{ textAlign: "center", border: '1px dashed #000', backgroundColor: 'pink' }}>
              <p>Commision ({COMMISION_PERCENTAGE*100}%)</p>
            </div>
            {orders.map((order) => (
              <>
                {order.items.map((orderItem) => (
                  <>
                    {/* Render attributes for each invoice item */}
                    <div className="invoice-item" style={{ textAlign: "center", borderRight: '1px solid #000', backgroundColor: 'white' }}>
                      <p>{orderItem.itemId.slice(3, MAX_ITEM_TITLE_LENGTH)}</p>
                    </div>
                    <div className="invoice-item" style={{ textAlign: "center", borderRight: '1px solid #000', backgroundColor: 'white' }}>
                      <p>&nbsp;</p>
                    </div>
                    <div className="invoice-item" style={{ textAlign: "center", borderRight: '1px solid #000', backgroundColor: 'white' }}>
                      <p>{order.orderFor.firstName.slice(0, MAX_ORDER_NAME)} {order.orderFor.lastName.slice(0, MAX_ORDER_NAME)}</p>
                    </div>
                    <div className="invoice-item" style={{ textAlign: "center", borderRight: '1px solid #000', backgroundColor: 'white' }}>
                      <p>{orderItem.quantity}</p>
                    </div>
                    <div className="invoice-item" style={{ textAlign: "center", borderRight: '1px solid #000', backgroundColor: 'white' }}>
                      <p>&nbsp;</p>
                    </div>
                    <div className="invoice-item" style={{ textAlign: "center", borderRight: '1px solid #000', backgroundColor: 'white' }}>
                      <p>&nbsp;</p>
                    </div>
                  </>
                ))}
                <div className="invoice-item" style={{ textAlign: "center", borderRight: '1px solid #000', borderLeft: '1px solide #000', backgroundColor: 'lightblue' }}>
                  <p>{order.orderId}</p>
                </div>
                <div className="invoice-item" style={{ textAlign: "center", borderRight: '1px solid #000', backgroundColor: 'lightblue'}}>
                  <p>{order.createdAt}</p>
                </div>
                <div className="invoice-item" style={{ textAlign: "center", borderRight: '1px solid #000', backgroundColor: 'lightblue'}}>
                  <p>{order.orderFor.firstName.slice(0, MAX_ORDER_NAME)} {order.orderFor.lastName.slice(0, MAX_ORDER_NAME)}</p>
                </div>
                <div className="invoice-item" style={{ textAlign: "center", borderRight: '1px solid #000', backgroundColor: 'lightblue'}}>
                  <p>&nbsp;</p>
                </div>
                <div className="invoice-item" style={{ textAlign: "center", borderRight: '1px solid #000', backgroundColor: 'lightblue'}}>
                  <p>${(order.orderTotal * (order.dollarPerPoint || 0.01)).toFixed(2)}</p>
                </div>
                <div className="invoice-item" style={{ textAlign: "center", borderRight: '1px solid #000', backgroundColor: 'lightblue'}}>
                  <p>${((order.orderTotal * (order.dollarPerPoint || 0.01)) * COMMISION_PERCENTAGE).toFixed(2)}</p>
                </div>
              </>
            ))}
          </Masonry>
          <Masonry             
            columns={4}
            spacing={0}
            className="masonry-grid-total"
            columnClassName="masonry-column-total"
          >
            <div className="total-title" style={{textAlign: "center",  border: '1px dashed #000', backgroundColor: 'white' }}>
              <p>&nbsp;</p>
            </div>
            <div className="total-title" style={{textAlign: "center",  border: '1px dashed #000', backgroundColor: 'pink' }}>
              <p>Driver</p>
            </div>
            <div className="total-title" style={{ textAlign: "center", border: '1px dashed #000', backgroundColor: 'pink' }}>
              <p>Total Sales</p>
            </div>
            <div className="total-title" style={{ textAlign: "center", border: '1px dashed #000', backgroundColor: 'pink' }}>
              <p>Commision ({COMMISION_PERCENTAGE*100}%)</p>
            </div>

          {Object.entries(orderTotals).map(([name, total]) => (
            <React.Fragment key={name}>
              <div className="driver-entry" style={{textAlign: "center",  border: '1px dashed #000', backgroundColor: 'white' }}>
                <p>&nbsp;</p>
              </div>
              <div className="driver-entry" style={{textAlign: "center",  border: '1px dashed #000', backgroundColor: 'white' }}>
                <p>{name.slice(0, MAX_ORDER_NAME)}:</p>
              </div>
              <div className="driver-entry" style={{textAlign: "center",  border: '1px dashed #000', backgroundColor: 'white' }}>
                <p>${total.toFixed(2)}</p>
              </div>
              <div className="driver-entry" style={{textAlign: "center",  border: '1px dashed #000', backgroundColor: 'white' }}>
                <p>${(total * COMMISION_PERCENTAGE).toFixed(2)}</p>
              </div>
            </React.Fragment>
          ))}
          </Masonry>
          <Masonry             
            columns={4}
            spacing={0}
            className="masonry-grid-total"
            columnClassName="masonry-column-total"
          >
            {/* HEADERS */}
            <div className="total-title" style={{textAlign: "center",  border: '1px dashed #000', backgroundColor: 'white' }}>
              <p>&nbsp;</p>
            </div>
            <div className="total-title" style={{textAlign: "center",  border: '1px dashed #000', backgroundColor: 'pink' }}>
              <p>Organization</p>
            </div>
            <div className="total-title" style={{ textAlign: "center", border: '1px dashed #000', backgroundColor: 'pink' }}>
              <p>Grand Total Sales</p>
            </div>
            <div className="total-title" style={{ textAlign: "center", border: '1px dashed #000', backgroundColor: 'pink' }}>
              <p>Grand Commision ({COMMISION_PERCENTAGE*100}%)</p>
            </div>

            {/* VALUES */}
            <div className="total-title" style={{textAlign: "center",  border: '1px dashed #000', backgroundColor: 'white' }}>
              <p>&nbsp;</p>
            </div>
            <div className="total-title" style={{textAlign: "center",  border: '1px dashed #000', backgroundColor: 'white' }}>
              <p>{orders[0]?.organization.orgName || "NULL ORG"}</p>
            </div>
            <div className="total-title" style={{ textAlign: "center", border: '1px dashed #000', backgroundColor: 'white' }}>
              <p>${grandOrgSalesTotal.toFixed(2)}</p>
            </div>
            <div className="total-title" style={{ textAlign: "center", border: '1px dashed #000', backgroundColor: 'white' }}>
              <p>${(grandOrgSalesTotal * COMMISION_PERCENTAGE).toFixed(2)}</p>
            </div>
          </Masonry>
        </>)}
      </>
    );

}
