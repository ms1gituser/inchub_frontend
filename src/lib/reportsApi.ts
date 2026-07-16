import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const reportsApi = createApi({
  reducerPath: 'reportsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: (typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.hostname}:5000/api/v1/reports-center`
      : 'http://127.0.0.1:5000/api/v1/reports-center'),
    prepareHeaders: (headers) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('crm_access_token') : null;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['ReportsQueue', 'ReportsStats', 'ReportsAnalytics', 'ReportsDrawer'],
  endpoints: (builder) => ({
    getQueue: builder.query<any, any>({
      query: (params) => {
        const q = new URLSearchParams();
        if (params?.page) q.append('page', params.page.toString());
        if (params?.limit) q.append('limit', params.limit.toString());
        if (params?.search) q.append('search', params.search);
        if (params?.category && params.category !== 'All') q.append('category', params.category);
        if (params?.status && params.status !== 'All') q.append('status', params.status);
        if (params?.client && params.client !== 'All') q.append('client', params.client);
        if (params?.author && params.author !== 'All') q.append('author', params.author);
        if (params?.year && params.year !== 'All') q.append('year', params.year);
        if (params?.period && params.period !== 'All') q.append('period', params.period);
        if (params?.archived) q.append('archived', 'true');
        return { url: `/queue?${q.toString()}`, method: 'GET' };
      },
      providesTags: ['ReportsQueue'],
    }),
    getStats: builder.query<any, void>({ query: () => ({ url: '/stats', method: 'GET' }), providesTags: ['ReportsStats'] }),
    getAnalytics: builder.query<any, void>({ query: () => ({ url: '/analytics', method: 'GET' }), providesTags: ['ReportsAnalytics'] }),
    getDrawerDetails: builder.query<any, string>({
      query: (id) => ({ url: `/${id}/drawer`, method: 'GET' }),
      providesTags: (r, e, id) => [{ type: 'ReportsDrawer', id }],
    }),
    getMetadata: builder.query<any, void>({ query: () => ({ url: '/metadata', method: 'GET' }) }),
    postGenerate: builder.mutation<any, any>({ query: (body) => ({ url: '/', method: 'POST', body }), invalidatesTags: ['ReportsQueue', 'ReportsStats', 'ReportsAnalytics'] }),
    postBulk: builder.mutation<any, { ids: string[]; action: string; value?: string }>({
      query: (body) => ({ url: '/bulk', method: 'POST', body }),
      invalidatesTags: (r, e, arg) => ['ReportsQueue', 'ReportsStats', ...arg.ids.map((id) => ({ type: 'ReportsDrawer' as const, id }))],
    }),
    postNote: builder.mutation<any, { id: string; body: string }>({
      query: ({ id, ...body }) => ({ url: `/${id}/notes`, method: 'POST', body }),
      invalidatesTags: (r, e, arg) => [{ type: 'ReportsDrawer', id: arg.id }],
    }),
    postDocument: builder.mutation<any, { id: string; name: string; format?: string; fileKey?: string; sizeKb?: number }>({
      query: ({ id, ...body }) => ({ url: `/${id}/documents`, method: 'POST', body }),
      invalidatesTags: (r, e, arg) => [{ type: 'ReportsDrawer', id: arg.id }],
    }),
  }),
});

export const {
  useGetQueueQuery, useGetStatsQuery, useGetAnalyticsQuery, useGetDrawerDetailsQuery, useGetMetadataQuery,
  usePostGenerateMutation, usePostBulkMutation, usePostNoteMutation, usePostDocumentMutation,
} = reportsApi;
