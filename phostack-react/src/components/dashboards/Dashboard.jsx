import { Button, Grid, Icon } from '@mui/material';
import { Chart as CharJS } from 'chart.js/auto';
import { Bar, Line } from 'react-chartjs-2';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchAllOrganizations } from '../../util/organizations';
import { fetchPointLogs } from '../../util/logs.points';
import useUser from '../../hooks/useUser';
import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { fetchSalesReport } from '../../util/reports';
import DriverSelectOrganization from '../DriverSelectOrganization';
import { dashBoardStyle, HorizontalRow } from './dashStyles';
const Dashboard = () => {
  var randomColor = () => {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  };
  const blankData = { labels: [], datasets: [] };
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const { user } = useUser();
  const { getAccessTokenSilently } = useAuth0();
  const viewAs = user?.viewAs;
  const { userId, userType, selectedOrgId: orgId } = viewAs;
  const [points, setPoints] = useState(0);
  const [chartColors, setChartColors] = useState([]);
  const [lineData, setLineData] = useState({ labels: [], datasets: [] });
  const [isVisible, setIsVisible] = useState(false);
  const [monthlyLow, setMonthlyLow] = useState(0);
  const [monthlyHigh, setMonthlyHigh] = useState(100000000);
  const btnRef = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [lowestMonth, setLowestMonth] = useState('Jan');
  const [highestMonth, setHighestMonth] = useState('Jan');
  let tempOrgId = viewAs?.orgId;
  let userOrgs = [];
  let orgPoints = [];
  let colors = [];
  viewAs.organizations?.map((e) => {
    userOrgs.push(<li>{e.orgName}</li>);
    orgPoints.push(e.pointValue);
    colors.push(randomColor());
  });
  useState(() => {
    setChartColors(colors);
  }, [chartColors]);

  const {
    data: reportData,
    isLoading: repIsLoading,
    isError: repIsError,
    isRefetching: repIsRefetching,
    refetch: reportRefetch
  } = useQuery({
    queryKey: ['sales-report'],
    queryFn: ({ signal }) =>
      fetchSalesReport({ 
        signal,
        params:{
          orderStatus: null,
          startDate: '2024-01-01',
          endDate: new Date().toISOString().slice(0, 10),
          orgId: viewAs.selectedOrgId,
          orderFor: viewAs.userId ? viewAs.userId : null,
          type: 'detail',
          reportFor: 'driver',
        }, 
      getAccessTokenSilently }),
  });
  let monthlyData = Array(12).fill(0);

  //add up all points from that month
  if (!(repIsLoading || repIsRefetching)) {
    if(reportData.length != 0){
      reportData?.[0].data?.map((e) => {
        //get month from createdAt, but start from 0
        let deconvert = viewAs?.organizations.find(
          (e) => e.orgId == viewAs?.selectedOrgId
        ).dollarPerPoint;
        //prevent divide by 0
        if(deconvert == NaN || deconvert == 0){deconvert = 0.01}
        const month = monthNames.indexOf(e.date.substring(0, 3));
        monthlyData[month] = Math.round(e.total / deconvert);
      });
    }
  }
  const loadMonthlyData = () => {
    const newLineData = {
      labels: monthNames,
      datasets: [{ label: 'Points', data: monthlyData }],
    };
    let max = Math.max(...monthlyData);
    let min = Math.min(...monthlyData);
    setMonthlyHigh(max);
    setMonthlyLow(min);
    setLineData(newLineData);
    setLowestMonth(monthNames[monthlyData.indexOf(min)]);
    setHighestMonth(monthNames[monthlyData.indexOf(max)]);
  };
  useEffect(() => {
    reportRefetch();
    setPoints(orgPoints);
    loadMonthlyData();
  }, [viewAs.selectedOrgId, reportData]);
  return (
    <>
      <div style={{ marginBottom: '1rem' }}>
        <DriverSelectOrganization />
      </div>
      <div style={HorizontalRow}>
        <div style={dashBoardStyle}>
          <Bar
            data={{
              labels: viewAs.organizations?.map((e) => e.orgName),
              datasets: [
                {
                  label: 'Points',
                  data: points ? points : blankData,
                  backgroundColor: chartColors,
                },
              ],
            }}
          />
        </div>
        {isVisible && (
          <div style={dashBoardStyle}>
            <Line data={lineData ? lineData : blankData} />
            <div>
              Monthly High | {highestMonth}, {monthlyHigh} pts
            </div>
            <div>
              Monthly Low | {lowestMonth}, {monthlyLow} pts
            </div>
          </div>
        )}
        <Button
          ref={btnRef}
          onClick={() => {
            loadMonthlyData();
            setIsVisible(!isVisible);
          }}
        >
          Monthly Stats
        </Button>
      </div>
      <div></div>
    </>
  );
};

export default Dashboard;
