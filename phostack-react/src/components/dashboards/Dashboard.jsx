import { Grid } from "@mui/material";
import {Chart as CharJS} from 'chart.js/auto';
import {Bar} from 'react-chartjs-2';
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchPointLogs } from "../../util/logs.points";
import { fetchAllOrganizations } from "../../util/organizations";
import useUser from "../../hooks/useUser";
import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const Dashboard = () =>{
    const dashBoardStyle = {
        //dimension
        width: '75%',
        maxWidth: '200px',
        height: '100px',
        //border
        border: '2px solid #000',
        borderRadius: '5px',
        //alignment
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
    }
    const { user } = useUser();
    const { getAccessTokenSilently } = useAuth0();
    const viewAs = user?.viewAs;
    const { userId, userType, selectedOrgId: orgId } = viewAs;
    const [points, setPoints] = useState(0)
    let params = {orgId}
    const { data = [] } = useQuery({
        queryKey: ['logs', 'points', { params }],
        queryFn: ({ signal }) =>
          fetchPointLogs({
            params,
            signal,
            getAccessTokenSilently,
          }),
    });
    const d = data;
    console.log(orgId)
    console.log(d)

    return(
    <>
        <div style={dashBoardStyle}>
            <Bar
                data={{
                    labels: ["J", "F", "M"],
                    datasets: [
                        {
                            label: "Points",
                            data: [1,2,3,4,5],
                        },
                    ],
                }}
            />
        </div>
    </>
    )
}

export default Dashboard;