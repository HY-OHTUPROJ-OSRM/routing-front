import { createSlice } from '@reduxjs/toolkit';

const removeTimedAlertHelper = (state, action) => {
    return state.filter((alert) => alert.id !== action.payload);
};

const triggerTimedAlertHelper = (state, action) => {
    const msg = action.payload;

    const id = msg.id || new Date().getTime();

    let timeout = 3000;
    if (msg.timeout === null) {
        // If timeout is explicitly set to null, use 60s
        timeout = 60000;
    } else if (msg.timeout) {
        // If timeout is set, use the provided value
        timeout = msg.timeout;
    }

    state.push({ ...msg, id, timeout });
    setTimeout(() => removeTimedAlertHelper(state, { payload: id }), timeout);
};

export const timedAlertSlice = createSlice({
    name: 'timedAlert',
    initialState: [],
    reducers: {
        triggerTimedAlert: (state, action) => {
            triggerTimedAlertHelper(state, action);
        },
        removeTimedAlert: (state, action) => {
            removeTimedAlertHelper(state, action);
        },
    },
});

export const { triggerTimedAlert, removeTimedAlert } = timedAlertSlice.actions;

export default timedAlertSlice.reducer;
