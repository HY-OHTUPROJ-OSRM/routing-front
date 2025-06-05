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
//fetches the generated route line from backend
export const fetchRouteLine = (coords, profile) => {
  console.trace("🔍 fetchRouteLine trace");
  return async (dispatch, getState) => {
    const state = getState();
    const startPosition = state.routeLine.startPosition;
    const endPosition = state.routeLine.endPosition;
    if (!coords && startPosition!==null && endPosition!==null) {
      coords = [startPosition, endPosition];
    }
    if (coords) {
      const routeLine = await getRoute(coords, profile);
      dispatch(setRouteLine(routeLine));
    } else {
      console.error("No coordinates provided and no start/end positions set while fetching route");
    }
  };
};

export const UpdateRouteInfo = (info) => {  
  return async (dispatch, getState) => {
    dispatch(setRouteInfo(info));
  }
}
export default routeSlice.reducer;