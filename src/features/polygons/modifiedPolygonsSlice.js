import { createSlice } from "@reduxjs/toolkit";

export const modifiedPolygonsSlice = createSlice({
    name: "modifiedPolygons",
    initialState: {
        polygons: {},
        sendIds: {}, // using boolean maps instead of sets because createSlice doesn't work with them
        deleteIds: {},
        faults: {},
        faultval: 0
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
        },
        // takes in id and type of actions eg. to be added due to fault in input or removed as input is fixed
        // type 0 when fixed type 1 if wrong
        setFaults: (state, action) => {
            const { id, type } = action.payload;
            console.log("debug", id, type, state.faults, state.faultval);
            
            if (type === 2) {
                state.faults = {};
                state.faultval = 0;
            } else {
                if (!(id in state.faults) && type === 1) {
                    state.faults[id] = true;
                    state.faultval++;
                } else if (id in state.faults && type === 0) {
                    state.faultval--;
                    delete state.faults[id];
                }
            }
            
            console.log(state.faultval);
        }
    }
})

export const { setModifiedPolygons, addPolygon, modifyPolygon, setFaults } = modifiedPolygonsSlice.actions

export default modifiedPolygonsSlice.reducer
