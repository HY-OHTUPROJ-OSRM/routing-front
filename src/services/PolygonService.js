import { ins } from '../api/api';
import {filterUUIDv4} from './JSONToGeoJSON';
import { showTimedAlert, clearTimedAlert } from '../Utils/dispatchUtility';
import handleAxiosError from './handleAxiosError';

import { createNarrowPolygon, PolygonToLine } from './LineToPolygon';

// Get polygons from backend
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
  
    // Convert polygons if needed. If IsLine is 1, convert polygon to line. 
    // Currently backend does not keep track of isLine so lines will be displayed as polygons
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

// Unused function
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

// Used in create polygon form
const CreatePolygon = async (object) => {
  const alertId = `loading-${Date.now()}`;
  showTimedAlert({ text: 'Adding polygon...', variant: 'info', id: alertId });
  const data = { added: object.features, deleted: [5225] };
  try {
    await ins({
      url: 'zones/diff',
      method: "post",
      data,
      headers: { "content-type": "application/json" },
      timeout: 0
    });
    
    clearTimedAlert(alertId)
    showTimedAlert({ text: 'Polygon created successfully', variant: 'success' });
    
  } catch (error) {
    clearTimedAlert(alertId)
    handleAxiosError(error);
  }
};

// Used in edit mode save
const ChangePolygons = async (added, deletedIds) => {
  const alertId = `loading-${Date.now()}`;
  let deleted = filterUUIDv4(deletedIds);
  
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

    await ins({
      url: 'zones/diff',
      method: "post",
      data,
      headers: { "content-type": "application/json" },
      timeout: 0
    });
    showTimedAlert({ text: 'Polygons updated successfully', variant: 'success' });
  } catch (error) {
    handleAxiosError(error);
  }
};

// Used in polygon display delete button (trash can)
const DeletePolygon = async (id) => {
  const alertId = `loading-${Date.now()}`;
  showTimedAlert({ text: 'Deleting polygon...', variant: 'info', id: alertId });
  try {
    // Ensure ID is integer format
    const integerId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (isNaN(integerId)) {
      throw new Error(`Invalid ID format: ${id}`);
    }
    
    const data = { added: [], deleted: [integerId] };
    
    await ins({
      url: 'zones/diff',
      method: "post",
      data: JSON.stringify(data),
      headers: { 
        "content-type": "application/json",
        "accept": "application/json"
      },
      timeout: 0,
      transformRequest: [(data) => data]
    });
    clearTimedAlert(alertId)
    showTimedAlert({ text: 'Polygon deleted successfully', variant: 'success' });
  } catch (error) {
    clearTimedAlert(alertId)
    handleAxiosError(error);
  }
};

// Batch delete polygons by IDs
const BatchDeletePolygons = async (polygonIds) => {
  const alertId = `batch-delete-${Date.now()}`;
  
  try {
    if (!Array.isArray(polygonIds) || polygonIds.length === 0) {
      throw new Error('Invalid polygon IDs provided');
    }

    showTimedAlert({ 
      text: `Deleting ${polygonIds.length} polygon(s)...`, 
      variant: 'info', 
      id: alertId 
    });
    
    const integerIds = polygonIds.map(id => {
      const parsed = typeof id === 'string' ? parseInt(id, 10) : id;
      if (isNaN(parsed)) {
        throw new Error(`Invalid ID format: ${id}`);
      }
      return parsed;
    });
    
    const data = { added: [], deleted: integerIds };
    
    await ins({
      url: 'zones/diff',
      method: "post",
      data: JSON.stringify(data),
      headers: { 
        "content-type": "application/json",
        "accept": "application/json"
      },
      timeout: 30000
    });
    
    clearTimedAlert(alertId);
    showTimedAlert({ 
      text: `Successfully deleted all ${integerIds.length} polygon(s)`, 
      variant: 'success' 
    });
    
  } catch (error) {
    clearTimedAlert(alertId);
    showTimedAlert({ 
      text: `Failed to delete polygons: ${error.message}`, 
      variant: 'error' 
    });
    handleAxiosError(error);
    throw error;
  }
};
    
    

export { getPolygons, CreatePolygon, DeletePolygon, ChangePolygons, getSegments, BatchDeletePolygons };
