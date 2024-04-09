import { useState, useEffect, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchAllOrganizations } from "../../util/organizations";
import { fetchDrivers } from "../../util/users";
import { fetchBehaviorsByOrgId } from '../../util/behavior';
import { useNavigate } from "react-router-dom";
import useUser from "../../hooks/useUser";
import { Line, Pie } from "react-chartjs-2";
import {dashBoardStyle, HorizontalRow} from "./dashStyles";
const AdminDashboard = () =>{
    var randomColor = () => {
        var r = Math.floor(Math.random() * 255);
        var g = Math.floor(Math.random() * 255);
        var b = Math.floor(Math.random() * 255);
        return "rgb(" + r + "," + g + "," + b + ")";
     };

    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const blankData = {labels:[], datasets:[]};
    const { getAccessTokenSilently } = useAuth0();
    const { user } = useUser();
    const viewAs = user?.viewAs;
    const navigate = useNavigate();
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showErrorAlert, setShowErrorAlert] = useState(false);
    const [selectedDrivers, setSelectedDrivers] = useState([]);
    const [selectedOrg, setselectedOrg] = useState(1);
    const [pointValues, setPointValues] = useState([]);
    const [pieData, setPieData] = useState(null);
    const [lineData, setLineData] = useState(null);
    const [firstLoad, setFirstLoad] = useState(false);
    var{ data = [], isLoading, isError, error, isRefetching, } = useQuery({
        queryKey: [],
        queryFn: ({ signal }) =>
            fetchAllOrganizations({
                signal,
                getAccessTokenSilently,
            }),
        placeholderData: keepPreviousData,
    });
    const orgs = data
    let colors = [];
    var{data = [], isLoading, isError, error, refetch, isRefetching,} = useQuery({
        queryKey: ['users', 'drivers'],
        queryFn: ({ signal }) =>
          fetchDrivers({
            signal,
            getAccessTokenSilently,
          }),
        placeholderData: keepPreviousData,
      });
    const drivers = data;
    let orgId = selectedOrg
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

    //when clicking on the first list the second list will show every driver with that org
    let allSponsorPoints = 0;
    let pointsPerSponsor = 0;
    let driverNames = [];
    
    function chooseOrg(val){
        if(selectedOrg == val && selectedOrg != 1){
            return;
        }
        setselectedOrg(val);
        let filteredDrivers = drivers.filter((e) => e.selectedOrgId == val);
        filteredDrivers = filteredDrivers.slice(0,5)
        setSelectedDrivers(filteredDrivers)
        
        const newPointValues = filteredDrivers.map((e)=>{
            colors.push(randomColor());
            driverNames.push(String(e.firstName) + " " + String(e.lastName))
            const org = e.organizations.find(i=>i.orgId==val);
            return org ? org.pointValue : 0
        })
        setPointValues(newPointValues)
        let monthlyData = Array(12).fill(0)
        behaviors.map((e)=>{
            //get month from createdAt, but start from 0
            const month = parseInt(e.createdAt.substring(5, 7)) - 1;
            monthlyData[month] += e.pointValue
        })
        const newPieData = {
            labels: driverNames,
            datasets: [
              {
                data: newPointValues, // Values for each slice
                backgroundColor: colors, // Colors for each slice
                hoverBackgroundColor: colors, // Colors on hover
              },
            ],
        }
        const newLineData = {
            labels: monthNames,
            datasets: [
              { label: "Points", data: monthlyData },
            ],
        }

        setPieData(newPieData)
        setLineData(newLineData)
        //set flag to display colors after first selection
        setFirstLoad(true)
    }
    return(
    <>
        <div style={HorizontalRow}>
            <div style={dashBoardStyle}>Sponsors
                {orgs && <ol>
                    {orgs.map(item=>(
                        <li 
                            key={item.orgId} 
                            onClick={()=>{chooseOrg(item.orgId)}}
                            style={{backgroundColor: (selectedOrg == item.orgId) && firstLoad ? 'lightblue' : 'white'}}
                        >
                            {item.orgName}
                        </li>
                    ))}
                </ol>}
            </div>
            <div style={dashBoardStyle}>Top 5 Drivers<Pie data={!behaviorsIsRefetching ? pieData || blankData : blankData}/></div>
            <div style={dashBoardStyle}>Points over time<Line data={!behaviorsIsRefetching ? lineData || blankData : blankData}/></div>
        </div>
    </>
    )
}

export default AdminDashboard;