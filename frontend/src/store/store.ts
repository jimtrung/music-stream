import { configureStore } from '@reduxjs/toolkit';
import playerReducer from './playerSlice';
import uiReducer from './uiSlice';
import homeDataReducer from './homeDataSlice';

export const store = configureStore({
  reducer: {
    player: playerReducer,
    ui: uiReducer,
    homeData: homeDataReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
