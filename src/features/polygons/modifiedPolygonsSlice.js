import { createSlice } from "@reduxjs/toolkit";

export const modifiedPolygonsSlice = createSlice({
    name: "modifiedPolygons",
    initialState: {
        polygons: {},
        sendIds: {}, // using boolean maps instead of sets because createSlice doesn't work with them
        deleteIds: {}
    },
    reducers: {
        setModifiedPolygons: (state, action) => {
            state.polygons = {}
            state.sendIds = {}
            state.deleteIds = {}
            action.payload.forEach(polygon => {
                state.polygons[polygon.properties.id] = polygon
            })
        },
        addPolygon: (state, action) => {
            const polygon = action.payload
            state.polygons[polygon.properties.id] = polygon
            state.sendIds[polygon.properties.id] = true
        },
        modifyPolygon: (state, action) => {
            const polygon = action.payload
            state.polygons[polygon.properties.id] = polygon
            state.sendIds[polygon.properties.id] = true
            state.deleteIds[polygon.properties.id] = true
        }
    }
})

export const { setModifiedPolygons, addPolygon, modifyPolygon } = modifiedPolygonsSlice.actions

export default modifiedPolygonsSlice.reducer
