import { createSlice } from '@reduxjs/toolkit';

export const modifiedPolygonsSlice = createSlice({
    name: 'modifiedPolygons',
    initialState: {
        polygons: {},
        sendIds: {}, // using boolean maps instead of sets because createSlice doesn't work with them
        deleteIds: {},
        cancelSendIds: { '-1': true },
        faults: {},
        faultval: 0,
    },
    reducers: {
        setPolygons: (state, action) => {
            state.polygons = {};
            state.sendIds = {};
            state.deleteIds = {};
            action.payload.forEach((polygon) => {
                state.polygons[polygon.properties.id] = polygon;
            });
        },
        addPolygon: (state, action) => {
            const polygon = action.payload;
            console.log('nowaddingpolygon', polygon);
            state.polygons[polygon.properties.id] = polygon;
            state.sendIds[polygon.properties.id] = true;
        },
        modifyPolygon: (state, action) => {
            const polygon = action.payload;
            const id = polygon.properties.id;
            const existingPolygon = state.polygons[id];

            if (existingPolygon) {
                // Only change geometry if different
                if (JSON.stringify(existingPolygon.geometry) !== JSON.stringify(polygon.geometry)) {
                    state.polygons[id].geometry = polygon.geometry;
                } else {
                    state.polygons[id] = polygon;
                }
            } else {
                // Replace all values if polygon doesn't exist
                state.polygons[id] = polygon;
            }

            state.sendIds[id] = true;
            state.deleteIds[id] = true;
        },

        // takes in id and type of actions eg. to be added due to fault in input or removed as input is fixed
        // type 0 when fixed type 1 if wrong, type 2 to reset all tracked faults
        setFaults: (state, action) => {
            const { id, type } = action.payload;
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
        },
        setCanceledits: (state, action) => {
            //Used to make sure that the polygon is not sent to the server if it is set to be deleted
            const { id, add } = action.payload;
            if (add) {
                state.cancelSendIds[id] = true;
                state.deleteIds[id] = true;
            } else {
                delete state.cancelSendIds[id];
                delete state.deleteIds[id];
            }
            console.log(Object.keys(state.cancelSendIds).length);
        },
    },
});

export const { setModifiedPolygons, addPolygon, modifyPolygon, setFaults, setCanceledits } =
    modifiedPolygonsSlice.actions;

export default modifiedPolygonsSlice.reducer;
