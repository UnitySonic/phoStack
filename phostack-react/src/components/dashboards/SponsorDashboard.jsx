import { Grid, ListItemSecondaryAction } from '@mui/material';
import { Chart as CharJS } from 'chart.js/auto';
import { Bar, Chart, Pie } from 'react-chartjs-2';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Line } from 'react-chartjs-2';
import useUser from '../../hooks/useUser';
import { fetchDriversByOrgId } from '../../util/users';
import { useEffect, useMemo, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { dashBoardStyle, HorizontalRow } from './dashStyles';
import { fetchPointLogs } from '../../util/logs.points';
import { fetchSalesReport } from '../../util/reports';
const SponsorDashboard = ()  =>{
  const { getAccessTokenSilently } = useAuth0();
  const {user} = useUser();
  const viewAs = user?.viewAs;
  const orgId = viewAs?.selectedOrgId;
  const navigate = useNavigate();
  const blankData = {labels:[], datasets:[]};
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  // const [drivers, setDrivers] = useState(false)
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  var randomColor = () => {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    return "rgb(" + r + "," + g + "," + b + ")";
  };
  //get people making most points
  const {
    data: drivers, isLoading: PDisLoading,
  } = useQuery({
    queryKey: ['users', 'drivers', {orgId} ],
    queryFn: ({signal}) =>
      fetchDriversByOrgId({
        signal,
        orgId,
        getAccessTokenSilently,
      }),
  });
  let points = [];
  let driverList = [];
  let names = [];
  let colors = [];
  if(!PDisLoading){
    drivers?.slice(0, 5)?.map((e, index)=>(
      names.push(e.firstName + " " + e.lastName),
      points.push(e.organizations.find(o => o.orgId == orgId).pointValue),
      driverList.push(<li key={index}>{e.firstName + " " + e.lastName}</li>),
      colors.push(randomColor())
    ));
  }
  //get people making money
  //query to get monthly data
  const { 
    data: reportMonthlyData, 
    isLoading: MDisLoading 
  } = useQuery({
    queryKey: ['sales-report'],
    queryFn: ({ signal }) =>
      fetchSalesReport({
        signal,
        params: {
          orgId: viewAs.selectedOrgId,
          type: 'detail',
          reportFor: 'driver'
        },
        getAccessTokenSilently,
      }),
      placeholderData: keepPreviousData,
  });
  //parse monthly data
  let reportNames = []
  let contribData = []
  let monthlyData = Array(12).fill(0)
  let totalPoints = 0;
  let totalEarnings = 0;
  if(!MDisLoading){
    reportMonthlyData?.slice(0, 5).map((e)=>{
      totalPoints = 0;
      reportNames.push(e.firstName + " " + e.lastName)
      const monthDict = []
      e.data?.map(d=>{
        const month = monthNames.indexOf(d.date.substring(0, 3))
        if(monthDict.includes(month))
          return
        totalPoints += d.total
        totalEarnings += d.total
        monthlyData[month] = Math.round(d.total)
        monthDict.push(month)
      })
      contribData.push(totalPoints)
    })
    contribData = contribData.slice(0,5)
  }
  //earnings line data
  const chartData = {
    labels: monthNames,
    datasets: [
      {
        label: 'Earnings',
        data: monthlyData,
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        fill: false,
      },
    ],
  }
  //pie chart data
  const pointChartData = {
    labels: names,
    datasets: [
      {
        data: points, // Values for each slice
        backgroundColor: colors, // Colors for each slice
        hoverBackgroundColor: colors, // Colors on hover
      },
    ],
  }
  //contribution data
  const salesChartData = {
    labels: reportNames,
    datasets: [
      {
        label: 'Contribution ($)',
        data: contribData, // Values for each slice
      },
    ],
}
    return(
    <>
      {PDisLoading && <div>Loading data...</div>}
      {!PDisLoading && (
        <>
        <div style={HorizontalRow}>
            <div style = {dashBoardStyle}>
                Top 5 Drivers
                <ol>
                  {driverList}
                </ol>
                {!PDisLoading && <div>Contribution (in $)<Bar data = {salesChartData ? salesChartData : blankData}/></div>}
            </div>
            <div style={{ border: '2px solid black', borderRadius: '2px', padding: '10px' }}>
                Points
                <Pie data = {pointChartData ? pointChartData : blankData}/>
                <div style={HorizontalRow}>
        </div>
        </div>
          <div style={{ border: '2px solid black', borderRadius: '2px', padding: '10px' }}>
              Earnings ($)
              <Line data={chartData ? chartData : blankData}/>
              <div style={dashBoardStyle}>
                <div style={HorizontalRow}>Total Earnings: ${totalEarnings}</div>
              </div>
          </div>
        </div>

        </>
      )}
    </>
  );
};

export default SponsorDashboard;
