import { createSlice } from '@reduxjs/toolkit';

export const disconnectedRoadSlice = createSlice({
    name: 'nodelist',
    initialState: {
        showHandler: null,
        clearHandler: null,
        listHandler: null,
    },
    reducers: {
        setShowHandler: (state, action) => {
            state.showHandler = action.payload;
        },
        setClearHandler: (state, action) => {
            state.clearHandler = action.payload;
        },
        setListHandler: (state, action) => {
            state.listHandler = action.payload;
        },
    },
});

export const { setShowHandler, setClearHandler, setListHandler } = disconnectedRoadSlice.actions;

export default disconnectedRoadSlice.reducer;
