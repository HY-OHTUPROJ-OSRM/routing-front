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
  // pass
};

const updateTempRoad = async (id, updates) => {
  // pass
};

const deleteTempRoad = async (id) => {
  // pass
};

const toggleTempRoad = async (id) => {
  // pass
};

export { 
  getAllTempRoads, 
  createTempRoad,
  getTempRoadById,
  updateTempRoad,
  deleteTempRoad,
  toggleTempRoad
};