import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

// Async Thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/notifications');
      return response.data; // contains unreadCount and data
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch notifications');
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.put(`/notifications/${id}/read`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to mark notification read');
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      await api.put('/notifications/read-all');
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to mark all read');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotificationReceived: (state, action) => {
      // Append real-time notification to the beginning
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    clearNotificationError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.data;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Mark single read
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex((n) => n._id === action.payload._id);
        if (index !== -1) {
          if (!state.notifications[index].read) {
            state.notifications[index].read = true;
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        }
      })
      // Mark all read
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map((n) => ({ ...n, read: true }));
        state.unreadCount = 0;
      });
  },
});

export const { addNotificationReceived, clearNotificationError } = notificationSlice.actions;
export default notificationSlice.reducer;
