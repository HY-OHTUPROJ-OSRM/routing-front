import { createSlice } from "@reduxjs/toolkit";
import { getSegments } from "../../services/PolygonService";

export const segmentsSlice = createSlice({
    name: "segments",
    initialState: [],
    reducers: {
        setSegments: (state, action) => {
            return action.payload
        }
    }
})

export const { setSegments } = segmentsSlice.actions

export const fetchSegments = () => {
    return async (dispatch) => {
        const segments = await getSegments()
        dispatch(setSegments(segments))
    }
}

export default segmentsSlice.reducer