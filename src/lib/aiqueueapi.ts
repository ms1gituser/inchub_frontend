/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const aiQueueApi = createApi({
  reducerPath: 'aiQueueApi',
  baseQuery: fetchBaseQuery({
    baseUrl: (typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.hostname}:5000/api/v1/ai-queue`
      : 'http://127.0.0.1:5000/api/v1/ai-queue'),
    prepareHeaders: (headers) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('crm_access_token') : null;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['QueueItem', 'QueueKPI', 'QueueAnalytics'],
  endpoints: (builder) => ({
    getQueue: builder.query<any, any>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
        
        if (params.filters) {
          Object.entries(params.filters).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== '' && val !== 'All' && val !== 'All Statuses' && val !== 'All Managers' && val !== 'All Bookkeepers' && val !== 'All Industries' && val !== 'All Countries' && val !== 'All Types' && val !== 'All Years' && val !== 'All Exceptions' && val !== 'All Steps') {
              queryParams.append(key, val as string);
            }
          });
        }
        return {
          url: `/?${queryParams.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['QueueItem'],
    }),
    getQueueKpis: builder.query<any, void>({
      query: () => ({
        url: '/kpis',
        method: 'GET',
      }),
      providesTags: ['QueueKPI'],
    }),
    getQueueAnalytics: builder.query<any, void>({
      query: () => ({
        url: '/analytics',
        method: 'GET',
      }),
      providesTags: ['QueueAnalytics'],
    }),
    getQueueDrawerDetails: builder.query<any, string>({
      query: (id) => ({
        url: `/${id}/drawer`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'QueueItem', id }],
    }),
    addQueueItem: builder.mutation<any, any>({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['QueueItem', 'QueueKPI', 'QueueAnalytics'],
    }),
    updateQueueItem: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => ['QueueItem', 'QueueKPI', 'QueueAnalytics', { type: 'QueueItem', id }],
    }),
    bulkUpdateQueue: builder.mutation<any, { ids: string[]; action: string; value?: string }>({
      query: (body) => ({
        url: '/bulk',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['QueueItem', 'QueueKPI', 'QueueAnalytics'],
    }),
    importQueue: builder.mutation<any, { fileBase64: string; fileName: string }>({
      query: (body) => ({
        url: '/import',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['QueueItem', 'QueueKPI', 'QueueAnalytics'],
    }),
  }),
});

export const {
  useGetQueueQuery,
  useGetQueueKpisQuery,
  useGetQueueAnalyticsQuery,
  useGetQueueDrawerDetailsQuery,
  useAddQueueItemMutation,
  useUpdateQueueItemMutation,
  useBulkUpdateQueueMutation,
  useImportQueueMutation,
} = aiQueueApi;
