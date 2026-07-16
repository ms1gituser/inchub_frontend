import { configureStore } from '@reduxjs/toolkit';
import { accountingDashboardApi } from './accoutingdashboradapiclient';
import { clientApi } from './clientapi';
import { aiQueueApi } from './aiqueueapi';
import { vendorApi } from './vendorapi';
import { reconciliationApi } from './reconciliationApi';
import { vatApi } from './vatApi';
import { ctApi } from './ctApi';
import { qboConnectionsApi } from './qboConnectionsApi';
import { reportsApi } from './reportsApi';

export const store = configureStore({
  reducer: {
    [accountingDashboardApi.reducerPath]: accountingDashboardApi.reducer,
    [clientApi.reducerPath]: clientApi.reducer,
    [aiQueueApi.reducerPath]: aiQueueApi.reducer,
    [vendorApi.reducerPath]: vendorApi.reducer,
    [reconciliationApi.reducerPath]: reconciliationApi.reducer,
    [vatApi.reducerPath]: vatApi.reducer,
    [ctApi.reducerPath]: ctApi.reducer,
    [qboConnectionsApi.reducerPath]: qboConnectionsApi.reducer,
    [reportsApi.reducerPath]: reportsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      accountingDashboardApi.middleware,
      clientApi.middleware,
      aiQueueApi.middleware,
      vendorApi.middleware,
      reconciliationApi.middleware,
      vatApi.middleware,
      ctApi.middleware,
      qboConnectionsApi.middleware,
      reportsApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

