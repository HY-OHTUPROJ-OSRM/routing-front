import { configureStore } from "@reduxjs/toolkit"
import polygonsReducer from "../features/polygons/polygonsSlice"

export default configureStore({
    reducer: {
        polygons: polygonsReducer
    }
})
