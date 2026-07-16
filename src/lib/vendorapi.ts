import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// ── Types ───────────────────────────────────────────────────────────────────

export interface VendorListItem {
  id: string;
  vendorId: string | null;
  name: string;
  category: string;
  categoryBg: string;
  categoryColor: string;
  country: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  terms: string;
  status: 'Active' | 'Pending' | 'Verified' | 'High Risk' | 'Blacklisted' | 'Archived';
  manager: string | null;
  vendorType: 'Local' | 'International';
  isPreferred: boolean;
  complianceScore: number;
  createdAt: string;
  outstandingBalance: number;
  totalSpend: number;
  lastTransaction: string | null;
}

export interface VendorFilters {
  category?: string;
  country?: string;
  terms?: string;
  manager?: string;
  status?: string;
  vendorType?: string;
  risk?: string;
  compliance?: string;
}

export interface VendorListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  filters?: VendorFilters;
}

export interface VendorListResponse {
  vendors: VendorListItem[];
  total: number;
  pages: number;
  page: number;
  limit: number;
}

export interface VendorKpis {
  total: number;
  active: number;
  pending: number;
  highRisk: number;
  blocked: number;
  verified: number;
  archived: number;
  local: number;
  international: number;
  complianceScore: number;
  outstandingPayables: number;
  totalSpend: number;
  thisMonthPurchases: number;
  avgPaymentTimeDays: number;
  contractsExpiringSoon: number;
  lastVendorAdded: string | null;
}

export interface VendorContact {
  id: string;
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  isPrimary: boolean;
  createdAt: string;
}

export interface VendorBankAccount {
  id: string;
  bankName: string;
  accountHolderName: string | null;
  accountNumber: string | null;
  iban: string | null;
  swiftCode: string | null;
  currency: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface VendorPurchaseOrder {
  id: string;
  poNumber: string;
  description: string | null;
  amount: number;
  currency: string;
  status: 'Draft' | 'Sent' | 'Approved' | 'Fulfilled' | 'Cancelled';
  orderDate: string;
  expectedDeliveryDate: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface VendorBill {
  id: string;
  billNumber: string;
  poId: string | null;
  billDate: string;
  dueDate: string | null;
  amount: number;
  taxAmount: number;
  currency: string;
  status: 'Unpaid' | 'Partial' | 'Paid' | 'Overdue';
  paidAmount: number;
  paymentDate: string | null;
  paymentMethod: string | null;
  createdAt: string;
}

export interface VendorDocument {
  id: string;
  documentName: string;
  documentType: 'Trade License' | 'Contract' | 'Tax Certificate' | 'Insurance' | 'Other';
  fileKey: string | null;
  expiryDate: string | null;
  uploadedBy: string | null;
  status: string;
  createdAt: string;
}

export interface VendorComplianceItem {
  id: string;
  itemName: string;
  isMandatory: boolean;
  status: 'Missing' | 'Uploaded' | 'Verified' | 'Rejected' | 'Expired';
  fileKey: string | null;
  expiresAt: string | null;
  verifiedBy: string | null;
  verifiedAt: string | null;
  notes: string | null;
}

export interface VendorNote {
  id: string;
  tag: 'internal' | 'finance' | 'compliance' | 'audit' | 'ai';
  content: string;
  createdBy: string | null;
  createdAt: string;
}

export interface VendorTransaction {
  id: string;
  date: string;
  amount: number;
  taxAmount: number;
  reference: string | null;
  fileKey: string | null;
  createdAt: string;
}

export interface VendorActivity {
  id: string;
  tableName: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  changedBy: string | null;
  changedAt: string;
  oldJson: Record<string, unknown> | null;
  newJson: Record<string, unknown> | null;
}

export interface VendorBillsSummary {
  totalBilled: number;
  totalPaid: number;
  outstanding: number;
  overdueCount: number;
}

export interface VendorDrawerDetails {
  profile: VendorListItem & { trn: string | null };
  contacts: VendorContact[];
  bankAccounts: VendorBankAccount[];
  purchaseOrders: VendorPurchaseOrder[];
  bills: VendorBill[];
  billsSummary: VendorBillsSummary;
  documents: VendorDocument[];
  complianceChecklist: VendorComplianceItem[];
  notes: VendorNote[];
  transactions: VendorTransaction[];
  activity: VendorActivity[];
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

// ── API ─────────────────────────────────────────────────────────────────────

export const vendorApi = createApi({
  reducerPath: 'vendorApi',
  baseQuery: fetchBaseQuery({
    baseUrl: (typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.hostname}:5000/api/v1/vendors`
      : 'http://127.0.0.1:5000/api/v1/vendors'),
    prepareHeaders: (headers) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('crm_access_token') : null;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Vendor', 'VendorKPI', 'VendorDrawer'],
  endpoints: (builder) => ({
    getVendors: builder.query<ApiEnvelope<VendorListResponse>, VendorListParams>({
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
        return { url: `/?${queryParams.toString()}`, method: 'GET' };
      },
      providesTags: ['Vendor'],
    }),

    getVendorKpis: builder.query<ApiEnvelope<VendorKpis>, void>({
      query: () => ({ url: '/kpis', method: 'GET' }),
      providesTags: ['VendorKPI'],
    }),

    addVendor: builder.mutation<ApiEnvelope<VendorListItem>, Partial<VendorListItem> & { name: string }>({
      query: (body) => ({ url: '/', method: 'POST', body }),
      invalidatesTags: ['Vendor', 'VendorKPI'],
    }),

    updateVendor: builder.mutation<ApiEnvelope<VendorListItem>, { id: string; body: Partial<VendorListItem> }>({
      query: ({ id, body }) => ({ url: `/${id}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, arg) => ['Vendor', 'VendorKPI', { type: 'VendorDrawer', id: arg.id }],
    }),

    deleteVendor: builder.mutation<ApiEnvelope<{ id: string }>, string>({
      query: (id) => ({ url: `/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Vendor', 'VendorKPI'],
    }),

    bulkUpdateVendors: builder.mutation<ApiEnvelope<{ ids: string[]; action: string }>, { ids: string[]; action: string; value?: unknown }>({
      query: (body) => ({ url: '/bulk', method: 'POST', body }),
      invalidatesTags: ['Vendor', 'VendorKPI'],
    }),

    importVendors: builder.mutation<ApiEnvelope<{ count: number }>, { file: string }>({
      query: (body) => ({ url: '/import', method: 'POST', body }),
      invalidatesTags: ['Vendor', 'VendorKPI'],
    }),

    getVendorDrawerDetails: builder.query<ApiEnvelope<VendorDrawerDetails>, string>({
      query: (id) => ({ url: `/${id}/drawer`, method: 'GET' }),
      providesTags: (_r, _e, id) => [{ type: 'VendorDrawer', id }],
    }),

    addVendorContact: builder.mutation<ApiEnvelope<VendorContact>, { vendorId: string; body: Partial<VendorContact> }>({
      query: ({ vendorId, body }) => ({ url: `/${vendorId}/contacts`, method: 'POST', body }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'VendorDrawer', id: arg.vendorId }],
    }),
    updateVendorContact: builder.mutation<ApiEnvelope<VendorContact>, { vendorId: string; contactId: string; body: Partial<VendorContact> }>({
      query: ({ vendorId, contactId, body }) => ({ url: `/${vendorId}/contacts/${contactId}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'VendorDrawer', id: arg.vendorId }],
    }),
    deleteVendorContact: builder.mutation<ApiEnvelope<{ id: string }>, { vendorId: string; contactId: string }>({
      query: ({ vendorId, contactId }) => ({ url: `/${vendorId}/contacts/${contactId}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'VendorDrawer', id: arg.vendorId }],
    }),

    addVendorBankAccount: builder.mutation<ApiEnvelope<VendorBankAccount>, { vendorId: string; body: Partial<VendorBankAccount> }>({
      query: ({ vendorId, body }) => ({ url: `/${vendorId}/bank-accounts`, method: 'POST', body }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'VendorDrawer', id: arg.vendorId }],
    }),
    updateVendorBankAccount: builder.mutation<ApiEnvelope<VendorBankAccount>, { vendorId: string; bankId: string; body: Partial<VendorBankAccount> }>({
      query: ({ vendorId, bankId, body }) => ({ url: `/${vendorId}/bank-accounts/${bankId}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'VendorDrawer', id: arg.vendorId }],
    }),
    deleteVendorBankAccount: builder.mutation<ApiEnvelope<{ id: string }>, { vendorId: string; bankId: string }>({
      query: ({ vendorId, bankId }) => ({ url: `/${vendorId}/bank-accounts/${bankId}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'VendorDrawer', id: arg.vendorId }],
    }),

    addPurchaseOrder: builder.mutation<ApiEnvelope<VendorPurchaseOrder>, { vendorId: string; body: Partial<VendorPurchaseOrder> }>({
      query: ({ vendorId, body }) => ({ url: `/${vendorId}/purchase-orders`, method: 'POST', body }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'VendorDrawer', id: arg.vendorId }],
    }),
    updatePurchaseOrder: builder.mutation<ApiEnvelope<VendorPurchaseOrder>, { vendorId: string; poId: string; body: Partial<VendorPurchaseOrder> }>({
      query: ({ vendorId, poId, body }) => ({ url: `/${vendorId}/purchase-orders/${poId}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'VendorDrawer', id: arg.vendorId }],
    }),

    addVendorBill: builder.mutation<ApiEnvelope<VendorBill>, { vendorId: string; body: Partial<VendorBill> }>({
      query: ({ vendorId, body }) => ({ url: `/${vendorId}/bills`, method: 'POST', body }),
      invalidatesTags: (_r, _e, arg) => ['Vendor', 'VendorKPI', { type: 'VendorDrawer', id: arg.vendorId }],
    }),
    recordBillPayment: builder.mutation<ApiEnvelope<VendorBill>, { vendorId: string; billId: string; body: { amount: number; paymentDate?: string; paymentMethod?: string } }>({
      query: ({ vendorId, billId, body }) => ({ url: `/${vendorId}/bills/${billId}/payment`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, arg) => ['Vendor', 'VendorKPI', { type: 'VendorDrawer', id: arg.vendorId }],
    }),

    uploadVendorDocument: builder.mutation<ApiEnvelope<VendorDocument>, { vendorId: string; body: Partial<VendorDocument> }>({
      query: ({ vendorId, body }) => ({ url: `/${vendorId}/documents`, method: 'POST', body }),
      invalidatesTags: (_r, _e, arg) => ['VendorKPI', { type: 'VendorDrawer', id: arg.vendorId }],
    }),
    deleteVendorDocument: builder.mutation<ApiEnvelope<{ id: string }>, { vendorId: string; docId: string }>({
      query: ({ vendorId, docId }) => ({ url: `/${vendorId}/documents/${docId}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, arg) => ['VendorKPI', { type: 'VendorDrawer', id: arg.vendorId }],
    }),

    updateComplianceItem: builder.mutation<ApiEnvelope<VendorComplianceItem>, { vendorId: string; itemId: string; body: Partial<VendorComplianceItem> }>({
      query: ({ vendorId, itemId, body }) => ({ url: `/${vendorId}/compliance/${itemId}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, arg) => ['Vendor', 'VendorKPI', { type: 'VendorDrawer', id: arg.vendorId }],
    }),

    addVendorNote: builder.mutation<ApiEnvelope<VendorNote>, { vendorId: string; body: { tag: string; content: string } }>({
      query: ({ vendorId, body }) => ({ url: `/${vendorId}/notes`, method: 'POST', body }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'VendorDrawer', id: arg.vendorId }],
    }),
  }),
});

export const {
  useGetVendorsQuery,
  useGetVendorKpisQuery,
  useAddVendorMutation,
  useUpdateVendorMutation,
  useDeleteVendorMutation,
  useBulkUpdateVendorsMutation,
  useImportVendorsMutation,
  useGetVendorDrawerDetailsQuery,
  useAddVendorContactMutation,
  useUpdateVendorContactMutation,
  useDeleteVendorContactMutation,
  useAddVendorBankAccountMutation,
  useUpdateVendorBankAccountMutation,
  useDeleteVendorBankAccountMutation,
  useAddPurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  useAddVendorBillMutation,
  useRecordBillPaymentMutation,
  useUploadVendorDocumentMutation,
  useDeleteVendorDocumentMutation,
  useUpdateComplianceItemMutation,
  useAddVendorNoteMutation,
} = vendorApi;
