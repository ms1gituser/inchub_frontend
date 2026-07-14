import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface DashboardFilters {
  client?: string;
  manager?: string;
  bookkeeper?: string;
  country?: string;
  entityType?: string;
  industry?: string;
  dateRange?: string;
  fy?: string;
  compliance?: string;
  qbo?: string;
  months?: string;
}

export const accountingDashboardApi = createApi({
  reducerPath: 'accountingDashboardApi',
  baseQuery: fetchBaseQuery({
    baseUrl: (typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.hostname}:5000/api/v1/accounting-dashboard`
      : 'http://127.0.0.1:5000/api/v1/accounting-dashboard'),
    prepareHeaders: (headers) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('crm_access_token') : null;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getStats: builder.query<any, DashboardFilters>({
      query: (filters) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, val]) => {
          if (val !== undefined && val !== null && val !== '') {
            params.append(key, val);
          }
        });
        return {
          url: `/stats?${params.toString()}`,
          method: 'GET',
        };
      },
    }),
    getLists: builder.query<any, DashboardFilters>({
      query: (filters) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, val]) => {
          if (val !== undefined && val !== null && val !== '') {
            params.append(key, val);
          }
        });
        return {
          url: `/lists?${params.toString()}`,
          method: 'GET',
        };
      },
    }),
    getActivities: builder.query<any, { page: number; limit: number }>({
      query: ({ page, limit }) => ({
        url: `/activities?page=${page}&limit=${limit}`,
        method: 'GET',
      }),
    }),
    searchWorkspace: builder.query<any, string>({
      query: (queryStr) => ({
        url: `/search?q=${encodeURIComponent(queryStr)}`,
        method: 'GET',
      }),
    }),
    getFilterOptions: builder.query<{
      success: boolean;
      message: string;
      data: {
        clients: { id: string; name: string }[];
        managers: string[];
        bookkeepers: string[];
        countries: string[];
        entities: string[];
        industries: string[];
      };
    }, void>({
      query: () => ({
        url: '/filter-options',
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useGetStatsQuery,
  useGetListsQuery,
  useGetActivitiesQuery,
  useLazySearchWorkspaceQuery,
  useGetFilterOptionsQuery,
} = accountingDashboardApi;

