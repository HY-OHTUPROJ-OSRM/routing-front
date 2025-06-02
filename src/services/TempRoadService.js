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

export { 
  getAllTempRoads, 
  createTempRoad,
  getTempRoadById,
  updateTempRoad,
  deleteTempRoad,
  toggleTempRoad,
  getNodeCoordinates
};