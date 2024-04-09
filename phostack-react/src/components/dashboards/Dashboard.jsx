import { Button, Grid, Icon } from "@mui/material";
import {Chart as CharJS} from 'chart.js/auto';
import {Bar, Line} from 'react-chartjs-2';
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchAllOrganizations } from "../../util/organizations";
// import { fetchBehaviorsByOrgId } from "../../util/behavior";
import { fetchPointLogs } from "../../util/logs.points";
import useUser from "../../hooks/useUser";
import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { dashBoardStyle, HorizontalRow } from "./dashStyles";
const Dashboard = () =>{
    var randomColor = () => {
        var r = Math.floor(Math.random() * 255);
        var g = Math.floor(Math.random() * 255);
        var b = Math.floor(Math.random() * 255);
        return "rgb(" + r + "," + g + "," + b + ")";
     };
    const blankData = {labels:[], datasets:[]};
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const { user } = useUser();
    const { getAccessTokenSilently } = useAuth0();
    const viewAs = user?.viewAs;
    const { userId, userType, selectedOrgId: orgId } = viewAs;
    const [points, setPoints] = useState(0);
    const [chartColors, setChartColors] = useState([]);
    const [lineData, setLineData] = useState({labels:[], datasets:[]})
    const [isVisible, setIsVisible] = useState(false)
    const [ATH, setATH] = useState(0)
    const [ATL, setATL] = useState(100000000)
    const [ATHMonth, setATHMonth] = useState(0)
    const [ATLMonth, setATLMonth] = useState(0)
    const btnRef = useState(null)
    const paramId = viewAs.userId
    let params = {orgId, paramId}
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
    var { data = [], isRefetching: PLisRefetching } = useQuery({
        queryKey: ['logs', 'points', { params }],
        queryFn: ({ signal }) =>
          fetchPointLogs({
            params,
            signal,
            getAccessTokenSilently,
          }),
        placeholderData: keepPreviousData,
        // refetchInterval: 3000
    });
    let pointLogs = data.filter((e)=>e.pointGivenTo == viewAs.userId);
    // console.log(pointLogs)
    let monthlyData = Array(12).fill(0)
    //add up all points from that month
    pointLogs.map((e)=>{
        //get month from createdAt, but start from 0
        const month = parseInt(e.createdAt.substring(5, 7)) - 1;
        monthlyData[month] += e.pointValue

    })
    console.log(monthlyData)
    monthlyData.map((e, i)=>{
        if(e > ATH){
            setATH(e)
            setATHMonth(i)
        }
        if(e < ATL){
            setATL(e)
            setATLMonth(i)
        }
    })
    const loadMonthlyData =()=>{
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
        loadMonthlyData();
    }, [orgId, PLisRefetching]);
    return(
    <>
        <div style={HorizontalRow}>
            <div style={dashBoardStyle}>
                <Bar 
                    data={{ 
                        labels: viewAs.organizations.map(e=>e.orgName),
                        datasets: [{label: "Points", data: orgPoints, backgroundColor: chartColors,},],
                    }}/>
            </div> 
            {isVisible && !PLisRefetching &&<div style={dashBoardStyle}>
                <Line data={lineData || blankData}/>
            </div>}
            {PLisRefetching && <div>Loading...</div>}
            <div>
            <div style={dashBoardStyle}>
                All Time High | {monthNames[ATHMonth]}, {ATH} pts
            </div>
            <div style={dashBoardStyle}>
                All Time Low | {monthNames[ATLMonth]}, {ATL} pts
            </div>
        </div>
            <Button ref={btnRef} onClick={()=>{loadMonthlyData(); setIsVisible(!isVisible)}}>Monthly Stats</Button>
        </div>

    </>
    )
}

export default Dashboard;