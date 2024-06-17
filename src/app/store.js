import { configureStore } from "@reduxjs/toolkit"
import polygonsReducer from "../features/polygons/polygonsSlice"
import modifiedPolygonsReducer from "../features/polygons/modifiedPolygonsSlice"
import routeReducer from "../features/routes/routeSlice"
import timedAlertReducer from "../features/messages/timedAlertSlice"
import segmentsReducer from "../features/segments/segmentSlice"
//import segmentsReducer from "../features/segments/segmentsSlice"
import ViewSliceReducer from "../features/view/ViewSlice"

//store to add all used reducers
export default configureStore({
    reducer: {
        polygons: polygonsReducer,
        routeLine: routeReducer,
        timedAlert: timedAlertReducer,
        modifiedPolygons: modifiedPolygonsReducer,
        segments: segmentsReducer,
        view: ViewSliceReducer
    }
})
