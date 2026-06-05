import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import projectReducer from '../features/projects/projectSlice';
import userReducer from '../features/users/userSlice';
import notificationReducer from '../features/notifications/notificationSlice';
import activityLogReducer from '../features/activityLogs/activityLogSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
    users: userReducer,
    notifications: notificationReducer,
    activityLogs: activityLogReducer,
  },
});

export default store;
