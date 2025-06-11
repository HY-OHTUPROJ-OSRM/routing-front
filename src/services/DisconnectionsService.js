import { ins } from '../api/api';
import { showTimedAlert, clearTimedAlert } from '../Utils/dispatchUtility';
import handleAxiosError from './handleAxiosError';
import axios from "axios";
//fetch route from backend
export const getDisconnections = async (minDistance, maxDistance, isSameName) => {
  const alertId = `loading-${Date.now()}`;
  try {
    showTimedAlert({ text: 'Loading disconnections...', variant: 'info', id: alertId });
    const response = await ins({
      url: `disconnected_links`,
      method: "post",
      headers: { "content-type": "application/json" },
      data: JSON.stringify({
        minDist: minDistance,
        maxDist: maxDistance,
        namesAreSame: isSameName
      })
    });
    setTimeout(() => clearTimedAlert(alertId), 300);
    console.log(response.data);
    return response.data || [];

  } catch (error) {
    setTimeout(() => clearTimedAlert(alertId), 300);
    handleAxiosError(error);
    return [];
  }
};

export const attachTempRoadToDisconnection = (discId, tempRoadId) => {
  return ins.patch(`disconnected_links/${discId}`, {
    temp_road_id: tempRoadId,
  });
};
