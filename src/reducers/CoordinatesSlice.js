import { createSlice } from '@reduxjs/toolkit';

export const coordinatesSlice = createSlice({
    name: 'coordinate',
    initialState: {
        coordinates: 'No profile',
    },
    reducers: {
        setCoordinates: (state, action) => {
            state.selectedProfile = action.payload;
        },
    },
});

export const { setCoordinates } = coordinatesSlice.actions;

export default coordinatesSlice.reducer;
