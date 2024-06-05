import store from '../app/store';
import { triggerTimedAlert, removeTimedAlert } from '../features/messages/timedAlertSlice';
import { fetchRouteLine } from '../features/routes/routeSlice';
export const showTimedAlert = (msg) => {
    store.dispatch(triggerTimedAlert(msg));
};

export const clearTimedAlert = (id) => {
    store.dispatch(removeTimedAlert(id));
};

export const updateRoute = () => {
    store.dispatch(fetchRouteLine());
};