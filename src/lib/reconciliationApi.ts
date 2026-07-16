import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const reconciliationApi = createApi({
  reducerPath: 'reconciliationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: (typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.hostname}:5000/api/v1/reconciliation`
      : 'http://127.0.0.1:5000/api/v1/reconciliation'),
    prepareHeaders: (headers) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('crm_access_token') : null;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['ReconciliationQueue', 'ReconciliationStats', 'ReconciliationAnalytics', 'ReconciliationHistory', 'ReconciliationDrawer', 'ReconciliationSavedViews', 'ReconciliationPreferences', 'ReconciliationFailedJobs'],
  endpoints: (builder) => ({
    getQueue: builder.query<any, any>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
        if (params.status) queryParams.append('status', params.status);
        if (params.client && params.client !== 'All') queryParams.append('client', params.client);
        if (params.manager && params.manager !== 'All') queryParams.append('manager', params.manager);
        if (params.bookkeeper && params.bookkeeper !== 'All') queryParams.append('bookkeeper', params.bookkeeper);
        if (params.bank && params.bank !== 'All') queryParams.append('bank', params.bank);
        if (params.financialYear && params.financialYear !== 'All') queryParams.append('financialYear', params.financialYear);
        if (params.month && params.month !== 'All') queryParams.append('month', params.month);
        if (params.currency && params.currency !== 'All') queryParams.append('currency', params.currency);
        if (params.differenceType && params.differenceType !== 'All') queryParams.append('differenceType', params.differenceType);
        if (params.quickBooksStatus && params.quickBooksStatus !== 'All') queryParams.append('quickBooksStatus', params.quickBooksStatus);
        if (params.priority && params.priority !== 'All') queryParams.append('priority', params.priority);
        if (params.reviewer && params.reviewer !== 'All') queryParams.append('reviewer', params.reviewer);
        if (params.dateStart) queryParams.append('dateStart', params.dateStart);
        if (params.dateEnd) queryParams.append('dateEnd', params.dateEnd);
        if (params.amountMin) queryParams.append('amountMin', params.amountMin);
        if (params.amountMax) queryParams.append('amountMax', params.amountMax);

        return {
          url: `/queue?${queryParams.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['ReconciliationQueue'],
    }),
    getStats: builder.query<any, void>({
      query: () => ({
        url: '/stats',
        method: 'GET',
      }),
      providesTags: ['ReconciliationStats'],
    }),
    getAnalytics: builder.query<any, void>({
      query: () => ({
        url: '/analytics',
        method: 'GET',
      }),
      providesTags: ['ReconciliationAnalytics'],
    }),
    getHistory: builder.query<any, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: `/history?page=${page}&limit=${limit}`,
        method: 'GET',
      }),
      providesTags: ['ReconciliationHistory'],
    }),
    getDrawerDetails: builder.query<any, string>({
      query: (id) => ({
        url: `/${id}/drawer`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'ReconciliationDrawer', id }],
    }),
    postManual: builder.mutation<any, { transaction_id: string; receipt_id: string; allocated_amount?: number; override_reason: string }>({
      query: (body) => ({
        url: '/manual',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ReconciliationQueue', 'ReconciliationStats', 'ReconciliationAnalytics', 'ReconciliationHistory'],
    }),
    postAccept: builder.mutation<any, { candidate_id: string }>({
      query: (body) => ({
        url: '/accept',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ReconciliationQueue', 'ReconciliationStats', 'ReconciliationAnalytics', 'ReconciliationHistory'],
    }),
    postReject: builder.mutation<any, { candidate_id: string }>({
      query: (body) => ({
        url: '/reject',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ReconciliationQueue', 'ReconciliationStats', 'ReconciliationAnalytics', 'ReconciliationHistory'],
    }),
    postSplit: builder.mutation<any, { transaction_id: string; allocations: Array<{ receipt_id: string; allocated_amount: number }>; override_reason?: string }>({
      query: (body) => ({
        url: '/split',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ReconciliationQueue', 'ReconciliationStats', 'ReconciliationAnalytics', 'ReconciliationHistory'],
    }),
    postMerge: builder.mutation<any, { transaction_id?: string; receipt_id?: string; allocations: Array<{ transaction_id?: string; receipt_id?: string; allocated_amount: number }>; override_reason?: string }>({
      query: (body) => ({
        url: '/merge',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ReconciliationQueue', 'ReconciliationStats', 'ReconciliationAnalytics', 'ReconciliationHistory'],
    }),
    postUndo: builder.mutation<any, { reconciliation_id: string }>({
      query: (body) => ({
        url: '/undo',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ReconciliationQueue', 'ReconciliationStats', 'ReconciliationAnalytics', 'ReconciliationHistory'],
    }),
    getMetadata: builder.query<any, void>({
      query: () => ({
        url: '/metadata',
        method: 'GET',
      }),
    }),
    postBulk: builder.mutation<any, { ids: string[]; action: string; value?: any }>({
      query: (body) => ({ url: '/bulk', method: 'POST', body }),
      invalidatesTags: ['ReconciliationQueue', 'ReconciliationStats', 'ReconciliationAnalytics', 'ReconciliationHistory'],
    }),
    postNote: builder.mutation<any, { id: string; body: string; mentions?: string[] }>({
      query: ({ id, ...body }) => ({ url: `/${id}/notes`, method: 'POST', body }),
      invalidatesTags: (result, error, arg) => [{ type: 'ReconciliationDrawer', id: arg.id }],
    }),
    postDocument: builder.mutation<any, { id: string; name: string; type?: string; fileKey?: string; sizeKb?: number }>({
      query: ({ id, ...body }) => ({ url: `/${id}/documents`, method: 'POST', body }),
      invalidatesTags: (result, error, arg) => [{ type: 'ReconciliationDrawer', id: arg.id }],
    }),
    deleteDocument: builder.mutation<any, { docId: string; transactionId: string }>({
      query: ({ docId }) => ({ url: `/documents/${docId}`, method: 'DELETE' }),
      invalidatesTags: (result, error, arg) => [{ type: 'ReconciliationDrawer', id: arg.transactionId }],
    }),
    getSavedViews: builder.query<any, void>({
      query: () => ({ url: '/saved-views', method: 'GET' }),
      providesTags: ['ReconciliationSavedViews'],
    }),
    postSavedView: builder.mutation<any, { name: string; filters: any }>({
      query: (body) => ({ url: '/saved-views', method: 'POST', body }),
      invalidatesTags: ['ReconciliationSavedViews'],
    }),
    deleteSavedView: builder.mutation<any, string>({
      query: (viewId) => ({ url: `/saved-views/${viewId}`, method: 'DELETE' }),
      invalidatesTags: ['ReconciliationSavedViews'],
    }),
    getPreferences: builder.query<any, void>({
      query: () => ({ url: '/preferences', method: 'GET' }),
      providesTags: ['ReconciliationPreferences'],
    }),
    putPreferences: builder.mutation<any, Record<string, unknown>>({
      query: (body) => ({ url: '/preferences', method: 'PUT', body }),
      invalidatesTags: ['ReconciliationPreferences'],
    }),
    getFailedJobs: builder.query<any, void>({
      query: () => ({ url: '/failed-jobs', method: 'GET' }),
      providesTags: ['ReconciliationFailedJobs'],
    }),
    retryFailedJob: builder.mutation<any, string>({
      query: (jobId) => ({ url: `/failed-jobs/${jobId}/retry`, method: 'POST' }),
      invalidatesTags: ['ReconciliationFailedJobs', 'ReconciliationQueue'],
    }),
    retryAllFailedJobs: builder.mutation<any, void>({
      query: () => ({ url: '/failed-jobs/retry-all', method: 'POST' }),
      invalidatesTags: ['ReconciliationFailedJobs', 'ReconciliationQueue'],
    }),
  }),
});

export const {
  useGetQueueQuery,
  useGetStatsQuery,
  useGetAnalyticsQuery,
  useGetHistoryQuery,
  useGetDrawerDetailsQuery,
  useGetMetadataQuery,
  usePostManualMutation,
  usePostAcceptMutation,
  usePostRejectMutation,
  usePostSplitMutation,
  usePostMergeMutation,
  usePostUndoMutation,
  usePostBulkMutation,
  usePostNoteMutation,
  usePostDocumentMutation,
  useDeleteDocumentMutation,
  useGetSavedViewsQuery,
  usePostSavedViewMutation,
  useDeleteSavedViewMutation,
  useGetPreferencesQuery,
  usePutPreferencesMutation,
  useGetFailedJobsQuery,
  useRetryFailedJobMutation,
  useRetryAllFailedJobsMutation,
} = reconciliationApi;
