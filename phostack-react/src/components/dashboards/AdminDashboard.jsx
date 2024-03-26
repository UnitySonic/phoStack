import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchAllOrganizations } from "../../util/organizations";
import { fetchDrivers } from "../../util/users";
import { useNavigate } from "react-router-dom";
import useUser from "../../hooks/useUser";

const AdminDashboard = () =>{
    const dashBoardStyle = {
        //dimension
        width: '75%',
        maxWidth: '200px',
        height: 'auto',
        //border
        border: '2px solid #000',
        borderRadius: '5px',
        //alignment
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
    }
    const HorizontalRow = {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'left',
    }
    const { getAccessTokenSilently } = useAuth0();
    const { user } = useUser();
    const viewAs = user?.viewAs;
    const navigate = useNavigate();
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showErrorAlert, setShowErrorAlert] = useState(false);
    const [selectedDrivers, setSelectedDrivers] = useState([]);
    const [currentDriver, setCurrentDriver] = useState(null);
    const [selectedOrg, setselectedOrg] = useState(-1);
    const [pointVal, setPointVal] = useState(0);
    //idk how to use two queries together but if it works it works
    var{
        data = [],
        isLoading,
        isError,
        error,
        isRefetching,
      } = useQuery({
        queryKey: [],
        queryFn: ({ signal }) =>
            fetchAllOrganizations({
                signal,
                getAccessTokenSilently,
            }),
        placeholderData: keepPreviousData,
    });
    const orgs = data
    var{
        data = [],
        isLoading,
        isError,
        error,
        refetch,
        isRefetching,
      } = useQuery({
        queryKey: ['users', 'drivers'],
        queryFn: ({ signal }) =>
          fetchDrivers({
            signal,
            getAccessTokenSilently,
          }),
        placeholderData: keepPreviousData,
      });
    const drivers = data;
    //when clicking on the first list the second list will show every driver with that org
    function chooseOrg(val){
        setselectedOrg(val);
        setSelectedDrivers(drivers.filter((e, i) => e.selectedOrgId == val))
    }
    const getSelectedDriver = async () => {
        const userOrganizations = viewAs?.organizations || [];
        const selectedOrganization = userOrganizations.find(org => org.orgId == selectedOrg);
        const userPointValue = selectedOrganization?.pointValue;
        setPointVal(userPointValue || 0);
    };

    useEffect(() => {
        // Function to fetch point value when a driver is selected
        getSelectedDriver();
    }, [currentDriver]);

    return(
    <>
        <div style={HorizontalRow}>
            <div style={dashBoardStyle}>Sponsors
                <ol>
                    {orgs.map(item=>(
                        <li 
                            key={item.orgId} 
                            onClick={()=>{chooseOrg(item.orgId)}}
                            style={{backgroundColor: selectedOrg == item.orgId ? 'lightblue' : 'white'}}
                        >
                            {item.orgName}
                        </li>
                    ))}
                </ol>
            </div>
            <div style={dashBoardStyle}>
                <ul>
                    {selectedDrivers.map((e, index)=>(
                        <li
                            onClick={()=>{setCurrentDriver(selectedDrivers[index]); getSelectedDriver()}}
                            style={{backgroundColor: ((currentDriver != null) && currentDriver.userId == e.userId) ? 'lightblue' : 'white'}}
                        >
                            {e.firstName + " " + e.lastName}
                        </li>
                    ))}
                </ul>
            </div>
            <div style={dashBoardStyle}>
                {(currentDriver != null) &&
                <ul>
                    <li>{currentDriver.firstName + " " + currentDriver.lastName}</li>
                    <li>Points: {pointVal}</li>
                </ul>}
            </div>
        </div>
        <div style={HorizontalRow}>
            <div style={dashBoardStyle}>
                <h3>Total sponsors: {orgs.length}</h3>
                <h3>Total drivers: {drivers.length}</h3>
            </div>
            <div style={dashBoardStyle}>
                <h3>{"selected drivers: " + selectedDrivers.length}</h3>
            </div>
        </div>

    </>
    )
}

export default AdminDashboard;