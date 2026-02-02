import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: null,
    userdata: null,
  },
  reducers: {
    setToken: (state, action) => {
      const { token } = action.payload;
      state.token = token;
    },
    setUser: (state, action) => {
      const { userdata } = action.payload;
      state.userdata = userdata;
    },
    logOut: (state) => {
      state.token = null;
      state.userdata = null;
    },
  },
});

export const { setToken, setUser, logOut } = authSlice.actions;
export default authSlice.reducer;
