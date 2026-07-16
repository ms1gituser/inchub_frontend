import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const qboConnectionsApi = createApi({
  reducerPath: 'qboConnectionsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: (typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.hostname}:5000/api/v1/qbo-connections`
      : 'http://127.0.0.1:5000/api/v1/qbo-connections'),
    prepareHeaders: (headers) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('crm_access_token') : null;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['QboQueue', 'QboStats', 'QboAnalytics', 'QboDrawer'],
  endpoints: (builder) => ({
    getQueue: builder.query<any, any>({
      query: (params) => {
        const q = new URLSearchParams();
        if (params?.page) q.append('page', params.page.toString());
        if (params?.limit) q.append('limit', params.limit.toString());
        if (params?.search) q.append('search', params.search);
        if (params?.status && params.status !== 'All') q.append('status', params.status);
        if (params?.manager && params.manager !== 'All') q.append('manager', params.manager);
        if (params?.syncType && params.syncType !== 'All') q.append('syncType', params.syncType);
        if (params?.environment && params.environment !== 'All') q.append('environment', params.environment);
        return { url: `/queue?${q.toString()}`, method: 'GET' };
      },
      providesTags: ['QboQueue'],
    }),
    getStats: builder.query<any, void>({ query: () => ({ url: '/stats', method: 'GET' }), providesTags: ['QboStats'] }),
    getAnalytics: builder.query<any, void>({ query: () => ({ url: '/analytics', method: 'GET' }), providesTags: ['QboAnalytics'] }),
    getDrawerDetails: builder.query<any, string>({
      query: (id) => ({ url: `/${id}/drawer`, method: 'GET' }),
      providesTags: (r, e, id) => [{ type: 'QboDrawer', id }],
    }),
    getMetadata: builder.query<any, void>({ query: () => ({ url: '/metadata', method: 'GET' }) }),
    postConnect: builder.mutation<any, { tenantId?: string; company?: string }>({
      query: (body) => ({ url: '/connect', method: 'POST', body }),
      invalidatesTags: ['QboQueue', 'QboStats'],
    }),
    postBulk: builder.mutation<any, { ids: string[]; action: string }>({
      query: (body) => ({ url: '/bulk', method: 'POST', body }),
      invalidatesTags: ['QboQueue', 'QboStats', 'QboAnalytics'],
    }),
    postNote: builder.mutation<any, { id: string; body: string; mentions?: string[] }>({
      query: ({ id, ...body }) => ({ url: `/${id}/notes`, method: 'POST', body }),
      invalidatesTags: (r, e, arg) => [{ type: 'QboDrawer', id: arg.id }],
    }),
    postDocument: builder.mutation<any, { id: string; name: string; type?: string; fileKey?: string; sizeKb?: number }>({
      query: ({ id, ...body }) => ({ url: `/${id}/documents`, method: 'POST', body }),
      invalidatesTags: (r, e, arg) => [{ type: 'QboDrawer', id: arg.id }],
    }),
    deleteDocument: builder.mutation<any, { docId: string; tenantId: string }>({
      query: ({ docId }) => ({ url: `/documents/${docId}`, method: 'DELETE' }),
      invalidatesTags: (r, e, arg) => [{ type: 'QboDrawer', id: arg.tenantId }],
    }),
  }),
});

export const {
  useGetQueueQuery, useGetStatsQuery, useGetAnalyticsQuery, useGetDrawerDetailsQuery, useGetMetadataQuery,
  usePostConnectMutation, usePostBulkMutation, usePostNoteMutation, usePostDocumentMutation, useDeleteDocumentMutation,
} = qboConnectionsApi;
