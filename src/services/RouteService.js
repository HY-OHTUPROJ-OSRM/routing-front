import ins from '../api/api';
import { routeTransformer, routeGiver, fetchroute, routeFlip } from './RouteTransformer';


const getRoute = async (coords) => {
    let proper=routeGiver(coords);
    console.log(proper,"cords",coords);
    try {
      const response = await ins({
        url: `route/v1/driving/${proper}?overview=false&alternatives=true&steps=true&geometries=geojson`,
        method: "get",
        headers: { "content-type": "application/json" },
      });
      //let response=await fetchroute()
      console.log("route response:", response);
      const proper_route=routeTransformer(response.data);
      console.log("proper_route",proper_route);
      return proper_route;
    } catch (error) {
      handleAxiosError(error);
      return [];
    }
  };

  const handleAxiosError = (error) => {
    if (error.response) {
      throw new Error(error.response.data.message);
    } else if (error.request) {
      console.log('no connection');
      throw new Error("Failed to connect to server");
    } else {
      throw new Error(error.message);
    }
  };

  export {getRoute};