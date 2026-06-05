import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  logs: [],
  pagination: {
    page: 1,
    limit: 15,
    total: 0,
    pages: 1,
  },
  loading: false,
  error: null,
};

// Async Thunks
export const fetchActivityLogs = createAsyncThunk(
  'activityLogs/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/activity-logs', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch activity logs');
    }
  }
);

const activityLogSlice = createSlice({
  name: 'activityLogs',
  initialState,
  reducers: {
    clearLogErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivityLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivityLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchActivityLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearLogErrors } = activityLogSlice.actions;
export default activityLogSlice.reducer;
