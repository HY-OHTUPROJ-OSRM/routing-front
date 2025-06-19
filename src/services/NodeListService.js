import { ins } from '../api/api';
import { showTimedAlert, clearTimedAlert } from '../utils/TimedAlert';
import handleAxiosError from './handleAxiosError';

const getNodeList = async () => {
    const alertId = `loading-${Date.now()}`;
    try {
        showTimedAlert({
            text: 'Loading nodelist...',
            variant: 'info',
            id: alertId,
            timeout: null,
        });
        const response = await ins({
            url: `nodelist`,
            method: 'get',
            headers: { 'content-type': 'application/json' },
        });
        setTimeout(() => clearTimedAlert(alertId), 300);
        return response.data || [];
    } catch (error) {
        setTimeout(() => clearTimedAlert(alertId), 300);
        handleAxiosError(error);
        return [];
    }
};
export { getNodeList };
