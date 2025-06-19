import { createSlice } from '@reduxjs/toolkit';

// Allows refreshing of the tile layer
export const tileLayerSlice = createSlice({
    name: 'tileLayer',
    initialState: 0,
    reducers: {
        refreshTileLayer: (state, action) => {
            return state + 1;
        },
    },
});

export const { refreshTileLayer } = tileLayerSlice.actions;

export default tileLayerSlice.reducer;
