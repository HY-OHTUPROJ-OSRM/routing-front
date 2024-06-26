import store from '../app/store';
import { triggerTimedAlert, removeTimedAlert } from '../features/messages/timedAlertSlice';
import { fetchRouteLine, UpdateRouteInfo } from '../features/routes/routeSlice';
import { fetchPolygons } from '../features/polygons/polygonsSlice';
import { changeListView } from '../features/view/ViewSlice';

//simple utilities for dispatching actions outside of react components
export const showTimedAlert = (msg) => {
    store.dispatch(triggerTimedAlert(msg));
};

export const clearTimedAlert = (id) => {
    store.dispatch(removeTimedAlert(id));
};

export const updateRoute = () => {
    store.dispatch(fetchRouteLine());
};

export const RefetchPolygons = () => {
    store.dispatch(fetchPolygons());
};

export const UpdateRouteInfoUtil = (info) => {
    store.dispatch(UpdateRouteInfo(info));
}

export const UpdateListHighlight = () => {
    store.dispatch(changeListView(null));
}