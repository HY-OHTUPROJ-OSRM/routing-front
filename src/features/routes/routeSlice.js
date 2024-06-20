import { createSlice } from "@reduxjs/toolkit";
import { getRoute } from "../../services/RouteService";

export const routeSlice = createSlice({
  name: "routeLine",
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
  }
});

export const { setRouteLine, setStartPosition, setEndPosition, setRouteInfo } = routeSlice.actions;

export const fetchRouteLine = (coords) => {
  return async (dispatch, getState) => {
    const state = getState();
    const startPosition = state.routeLine.startPosition;
    const endPosition = state.routeLine.endPosition;
    //console.log("fetchingRouteLine", startPosition, endPosition, coords);
    if (!coords && startPosition!==null && endPosition!==null) {
      coords = [startPosition, endPosition];
    }

    if (coords) {
        console.log("coords", coords);
      const routeLine = await getRoute(coords);
      //console.log("routeLine", routeLine);
      dispatch(setRouteLine(routeLine));

    } else {
      console.error("No coordinates provided and no start/end positions set");
    }
  };
};

export const UpdateRouteInfo = (info) => {  
  return async (dispatch, getState) => {
    dispatch(setRouteInfo(info));
  }
}
export default routeSlice.reducer;



/*import { createSlice } from "@reduxjs/toolkit";
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
                state.polygons[polygon.id] = polygon
            })
        },
        addPolygon: (state, action) => {
            const polygon = action.payload
            state.polygons[polygon.id] = polygon
            state.sendIds[polygon.id] = true
        },
        modifyPolygon: (state, action) => {
            const polygon = action.payload
            state.polygons[polygon.id] = polygon
            state.sendIds[polygon.id] = true
            state.deleteIds[polygon.id] = true
        }
    }
})
export const { setModifiedPolygons, addPolygon, modifyPolygon } = modifiedPolygonsSlice.actions
export default modifiedPolygonsSlice.reducer*/