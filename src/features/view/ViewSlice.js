import { createSlice } from "@reduxjs/toolkit";

export const ViewSlice = createSlice({
    name: "view",
    initialState: {
        mapView: {},
        listView: {},
    },
    reducers: {
        changeMapView: (state, action) => {
            state.mapView=action.payload;
        },
        changeListView: (state, action) => {
            state.listView=action.payload;
        }
    }
});

export const { changeMapView, changeListView} = ViewSlice.actions;



export default ViewSlice.reducer;