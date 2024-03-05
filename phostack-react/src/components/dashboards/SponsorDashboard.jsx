import { Grid, ListItemSecondaryAction } from "@mui/material";
import {Chart as CharJS} from 'chart.js/auto';
import {Bar, Chart, Pie} from 'react-chartjs-2';
import { useQuery, keepPreviousData, useMutation} from '@tanstack/react-query';
import { Line } from 'react-chartjs-2'
import useUser from '../../hooks/useUser'

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
    const {user} = useUser();
    const orgId = '1' //idk what orgs we have
    //console.log(orgId)
    const {
        data = [],
        isLoading,
        isError,
        error,
        refetch,
        isRefetching,
    } = useQuery({
        queryKey: ['users', 'drivers', { orgId }],
        queryFn: ({ signal }) =>
        fetchDriversByOrgId({
            signal,
            orgId,
            getAccessTokenSilently,
        }),
        placeholderData: keepPreviousData,
    });
    const chartData = {
        labels: ['January', 'February', 'March', 'April', 'May'],
        datasets: [
          {
            label: 'Earnings',
            data: [2000, 2500, 1800, 3000, 2800],
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
                    stepSize: 500,
                    min: 0,
                    max: 3500,
                },
                beginAtZero: true
            },
        },
    };
    const pieData = {
        labels: ['Driver 1', 'Driver 2', 'Driver 3'],
        datasets: [
          {
            data: [30, 50, 20], // Values for each slice
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'], // Colors for each slice
            hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'], // Colors on hover
          },
        ],
    }
    return(
    <>
        <div style={HorizontalRow}>
            <div style = {dashBoardStyle}>
                Drivers
                <ol>
                    {/* {data.map((item, index)=>(
                    <li key={index}>{item}</li>))} */}
                    <li>Driver1</li>
                    <li>Driver2</li>
                    <li>Driver3</li>
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
    </>
    )
}

export default SponsorDashboard;