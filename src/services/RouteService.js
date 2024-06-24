import { ins } from '../api/api';
import { routeTransformer, routeGiver, fetchroute, routeFlip, routeInfoExtractor } from './RouteTransformer';
import { showTimedAlert, clearTimedAlert, UpdateRouteInfoUtil } from '../Utils/dispatchUtility';
import handleAxiosError from './handleAxiosError';
const getRoute = async (coords) => {
    let proper=routeGiver(coords);
    //console.log(proper,"cords",coords);
    const alertId = `loading-${Date.now()}`;
    try {
      showTimedAlert({ text: 'Loading route...', variant: 'info', id: alertId });
      const response = await ins({
        url: `route/v1/driving/${proper}?overview=false&alternatives=true&steps=true&geometries=geojson`,
        method: "get",
        headers: { "content-type": "application/json" },
      });
      setTimeout(() => clearTimedAlert(alertId), 300);
      //let response=await fetchroute()
      //console.log("route response:", response);
      const proper_route=routeTransformer(response.data);
      UpdateRouteInfoUtil(routeInfoExtractor(response.data));
      //console.log("proper_route",proper_route);
      return proper_route;
    } catch (error) {
      
      setTimeout(() => clearTimedAlert(alertId), 300);
      handleAxiosError(error);
      return [];
    }
  };



  export {getRoute};