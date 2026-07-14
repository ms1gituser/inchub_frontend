import { configureStore } from '@reduxjs/toolkit';
import { accountingDashboardApi } from './accoutingdashboradapiclient';

export const store = configureStore({
  reducer: {
    [accountingDashboardApi.reducerPath]: accountingDashboardApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(accountingDashboardApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
