import { ins } from '../api/api';
import {convertToGeoJSON,convertToJSON, filterUUIDv4} from './JSONToGeoJSON';
import { showTimedAlert, clearTimedAlert } from '../Utils/dispatchUtility';
import handleAxiosError from './handleAxiosError';
import { fetchRouteLine } from '../features/routes/routeSlice';
import { useDispatch } from 'react-redux';
import { createNarrowPolygon, PolygonToLine } from './LineToPolygon';

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
    const convertIfNeeded = (polygon) => {
      if (polygon.properties && polygon.properties.IsLine === 1) {
        return PolygonToLine(polygon); // Use desired width
      }
      return polygon;
    };
  
    
      // Convert polygons if needed
    const convertedfeatures = response.data.features.map(convertIfNeeded);
    return convertedfeatures;
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
  const data = { added: [object], deleted: [] };
  try {
    //const GEOJSON= convertToGeoJSON(object);
    await ins({
      url: 'zones/diff',
      method: "post",
      data,
      headers: { "content-type": "application/json" },
    });
    
    clearTimedAlert(alertId)
    showTimedAlert({ text: 'Polygon created successfully', variant: 'success' });
    
  } catch (error) {
    clearTimedAlert(alertId)
    handleAxiosError(error);
  }
};

const ChangePolygons = async (added, deletedIds) => {
  const alertId = `loading-${Date.now()}`;
  let deleted=filterUUIDv4(deletedIds);
  showTimedAlert({ text: 'Updating roads...', variant: 'progress', id: alertId });
  
  // Function to convert polyline to polygon if IsLine is 1
  const convertIfNeeded = (polygon) => {
    if (polygon.properties && polygon.properties.IsLine === 1) {
      return createNarrowPolygon(polygon, 10); // Use desired width
    }
    return polygon;
  };

  try {
    // Convert polygons if needed
    const convertedAdded = added.map(convertIfNeeded);
    console.log(convertedAdded)
    const data = { added: convertedAdded, deleted };

    await ins({
      url: 'zones/diff',
      method: "post",
      data,
      headers: { "content-type": "application/json" },
    });
    clearTimedAlert(alertId);
    showTimedAlert({ text: 'Polygons updated successfully', variant: 'success' });
  } catch (error) {
    clearTimedAlert(alertId);
    handleAxiosError(error);
  }

  
  
};

const DeletePolygon = async (id) => {
  const alertId = `loading-${Date.now()}`;
  showTimedAlert({ text: 'Deleting polygon...', variant: 'info', id: alertId });
  try {
    const data = { added: [], deleted: [id] };
    await ins({
      url: 'zones/diff',
      method: "post",
      data,
      headers: { "content-type": "application/json" },
    });
    clearTimedAlert(alertId)
    showTimedAlert({ text: 'Polygon deleted successfully', variant: 'success' });
  } catch (error) {
    clearTimedAlert(alertId)
    handleAxiosError(error);
  }
};


export { getPolygons, CreatePolygon, DeletePolygon, UpdatePolygon, ChangePolygons, getSegments };