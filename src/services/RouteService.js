import { ins } from '../api/api';
import { routeTransformer, routeGiver } from '../utils/RouteTransformer';
import { showTimedAlert, clearTimedAlert } from '../utils/TimedAlert';
import handleAxiosError from './handleAxiosError';

//fetch route from backend
const getRoute = async (coords, profile) => {
    console.log('getRoute -> coords:', coords, 'profile:', profile);
    const proper = routeGiver(coords);
    const alertId = `loading-${Date.now()}`;
    try {
        showTimedAlert({ text: 'Loading route...', variant: 'info', id: alertId });
        const exclude = profile.apiKey ? `&exclude=${profile.apiKey}` : '';
        const response = await ins({
            url: `route/v1/driving/${proper}?overview=false&alternatives=true&steps=true&geometries=geojson${exclude}`,
            method: 'get',
            headers: { 'content-type': 'application/json' },
        });
        setTimeout(() => clearTimedAlert(alertId), 300);
        console.log(response.data);
        const proper_route = routeTransformer(response.data);
        return proper_route;
    } catch (error) {
        setTimeout(() => clearTimedAlert(alertId), 300);
        handleAxiosError(error);
        return [];
    }
};

export { getRoute };
