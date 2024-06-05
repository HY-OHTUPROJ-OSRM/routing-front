import ins from '../api/api';
import {convertToGeoJSON,convertToJSON} from './JSONToGeoJSON';
import { showTimedAlert, clearTimedAlert } from '../Utils/dispatchUtility';
import handleAxiosError from './handleAxiosError';
const getPolygons = async () => {
  const alertId = `loading-${Date.now()}`;
  try {
    showTimedAlert({ text: 'Loading polygons...', variant: 'info', id: alertId });
    const response = await ins({
      url: 'zones',
      method: "get",
      headers: { "content-type": "application/json" },
    });
    clearTimedAlert(alertId);
    if (response.data.features === null) {
      return []
    }

    console.log(response.data.features);
    return response.data.features;
    //return convertToJSON(response.data);
  } catch (error) {
    clearTimedAlert(alertId);
    handleAxiosError(error);
    return [];
  }
};

const UpdatePolygon = async (object) => {
  try {
    const response = await ins({
      url: `polygons/${object.name}`,
      method: "put",
      data: object,
      headers: { "content-type": "application/json" },
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

const CreatePolygon = async (object) => {
  console.log(object);
  try {
    //const GEOJSON= convertToGeoJSON(object);
    const GEOJSON=object
    console.log(GEOJSON)
    const response = await ins({
      url: 'zones',
      method: "post",
      data: GEOJSON,
      headers: { "content-type": "application/json" },
    });
    console.log(response.data);
    if (response.status === 201) {
      showTimedAlert({ text: 'Polygon created successfully', variant: 'success' });
      return response.data;
    }
    showTimedAlert({ text: 'something unexpected happened', variant: 'failure' });
  } catch (error) {
    handleAxiosError(error);
  }
};

const DeletePolygon = async (id) => {
  try {
    const response = await ins({
      url: `zones/${id}`,
      method: "delete",
      headers: { "content-type": "application/json" },
    });
    showTimedAlert({ text: 'Polygon deleted successfully', variant: 'success' });
    return response;
  } catch (error) {
    handleAxiosError(error);
  }
};


export { getPolygons, CreatePolygon, DeletePolygon, UpdatePolygon };