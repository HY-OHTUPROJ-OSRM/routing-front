import { createSlice } from '@reduxjs/toolkit';

export const profileSlice = createSlice({
    name: 'profile',
    initialState: {
        selectedProfile: 'No profile',
    },
    reducers: {
        setSelectedProfile: (state, action) => {
            state.selectedProfile = action.payload;
        },
    },
});

export const { setSelectedProfile } = profileSlice.actions;

export default profileSlice.reducer;
