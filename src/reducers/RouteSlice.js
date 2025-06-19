import { createSlice } from '@reduxjs/toolkit';

export const routeSlice = createSlice({
    name: 'routeLine',
    initialState: {
        routeLine: [],
        startPosition: null,
        endPosition: null,
        routeInfo: [],
    },
    reducers: {
        setRouteLine: (state, action) => {
            state.routeLine = action.payload;
        },
        setStartPosition: (state, action) => {
            state.startPosition = action.payload;
        },
        setEndPosition: (state, action) => {
            state.endPosition = action.payload;
        },
        setRouteInfo: (state, action) => {
            state.routeInfo = action.payload;
        },
    },
});

export const { setRouteLine, setStartPosition, setEndPosition, setRouteInfo } = routeSlice.actions;

export default routeSlice.reducer;
