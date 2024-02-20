import { Grid } from "@mui/material";
import {Chart as CharJS} from 'chart.js/auto';
import {Bar} from 'react-chartjs-2';

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
    return(
    <>
        <h3>Dashboard
            <div style={dashBoardStyle}>
                <Bar
                    data={{
                        labels: ["J", "F", "M"],
                        datasets: [
                            {
                                label: "Points",
                                data: [1, 5, 10],
                            },
                        ],
                    }}
                />
            </div>
        </h3>
        
    </>
    )
}

export default Dashboard;