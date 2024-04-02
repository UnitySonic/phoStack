import { Button, Grid, Icon } from "@mui/material";
import {Chart as CharJS} from 'chart.js/auto';
import {Bar, Line} from 'react-chartjs-2';
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchPointLogs } from "../../util/logs.points";
import { fetchAllOrganizations } from "../../util/organizations";
import useUser from "../../hooks/useUser";
import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { fetchBehaviorsByOrgId } from "../../util/behavior";
const Dashboard = () =>{
    var randomColor = () => {
        var r = Math.floor(Math.random() * 255);
        var g = Math.floor(Math.random() * 255);
        var b = Math.floor(Math.random() * 255);
        return "rgb(" + r + "," + g + "," + b + ")";
     };
    const dashBoardStyle = {
        //dimension
        width: '75%',
        maxWidth: '40%',
        height: '75%',
        maxHeight: '150px',
        //border
        border: '2px solid #000',
        borderRadius: '5px',
        //alignment
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '5px',
        margin: '20px',
    }
    const HorizontalRow = {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    }
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const { user } = useUser();
    const { getAccessTokenSilently } = useAuth0();
    const viewAs = user?.viewAs;
    const { userId, userType, selectedOrgId: orgId } = viewAs;
    const [points, setPoints] = useState(0);
    const [chartColors, setChartColors] = useState([]);
    const [lineData, setLineData] = useState({labels:[], datasets:[]})
    const [isVisible, setIsVisible] = useState(false)
    const btnRef = useState(null)
    let params = {orgId}
    var { data = [] } = useQuery({
        queryKey: ['logs', 'points', { params }],
        queryFn: ({ signal }) =>
          fetchPointLogs({
            params,
            signal,
            getAccessTokenSilently,
          }),
    });
    const driverPoints = data;
    let userOrgs = [];
    let orgPoints = [];
    let colors = [];
    let lowestPoints = 0;
    let highestPoints = 0;
    viewAs.organizations.map(e=>{
        userOrgs.push(<li>{e.orgName}</li>)
        orgPoints.push(e.pointValue)
        colors.push(randomColor())
    })
    useState(()=>{
        setChartColors(colors);
    }, [chartColors])
    var {data = [], refetch: behaviorsRefetch, isRefetching: behaviorsIsRefetching, } = useQuery({
        queryKey: ['behaviors', { orgId }],
        queryFn: ({ signal }) =>
          fetchBehaviorsByOrgId({
            orgId,
            signal,
            getAccessTokenSilently,
          }),
        placeholderData: keepPreviousData,
    });
    const behaviors = data;
    let monthlyData = Array(12).fill(0)
    console.log(behaviors)
    //add up all points from that month
    behaviors.map((e)=>{
        //get month from createdAt, but start from 0
        const month = parseInt(e.createdAt.substring(5, 7)) - 1;
        monthlyData[month] += e.pointValue
    })
    const loadMonthlyData =()=>{
        if(!isVisible)
            return;
        const newLineData =         
        {
            labels: monthNames,
            datasets: [
              { label: "Points", data: monthlyData },
            ],
        }
        setLineData(newLineData)
    }
    useEffect(() => {
        // This effect will run every time myState changes
        loadMonthlyData;
    }, [orgId]);
    return(
    <>
        <div style={HorizontalRow}>
            <div style={dashBoardStyle}>
                <Bar
                    data={{
                        labels: viewAs.organizations.map(e=>e.orgName),
                        datasets: [
                            {
                                label: "Points",
                                data: orgPoints,
                                backgroundColor: chartColors,
                            },
                        ],
                    }}
                />
            </div>
            
            {isVisible && <div style={dashBoardStyle}>
                <Line data={lineData}/>
            </div>}
            {!behaviorsIsRefetching && <Button ref={btnRef} onClick={()=>{loadMonthlyData(); setIsVisible(!isVisible)}}>Monthly Stats</Button>}
        </div>
    </>
    )
}

export default Dashboard;