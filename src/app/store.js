import { configureStore } from "@reduxjs/toolkit"
import polygonsReducer from "../features/polygons/polygonsSlice"
import modifiedPolygonsReducer from "../features/polygons/modifiedPolygonsSlice"
import routeReducer from "../features/routes/routeSlice"
import timedAlertReducer from "../features/messages/timedAlertSlice"

export default configureStore({
    reducer: {
        polygons: polygonsReducer,
        routeLine: routeReducer,
        timedAlert: timedAlertReducer,
        modifiedPolygons: modifiedPolygonsReducer
    }
})