import { createSlice } from '@reduxjs/toolkit';

export const nodeListSlice = createSlice({
    name: 'nodelist',
    initialState: {
        nodeSelectionHandler: null, // handler function
    },
    reducers: {
        setNodeSelectionHandler: (state, action) => {
            state.nodeSelectionHandler = action.payload;
        },
    },
});

export const { setNodeSelectionHandler } = nodeListSlice.actions;

export default nodeListSlice.reducer;
