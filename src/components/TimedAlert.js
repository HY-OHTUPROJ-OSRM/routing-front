import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Alert } from 'react-bootstrap'
import { removeTimedAlert } from '../features/messages/timedAlertSlice';
import './TimedAlert.css'
export default function TimedAlert() {
    const alerts = useSelector(state => state.timedAlert);
    const dispatch = useDispatch();

    useEffect(() => {
        alerts.forEach(alert => {
            //console.log(alert)
            setTimeout(() => dispatch(removeTimedAlert(alert.id)), alert.timeout);
        });
    }, [alerts, dispatch]);

    return (
        <>
            {alerts.map(alert => (
                <div key={alert.id} className={`timed-alert ${alert.variant}`}>
                    {alert.text}
                </div>
            ))}
        </>
    )
}