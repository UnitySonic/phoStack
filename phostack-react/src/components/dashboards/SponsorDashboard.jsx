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
const SponsorDashboard = ()  =>{
    const dashBoardStyle = {
        //dimension
        width: '200px',
        maxWidth: '500px',
        height: 'auto',
        margin: '2px',
        //border
        border: '2px solid',
        borderRadius: '5px',
        //alignment
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
    }
    const HorizontalRow = {
        display: 'flex',
        flexDirection: 'row', // default is row, but you can explicitly set it
        justifyContent: 'space-between',
    }
    const { getAccessTokenSilently } = useAuth0();
    const {user} = useUser();
    const viewAs = user?.viewAs;
    const orgId = viewAs?.selectedOrgId;
    const navigate = useNavigate();
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showErrorAlert, setShowErrorAlert] = useState(false);
    const [drivers, setDrivers] = useState(false)
    const {
      data = [],
      isLoading,
      isError,
      error,
      refetch,
      isRefetching,
    } = useQuery({
      queryKey: ['users', 'drivers', {orgId} ],
      queryFn: ({signal}) =>
        fetchDriversByOrgId({
          signal,
          orgId,
          getAccessTokenSilently,
        }),
        placeholderData: keepPreviousData
    });
    console.log(data);
    let points = [];
    let driverList = [];
    let names = [];
    let colors = [];
    let drivers_arr = data
    var randomColor = () => {
      var r = Math.floor(Math.random() * 255);
      var g = Math.floor(Math.random() * 255);
      var b = Math.floor(Math.random() * 255);
      return "rgb(" + r + "," + g + "," + b + ")";
   };
    drivers_arr.slice(0, 5).map((e, index)=>(
      names.push(e.firstName + " " + e.lastName),
      points.push(e.organizations.find(o => o.orgId == orgId).pointValue),
      driverList.push(
        <li key={index}>{e.firstName + " " + e.lastName}</li>
      ),
      colors.push(randomColor())
    ));
    
    console.log(points)
    const chartData = {
        labels: ['January', 'February', 'March', 'April', 'May'],
        datasets: [
          {
            label: 'Earnings',
            data: points,
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            fill: false,
          },
        ],
    }
    const chartOptions = {
        height: '500px',
        scales: {
            y: {
                ticks:{
                    stepSize: 1000,
                    min: 0,
                    max: 100_000
                },
                beginAtZero: true
            },
        },
    };
    const pieData = {
        labels: names,
        datasets: [
          {
            data: points, // Values for each slice
            backgroundColor: colors, // Colors for each slice
            hoverBackgroundColor: colors, // Colors on hover
          },
        ],
    }
    return(
    <>
      {/* display data when finished loading */}
      {isLoading && <div>Loading data...</div>}
      {!isLoading && (
        <div style={HorizontalRow}>
            <div style = {dashBoardStyle}>
                Top Drivers
                <ol>
                  {driverList}
                </ol>
            </div>
            <div style={{ border: '2px solid black', borderRadius: '2px', padding: '10px' }}>
                Points
                <Pie data = {pieData}/>
            </div>
            <div style={{ border: '2px solid black', borderRadius: '2px', padding: '10px' }}>
                Earnings
                <Line data={chartData} options={chartOptions}/>
            </div>
        </div>
      )}
    </>
  );
};

export default SponsorDashboard;
