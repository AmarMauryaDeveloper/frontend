import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  projects: [],
  selectedProject: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  },
  loading: false,
  detailsLoading: false,
  error: null,
};

// Async Thunks
export const fetchProjects = createAsyncThunk(
  'projects/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/projects', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch projects');
    }
  }
);

export const fetchProjectDetails = createAsyncThunk(
  'projects/fetchDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/projects/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch project details');
    }
  }
);

export const createNewProject = createAsyncThunk(
  'projects/create',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/projects', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create project');
    }
  }
);

export const updateProjectDetails = createAsyncThunk(
  'projects/update',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/projects/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update project');
    }
  }
);

export const updateStatusOnly = createAsyncThunk(
  'projects/updateStatusOnly',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/projects/${id}`, { status });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update project status');
    }
  }
);

export const deleteProjectRecord = createAsyncThunk(
  'projects/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/projects/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete project');
    }
  }
);

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearProjectError: (state) => {
      state.error = null;
    },
    clearSelectedProject: (state) => {
      state.selectedProject = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Projects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Details
      .addCase(fetchProjectDetails.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchProjectDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedProject = action.payload;
      })
      .addCase(fetchProjectDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload;
      })
      // Create Project
      .addCase(createNewProject.pending, (state) => {
        state.loading = true;
      })
      .addCase(createNewProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects.unshift(action.payload);
      })
      .addCase(createNewProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Project
      .addCase(updateProjectDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProjectDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProject = action.payload;
        // Update item in projects list
        const index = state.projects.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
      })
      .addCase(updateProjectDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Status Only (standard user)
      .addCase(updateStatusOnly.fulfilled, (state, action) => {
        state.selectedProject = action.payload;
        const index = state.projects.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
      })
      // Delete Project
      .addCase(deleteProjectRecord.fulfilled, (state, action) => {
        state.projects = state.projects.filter((p) => p._id !== action.payload);
        if (state.selectedProject?._id === action.payload) {
          state.selectedProject = null;
        }
      });
  },
});

export const { clearProjectError, clearSelectedProject } = projectSlice.actions;
export default projectSlice.reducer;
