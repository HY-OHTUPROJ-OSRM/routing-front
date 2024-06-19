import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Alert, ProgressBar } from 'react-bootstrap';
import { removeTimedAlert } from '../features/messages/timedAlertSlice';
import './TimedAlert.css';
import { status_socket } from '../api/api';

export default function TimedAlert() {
    const alerts = useSelector(state => state.timedAlert);
    const dispatch = useDispatch();
    const [percentage, setPercentage] = useState(0);

    useEffect(() => {
        alerts.forEach(alert => {
            setTimeout(() => dispatch(removeTimedAlert(alert.id)), alert.timeout);
        });
    }, [alerts, dispatch]);

    useEffect(() => {
        
        
        const socket = new EventSource(status_socket);

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.status === 'processing') {
                setPercentage(data.progress.percentage);
            }
        };

        socket.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };

        return () => {
            socket.close();
        };
    }, []);

    return (
        <>
            {alerts.map(alert => (
                <div key={alert.id} className={`timed-alert ${alert.variant}`}>
                    {alert.variant === 'progress' ? (
                        <ProgressBar now={percentage} label={`${percentage}%`} />
                    ) : (
                        <Alert variant={alert.variant}>
                            {alert.text}
                        </Alert>
                    )}
                </div>
            ))}
        </>
    );
}