import { useDispatch } from 'react-redux';
import { triggerTimedAlert } from '../features/messages/timedAlertSlice';

function SomeComponent() {
    const dispatch = useDispatch();

    const showAlert = () => {
        dispatch(triggerTimedAlert({ text: 'This is a timed alert', variant: 'success' }));
    };

    return (
        <div style={{marginTop: "100%", margin: "100%"}}>
        <button onClick={showAlert} style={{marginTop: "100%", margin: "100%"}}>Show Timed Alert</button>
        </div>
    );
}
export default SomeComponent;