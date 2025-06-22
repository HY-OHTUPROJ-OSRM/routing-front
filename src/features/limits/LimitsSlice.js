import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllLimits, getVehicleConfig } from '../../services/LimitsService';

export const fetchLimits = createAsyncThunk(
  'limits/fetchLimits',
  async (_, { rejectWithValue }) => {
    try {
      return await getAllLimits();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchVehicleConfig = createAsyncThunk(
  'limits/fetchVehicleConfig',
  async (_, { rejectWithValue }) => {
    try {
      return await getVehicleConfig();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const limitsSlice = createSlice({
  name: 'limits',
  initialState: {
    limits: [],
    vehicleConfig: { classes: [] },
    loading: false,
    error: null,
    isVisible: false,
    visibleLimitIds: []
  },
  reducers: {
    clearLimits: (state) => {
      state.limits = [];
      state.error = null;
    },
    setLimitsVisible: (state, action) => {
      state.isVisible = action.payload;
    },
    
    addLimitToMap: (state, action) => {
      const limitId = action.payload;
      if (!state.visibleLimitIds.includes(limitId)) {
        state.visibleLimitIds.push(limitId);
      }
    },
    removeLimitFromMap: (state, action) => {
      const limitId = action.payload;
      state.visibleLimitIds = state.visibleLimitIds.filter(id => id !== limitId);
    },
    clearMapLimits: (state) => {
      state.visibleLimitIds = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLimits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLimits.fulfilled, (state, action) => {
        state.loading = false;
        state.limits = action.payload;
        state.error = null;
      })
      .addCase(fetchLimits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchVehicleConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicleConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicleConfig = action.payload;
        state.error = null;
      })
      .addCase(fetchVehicleConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  clearLimits, 
  setLimitsVisible, 
  addLimitToMap,
  removeLimitFromMap,
  clearMapLimits
} = limitsSlice.actions;

export default limitsSlice.reducer;