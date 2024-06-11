import { createSlice } from "@reduxjs/toolkit";

export const timedAlertSlice = createSlice({
    name: "timedAlert",
    initialState: [],
    reducers: {
        addTimedAlert: (state, action) => {
            state.push(action.payload);
        },
        removeTimedAlert: (state, action) => {
            return state.filter(alert => alert.id !== action.payload);
        }
    }
});

export const { addTimedAlert, removeTimedAlert } = timedAlertSlice.actions;

export const triggerTimedAlert = (msg) => (dispatch) => {
    const id = msg.id || new Date().getTime();
    //console.log(msg.id, id)
    const timeout = msg.id===undefined ? 3000 : 1000000;
    //console.log(msg.id, id, timeout)
    msg.timeout = timeout;
    //console.log(msg)
    dispatch(addTimedAlert({ ...msg, id }));
    setTimeout(() => dispatch(removeTimedAlert(id)), timeout);
};

export default timedAlertSlice.reducer;