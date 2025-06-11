import { ins } from '../api/api';
import { showTimedAlert, clearTimedAlert } from '../Utils/dispatchUtility';
import handleAxiosError from './handleAxiosError';

const getAllTempRoads = async () => {
  const alertId = `loading-${Date.now()}`;
  try {
    showTimedAlert({ text: 'Show temporary roads...', variant: 'info', id: alertId });
    const response = await ins({
      url: 'temps',
      method: "get",
      headers: { "content-type": "application/json" },
    });
    clearTimedAlert(alertId);
    return response.data;
  } catch (error) {
    clearTimedAlert(alertId);
    handleAxiosError(error);
    return [];
  }
};

const createTempRoad = async (data) => {
  const alertId = `loading-${Date.now()}`;
  try {
    showTimedAlert({ text: 'Create temporary roads...', variant: 'info', id: alertId });
    const response = await ins({
      url: 'temps',
      method: "post",
      data,
      headers: { "content-type": "application/json" },
    });
    clearTimedAlert(alertId);
    showTimedAlert({ text: 'Created successfully', variant: 'success' });
    return response.data;
  } catch (error) {
    clearTimedAlert(alertId);
    handleAxiosError(error);
    return null;
  }
};

const getTempRoadById = async (id) => {
  const alertId = `loading-${Date.now()}`;
  try {
    showTimedAlert({ text: 'Loading temporary road...', variant: 'info', id: alertId });
    const response = await ins({
      url: `temps/${id}`,
      method: "get",
      headers: { "content-type": "application/json" },
    });
    clearTimedAlert(alertId);
    return response.data;
  } catch (error) {
    clearTimedAlert(alertId);
    handleAxiosError(error);
    return null;
  }
};

const deleteTempRoad = async (id) => {
  const alertId = `loading-${Date.now()}`;
  try {
    showTimedAlert({ text: 'Deleting temporary road...', variant: 'info', id: alertId });
    const response = await ins({
      url: `temps/${id}`,
      method: "delete",
      headers: { "content-type": "application/json" },
    });
    clearTimedAlert(alertId);
    showTimedAlert({ text: 'Deleted successfully', variant: 'success' });
    return response.data;
  } catch (error) {
    clearTimedAlert(alertId);
    handleAxiosError(error);
    throw error; // re-throw to handle it in the calling function
  }
};

const updateTempRoad = async (id, updates) => {
  const alertId = `loading-${Date.now()}`;
  try {
    showTimedAlert({ text: 'Updating temporary road...', variant: 'info', id: alertId });
    const response = await ins({
      url: `temps/${id}`,
      method: "patch",
      data: updates,
      headers: { "content-type": "application/json" },
    });
    clearTimedAlert(alertId);
    showTimedAlert({ text: 'Updated successfully', variant: 'success' });
    return response.data;
  } catch (error) {
    clearTimedAlert(alertId);
    handleAxiosError(error);
    return null;
  }
};

const toggleTempRoad = async (id) => {
  const alertId = `loading-${Date.now()}`;
  try {
    showTimedAlert({ text: 'Toggling road status...', variant: 'info', id: alertId });
    const response = await ins({
      url: `temps/${id}/toggle`,
      method: "post",
      headers: { "content-type": "application/json" },
    });
    clearTimedAlert(alertId);
    showTimedAlert({ text: 'Status toggled successfully', variant: 'success' });
    return response.data;
  } catch (error) {
    clearTimedAlert(alertId);
    handleAxiosError(error);
    return null;
  }
};

const getNodeCoordinates = async (nodeId) => {
  try {
    const response = await ins({
      url: `nodes/${nodeId}`,
      method: "get",
      headers: { "content-type": "application/json" },
    });
    
    const lat = parseFloat(response.data.lat);
    const lng = parseFloat(response.data.lng);
    
    if (isNaN(lat) || isNaN(lng)) {
      console.error(`Invalid coordinates for node ${nodeId}`);
      return null;
    }
    
    return [lat, lng];
  } catch (error) {
    console.error(`Failed to get coordinates for node ${nodeId}:`, error);
    return null;
  }
};

const findNearestNode = async (lat, lng) => {
  try {
    const response = await ins({
      url: `nodes/nearest?lat=${lat}&lng=${lng}`,
      method: "get",
      headers: { "content-type": "application/json" },
    });
    
    if (!response.data || !response.data.nodeId) {
      throw new Error('Invalid response from nearest node API');
    }
    
    return response.data.nodeId;
  } catch (error) {
    console.error('Failed to find nearest node:', error);
    throw new Error(`Failed to find nearest node: ${error.message}`);
  }
};

const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const toRad = (value) => value * Math.PI / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return Math.round(R * c *100)/ 100; // distance in kilometers, rounded to 2 decimal places
}

const calculateDistanceBetweenNodes = async (nodeId1, nodeId2) => {
  try {
    const [coord1, coord2] = await Promise.all([
      getNodeCoordinates(nodeId1),
      getNodeCoordinates(nodeId2)
    ]);
    
    if (!coord1 || !coord2) {
      throw new Error('Invalid coordinates for one or both nodes');
    }
    
    return calculateDistance(coord1[0], coord1[1], coord2[0], coord2[1]);
  } catch (error) {
    console.error('Failed to calculate distance between nodes:', error);
    throw new Error(`Failed to calculate distance: ${error.message}`);
  }
}

export { 
  getAllTempRoads, 
  createTempRoad,
  getTempRoadById,
  updateTempRoad,
  deleteTempRoad,
  toggleTempRoad,
  getNodeCoordinates,
  findNearestNode,
  calculateDistance,
  calculateDistanceBetweenNodes
};
