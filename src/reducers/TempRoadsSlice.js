import { createSlice } from '@reduxjs/toolkit';

const tempRoadsSlice = createSlice({
    name: 'tempRoads',
    initialState: {
        list: [],
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null,
        selectedRoadId: null,
        visibleRoads: {},
    },
    reducers: {
        selectRoad: (state, action) => {
            state.selectedRoadId = action.payload;
        },
        clearSelection: (state) => {
            state.selectedRoadId = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        setVisibleRoads: (state, action) => {
            state.visibleRoads = action.payload;
        },
    },
});

export const { selectRoad, clearSelection, clearError, setVisibleRoads } = tempRoadsSlice.actions;

export default tempRoadsSlice.reducer;
