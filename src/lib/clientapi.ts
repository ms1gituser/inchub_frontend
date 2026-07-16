/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const clientApi = createApi({
  reducerPath: 'clientApi',
  baseQuery: fetchBaseQuery({
    baseUrl: (typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.hostname}:5000/api/v1/clients`
      : 'http://127.0.0.1:5000/api/v1/clients'),
    prepareHeaders: (headers) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('crm_access_token') : null;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Client', 'ClientKPI'],
  endpoints: (builder) => ({
    getClients: builder.query<any, any>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
        
        if (params.filters) {
          Object.entries(params.filters).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== '' && val !== 'All') {
              queryParams.append(key, val as string);
            }
          });
        }
        return {
          url: `/?${queryParams.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['Client'],
    }),
    getClientKpis: builder.query<any, void>({
      query: () => ({
        url: '/kpis',
        method: 'GET',
      }),
      providesTags: ['ClientKPI'],
    }),
    addClient: builder.mutation<any, any>({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Client', 'ClientKPI'],
    }),
    updateClient: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Client', 'ClientKPI'],
    }),
    deleteClient: builder.mutation<any, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Client', 'ClientKPI'],
    }),
    bulkUpdateClients: builder.mutation<any, { ids: string[]; action: string; value: any }>({
      query: (body) => ({
        url: '/bulk',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Client', 'ClientKPI'],
    }),
    importClients: builder.mutation<any, { file: string }>({
      query: (body) => ({
        url: '/import',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Client', 'ClientKPI'],
    }),
    getClientDrawerDetails: builder.query<any, string>({
      query: (id) => ({
        url: `/${id}/drawer`,
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useGetClientsQuery,
  useGetClientKpisQuery,
  useAddClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
  useBulkUpdateClientsMutation,
  useImportClientsMutation,
  useGetClientDrawerDetailsQuery,
} = clientApi;
