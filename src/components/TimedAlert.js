import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Alert, ProgressBar } from 'react-bootstrap';
import { removeTimedAlert } from '../features/messages/timedAlertSlice';
import './TimedAlert.css';
import { ROUTING_API_URL } from '../Utils/config';
// A component that displays alerts for a certain amount of time. Displays also a progress bar on editmode saving, which is dynamically updated from backend url /status
export default function TimedAlert() {
    const alerts = useSelector(state => state.timedAlert);
    const dispatch = useDispatch();
    const [percentage, setPercentage] = useState(0);
    const [estimate, setEstimate] = useState(Date.now());
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
            if (data.status === 'processing') {
                setPercentage(data.progress.percentage);
                setEstimate(formatTime(Math.max((new Date(data.progress.estimate).getTime() - Date.now())/1000, 0)));
                console.log(new Date(data.progress.estimate).getTime(), Date.now())
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
                        {alert.progress && <p>Estimated time left: {estimate}</p>}
                    </Alert>
            </div>
        ))}
    </>
);
}