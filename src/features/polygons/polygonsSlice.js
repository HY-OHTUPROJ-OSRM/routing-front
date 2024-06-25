import { createSlice } from "@reduxjs/toolkit";
import { getPolygons } from "../../services/PolygonService";
//redux slice for polygons. used to fetch polygons from backend
export const polygonsSlice = createSlice({
    name: "polygons",
    initialState: [],
    reducers: {
        setPolygons: (state, action) => {
            return action.payload
        }
    }
})

export const { setPolygons } = polygonsSlice.actions

export const fetchPolygons = () => {
    return async (dispatch) => {
        const polygons = await getPolygons()
        dispatch(setPolygons(polygons))
    }
}

export default polygonsSlice.reducer
