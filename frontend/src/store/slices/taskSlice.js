// src/store/slices/taskSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

// Async thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (params = {}, { rejectWithValue }) => {
    try {
      // Clean filters - remove empty strings and undefined values
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([key, value]) => 
          value !== '' && value !== null && value !== undefined
        )
      );

      // Always include page and limit
      const finalParams = {
        page: cleanParams.page || 1,
        limit: cleanParams.limit || 10,
        ...cleanParams
      };

      const queryString = new URLSearchParams(finalParams).toString();
      const response = await api.get(`/tasks?${queryString}`);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch tasks';
      return rejectWithValue(message);
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await api.post('/tasks', taskData);
      toast.success('Task created successfully!');
      return response.data.data.task;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create task';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/tasks/${id}`, updates);
      toast.success('Task updated successfully!');
      return response.data.data.task;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update task';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Task deleted successfully!');
      return taskId;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete task';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  tasks: [],
  currentTask: null,
  stats: {
    total: 0,
    pending: 0,
    'in-progress': 0,
    completed: 0
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalTasks: 0,
    hasNext: false,
    hasPrev: false
  },
  filters: {
    status: '',
    priority: '',
    search: '',
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  },
  isLoading: false,
  error: null,
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      // Reset to page 1 when filters change (except for page changes)
      if (!action.payload.page) {
        state.filters.page = 1;
      }
    },
    clearFilters: (state) => {
      state.filters = {
        status: '',
        priority: '',
        search: '',
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };
    },
    setCurrentTask: (state, action) => {
      state.currentTask = action.payload;
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetTasks: (state) => {
      return { ...initialState };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload.tasks || [];
        state.stats = action.payload.stats || initialState.stats;
        state.pagination = action.payload.pagination || initialState.pagination;
        state.error = null;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        // Don't clear tasks on error to maintain UI state
      })
      
      // Create task
      .addCase(createTask.pending, (state) => {
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload);
        state.stats.total += 1;
        state.stats[action.payload.status] += 1;
        state.error = null;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Update task
      .addCase(updateTask.pending, (state) => {
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(task => task._id === action.payload._id);
        if (index !== -1) {
          const oldStatus = state.tasks[index].status;
          const newStatus = action.payload.status;
          
          state.tasks[index] = action.payload;
          
          // Update stats if status changed
          if (oldStatus !== newStatus) {
            state.stats[oldStatus] -= 1;
            state.stats[newStatus] += 1;
          }
        }
        state.currentTask = action.payload;
        state.error = null;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Delete task
      .addCase(deleteTask.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        const taskIndex = state.tasks.findIndex(task => task._id === action.payload);
        if (taskIndex !== -1) {
          const task = state.tasks[taskIndex];
          state.stats.total -= 1;
          state.stats[task.status] -= 1;
          state.tasks.splice(taskIndex, 1);
        }
        state.error = null;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export const { 
  setFilters, 
  clearFilters, 
  setCurrentTask,
  clearCurrentTask, 
  clearError, 
  resetTasks 
} = taskSlice.actions;

export default taskSlice.reducer;