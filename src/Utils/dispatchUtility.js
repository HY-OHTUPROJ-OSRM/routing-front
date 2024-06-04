import store from '../app/store';
import { triggerTimedAlert, removeTimedAlert } from '../features/messages/timedAlertSlice';

export const showTimedAlert = (msg) => {
    store.dispatch(triggerTimedAlert(msg));
};

export const clearTimedAlert = (id) => {
    store.dispatch(removeTimedAlert(id));
};