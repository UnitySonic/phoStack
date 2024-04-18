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
import { fetchSalesReport } from "../../util/reports";

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
    const [selectedOrg, setselectedOrg] = useState(0);
    const [pointValues, setPointValues] = useState([]);
    const [pieData, setPieData] = useState(null);
    const [lineData, setLineData] = useState(null);
    const [firstLoad, setFirstLoad] = useState(false);
    const{ data: orgs} = useQuery({
        queryKey: [],
        queryFn: ({ signal }) =>
            fetchAllOrganizations({
                signal,
                getAccessTokenSilently,
            }),
        placeholderData: keepPreviousData,
    });
    let colors = [];
    //get drivers
    const {data: drivers, isLoading: driversIsLoading, 
        isError, error, 
        refetch: driversRefetch, isRefetching: driversIsRefetching,} = useQuery({
        queryKey: ['users', 'drivers'],
        queryFn: ({ signal }) =>
          fetchDrivers({
            signal,
            getAccessTokenSilently,
          }),
        placeholderData: keepPreviousData,
      });
    //get reports based on orgid
    let orgId = selectedOrg
    const {data: behaviors, isLoading: reportsIsLoading, 
        refetch: reportsRefetch, isRefetching: reportsIsRefetching, } = useQuery({
        queryKey: ['sales-report'],
        queryFn: ({ signal }) =>
        fetchSalesReport({
            signal,
            params: {
              orgId: orgId,
              type: 'detail',
              reportFor: 'driver'
            },
            getAccessTokenSilently,
          }),
        placeholderData: keepPreviousData
    });
    //when clicking on the first list the second list will show every driver with that org
    let allSponsorPoints = 0;
    let pointsPerSponsor = 0;
    let driverNames = [];
    
    function chooseOrg(val){
        setselectedOrg(val);
        reportsRefetch()
        driversRefetch()
    }
    //update based on driver and report data
    useEffect(()=>{
        if(driversIsLoading || reportsIsLoading){return}
        let filteredDrivers = drivers?.filter((e) => e.selectedOrgId == selectedOrg);
        filteredDrivers = filteredDrivers?.slice(0,5)
        setSelectedDrivers(filteredDrivers)
        const newPointValues = filteredDrivers?.map((e)=>{
            colors.push(randomColor());
            driverNames.push(String(e.firstName) + " " + String(e.lastName))
            const org = e.organizations.find(i=>i.orgId==selectedOrg);
            return org ? org.pointValue : 0
        })
        setPointValues(newPointValues)
        //place earnings into monthly buckets
        let monthlyData = Array(12).fill(0);
        behaviors?.map((e)=>{
            const monthDict = []
            e.data?.map(d=>{
              const month = monthNames.indexOf(d.date.substring(0, 3))
              if(monthDict.includes(month))
                return
              monthlyData[month] = Math.round(d.total)
              monthDict.push(month)
            })
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
    }, [behaviors, orgs, selectedOrg])
    return(
    <>
        {(!reportsIsRefetching && !driversIsRefetching) && <><div style={HorizontalRow}>
            <div style={dashBoardStyle}>Sponsors
                {orgs && <ol>
                    {orgs?.map(item=>(
                        <li 
                            key={item.orgId} 
                            onClick={()=>{
                                orgId = item.orgId
                                chooseOrg(item.orgId);
                                
                            }}
                            style={{backgroundColor: (selectedOrg == item.orgId) ? 'lightblue' : 'white'}}
                        >
                            {item.orgName}
                        </li>
                    ))}
                </ol>}
            </div>
            <div style={dashBoardStyle}>Top 5 Drivers (Points)<Pie data={pieData? pieData : blankData}/></div>
            <div style={dashBoardStyle}>Earnings ($)<Line data={lineData ? lineData : blankData}/></div>
        </div></>}
        {(driversIsRefetching || reportsIsRefetching) && <div style={{fontSize: 24}}>Loading...</div>} 
    </>
    )
}

export default AdminDashboard;