import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const vatApi = createApi({
  reducerPath: 'vatApi',
  baseQuery: fetchBaseQuery({
    baseUrl: (typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.hostname}:5000/api/v1/vat`
      : 'http://127.0.0.1:5000/api/v1/vat'),
    prepareHeaders: (headers) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('crm_access_token') : null;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['VatQueue', 'VatStats', 'VatAnalytics', 'VatDrawer'],
  endpoints: (builder) => ({
    getQueue: builder.query<any, any>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.status) queryParams.append('status', params.status);
        if (params.client && params.client !== 'All') queryParams.append('client', params.client);
        if (params.reviewer && params.reviewer !== 'All') queryParams.append('reviewer', params.reviewer);
        if (params.priority && params.priority !== 'All') queryParams.append('priority', params.priority);

        return {
          url: `/queue?${queryParams.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['VatQueue'],
    }),
    getStats: builder.query<any, void>({
      query: () => ({
        url: '/stats',
        method: 'GET',
      }),
      providesTags: ['VatStats'],
    }),
    getAnalytics: builder.query<any, void>({
      query: () => ({
        url: '/analytics',
        method: 'GET',
      }),
      providesTags: ['VatAnalytics'],
    }),
    getDrawerDetails: builder.query<any, string>({
      query: (id) => ({
        url: `/${id}/drawer`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'VatDrawer', id }],
    }),
    getMetadata: builder.query<any, void>({
      query: () => ({
        url: '/metadata',
        method: 'GET',
      }),
    }),
    postFile: builder.mutation<any, { id: string }>({
      query: (body) => ({
        url: '/file',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['VatQueue', 'VatStats', 'VatAnalytics'],
    }),
    postAmend: builder.mutation<any, { id: string }>({
      query: (body) => ({
        url: '/amend',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['VatQueue', 'VatStats', 'VatAnalytics'],
    }),
    addVatReturn: builder.mutation<any, any>({
      query: (body) => ({ url: '/', method: 'POST', body }),
      invalidatesTags: ['VatQueue', 'VatStats', 'VatAnalytics'],
    }),
    postBulk: builder.mutation<any, { ids: string[]; action: string; value?: any }>({
      query: (body) => ({ url: '/bulk', method: 'POST', body }),
      invalidatesTags: ['VatQueue', 'VatStats', 'VatAnalytics'],
    }),
    importReturns: builder.mutation<any, { file: string }>({
      query: (body) => ({ url: '/import', method: 'POST', body }),
      invalidatesTags: ['VatQueue', 'VatStats', 'VatAnalytics'],
    }),
    postNote: builder.mutation<any, { id: string; body: string; mentions?: string[] }>({
      query: ({ id, ...body }) => ({ url: `/${id}/notes`, method: 'POST', body }),
      invalidatesTags: (result, error, arg) => [{ type: 'VatDrawer', id: arg.id }],
    }),
    postDocument: builder.mutation<any, { id: string; name: string; type?: string; fileKey?: string; sizeKb?: number }>({
      query: ({ id, ...body }) => ({ url: `/${id}/documents`, method: 'POST', body }),
      invalidatesTags: (result, error, arg) => [{ type: 'VatDrawer', id: arg.id }],
    }),
    deleteDocument: builder.mutation<any, { docId: string; returnId: string }>({
      query: ({ docId }) => ({ url: `/documents/${docId}`, method: 'DELETE' }),
      invalidatesTags: (result, error, arg) => [{ type: 'VatDrawer', id: arg.returnId }],
    }),
  }),
});

export const {
  useGetQueueQuery,
  useGetStatsQuery,
  useGetAnalyticsQuery,
  useGetDrawerDetailsQuery,
  useGetMetadataQuery,
  usePostFileMutation,
  usePostAmendMutation,
  useAddVatReturnMutation,
  usePostBulkMutation,
  useImportReturnsMutation,
  usePostNoteMutation,
  usePostDocumentMutation,
  useDeleteDocumentMutation,
} = vatApi;
