import { ins } from '../api/api';
import { showTimedAlert, clearTimedAlert } from '../Utils/dispatchUtility';
import handleAxiosError from './handleAxiosError';
import { distance as turfDistance, point as turfPoint } from '@turf/turf';

// Helper for API calls with alert and error handling
async function apiCallWithAlert({
  alertText, successText, apiCall, onErrorReturn = null, throwOnError = false
}) {
  const alertId = `loading-${Date.now()}`;
  try {
    showTimedAlert({ text: alertText, variant: 'info', id: alertId });
    const response = await apiCall();
    clearTimedAlert(alertId);
    if (successText) showTimedAlert({ text: successText, variant: 'success' });
    return response.data;
  } catch (error) {
    clearTimedAlert(alertId);
    handleAxiosError(error);
    if (throwOnError) throw error;
    return onErrorReturn;
  }
}

const getAllTempRoads = async () =>
  apiCallWithAlert({
    alertText: 'Show temporary roads...',
    apiCall: () => ins({ url: 'temps', method: 'get', headers: { 'content-type': 'application/json' } }),
    onErrorReturn: []
  });

const createTempRoad = async (data) => {
  return apiCallWithAlert({
    alertText: 'Create temporary roads...',
    successText: 'Created successfully',
    apiCall: () => ins({ url: 'temps', method: 'post', data, headers: { 'content-type': 'application/json' } }),
    throwOnError: true
  });
};

const getTempRoadById = async (id) =>
  apiCallWithAlert({
    alertText: 'Loading temporary road...',
    apiCall: () => ins({ url: `temps/${id}`, method: 'get', headers: { 'content-type': 'application/json' } }),
    onErrorReturn: null
  });

const deleteTempRoad = async (id, updated_at) =>
  apiCallWithAlert({
    alertText: 'Deleting temporary road...',
    successText: 'Deleted successfully',
    apiCall: () => ins({ url: `temps/${id}`, method: 'delete', data: { updated_at }, headers: { 'content-type': 'application/json' } }),
    throwOnError: true
  });

const updateTempRoad = async (id, updates) => {
  return apiCallWithAlert({
    alertText: 'Updating temporary road...',
    successText: 'Updated successfully',
    apiCall: () => ins({ url: `temps/${id}`, method: 'patch', data: updates, headers: { 'content-type': 'application/json' } }),
    throwOnError: true
  });
};

const toggleTempRoad = async (id) =>
  apiCallWithAlert({
    alertText: 'Toggling road status...',
    successText: 'Status toggled successfully',
    apiCall: () => ins({ url: `temps/${id}/toggle`, method: 'post', headers: { 'content-type': 'application/json' } }),
    onErrorReturn: null
  });

// Use Turf for distance between two coordinate pairs [lat, lng]
const calculateDistanceBetweenCoords = (coord1, coord2) => {
  if (!coord1 || !coord2 || coord1.length !== 2 || coord2.length !== 2) {
    throw new Error('Invalid coordinates for one or both points');
  }
  const from = turfPoint([coord1[1], coord1[0]]);
  const to = turfPoint([coord2[1], coord2[0]]);
  // Returns distance in kilometers by default
  return Math.round(turfDistance(from, to, { units: 'kilometers' }) * 100) / 100;
};

// Returns the coordinates [lat, lng] of the nearest node to the given coordinates
const getNearestNodeCoordinates = async (lat, lng) => {
  try {
    const response = await ins({
      url: `nodes/nearest?lat=${lat}&lng=${lng}`,
      method: 'get',
      headers: { 'content-type': 'application/json' },
    });
    if (!response.data || !response.data.coordinates) {
      throw new Error('Invalid response from nearest node API');
    }
    const { lat: nearestLat, lng: nearestLng } = response.data.coordinates;
    if (typeof nearestLat !== 'number' || typeof nearestLng !== 'number') {
      throw new Error('Invalid coordinates in nearest node response');
    }
    return [nearestLat, nearestLng];
  } catch (error) {
    console.error('Failed to get nearest node coordinates:', error);
    throw new Error(`Failed to get nearest node coordinates: ${error.message}`);
  }
};

export {
  getAllTempRoads,
  createTempRoad,
  getTempRoadById,
  updateTempRoad,
  deleteTempRoad,
  toggleTempRoad,
  calculateDistanceBetweenCoords,
  getNearestNodeCoordinates
};
