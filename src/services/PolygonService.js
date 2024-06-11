import ins from '../api/api';
import {convertToGeoJSON,convertToJSON} from './JSONToGeoJSON';
import { showTimedAlert, clearTimedAlert } from '../Utils/dispatchUtility';
import handleAxiosError from './handleAxiosError';
import { fetchRouteLine } from '../features/routes/routeSlice';
import { useDispatch } from 'react-redux';
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

    //console.log(response.data.features);
    return response.data.features;
    //return convertToJSON(response.data);
  } catch (error) {
    clearTimedAlert(alertId);
    handleAxiosError(error);
    return [];
  }
};

const getSegments = async () => {
  
  const alertId = `loading-${Date.now()}`;
  try {
    showTimedAlert({ text: 'Loading segments...', variant: 'info', id: alertId });
    const response = await ins({
      url: 'segments',
      method: "get",
      headers: { "content-type": "application/json" },
    });
    clearTimedAlert(alertId);
    if (response.data.features === null) {
      return []
    }

    console.log(response.data);
    return response.data;
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
  const alertId = `loading-${Date.now()}`;
  showTimedAlert({ text: 'Adding polygon...', variant: 'info', id: alertId });
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
    clearTimedAlert(alertId)
    if (response.status === 201) {
      showTimedAlert({ text: 'Polygon created successfully', variant: 'success' });
      return response.data;
    }
    showTimedAlert({ text: 'something unexpected happened', variant: 'failure' });
    
  } catch (error) {
    clearTimedAlert(alertId)
    handleAxiosError(error);
  }
};

const ChangePolygons = async (added, deleted) => {
  const alertId = `loading-${Date.now()}`;
  showTimedAlert({ text: 'Updating roads...', variant: 'info', id: alertId });
  try {
    const data = {added, deleted}

    await ins({
      url: 'zones/diff',
      method: "post",
      data,
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    handleAxiosError(error)
  }
  clearTimedAlert(alertId)
  showTimedAlert({ text: 'Polygons updated succesfully', variant: 'success'});
}

const DeletePolygon = async (id) => {
  const alertId = `loading-${Date.now()}`;
  showTimedAlert({ text: 'Deleting polygon...', variant: 'info', id: alertId });
  try {
    const response = await ins({
      url: `zones/${id}`,
      method: "delete",
      headers: { "content-type": "application/json" },
    });
    clearTimedAlert(alertId)
    showTimedAlert({ text: 'Polygon deleted successfully', variant: 'success' });
    
    return response;
  } catch (error) {
    clearTimedAlert(alertId)
    handleAxiosError(error);
  }
};


export { getPolygons, CreatePolygon, DeletePolygon, UpdatePolygon, ChangePolygons, getSegments };