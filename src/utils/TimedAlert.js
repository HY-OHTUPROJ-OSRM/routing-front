import store from '../reducers/store';
import { triggerTimedAlert, removeTimedAlert } from '../reducers/TimedAlertSlice';

// Dispatch functions for alerting
export const showTimedAlert = (msg) => {
    store.dispatch(triggerTimedAlert(msg));
};

export const clearTimedAlert = (id) => {
    store.dispatch(removeTimedAlert(id));
};
