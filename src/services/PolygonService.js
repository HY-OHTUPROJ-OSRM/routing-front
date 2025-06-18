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
  try {
    await ins({
      url: 'zones',
      method: "post",
      data: object, // Send the full FeatureCollection as required by backend
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
// Accepts deletedPolygons: array of {id, updated_at}
const ChangePolygons = async (added, deletedPolygons) => {
  const alertId = `loading-${Date.now()}`;
  // deletedPolygons should be [{id, updated_at}, ...]
  
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
    const deleted = deletedPolygons.map(({id, updated_at}) => ({
      id: typeof id === 'string' ? parseInt(id, 10) : id,
      updated_at
    }));
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
const DeletePolygon = async (id, updated_at) => {
  const alertId = `loading-${Date.now()}`;
  showTimedAlert({ text: 'Deleting polygon...', variant: 'info', id: alertId });
  try {
    // Ensure ID is integer format
    const integerId = typeof id === 'string' ? parseInt(id, 10) : id;
    await ins({
      url: `zones/${integerId}`,
      method: "delete",
      data: { updated_at },
      headers: { 
        "content-type": "application/json",
        "accept": "application/json"
      },
      timeout: 0
    });
    clearTimedAlert(alertId)
    showTimedAlert({ text: 'Polygon deleted successfully', variant: 'success' });
  } catch (error) {
    clearTimedAlert(alertId)
    handleAxiosError(error);
  }
};

// Batch delete polygons by IDs 
const BatchDeletePolygons = async (polygonIdsWithUpdatedAt) => {
  const alertId = `batch-delete-${Date.now()}`;
  try {
    if (!Array.isArray(polygonIdsWithUpdatedAt) || polygonIdsWithUpdatedAt.length === 0) {
      throw new Error('Invalid polygon IDs provided');
    }
    showTimedAlert({ 
      text: `Deleting ${polygonIdsWithUpdatedAt.length} polygon(s)...`, 
      variant: 'info', 
      id: alertId 
    });
    // Use /zones/diff for batch delete, must provide [{id, updated_at}]
    const deleted = polygonIdsWithUpdatedAt.map(({id, updated_at}) => {
      const parsedId = typeof id === 'string' ? parseInt(id, 10) : id;
      return { id: parsedId, updated_at };
    });
    const data = { added: [], deleted };
    await ins({
      url: 'zones/diff',
      method: "post",
      data,
      headers: { 
        "content-type": "application/json",
        "accept": "application/json"
      },
      timeout: 30000
    });
    clearTimedAlert(alertId);
    showTimedAlert({ 
      text: `Successfully deleted all ${deleted.length} polygon(s)`, 
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
