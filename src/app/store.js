import { configureStore } from "@reduxjs/toolkit"
import polygonsReducer from "../features/polygons/polygonsSlice"
import routeReducer from "../features/routes/routeSlice"
export default configureStore({
    reducer: {
        polygons: polygonsReducer,
        routeLine: routeReducer
    }
})
