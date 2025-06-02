import { ins } from '../api/api';
import { routeTransformer, routeGiver, routeInfoExtractor } from './RouteTransformer';
import { showTimedAlert, clearTimedAlert, UpdateRouteInfoUtil } from '../Utils/dispatchUtility';
import handleAxiosError from './handleAxiosError';
//fetch route from backend
const getRoute = async (coords, profile) => {
  console.log("getRoute → coords:", coords, "profile:", profile);
  let proper=routeGiver(coords);
  const alertId = `loading-${Date.now()}`;
  try {
    showTimedAlert({ text: 'Loading route...', variant: 'info', id: alertId });
    const response = await ins({
      url: `route/v1/driving/${proper}?overview=false&alternatives=true&steps=true&geometries=geojson`,
      method: "get",
      headers: { "content-type": "application/json" },
    });
    setTimeout(() => clearTimedAlert(alertId), 300);
    console.log(response.data);
    const proper_route=routeTransformer(response.data);
    UpdateRouteInfoUtil(routeInfoExtractor(response.data));
    return proper_route;
  } catch (error) {
    
    setTimeout(() => clearTimedAlert(alertId), 300);
    handleAxiosError(error);
    return [];
  }
  };



  export {getRoute};