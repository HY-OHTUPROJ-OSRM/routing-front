import { createSlice } from "@reduxjs/toolkit";
//tracks list component to be highlighted or the mapview to be flew to
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