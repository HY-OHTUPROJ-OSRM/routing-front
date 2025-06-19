import { createSlice } from '@reduxjs/toolkit';

//no longer used, but kept for future. If backend is updated to support getblocked segments, this slice can be used to fetch them.
export const segmentsSlice = createSlice({
    name: 'segments',
    initialState: [],
    reducers: {
        setSegments: (state, action) => {
            return action.payload;
        },
    },
});

export const { setSegments } = segmentsSlice.actions;

export default segmentsSlice.reducer;
