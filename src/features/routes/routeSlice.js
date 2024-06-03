import { createSlice } from "@reduxjs/toolkit";
import { getRoute } from "../../services/RouteService";

export const routeSlice = createSlice({
    name: "routeLine",
    initialState: [],
    reducers: {
        setRouteline: (state, action) => {
            return action.payload
        }
    }
})

export const { setRouteline } = routeSlice.actions

export const fetchRouteline = (coords) => {
    return async (dispatch) => {
        
        const routeline = await getRoute(coords)
        console.log("routeline", routeline)
        dispatch(setRouteline(routeline))

    }
}

export default routeSlice.reducer
