import { configureStore } from '@reduxjs/toolkit';

import modifiedPolygonsReducer from './PolygonsSlice';
import routeReducer from './RouteSlice';
import timedAlertReducer from './TimedAlertSlice';
import segmentsReducer from './SegmentSlice';
import ViewSliceReducer from './ViewSlice';
import tileLayerReducer from './TileLayerSlice';
import tempRoadsReducer from './TempRoadsSlice';
import profileReducer from './ProfileSlice';
import coordinatesReducer from './CoordinatesSlice';
import nodeListReducer from './NodeListSlice';
import disconnectedRoadReducer from './DisconnectedRoadSlice';

//store to add all used reducers
export default configureStore({
    reducer: {
        routeLine: routeReducer,
        timedAlert: timedAlertReducer,
        modifiedPolygons: modifiedPolygonsReducer,
        segments: segmentsReducer,
        view: ViewSliceReducer,
        tileLayer: tileLayerReducer,
        tempRoads: tempRoadsReducer,
        profile: profileReducer,
        coordinates: coordinatesReducer,
        nodeList: nodeListReducer,
        disconnectedRoad: disconnectedRoadReducer,
    },
});
