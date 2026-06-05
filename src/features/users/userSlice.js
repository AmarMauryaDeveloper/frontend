import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  users: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  },
  loading: false,
  error: null,
};

// Async Thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/users', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch users');
    }
  }
);

export const createNewUser = createAsyncThunk(
  'users/create',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/users', userData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create user');
    }
  }
);

export const updateUserRecord = createAsyncThunk(
  'users/update',
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update user');
    }
  }
);

export const deleteUserRecord = createAsyncThunk(
  'users/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete user');
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create User
      .addCase(createNewUser.fulfilled, (state, action) => {
        state.users.unshift(action.payload);
      })
      .addCase(createNewUser.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Update User
      .addCase(updateUserRecord.fulfilled, (state, action) => {
        const index = state.users.findIndex((u) => u._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUserRecord.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Delete User
      .addCase(deleteUserRecord.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u._id !== action.payload);
      });
  },
});

export const { clearUserError } = userSlice.actions;
export default userSlice.reducer;
