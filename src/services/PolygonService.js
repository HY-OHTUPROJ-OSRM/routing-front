import { ins } from '../api/api';
import {filterUUIDv4} from './JSONToGeoJSON';
import { showTimedAlert, clearTimedAlert } from '../Utils/dispatchUtility';
import handleAxiosError from './handleAxiosError';

import { createNarrowPolygon, PolygonToLine } from './LineToPolygon';
//get polygons from backend
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

    const convertIfNeeded = (polygon) => {
      if (polygon.properties && polygon.properties.IsLine === 1) {
        return PolygonToLine(polygon); 
      }
      return polygon;
    };
  
      // Convert polygons if needed. If IsLine is 1, convert polygon to line. Currently backend does not keep track of isLine so lines will be displayed as polygons
      const updatedFeatures = response.data.features.map(polygon => {
        if (polygon.properties) {
          polygon.properties.effectValue = polygon.properties.effect_value;
        }
        return convertIfNeeded(polygon);
      });
      return updatedFeatures
  } catch (error) {
    clearTimedAlert(alertId);
    handleAxiosError(error);
    return [];
  }
};
//unused
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
    return response.data;
  } catch (error) {
    clearTimedAlert(alertId);
    handleAxiosError(error);
    return [];
  }
};

//used in createpolygon form
const CreatePolygon = async (object) => {
  const alertId = `loading-${Date.now()}`;
  showTimedAlert({ text: 'Adding polygon...', variant: 'info', id: alertId });
  const data = { added: object.features, deleted: [5225] };
  console.log("data", data)
  try {
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
//used in editmode save
const ChangePolygons = async (added, deletedIds) => {
  const alertId = `loading-${Date.now()}`;
  let deleted=filterUUIDv4(deletedIds);
  showTimedAlert({ text: 'Updating roads...', variant: 'info', progress: true, id: alertId });
  
  // Function to convert polyline to polygon if IsLine is 1
  const convertIfNeeded = (polygon) => {
    if (polygon.properties && polygon.properties.IsLine === 1) {
      return createNarrowPolygon(polygon, 10); 
    }
    return polygon;
  };

  try {
    // Convert polygons if needed
    const convertedAdded = added.map(convertIfNeeded);
    const data = { added: convertedAdded, deleted };
    console.log("data", data)

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
//used in polygondisplay delete button (trashcan)
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


export { getPolygons, CreatePolygon, DeletePolygon, ChangePolygons, getSegments };