import { configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import authSlice from "./slices/authSlice";
import reportSlice from "./slices/reportSlice";
import { persistStore, persistReducer } from "redux-persist";

const authPersistConfig = {
  key: "auth",
  storage,
};

const persistedAuthReducer = persistReducer(authPersistConfig, authSlice);

const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    report: reportSlice,
  },
});

export const persistor = persistStore(store);
export default store;
