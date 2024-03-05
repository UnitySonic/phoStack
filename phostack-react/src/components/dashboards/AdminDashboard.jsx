import { Grid } from "@mui/material";
import {Chart as CharJS} from 'chart.js/auto';
import {Bar} from 'react-chartjs-2';
import { useState } from "react";

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
    var timesClicked = 0
    const [showSecondList, setShowSecondList] = useState(false);
    const [clickCount, setClickCount] = useState(timesClicked);

    const countClick = (timesClicked) =>{
        timesClicked++
        setClickCount(timesClicked)
    }

    const clickEvent = (orgId)=>{
        //refresh driver list
        //console.log(orgId)
        setShowSecondList(true);
    }
    return(
    <>
        <div style={HorizontalRow}>
            <div style={dashBoardStyle}>Sponsors
                <ol>
                    <li onClick={()=>clickEvent(1)}>Sponsor 1</li>
                    <li onClick={()=>clickEvent(2)}>Sponsor 2</li>
                    <li onClick={()=>clickEvent(3)}>Sponsor 3</li>
                </ol>
            </div>
            <div style={dashBoardStyle}>
                {showSecondList && (
                    <ul>
                        <li onClick={()=>{countClick(timesClicked)}}> {clickCount} </li>
                    </ul>
                )}
            </div>
        </div>
        
    </>
    )
}

export default AdminDashboard;