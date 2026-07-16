import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const ctApi = createApi({
  reducerPath: 'ctApi',
  baseQuery: fetchBaseQuery({
    baseUrl: (typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.hostname}:5000/api/v1/corporate-tax`
      : 'http://127.0.0.1:5000/api/v1/corporate-tax'),
    prepareHeaders: (headers) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('crm_access_token') : null;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['CtQueue', 'CtStats', 'CtAnalytics', 'CtDrawer'],
  endpoints: (builder) => ({
    getQueue: builder.query<any, any>({
      query: (params) => {
        const q = new URLSearchParams();
        if (params?.page) q.append('page', params.page.toString());
        if (params?.limit) q.append('limit', params.limit.toString());
        if (params?.search) q.append('search', params.search);
        if (params?.status) q.append('status', params.status);
        if (params?.client && params.client !== 'All') q.append('client', params.client);
        if (params?.reviewer && params.reviewer !== 'All') q.append('reviewer', params.reviewer);
        if (params?.priority && params.priority !== 'All') q.append('priority', params.priority);
        if (params?.entityType && params.entityType !== 'All') q.append('entityType', params.entityType);
        if (params?.risk && params.risk !== 'All') q.append('risk', params.risk);
        if (params?.year && params.year !== 'All') q.append('year', params.year);
        if (params?.period && params.period !== 'All') q.append('period', params.period);
        return { url: `/queue?${q.toString()}`, method: 'GET' };
      },
      providesTags: ['CtQueue'],
    }),
    getStats: builder.query<any, void>({ query: () => ({ url: '/stats', method: 'GET' }), providesTags: ['CtStats'] }),
    getAnalytics: builder.query<any, void>({ query: () => ({ url: '/analytics', method: 'GET' }), providesTags: ['CtAnalytics'] }),
    getDrawerDetails: builder.query<any, string>({
      query: (id) => ({ url: `/${id}/drawer`, method: 'GET' }),
      providesTags: (r, e, id) => [{ type: 'CtDrawer', id }],
    }),
    getMetadata: builder.query<any, void>({ query: () => ({ url: '/metadata', method: 'GET' }) }),
    postFile: builder.mutation<any, { id: string }>({ query: (body) => ({ url: '/file', method: 'POST', body }), invalidatesTags: ['CtQueue', 'CtStats', 'CtAnalytics'] }),
    postAmend: builder.mutation<any, { id: string }>({ query: (body) => ({ url: '/amend', method: 'POST', body }), invalidatesTags: ['CtQueue', 'CtStats', 'CtAnalytics'] }),
    addCtReturn: builder.mutation<any, any>({ query: (body) => ({ url: '/', method: 'POST', body }), invalidatesTags: ['CtQueue', 'CtStats', 'CtAnalytics'] }),
    postBulk: builder.mutation<any, { ids: string[]; action: string; value?: any }>({ query: (body) => ({ url: '/bulk', method: 'POST', body }), invalidatesTags: ['CtQueue', 'CtStats', 'CtAnalytics'] }),
    importReturns: builder.mutation<any, { file: string }>({ query: (body) => ({ url: '/import', method: 'POST', body }), invalidatesTags: ['CtQueue', 'CtStats', 'CtAnalytics'] }),
    postNote: builder.mutation<any, { id: string; body: string; mentions?: string[] }>({
      query: ({ id, ...body }) => ({ url: `/${id}/notes`, method: 'POST', body }),
      invalidatesTags: (r, e, arg) => [{ type: 'CtDrawer', id: arg.id }],
    }),
    postDocument: builder.mutation<any, { id: string; name: string; type?: string; fileKey?: string; sizeKb?: number }>({
      query: ({ id, ...body }) => ({ url: `/${id}/documents`, method: 'POST', body }),
      invalidatesTags: (r, e, arg) => [{ type: 'CtDrawer', id: arg.id }],
    }),
    deleteDocument: builder.mutation<any, { docId: string; returnId: string }>({
      query: ({ docId }) => ({ url: `/documents/${docId}`, method: 'DELETE' }),
      invalidatesTags: (r, e, arg) => [{ type: 'CtDrawer', id: arg.returnId }],
    }),
  }),
});

export const {
  useGetQueueQuery, useGetStatsQuery, useGetAnalyticsQuery, useGetDrawerDetailsQuery, useGetMetadataQuery,
  usePostFileMutation, usePostAmendMutation, useAddCtReturnMutation, usePostBulkMutation, useImportReturnsMutation,
  usePostNoteMutation, usePostDocumentMutation, useDeleteDocumentMutation,
} = ctApi;
