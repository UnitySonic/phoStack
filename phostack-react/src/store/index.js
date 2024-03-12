import { configureStore } from '@reduxjs/toolkit';

import userSlice from './userSlice';
import organizationSlice from './organizationSlice';


const store = configureStore({
  reducer: { user: userSlice.reducer, organization: organizationSlice.reducer},
});

export default store;