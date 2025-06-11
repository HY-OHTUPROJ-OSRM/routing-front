import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Alert, ProgressBar } from 'react-bootstrap';
import { removeTimedAlert } from '../features/messages/timedAlertSlice';
import '../comp_styles.scss';
import { ROUTING_API_URL } from '../Utils/config';
import { showTimedAlert, clearTimedAlert } from '../Utils/dispatchUtility';
import { fetchPolygons } from '../features/polygons/polygonsSlice';
import { fetchRouteLine } from '../features/routes/routeSlice';
import { refreshTileLayer } from '../features/map/tileLayerSlice';

// A component that displays alerts for a certain amount of time. Displays also a progress bar on editmode saving, which is dynamically updated from backend url /status
const TimedAlert = () => {
    const alerts = useSelector(state => state.timedAlert);
    const dispatch = useDispatch();
    const [percentage, setPercentage] = useState(0);
    const [estimate, setEstimate] = useState(0);
    const [alertId, setAlertId] = useState(0);

    // Removes alerts after a certain amount of time
    useEffect(() => {
        alerts.forEach(alert => {
            setTimeout(() => dispatch(removeTimedAlert(alert.id)), alert.timeout);
        });
    }, [alerts, dispatch]);
    // Fetches the progress from backend url /status
    useEffect(() => {
        const socket = new EventSource(`${ROUTING_API_URL}/status`);

        socket.onmessage = (event) => {
            console.log('WebSocket message received:', event.data)
            const data = JSON.parse(event.data);
            //console.log(data)
            if (data.status === 'processing') {
                if (data.progress.percentage===0 && data.status==="processing"){
                    setAlertId(`loading-${Date.now()}`);
                    showTimedAlert({ text: 'Updating roads...', variant: 'info', id: 1, progress: true });
                }
                setPercentage(data.progress.percentage);
                if (data.progress.estimate!==undefined){
                    //console.log(data.progress.estimate)
                    setEstimate(formatTime(Math.max((new Date(data.progress.estimate).getTime() - Date.now())/1000, 0)));
                }
                //console.log(new Date(data.progress.estimate).getTime(), Date.now())
            
            } else {
                clearTimedAlert(1)
                dispatch(refreshTileLayer())
        }
        };

        socket.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };

        return () => {
            socket.close();
        };
    }, []);

    const formatTime = (seconds) => {
        if (seconds > 60) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = Math.floor(seconds % 60);
            return `${minutes}m ${remainingSeconds}s`;
        } else {
            return `${Math.floor(seconds)} seconds`;
        }
    };


    return (
        <>
        {alerts.map(alert => (
            <div key={alert.id} className={`timed-alert ${alert.variant}`}>
                    <Alert variant={alert.variant} style={{width: "100%"}}>
                        {alert.text}
                        {alert.progress && <ProgressBar key={percentage} animated now={percentage} label={`${percentage}%`} />}
                        {alert.progress && estimate!==0 && <p>Estimated time left: {estimate}</p>}
                    </Alert>
            </div>
        ))}
    </>
);
}

export default TimedAlert;
