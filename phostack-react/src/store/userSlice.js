import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: {
      createdAt: '',
      email: '',
      firstName: '',
      lastName: '',
      organizations: [],
      picture: '',
      pointValue: 0,
      userId: '',
      userStatus: '',
      userType: '',
      viewAs: {
        createdAt: '',
        email: '',
        firstName: '',
        lastName: '',
        organizations: [],
        picture: '',
        pointValue: 0,
        userId: '',
        userStatus: '',
        userType: '',
        viewAs: '',
      },
    },
  },
  reducers: {
    replaceUser(state, action) {
      state.user = action.payload.user;
    }
  },
});

export const userActions = userSlice.actions;

export default userSlice;
