import { createSlice } from "@reduxjs/toolkit";

export const modifiedPolygonsSlice = createSlice({
    name: "modifiedPolygons",
    initialState: [],
    reducers: {
        setModifiedPolygons: (state, action) => {
            return action.payload
        },
        addPolygon: (state, action) => {
            state.push(action.payload)
        }
    }
})

export const { setModifiedPolygons, addPolygon } = modifiedPolygonsSlice.actions

export default modifiedPolygonsSlice.reducer
