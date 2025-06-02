import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  getAllTempRoads, 
  createTempRoad, 
  updateTempRoad, 
  deleteTempRoad 
} from '../../services/TempRoadService';

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

export const updateTempRoadAsync = createAsyncThunk(
  'tempRoads/updateTempRoad',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const response = await updateTempRoad(id, updates);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTempRoadAsync = createAsyncThunk(
  'tempRoads/deleteTempRoad',
  async (id, { rejectWithValue }) => {
    try {
      await deleteTempRoad(id);
      return id;
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
    },
    clearSelection: (state) => {
      state.selectedRoadId = null;
    },
    clearError: (state) => {
      state.error = null;
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

      .addCase(addTempRoad.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addTempRoad.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list.push(action.payload);
      })
      .addCase(addTempRoad.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      .addCase(updateTempRoadAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateTempRoadAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.list.findIndex(road => road.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(updateTempRoadAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      .addCase(deleteTempRoadAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteTempRoadAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = state.list.filter(road => road.id !== action.payload);
        if (state.selectedRoadId === action.payload) {
          state.selectedRoadId = null;
        }
      })
      .addCase(deleteTempRoadAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export const { selectRoad, clearSelection, clearError } = tempRoadsSlice.actions;

export default tempRoadsSlice.reducer;