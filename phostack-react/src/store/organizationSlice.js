import { createSlice } from '@reduxjs/toolkit';

const organizationSlice = createSlice({
  name: 'organization',
  initialState: {
    selectedOrganization: {
      createdAt: '',
      dollarPerPoint: null,
      joinDate: '',
      orgDescription: '',
      orgId: null,
      orgName: '',
      orgStatus: ''
    }
  },
  reducers: {
    selectOrganization(state, action) {
      state.selectedOrganization = action.payload.selectedOrganization;
    },
  },
});

export const organizationActions = organizationSlice.actions;

export default organizationSlice;
