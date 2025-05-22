import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllTempRoads, createTempRoad } from '../../services/TempRoadService';

export const fetchTempRoads = createAsyncThunk(
  'tempRoads/fetchTempRoads',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllTempRoads();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addTempRoad = createAsyncThunk(
  'tempRoads/addTempRoad',
  async (roadData, { rejectWithValue }) => {
    try {
      const response = await createTempRoad(roadData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const tempRoadsSlice = createSlice({
  name: 'tempRoads',
  initialState: {
    list: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    selectedRoadId: null 
  },
  reducers: {
    selectRoad: (state, action) => {
      state.selectedRoadId = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTempRoads.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTempRoads.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchTempRoads.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addTempRoad.fulfilled, (state, action) => {
        state.list.push(action.payload);
      });
  }
});

export const { selectRoad } = tempRoadsSlice.actions;

export default tempRoadsSlice.reducer;