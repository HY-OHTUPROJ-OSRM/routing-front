import { ins } from '../api/api';
import { showTimedAlert, clearTimedAlert } from '../Utils/dispatchUtility';
import handleAxiosError from './handleAxiosError';

const getAllLimits = async () => {
  const alertId = `loading-${Date.now()}`;
  try {
    showTimedAlert({ text: 'Loading weight & height limits...', variant: 'info', id: alertId });
    const response = await ins({
      url: 'limits',
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

const getVehicleConfig = async () => {
  const alertId = `loading-${Date.now()}`;
  try {
    showTimedAlert({ text: 'Loading vehicle configuration...', variant: 'info', id: alertId });
    const response = await ins({
      url: 'vehicle-config',
      method: "get",
      headers: { "content-type": "application/json" },
    });
    clearTimedAlert(alertId);
    return response.data;
  } catch (error) {
    clearTimedAlert(alertId);
    handleAxiosError(error);
    return { classes: [] };
  }
};

export { 
  getAllLimits,
  getVehicleConfig
};