import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/AuthSlice";

// Khởi tạo Redux store
export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

// ✅ Export type cho toàn bộ app
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
