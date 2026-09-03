'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Pagination from '@/components/ui/Pagination';
import {
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
  useGetSavedViewsQuery,
  usePostSavedViewMutation,
  useDeleteSavedViewMutation,
  useGetPreferencesQuery,
  usePutPreferencesMutation,
  useGetFailedJobsQuery,
  useRetryFailedJobMutation,
  useRetryAllFailedJobsMutation
} from '@/lib/reconciliationApi';
import { useAddVendorMutation } from '@/lib/vendorapi';


// ============================================================================
// types.ts
// ============================================================================
// Shared type definitions for the Reconciliation Center feature.
// All data here is mock-driven — no API contracts.

export type Role = 'Admin' | 'Manager' | 'Bookkeeper' | 'Reviewer' | 'Read Only';

export type PermissionAction =
  | 'approve'
  | 'reject'
  | 'postToQuickBooks'
  | 'delete'
  | 'archive'
  | 'merge'
  | 'split'
  | 'assignReviewer'
  | 'manageColumns'
  | 'export'
  | 'retryMatching'
  | 'retryValidation'
  | 'manualOverride'
  | 'importStatement'
  | 'createBatch'
  | 'addNotes';

export type ReconciliationStatus =
  | 'Pending'
  | 'Auto Matched'
  | 'Manual Review'
  | 'Difference Found'
  | 'Ready To Post'
  | 'Posted'
  | 'Exception'
  | 'Archived';

export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type QuickBooksStatus = 'Not Synced' | 'Pending' | 'Synced' | 'Failed';

export type DifferenceType =
  | 'None'
  | 'Amount Mismatch'
  | 'Date Mismatch'
  | 'Duplicate'
  | 'Missing Entry'
  | 'Currency Mismatch';

export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface ReconciliationTransaction {
  id: string;
  client: string;
  clientId: string;
  bankAccount: string;
  bank: string;
  statementReference: string;
  transactionDate: string;
  description: string;
  descriptionSub?: string;
  amount: number;
  currency: string;
  aiMatchScore: number | null;
  matchedEntry: string | null;
  difference: number;
  differenceType: DifferenceType;
  status: ReconciliationStatus;
  assignedReviewer: string | null;
  manager: string;
  bookkeeper: string;
  quickBooksStatus: QuickBooksStatus;
  priority: Priority;
  riskLevel: RiskLevel;
  lastUpdated: string;
  financialYear: string;
  month: string;
  tags: string[];
  archived: boolean;
  slaHours: number;
  processingMinutes: number;
}

export interface ActivityLogEntry {
  id: string;
  transactionId: string;
  timestamp: string;
  user: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  ipAddress: string;
  system: string;
}

export type TimelineStage =
  | 'Created'
  | 'Imported'
  | 'OCR'
  | 'AI Matching'
  | 'Validation'
  | 'Manual Review'
  | 'Reviewer Assigned'
  | 'Approved'
  | 'Posted QB'
  | 'Completed'
  | 'Archived';

export interface TimelineEvent {
  stage: TimelineStage;
  status: 'done' | 'current' | 'pending' | 'skipped';
  timestamp: string | null;
  actor?: string;
  note?: string;
}

export interface ReconciliationDocument {
  id: string;
  name: string;
  type: 'Bank Statement' | 'Receipt' | 'Invoice' | 'Supporting Doc';
  uploadedAt: string;
  uploadedBy: string;
  sizeKb: number;
}

export interface ReconciliationNote {
  id: string;
  author: string;
  timestamp: string;
  body: string;
  mentions: string[];
  attachments: string[];
}

export interface SuggestedMatch {
  id: string;
  ledgerEntry: string;
  confidence: number;
  amount: number;
  date: string;
  reasonBreakdown: { label: string; score: number }[];
  isDuplicateRisk: boolean;
}

export interface ValidationCheck {
  key: string;
  label: string;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  detail?: string;
  suggestedFix?: string;
}

export interface FilterState {
  search: string;
  client: string;
  manager: string;
  bookkeeper: string;
  bank: string;
  financialYear: string;
  month: string;
  currency: string;
  status: string;
  differenceType: string;
  quickBooksStatus: string;
  priority: string;
  reviewer: string;
  dateStart: string;
  dateEnd: string;
  amountMin: string;
  amountMax: string;
  tags: string[];
}

export interface SavedView {
  id: string;
  name: string;
  filters: FilterState;
  createdAt: string;
}

export interface ColumnDef {
  key: string;
  label: string;
  width: number;
  minWidth: number;
  visible: boolean;
  sortable: boolean;
}

export type Density = 'compact' | 'comfortable' | 'spacious';

export interface ToastState {
  id: number;
  message: string;
  tone: 'success' | 'error' | 'warning' | 'info';
  actionLabel?: string;
  onAction?: () => void;
}

export interface ConfirmationConfig {
  title: string;
  message: string;
  confirmLabel: string;
  tone: 'danger' | 'warning' | 'neutral';
  onConfirm: () => void;
}

export type BulkActionKey =
  | 'assignReviewer'
  | 'approve'
  | 'reject'
  | 'retryMatching'
  | 'merge'
  | 'moveToException'
  | 'exportBatch'
  | 'postToQuickBooks'
  | 'archive'
  | 'delete'
  | 'addNotes'
  | 'clearSelection';

export type RowActionKey =
  | 'openDrawer'
  | 'viewTimeline'
  | 'previewTransactions'
  | 'aiMatchAnalysis'
  | 'manualMatch'
  | 'splitTransaction'
  | 'mergeTransaction'
  | 'postToQuickBooks'
  | 'export'
  | 'notes'
  | 'auditLog'
  | 'archive'
  | 'delete'
  | 'duplicate'
  | 'clone'
  | 'downloadPdf'
  | 'downloadCsv'
  | 'openClient'
  | 'jumpToAiQueue'
  | 'jumpToVat'
  | 'jumpToQuickBooks'
  | 'copyTransactionId'
  | 'autoCreateVendor';

export type DrawerTabKey =
  | 'overview'
  | 'transactions'
  | 'aiMatching'
  | 'manualMatch'
  | 'validation'
  | 'timeline'
  | 'activity'
  | 'documents'
  | 'quickBooksSync'
  | 'notes';

export interface PersistedState {
  filters: FilterState;
  statusChip: string;
  sortKey: string;
  sortDir: 'asc' | 'desc';
  columnWidths: Record<string, number>;
  hiddenColumns: string[];
  columnOrder: string[];
  density: Density;
  pageSize: number;
  lastDrawerTab: DrawerTabKey;
}


// ============================================================================
// drawer/types.ts
// ============================================================================

export interface DrawerActionHandlers {
  requestApprove: (tx: ReconciliationTransaction) => void;
  requestReject: (tx: ReconciliationTransaction) => void;
  requestChanges: (tx: ReconciliationTransaction) => void;
  requestPostToQuickBooks: (tx: ReconciliationTransaction) => void;
  requestRetryMatching: (tx: ReconciliationTransaction) => void;
  requestRetryValidation: (tx: ReconciliationTransaction) => void;
  requestManualOverride: (tx: ReconciliationTransaction, checkLabel: string) => void;
  openManualMatch: (tx: ReconciliationTransaction) => void;
  openSplit: (tx: ReconciliationTransaction) => void;
  openMerge: (tx: ReconciliationTransaction) => void;
  openExceptionDetails: (tx: ReconciliationTransaction, problem?: string) => void;
  openDifferenceExplanation: (tx: ReconciliationTransaction) => void;
  openAssignReviewer: (tx: ReconciliationTransaction) => void;
  openAddNotes: (tx: ReconciliationTransaction) => void;
  openAuditExport: (tx: ReconciliationTransaction) => void;
  openRetryFailedJobs: (tx: ReconciliationTransaction) => void;
  acceptSuggestion: (tx: ReconciliationTransaction, matchId: string) => void;
  rejectSuggestion: (tx: ReconciliationTransaction, matchId: string) => void;
  autoCreateVendor: (tx: ReconciliationTransaction) => void;
}

export interface DrawerTabProps {
  tx: ReconciliationTransaction;
  actions: DrawerActionHandlers;
}


// ============================================================================
// permissions.ts
// ============================================================================

export const ROLES: Role[] = ['Admin', 'Manager', 'Bookkeeper', 'Reviewer', 'Read Only'];

export const ROLE_BADGE_COLORS: Record<Role, { bg: string; color: string; border: string }> = {
  Admin: { bg: 'rgba(232,118,10,0.1)', color: '#E8760A', border: 'rgba(232,118,10,0.25)' },
  Manager: { bg: 'rgba(42,22,40,0.08)', color: '#2A1628', border: 'rgba(42,22,40,0.18)' },
  Bookkeeper: { bg: '#E6F4EA', color: '#137333', border: 'rgba(19,115,51,0.2)' },
  Reviewer: { bg: '#E8F0FE', color: '#1A56C4', border: 'rgba(26,86,196,0.2)' },
  'Read Only': { bg: 'rgba(42,22,40,0.05)', color: 'rgba(42,22,40,0.55)', border: 'rgba(42,22,40,0.12)' },
};

// Actions fully hidden (not just disabled) for a given role.
const HIDDEN: Record<Role, PermissionAction[]> = {
  Admin: [],
  Manager: [],
  Bookkeeper: ['delete', 'manageColumns'],
  Reviewer: ['delete', 'manageColumns', 'importStatement', 'createBatch'],
  'Read Only': [
    'approve', 'reject', 'postToQuickBooks', 'delete', 'archive', 'merge', 'split',
    'assignReviewer', 'manageColumns', 'retryMatching', 'retryValidation', 'manualOverride',
    'importStatement', 'createBatch', 'addNotes',
  ],
};

// Actions visible but disabled (with a tooltip) for a given role.
const DISABLED: Record<Role, PermissionAction[]> = {
  Admin: [],
  Manager: [],
  Bookkeeper: ['postToQuickBooks', 'manualOverride', 'delete'],
  Reviewer: ['postToQuickBooks', 'archive', 'merge', 'split', 'manualOverride'],
  'Read Only': ['export'],
};

export function isHidden(role: Role, action: PermissionAction): boolean {
  return HIDDEN[role].includes(action);
}

export function isDisabled(role: Role, action: PermissionAction): boolean {
  return DISABLED[role].includes(action);
}

export function can(role: Role, action: PermissionAction): boolean {
  return !isHidden(role, action) && !isDisabled(role, action);
}

export function restrictionReason(role: Role, action: PermissionAction): string | null {
  if (isDisabled(role, action)) {
    return `${role}s require Admin or Manager approval to perform this action.`;
  }
  return null;
}


// ============================================================================
// mockData.ts
// ============================================================================

// Fixed reference "today" so the mock dataset is deterministic across server/client render
// (avoids hydration mismatches that Math.random()/Date.now() would cause in a 'use client' tree).
export const TODAY_ISO = '2026-07-08';

export const CLIENTS: { id: string; name: string }[] = [
  { id: 'c1', name: 'ABC Trading LLC' },
  { id: 'c2', name: 'XYZ Holdings Limited' },
  { id: 'c3', name: 'Delta Properties FZCO' },
  { id: 'c4', name: 'Alpha Tech FZCO' },
  { id: 'c5', name: 'Beta Industries LLC' },
  { id: 'c6', name: 'Gamma Solutions FZCO' },
  { id: 'c7', name: 'Nova Hospitality LLC' },
  { id: 'c8', name: 'Prime Consultants FZCO' },
  { id: 'c9', name: 'Sigma Services LLC' },
  { id: 'c10', name: 'Vertex Enterprises LLC' },
  { id: 'c11', name: 'Orion Retail Group LLC' },
  { id: 'c12', name: 'Falcon Logistics FZCO' },
];

export const MANAGERS = ['Sara Al Marri', 'James Whitfield', 'Fatima Noor', 'David Chen'];
export const BOOKKEEPERS = ['Priya Nair', 'Omar Haddad', 'Lucia Ferreira', 'Ahmed Zaid', 'Kevin Park'];
export const REVIEWERS = ['Priya Nair', 'Omar Haddad', 'Lucia Ferreira', 'Ahmed Zaid', 'Kevin Park', 'Unassigned'];
export const BANKS = ['Emirates NBD', 'ADCB', 'Mashreq Bank', 'FAB', 'RAKBank', 'Dubai Islamic Bank'];
export const CURRENCIES = ['AED', 'USD', 'EUR', 'GBP'];
export const FINANCIAL_YEARS = ['FY2024', 'FY2025', 'FY2026'];
export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const TAGS = ['VIP', 'High Value', 'Recurring', 'New Client', 'Flagged', 'Needs Attention'];

export const STATUSES: ReconciliationStatus[] = [
  'Pending', 'Auto Matched', 'Manual Review', 'Difference Found', 'Ready To Post', 'Posted', 'Exception', 'Archived',
];
export const PRIORITIES: Priority[] = ['Low', 'Medium', 'High', 'Urgent'];
export const QB_STATUSES: QuickBooksStatus[] = ['Not Synced', 'Pending', 'Synced', 'Failed'];
export const RISK_LEVELS: RiskLevel[] = ['Low', 'Medium', 'High'];
export const DIFFERENCE_TYPES: DifferenceType[] = ['None', 'Amount Mismatch', 'Date Mismatch', 'Duplicate', 'Missing Entry', 'Currency Mismatch'];

export const STATUS_CHIPS: { key: string; label: string; status?: ReconciliationStatus }[] = [
  { key: 'All', label: 'All' },
  { key: 'Pending', label: 'Pending', status: 'Pending' },
  { key: 'Auto Matched', label: 'Auto Matched', status: 'Auto Matched' },
  { key: 'Manual Review', label: 'Manual Review', status: 'Manual Review' },
  { key: 'Difference Found', label: 'Difference Found', status: 'Difference Found' },
  { key: 'Ready To Post', label: 'Ready To Post', status: 'Ready To Post' },
  { key: 'Posted', label: 'Posted', status: 'Posted' },
  { key: 'Exceptions', label: 'Exceptions', status: 'Exception' },
  { key: 'Archived', label: 'Archived', status: 'Archived' },
];

const DESCRIPTIONS: { title: string; sub: string }[] = [
  { title: 'Office Rent Payment', sub: 'INV-2026-045' },
  { title: 'Customer Payment Received', sub: 'PMT-2026-231' },
  { title: 'Etisalat Internet & Comms Bill', sub: 'BILL-2026-098' },
  { title: 'Amazon Web Services Subscription', sub: 'AMZ-884211' },
  { title: 'Vendor Payment - Office Supplies', sub: 'PMT-2026-210' },
  { title: 'Stripe Payout Settlement', sub: 'STR-2026-1882' },
  { title: 'Salary Account Transfer', sub: 'TRF-2026-551' },
  { title: 'DEWA Utility Bill', sub: 'BILL-2026-122' },
  { title: 'Freight & Logistics Charges', sub: 'FRT-2026-330' },
  { title: 'Client Retainer Invoice', sub: 'INV-2026-071' },
  { title: 'Insurance Premium Payment', sub: 'INS-2026-014' },
  { title: 'Software License Renewal', sub: 'LIC-2026-207' },
];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function seededDate(index: number) {
  const day = 1 + (index % 28);
  const month = 1 + ((index * 3) % 7); // Jan-Jul 2026
  return `2026-${pad(month)}-${pad(day)}`;
}

function seededDateTime(index: number, offsetHours: number) {
  const hour = (8 + ((index * 7) + offsetHours) % 10);
  return `${seededDate(index)}T${pad(hour)}:${pad((index * 11) % 60)}:00`;
}

const TX_COUNT = 48;

export const TRANSACTIONS: ReconciliationTransaction[] = Array.from({ length: TX_COUNT }, (_, i) => {
  const client = CLIENTS[i % CLIENTS.length];
  const desc = DESCRIPTIONS[i % DESCRIPTIONS.length];
  const status = STATUSES[i % STATUSES.length];
  const priority = PRIORITIES[(i * 3) % PRIORITIES.length];
  const bank = BANKS[(i * 2) % BANKS.length];
  const qbStatus = QB_STATUSES[(i * 5) % QB_STATUSES.length];
  const riskLevel = RISK_LEVELS[(i * 4) % RISK_LEVELS.length];
  const diffType = status === 'Difference Found' || status === 'Exception'
    ? DIFFERENCE_TYPES[1 + (i % (DIFFERENCE_TYPES.length - 1))]
    : 'None';
  const amount = 500 + ((i * 137) % 24500);
  const difference = diffType === 'None' ? 0 : Math.round(amount * (0.02 + (i % 5) * 0.015));
  const aiMatchScore = status === 'Auto Matched' ? 92 + (i % 8)
    : status === 'Manual Review' ? 55 + (i % 30)
      : status === 'Pending' ? null
        : status === 'Exception' ? 20 + (i % 25)
          : 70 + (i % 25);
  const isToday = i % 9 === 0;
  const lastUpdated = isToday ? `${TODAY_ISO}T${pad(9 + (i % 8))}:${pad((i * 13) % 60)}:00` : seededDateTime(i, 2);

  const tx: ReconciliationTransaction = {
    id: `RC-${1000 + i}`,
    client: client.name,
    clientId: client.id,
    bankAccount: `${bank} •••• ${1000 + (i * 37) % 8999}`,
    bank,
    statementReference: `STMT-2026-${String(500 + i).padStart(4, '0')}`,
    transactionDate: seededDate(i),
    description: desc.title,
    descriptionSub: desc.sub,
    amount,
    currency: CURRENCIES[i % CURRENCIES.length],
    aiMatchScore,
    matchedEntry: aiMatchScore && aiMatchScore > 40 ? `${desc.sub} — Ledger Entry #${4000 + i}` : null,
    difference: status === 'Posted' || status === 'Auto Matched' ? 0 : difference,
    differenceType: status === 'Posted' || status === 'Auto Matched' ? 'None' : diffType,
    status,
    assignedReviewer: status === 'Pending' ? null : REVIEWERS[(i * 3) % (REVIEWERS.length - 1)],
    manager: MANAGERS[i % MANAGERS.length],
    bookkeeper: BOOKKEEPERS[i % BOOKKEEPERS.length],
    quickBooksStatus: status === 'Posted' ? 'Synced' : status === 'Ready To Post' ? 'Pending' : qbStatus,
    priority,
    riskLevel,
    lastUpdated,
    financialYear: 'FY2026',
    month: MONTHS[(1 + (i * 3) % 7)],
    tags: TAGS.filter((_, ti) => (i + ti) % 4 === 0),
    archived: status === 'Archived',
    slaHours: 4 + (i % 20),
    processingMinutes: 3 + (i % 45),
  };
  return tx;
});

// ---------- Derived, per-transaction drawer content (generated on demand, deterministic) ----------

export function getTimelineForTransaction(tx: ReconciliationTransaction): TimelineEvent[] {
  const stages: TimelineStage[] = [
    'Created', 'Imported', 'OCR', 'AI Matching', 'Validation', 'Manual Review',
    'Reviewer Assigned', 'Approved', 'Posted QB', 'Completed', 'Archived',
  ];
  const statusProgress: Record<ReconciliationStatus, number> = {
    Pending: 2,
    'Auto Matched': 4,
    'Manual Review': 5,
    'Difference Found': 5,
    'Ready To Post': 7,
    Posted: 9,
    Exception: 5,
    Archived: 10,
  };
  const reached = statusProgress[tx.status];
  return stages.map((stage, idx) => ({
    stage,
    status: idx < reached ? 'done' : idx === reached ? 'current' : 'pending',
    timestamp: idx <= reached ? seededDateTime(idx + tx.id.length, idx) : null,
    actor: idx <= reached ? (idx < 3 ? 'System' : tx.assignedReviewer || tx.bookkeeper) : undefined,
    note: idx === reached ? `Currently at ${stage} stage.` : undefined,
  }));
}

export function getActivityLogForTransaction(tx: ReconciliationTransaction): ActivityLogEntry[] {
  const base = tx.id.charCodeAt(tx.id.length - 1);
  const entries: Omit<ActivityLogEntry, 'id' | 'transactionId'>[] = [
    { timestamp: seededDateTime(base, 1), user: 'System', action: 'Transaction imported from bank statement', oldValue: undefined, newValue: tx.status === 'Pending' ? 'Pending' : undefined, ipAddress: '10.20.4.11', system: 'Bank Import Engine' },
    { timestamp: seededDateTime(base, 2), user: 'AI Matching Engine', action: 'AI match score computed', oldValue: '—', newValue: tx.aiMatchScore ? `${tx.aiMatchScore}%` : 'No match', ipAddress: '10.20.4.20', system: 'AI Bookkeeping Engine' },
    { timestamp: seededDateTime(base, 3), user: tx.bookkeeper, action: 'Reviewed transaction detail', oldValue: undefined, newValue: undefined, ipAddress: '192.168.1.44', system: 'Web App' },
    { timestamp: tx.lastUpdated, user: tx.assignedReviewer || tx.bookkeeper, action: `Status updated to ${tx.status}`, oldValue: 'Pending', newValue: tx.status, ipAddress: '192.168.1.44', system: 'Web App' },
  ];
  return entries.map((e, idx) => ({ ...e, id: `${tx.id}-log-${idx}`, transactionId: tx.id }));
}

export function getSuggestedMatchesForTransaction(tx: ReconciliationTransaction): SuggestedMatch[] {
  if (tx.aiMatchScore === null) return [];
  const primary: SuggestedMatch = {
    id: `${tx.id}-sm-0`,
    ledgerEntry: tx.matchedEntry || `Ledger Entry #${4000}`,
    confidence: tx.aiMatchScore,
    amount: tx.amount,
    date: tx.transactionDate,
    reasonBreakdown: [
      { label: 'Amount Match', score: Math.min(100, tx.aiMatchScore + 5) },
      { label: 'Date Proximity', score: Math.max(40, tx.aiMatchScore - 8) },
      { label: 'Vendor / Payee Match', score: Math.max(35, tx.aiMatchScore - 15) },
      { label: 'Reference Match', score: Math.max(20, tx.aiMatchScore - 25) },
      { label: 'Description Similarity', score: Math.max(30, tx.aiMatchScore - 12) },
      { label: 'Category Match', score: Math.max(10, tx.aiMatchScore - 5) },
    ],
    isDuplicateRisk: tx.differenceType === 'Duplicate',
  };
  const secondary: SuggestedMatch = {
    id: `${tx.id}-sm-1`,
    ledgerEntry: `Ledger Entry #${4100} (alternate)`,
    confidence: Math.max(10, tx.aiMatchScore - 35),
    amount: tx.amount - tx.difference,
    date: tx.transactionDate,
    reasonBreakdown: [
      { label: 'Amount Match', score: 60 },
      { label: 'Date Proximity', score: 45 },
      { label: 'Vendor / Payee Match', score: 30 },
      { label: 'Reference Match', score: 20 },
      { label: 'Description Similarity', score: 40 },
      { label: 'Category Match', score: 50 },
    ],
    isDuplicateRisk: false,
  };
  return tx.aiMatchScore < 70 ? [primary, secondary] : [primary];
}

export function getValidationChecksForTransaction(tx: ReconciliationTransaction): ValidationCheck[] {
  const checks: ValidationCheck[] = [
    { key: 'debitCredit', label: 'Debit / Credit Check', status: 'pass', detail: 'Debit and credit totals balance.' },
    { key: 'duplicate', label: 'Duplicate Check', status: tx.differenceType === 'Duplicate' ? 'fail' : 'pass', detail: tx.differenceType === 'Duplicate' ? 'A near-identical transaction was found in the same statement period.' : 'No duplicate transactions detected.', suggestedFix: tx.differenceType === 'Duplicate' ? 'Merge with the duplicate entry or mark this one as an exception.' : undefined },
    { key: 'amountDiff', label: 'Amount Difference', status: tx.difference > 0 ? 'warning' : 'pass', detail: tx.difference > 0 ? `Difference of ${tx.currency} ${tx.difference.toLocaleString()} detected against the matched ledger entry.` : 'Amounts reconcile exactly.', suggestedFix: tx.difference > 0 ? 'Review the ledger entry or apply a manual adjustment.' : undefined },
    { key: 'currency', label: 'Currency Check', status: tx.differenceType === 'Currency Mismatch' ? 'fail' : 'pass', detail: tx.differenceType === 'Currency Mismatch' ? `Statement currency does not match ledger currency (${tx.currency}).` : 'Currencies match.' },
    { key: 'openingBalance', label: 'Opening Balance Check', status: 'pass', detail: 'Opening balance carried forward correctly from prior period.' },
    { key: 'closingBalance', label: 'Closing Balance Check', status: tx.status === 'Exception' ? 'warning' : 'pass', detail: tx.status === 'Exception' ? 'Closing balance variance pending review.' : 'Closing balance matches statement total.' },
    { key: 'quickbooks', label: 'QuickBooks Validation', status: tx.quickBooksStatus === 'Failed' ? 'fail' : tx.quickBooksStatus === 'Synced' ? 'pass' : 'pending', detail: tx.quickBooksStatus === 'Failed' ? 'QuickBooks rejected the sync — account mapping mismatch.' : tx.quickBooksStatus === 'Synced' ? 'Successfully synced to QuickBooks Online.' : 'Awaiting QuickBooks sync.', suggestedFix: tx.quickBooksStatus === 'Failed' ? 'Re-map the QuickBooks account and retry.' : undefined },
  ];
  return checks;
}

export function getDocumentsForTransaction(tx: ReconciliationTransaction): ReconciliationDocument[] {
  const base = tx.id.charCodeAt(tx.id.length - 1);
  return [
    { id: `${tx.id}-doc-0`, name: `${tx.statementReference}.pdf`, type: 'Bank Statement', uploadedAt: seededDateTime(base, 0), uploadedBy: 'System', sizeKb: 240 + (base % 300) },
    { id: `${tx.id}-doc-1`, name: `${tx.descriptionSub || 'receipt'}.pdf`, type: 'Receipt', uploadedAt: seededDateTime(base, 1), uploadedBy: tx.bookkeeper, sizeKb: 80 + (base % 150) },
  ];
}

export function getNotesForTransaction(tx: ReconciliationTransaction): ReconciliationNote[] {
  if (tx.status === 'Pending' || tx.status === 'Auto Matched') return [];
  const base = tx.id.charCodeAt(tx.id.length - 1);
  return [
    {
      id: `${tx.id}-note-0`,
      author: tx.bookkeeper,
      timestamp: seededDateTime(base, 3),
      body: `Flagged for review due to ${tx.differenceType !== 'None' ? tx.differenceType.toLowerCase() : 'status change'}. @${tx.assignedReviewer || 'Unassigned'} please confirm.`,
      mentions: tx.assignedReviewer ? [tx.assignedReviewer] : [],
      attachments: [],
    },
  ];
}

// ---------- Table column definitions ----------

export const DEFAULT_COLUMNS: ColumnDef[] = [
  { key: 'client', label: 'Client', width: 200, minWidth: 140, visible: true, sortable: true },
  { key: 'bankAccount', label: 'Bank Account', width: 180, minWidth: 140, visible: true, sortable: false },
  { key: 'statementReference', label: 'Statement Reference', width: 170, minWidth: 130, visible: true, sortable: true },
  { key: 'transactionDate', label: 'Transaction Date', width: 140, minWidth: 110, visible: true, sortable: true },
  { key: 'description', label: 'Description', width: 220, minWidth: 160, visible: true, sortable: false },
  { key: 'amount', label: 'Amount', width: 130, minWidth: 100, visible: true, sortable: true },
  { key: 'aiMatchScore', label: 'AI Match Score', width: 140, minWidth: 110, visible: true, sortable: true },
  { key: 'matchedEntry', label: 'Matched Entry', width: 200, minWidth: 140, visible: true, sortable: false },
  { key: 'difference', label: 'Difference', width: 130, minWidth: 100, visible: true, sortable: true },
  { key: 'status', label: 'Status', width: 150, minWidth: 120, visible: true, sortable: true },
  { key: 'assignedReviewer', label: 'Assigned Reviewer', width: 160, minWidth: 130, visible: true, sortable: false },
  { key: 'quickBooksStatus', label: 'QuickBooks', width: 130, minWidth: 110, visible: true, sortable: true },
  { key: 'priority', label: 'Priority', width: 110, minWidth: 90, visible: true, sortable: true },
  { key: 'lastUpdated', label: 'Last Updated', width: 160, minWidth: 130, visible: true, sortable: true },
];


// ============================================================================
// context.tsx
// ============================================================================


interface ReconciliationContextValue {
  role: Role;
  setRole: (r: Role) => void;
  toasts: ToastState[];
  pushToast: (t: Omit<ToastState, 'id'>) => void;
  dismissToast: (id: number) => void;
  confirmation: ConfirmationConfig | null;
  requestConfirmation: (cfg: ConfirmationConfig) => void;
  closeConfirmation: () => void;
  isProcessing: boolean;
  setIsProcessing: (b: boolean) => void;
  isOffline: boolean;
  setIsOffline: (b: boolean) => void;
}

const ReconciliationContext = createContext<ReconciliationContextValue | null>(null);

export function ReconciliationProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('Admin');
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const [confirmation, setConfirmation] = useState<ConfirmationConfig | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const toastIdRef = useRef(0);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback((t: Omit<ToastState, 'id'>) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { ...t, id }]);
    const duration = t.actionLabel ? 6000 : 3500;
    setTimeout(() => dismissToast(id), duration);
  }, [dismissToast]);

  const requestConfirmation = useCallback((cfg: ConfirmationConfig) => setConfirmation(cfg), []);
  const closeConfirmation = useCallback(() => setConfirmation(null), []);

  return (
    <ReconciliationContext.Provider
      value={{
        role, setRole,
        toasts, pushToast, dismissToast,
        confirmation, requestConfirmation, closeConfirmation,
        isProcessing, setIsProcessing,
        isOffline, setIsOffline,
      }}
    >
      {children}
    </ReconciliationContext.Provider>
  );
}

export function useReconciliation() {
  const ctx = useContext(ReconciliationContext);
  if (!ctx) throw new Error('useReconciliation must be used within ReconciliationProvider');
  return ctx;
}


// ============================================================================
// shared/FocusTrap.tsx
// ============================================================================


interface FocusTrapProps {
  children: React.ReactNode;
  onEscape?: () => void;
  active?: boolean;
}

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

function FocusTrap({ children, onEscape, active = true }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;
    previouslyFocused.current = document.activeElement as HTMLElement;
    const container = containerRef.current;
    const focusable = container?.querySelectorAll<HTMLElement>(FOCUSABLE);
    focusable?.[0]?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        e.stopPropagation();
        onEscape();
        return;
      }
      if (e.key !== 'Tab' || !container) return;
      const items = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      previouslyFocused.current?.focus?.();
    };
  }, [active, onEscape]);

  return <div ref={containerRef} style={{ display: 'contents' }}>{children}</div>;
}


// ============================================================================
// shared/ModalShell.tsx
// ============================================================================


interface ModalShellProps {
  onClose: () => void;
  eyebrow: string;
  titlePlain: string;
  titleAccent: string;
  maxWidth?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  bodyStyle?: React.CSSProperties;
}

function ModalShell({ onClose, eyebrow, titlePlain, titleAccent, maxWidth = '540px', footer, children, bodyStyle }: ModalShellProps) {
  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(42,22,40,0.45)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
    >
      <FocusTrap onEscape={onClose}>
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${titlePlain} ${titleAccent}`}
          onClick={(e) => e.stopPropagation()}
          style={{ background: '#ffffff', borderRadius: '24px', width: '100%', maxWidth, maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(42,22,40,0.2)', overflow: 'hidden', fontFamily: 'var(--font-sans), Inter, sans-serif' }}
        >
          {/* Header */}
          <div style={{ padding: '2rem 2rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(42,22,40,0.4)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{eyebrow}</p>
              <h2 style={{ margin: '0.2rem 0 0', fontSize: '1.625rem', fontWeight: 300, color: '#2A1628', fontFamily: 'var(--font-serif), Georgia, serif' }}>
                {titlePlain} <span style={{ fontStyle: 'italic', color: '#E8760A' }}>{titleAccent}</span>
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              style={{ background: 'rgba(42,22,40,0.04)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2A1628', flexShrink: 0 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
          
          <div style={{ width: '100%', height: '1px', background: 'rgba(42,22,40,0.06)' }} />

          {/* Body */}
          <div className="hide-scrollbar" style={{ padding: '1.5rem 2rem', overflowY: 'auto', flex: 1, ...bodyStyle }}>
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div style={{ padding: '1rem 2rem 1.5rem', borderTop: '1px solid rgba(42,22,40,0.06)', background: '#FAF8F5', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexShrink: 0 }}>
              {footer}
            </div>
          )}
        </div>
      </FocusTrap>
    </div>
  );
}


// ============================================================================
// shared/DrawerKit.tsx
// ============================================================================


export function EyebrowLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ margin: '0 0 0.6rem', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
      {children}
    </p>
  );
}

export function DrawerSection({ title, children, action }: { title?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{ background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '10px', padding: '1rem' }}>
      {title && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <EyebrowLabel>{title}</EyebrowLabel>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function KeyValueRow({ label, value, valueColor }: { label: string; value: React.ReactNode; valueColor?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', padding: '0.4rem 0' }}>
      <span style={{ color: 'rgba(42,22,40,0.55)' }}>{label}</span>
      <span style={{ fontWeight: 600, color: valueColor || '#2A1628', textAlign: 'right' }}>{value}</span>
    </div>
  );
}

export function MiniStat({ label, value, tone }: { label: string; value: React.ReactNode; tone?: string }) {
  return (
    <div style={{ background: '#FAF8F5', borderRadius: '10px', padding: '0.75rem', textAlign: 'center' }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 300, fontFamily: 'var(--font-serif), Georgia, serif', color: tone || '#2A1628' }}>{value}</div>
      <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'rgba(42,22,40,0.5)', marginTop: '0.15rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
    </div>
  );
}

export function GhostButton({ label, onClick, tone = '#2A1628', icon, disabled, title }: { label: string; onClick: () => void; tone?: string; icon?: React.ReactNode; disabled?: boolean; title?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.4rem', background: `${tone}0F`, border: `1px solid ${tone}33`,
        borderRadius: '6px', padding: '0.4rem 0.75rem', fontSize: '0.7rem', fontWeight: 700, color: tone,
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, fontFamily: 'inherit', whiteSpace: 'nowrap',
      }}
    >
      {icon}
      {label}
    </button>
  );
}


// ============================================================================
// shared/Badges.tsx
// ============================================================================


export function Pill({ label, bg, color, border, size = 'md' }: { label: string; bg: string; color: string; border?: string; size?: 'sm' | 'md' }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: size === 'sm' ? '0.625rem' : '0.7rem',
        fontWeight: 700,
        padding: size === 'sm' ? '0.15rem 0.4rem' : '0.25rem 0.55rem',
        borderRadius: '4px',
        background: bg,
        color,
        border: border ? `1px solid ${border}` : undefined,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}

export function RoleBadge({ role, size = 'md' }: { role: Role; size?: 'sm' | 'md' }) {
  const c = ROLE_BADGE_COLORS[role];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        fontSize: size === 'sm' ? '0.625rem' : '0.7rem',
        fontWeight: 700,
        padding: size === 'sm' ? '0.15rem 0.45rem' : '0.25rem 0.6rem',
        borderRadius: '999px',
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        whiteSpace: 'nowrap',
      }}
    >
      {role}
    </span>
  );
}

export const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  Pending: { bg: '#FEFCE8', color: '#A16207' },
  'Auto Matched': { bg: '#E6F4EA', color: '#137333' },
  'Manual Review': { bg: '#FFF3E0', color: '#E65100' },
  'Difference Found': { bg: '#FEE2E2', color: '#D32F2F' },
  'Ready To Post': { bg: '#E8F0FE', color: '#1A56C4' },
  Posted: { bg: 'rgba(42,22,40,0.08)', color: '#2A1628' },
  Exception: { bg: '#FEE2E2', color: '#991B1B' },
  Archived: { bg: 'rgba(42,22,40,0.05)', color: 'rgba(42,22,40,0.5)' },
};

export const PRIORITY_COLORS: Record<string, { bg: string; color: string }> = {
  Low: { bg: 'rgba(42,22,40,0.05)', color: 'rgba(42,22,40,0.55)' },
  Medium: { bg: '#FFF3E0', color: '#E65100' },
  High: { bg: '#FEE2E2', color: '#D32F2F' },
  Urgent: { bg: '#991B1B', color: '#ffffff' },
};

export const QB_COLORS: Record<string, { bg: string; color: string }> = {
  'Not Synced': { bg: 'rgba(42,22,40,0.05)', color: 'rgba(42,22,40,0.55)' },
  Pending: { bg: '#FFF3E0', color: '#E65100' },
  Synced: { bg: '#E6F4EA', color: '#137333' },
  Failed: { bg: '#FEE2E2', color: '#D32F2F' },
};

export const RISK_COLORS: Record<string, { bg: string; color: string }> = {
  Low: { bg: '#E6F4EA', color: '#137333' },
  Medium: { bg: '#FFF3E0', color: '#E65100' },
  High: { bg: '#FEE2E2', color: '#D32F2F' },
};

export const VALIDATION_COLORS: Record<string, { bg: string; color: string }> = {
  pass: { bg: '#E6F4EA', color: '#137333' },
  fail: { bg: '#FEE2E2', color: '#D32F2F' },
  warning: { bg: '#FFF3E0', color: '#E65100' },
  pending: { bg: 'rgba(42,22,40,0.05)', color: 'rgba(42,22,40,0.55)' },
};

export function StatusPill({ status, size = 'md' }: { status: string; size?: 'sm' | 'md' }) {
  const c = STATUS_COLORS[status] || { bg: 'rgba(42,22,40,0.05)', color: '#2A1628' };
  return <Pill label={status} bg={c.bg} color={c.color} size={size} />;
}

export function PriorityPill({ priority, size = 'md' }: { priority: string; size?: 'sm' | 'md' }) {
  const c = PRIORITY_COLORS[priority] || { bg: 'rgba(42,22,40,0.05)', color: '#2A1628' };
  return <Pill label={priority} bg={c.bg} color={c.color} size={size} />;
}

export function QbPill({ status, size = 'md' }: { status: string; size?: 'sm' | 'md' }) {
  const c = QB_COLORS[status] || { bg: 'rgba(42,22,40,0.05)', color: '#2A1628' };
  return <Pill label={status} bg={c.bg} color={c.color} size={size} />;
}

export function RiskPill({ risk, size = 'md' }: { risk: string; size?: 'sm' | 'md' }) {
  const c = RISK_COLORS[risk] || { bg: 'rgba(42,22,40,0.05)', color: '#2A1628' };
  return <Pill label={`${risk} Risk`} bg={c.bg} color={c.color} size={size} />;
}


// ============================================================================
// shared/Skeletons.tsx
// ============================================================================


const KEYFRAMES = `
@keyframes reconShimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
@keyframes reconSpin { to { transform: rotate(360deg); } }
`;

export function SkeletonBar({ width = '100%', height = '14px', radius = '6px' }: { width?: string; height?: string; radius?: string }) {
  return <Bar width={width} height={height} radius={radius} />;
}

function Bar({ width = '100%', height = '14px', radius = '6px' }: { width?: string; height?: string; radius?: string }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: 'linear-gradient(90deg, #F1EAE2 25%, #E7DCCF 37%, #F1EAE2 63%)',
        backgroundSize: '800px 100%',
        animation: 'reconShimmer 1.4s ease-in-out infinite',
      }}
    />
  );
}

export function TableSkeleton({ rows = 8, columns = 10 }: { rows?: number; columns?: number }) {
  return (
    <div style={{ padding: '0.5rem' }}>
      <style>{KEYFRAMES}</style>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: 'flex', gap: '1rem', padding: '0.85rem 1rem', borderBottom: '1px solid rgba(42,22,40,0.04)' }}>
          {Array.from({ length: columns }).map((_, c) => (
            <Bar key={c} width={c === 0 ? '140px' : '90px'} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function DrawerSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
      <style>{KEYFRAMES}</style>
      <Bar width="60%" height="20px" />
      <Bar width="100%" height="80px" radius="10px" />
      <Bar width="100%" height="80px" radius="10px" />
      <Bar width="40%" height="14px" />
      <Bar width="100%" height="120px" radius="10px" />
    </div>
  );
}

export function ChartSkeleton({ height = '180px' }: { height?: string }) {
  return (
    <div style={{ padding: '0.5rem' }}>
      <style>{KEYFRAMES}</style>
      <Bar width="100%" height={height} radius="12px" />
    </div>
  );
}

export function ButtonSpinner({ color = '#ffffff' }: { color?: string }) {
  return (
    <span
      style={{
        width: '13px',
        height: '13px',
        borderRadius: '50%',
        border: `2px solid ${color}55`,
        borderTopColor: color,
        display: 'inline-block',
        animation: 'reconSpin 0.7s linear infinite',
        flexShrink: 0,
      }}
    >
      <style>{KEYFRAMES}</style>
    </span>
  );
}

export function ProcessingOverlay({ label = 'Processing…' }: { label?: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(1.5px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        zIndex: 40,
        borderRadius: 'inherit',
      }}
    >
      <ButtonSpinner color="#E8760A" />
      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2A1628' }}>{label}</span>
    </div>
  );
}


// ============================================================================
// shared/EmptyState.tsx
// ============================================================================


interface EmptyStateProps {
  variant?: 'no-results' | 'no-data' | 'error' | 'offline';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const ICONS: Record<string, React.ReactNode> = {
  'no-results': (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  'no-data': (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <rect x="3" y="4" width="18" height="16" rx="2" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  error: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  offline: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <line x1="1" y1="1" x2="23" y2="23" /><path d="M16.72 11.06A10.94 10.94 0 0119 12.55" />
      <path d="M5 12.55a10.94 10.94 0 015.17-2.39" /><path d="M10.71 5.05A16 16 0 0122.58 9" />
      <path d="M1.42 9a15.91 15.91 0 014.7-2.88" /><path d="M8.53 16.11a6 6 0 016.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
  ),
};

const DEFAULTS: Record<string, { title: string; description: string; tone: string }> = {
  'no-results': { title: 'No matching transactions', description: 'Try adjusting your filters or search terms.', tone: '#2A1628' },
  'no-data': { title: 'Nothing to reconcile yet', description: 'Import a bank statement to populate this workspace.', tone: '#2A1628' },
  error: { title: 'Something went wrong', description: "We couldn't load reconciliation data. Please retry.", tone: '#D32F2F' },
  offline: { title: "You're offline", description: 'Reconnect to the internet to sync the latest reconciliation data.', tone: '#D97706' },
};

function EmptyState({ variant = 'no-results', title, description, actionLabel, onAction }: EmptyStateProps) {
  const d = DEFAULTS[variant];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '3.5rem 1.5rem', textAlign: 'center' }}>
      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(42,22,40,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: d.tone }}>
        {ICONS[variant]}
      </div>
      <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#2A1628' }}>{title || d.title}</h4>
      <p style={{ margin: 0, fontSize: '0.8125rem', color: 'rgba(42,22,40,0.55)', maxWidth: '340px' }}>{description || d.description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{ marginTop: '0.5rem', background: '#2A1628', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.55rem 1.25rem', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}


// ============================================================================
// shared/ConfirmationModal.tsx
// ============================================================================


interface ConfirmationModalProps {
  config: ConfirmationConfig | null;
  onClose: () => void;
}

const TONE_COLORS: Record<string, string> = {
  danger: '#D32F2F',
  warning: '#E8760A',
  neutral: '#2A1628',
};

function ConfirmationModal({ config, onClose }: ConfirmationModalProps) {
  const [submitting, setSubmitting] = useState(false);
  if (!config) return null;
  const tone = TONE_COLORS[config.tone];

  const handleConfirm = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 550));
    config.onConfirm();
    setSubmitting(false);
    onClose();
  };

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(42,22,40,0.45)', backdropFilter: 'blur(4px)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
    >
      <FocusTrap onEscape={onClose}>
        <div
          role="dialog"
          aria-modal="true"
          aria-label={config.title}
          onClick={(e) => e.stopPropagation()}
          style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '440px', boxShadow: '0 24px 64px rgba(42,22,40,0.2)', overflow: 'hidden', fontFamily: 'var(--font-sans), Inter, sans-serif' }}
        >
          <div style={{ padding: '1.5rem 1.75rem 0.5rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${tone}14`, border: `1px solid ${tone}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tone, marginBottom: '1rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 300, color: '#2A1628', fontFamily: 'var(--font-serif), Georgia, serif' }}>{config.title}</h2>
            <p style={{ margin: '0.6rem 0 0', fontSize: '0.8125rem', color: 'rgba(42,22,40,0.65)', lineHeight: 1.6 }}>{config.message}</p>
          </div>
          <div style={{ padding: '1.25rem 1.75rem 1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              onClick={onClose}
              disabled={submitting}
              style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 1.25rem', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', color: '#2A1628', fontFamily: 'inherit' }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={submitting}
              style={{ background: tone, color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6rem 1.5rem', fontSize: '0.8125rem', fontWeight: 600, cursor: submitting ? 'default' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: submitting ? 0.85 : 1 }}
            >
              {submitting && <ButtonSpinner />}
              {config.confirmLabel}
            </button>
          </div>
        </div>
      </FocusTrap>
    </div>
  );
}


// ============================================================================
// shared/ToastStack.tsx
// ============================================================================


const TONE_COLORS_ToastStack: Record<string, string> = { success: '#047857', error: '#EF4444', warning: '#D97706', info: '#2A1628' };

function ToastStack() {
  const { toasts, dismissToast } = useReconciliation();
  if (toasts.length === 0) return null;
  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1300, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          style={{ background: TONE_COLORS_ToastStack[t.tone], color: '#fff', borderRadius: '10px', padding: '0.75rem 1.25rem', boxShadow: '0 8px 32px rgba(42,22,40,0.15)', fontSize: '0.8125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '260px', maxWidth: '360px' }}
        >
          <span style={{ flex: 1 }}>{t.message}</span>
          {t.actionLabel && t.onAction && (
            <button
              onClick={() => { t.onAction?.(); dismissToast(t.id); }}
              style={{ background: 'rgba(255,255,255,0.18)', border: 'none', borderRadius: '6px', padding: '0.3rem 0.65rem', color: '#fff', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', flexShrink: 0 }}
            >
              {t.actionLabel}
            </button>
          )}
          <button onClick={() => dismissToast(t.id)} aria-label="Dismiss notification" style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', display: 'flex', flexShrink: 0 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      ))}
    </div>
  );
}


// ============================================================================
// drawer/OverviewTab.tsx
// ============================================================================


function OverviewTab({ tx, actions }: DrawerTabProps) {
  const health = useMemo(() => {
    let score = tx.aiMatchScore ?? 40;
    if (tx.difference > 0) score -= 15;
    if (tx.riskLevel === 'High') score -= 20;
    if (tx.riskLevel === 'Medium') score -= 8;
    if (tx.status === 'Exception') score -= 25;
    if (tx.status === 'Posted') score += 10;
    return Math.max(5, Math.min(100, Math.round(score)));
  }, [tx]);

  const businessHealth = health >= 80 ? 'Healthy' : health >= 55 ? 'Attention Needed' : 'Critical';
  const healthColor = health >= 80 ? '#137333' : health >= 55 ? '#E65100' : '#D32F2F';

  const slaBudgetMinutes = tx.slaHours * 60;
  const slaStatus = tx.processingMinutes <= slaBudgetMinutes * 0.75 ? 'On Track' : tx.processingMinutes <= slaBudgetMinutes ? 'At Risk' : 'Breached';
  const slaColor = slaStatus === 'On Track' ? '#137333' : slaStatus === 'At Risk' ? '#E65100' : '#D32F2F';

  const circumference = 100;
  const dash = `${health} ${circumference - health}`;

  return (
    <>
      <DrawerSection title="Reconciliation Health Score">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ position: 'relative', width: '84px', height: '84px', flexShrink: 0 }}>
            <svg width="84" height="84" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F0E8DF" strokeWidth="3.4" />
              <circle cx="18" cy="18" r="15.915" fill="none" stroke={healthColor} strokeWidth="3.4" strokeDasharray={dash} strokeLinecap="round" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.35rem', fontWeight: 300, fontFamily: 'var(--font-serif), Georgia, serif', color: '#2A1628' }}>{health}</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: healthColor }}>{businessHealth}</div>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.75rem', color: 'rgba(42,22,40,0.55)', lineHeight: 1.5 }}>
              Composite of AI match confidence, outstanding differences, and risk classification for this transaction.
            </p>
          </div>
        </div>
      </DrawerSection>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
        <MiniStat label="Match Accuracy" value={tx.aiMatchScore !== null ? `${tx.aiMatchScore}%` : '—'} />
        <MiniStat label="Difference" value={`${tx.currency} ${tx.difference.toLocaleString()}`} tone={tx.difference > 0 ? '#D32F2F' : '#137333'} />
        <MiniStat label="Processing" value={`${tx.processingMinutes}m`} />
      </div>

      <DrawerSection title="Reconciliation Details">
        <KeyValueRow label="Client" value={tx.client} />
        <KeyValueRow label="Account" value={tx.bankAccount} />
        <KeyValueRow label="Statement Period" value={tx.month + ' ' + tx.financialYear} />
        <KeyValueRow
          label="Assigned Reviewer"
          value={
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {tx.assignedReviewer || 'Unassigned'}
              <GhostButton label="Assign" onClick={() => actions.openAssignReviewer(tx)} />
            </span>
          }
        />
        <KeyValueRow label="QuickBooks Status" value={<QbPill status={tx.quickBooksStatus} size="sm" />} />
        <KeyValueRow label="Risk Level" value={<RiskPill risk={tx.riskLevel} size="sm" />} />
        <KeyValueRow label="Priority" value={<PriorityPill priority={tx.priority} size="sm" />} />
        <KeyValueRow label="SLA Status" value={<span style={{ color: slaColor, fontWeight: 700 }}>{slaStatus}</span>} />
      </DrawerSection>
    </>
  );
}


// ============================================================================
// drawer/TransactionsTab.tsx
// ============================================================================


interface Line { id: string; label: string; sub: string; amount: number; date: string; matched: boolean; }

function TransactionsTab({ tx }: DrawerTabProps) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const bankLines: Line[] = useMemo(() => [
    { id: 'b1', label: tx.description, sub: tx.statementReference, amount: tx.amount, date: tx.transactionDate, matched: !!tx.matchedEntry },
    { id: 'b2', label: 'Bank Service Fee', sub: 'FEE-AUTO', amount: 12.5, date: tx.transactionDate, matched: false },
    { id: 'b3', label: 'Prior Day Carryover', sub: 'CFWD', amount: Math.round(tx.amount * 0.3), date: tx.transactionDate, matched: false },
  ], [tx]);

  const ledgerLines: Line[] = useMemo(() => [
    ...(tx.matchedEntry ? [{ id: 'l1', label: tx.matchedEntry, sub: tx.descriptionSub || '', amount: tx.amount - tx.difference, date: tx.transactionDate, matched: true }] : []),
    { id: 'l2', label: 'Suspense Account Entry', sub: 'SUS-TMP', amount: Math.round(tx.amount * 0.3), date: tx.transactionDate, matched: false },
    { id: 'l3', label: 'Accrued Expense Reversal', sub: 'ACC-REV', amount: 12.5, date: tx.transactionDate, matched: false },
  ], [tx]);

  const filter = (lines: Line[]) => lines.filter((l) => `${l.label} ${l.sub}`.toLowerCase().includes(search.toLowerCase()));

  const renderColumn = (title: string, lines: Line[]) => (
    <div style={{ flex: 1, minWidth: '200px' }}>
      <EyebrowLabel>{title}</EyebrowLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {filter(lines).map((l) => {
          const isOpen = expanded === l.id;
          const diff = l.amount - tx.amount;
          return (
            <div
              key={l.id}
              style={{
                background: l.matched ? '#E6F4EA' : '#ffffff', border: `1px solid ${l.matched ? 'rgba(19,115,51,0.25)' : 'rgba(42,22,40,0.08)'}`,
                borderRadius: '8px', padding: '0.65rem 0.75rem', cursor: 'pointer',
              }}
              onClick={() => setExpanded(isOpen ? null : l.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.78rem', color: '#2A1628' }}>{l.label}</div>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.45)' }}>{l.sub}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#2A1628' }}>{tx.currency} {l.amount.toLocaleString()}</div>
                  {!l.matched && diff !== 0 && (
                    <div style={{ fontSize: '0.625rem', fontWeight: 700, color: '#D32F2F' }}>Δ {tx.currency} {Math.abs(diff).toLocaleString()}</div>
                  )}
                </div>
              </div>
              {isOpen && (
                <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed rgba(42,22,40,0.1)', fontSize: '0.7rem', color: 'rgba(42,22,40,0.6)' }}>
                  Date: {l.date} &middot; {l.matched ? 'Matched to counterpart entry' : 'No corresponding entry found yet'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <div style={{ position: 'relative' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(42,22,40,0.35)' }}>
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text" placeholder="Search line items…" value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2rem', fontSize: '0.75rem', border: '1px solid #DDD0C4', borderRadius: '8px', background: '#FAF8F5', outline: 'none', color: '#2A1628', boxSizing: 'border-box', fontFamily: 'inherit' }}
        />
      </div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {renderColumn('Imported Bank Transactions', bankLines)}
        {renderColumn('Accounting Ledger Entries', ledgerLines)}
      </div>
    </>
  );
}


// ============================================================================
// drawer/AiMatchingTab.tsx
// ============================================================================


function AiMatchingTab({ tx, actions, drawerData }: DrawerTabProps & { drawerData?: any }) {
  const suggestions: SuggestedMatch[] = drawerData?.suggestedMatches ?? getSuggestedMatchesForTransaction(tx);
  const recommendation = tx.aiMatchScore === null
    ? 'No confident candidate was found — route to Manual Match.'
    : tx.aiMatchScore >= 80
      ? 'High confidence match — safe to accept and proceed to posting.'
      : tx.aiMatchScore >= 50
        ? 'Moderate confidence — review the breakdown before accepting.'
        : 'Low confidence — recommend rejecting and using Manual Match.';

  return (
    <>
      <DrawerSection title="AI Match Summary">
        <p style={{ margin: 0, fontSize: '0.8125rem', color: '#2A1628', lineHeight: 1.6 }}>
          {tx.aiMatchScore === null ? 'No suggested matches were generated for this transaction.' : `${suggestions.length} candidate${suggestions.length === 1 ? '' : 's'} evaluated against the accounting ledger.`}
        </p>
      </DrawerSection>

      <DrawerSection title="Smart Recommendation">
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(232,118,10,0.1)', color: '#E8760A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a7 7 0 0 0-7 7c0 2.4 1.2 4.2 3 5.5V17h8v-2.5c1.8-1.3 3-3.1 3-5.5a7 7 0 0 0-7-7z" /><line x1="9" y1="21" x2="15" y2="21" /></svg>
          </div>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: '#2A1628', lineHeight: 1.55 }}>{recommendation}</p>
        </div>
      </DrawerSection>

      <div>
        <EyebrowLabel>Suggested Matches</EyebrowLabel>
        {suggestions.length === 0 && <p style={{ fontSize: '0.8125rem', color: 'rgba(42,22,40,0.5)' }}>No suggestions available.</p>}
        <div style={{ marginBottom: '0.75rem' }}>
           <GhostButton label="Auto-Create Vendor" tone="#137333" onClick={() => actions.autoCreateVendor(tx)} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {suggestions.map((s) => (
            <div key={s.id} style={{ border: `1.5px solid ${s.confidence >= 70 ? '#137333' : '#DDD0C4'}`, borderRadius: '10px', padding: '0.85rem', background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#2A1628' }}>{s.ledgerEntry}</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.5)' }}>{tx.currency} {s.amount.toLocaleString()} &middot; {s.date}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: s.confidence >= 70 ? '#137333' : s.confidence >= 40 ? '#E65100' : '#D32F2F' }}>{s.confidence}%</div>
                  {s.isDuplicateRisk && <RiskPill risk="High" size="sm" />}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.75rem' }}>
                {s.reasonBreakdown.map((r) => (
                  <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.55)', width: '130px', flexShrink: 0 }}>{r.label}</span>
                    <div style={{ flex: 1, height: '5px', borderRadius: '3px', background: '#F0E8DF', overflow: 'hidden' }}>
                      <div style={{ width: `${r.score}%`, height: '100%', background: '#E8760A' }} />
                    </div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#2A1628', width: '30px', textAlign: 'right' }}>{r.score}%</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <GhostButton label="Accept Suggestion" tone="#137333" onClick={() => actions.acceptSuggestion(tx, s.id)} />
                <GhostButton label="Reject Suggestion" tone="#D32F2F" onClick={() => actions.rejectSuggestion(tx, s.id)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <DrawerSection title="Matching Logic &amp; Duplicate Detection">
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: 'rgba(42,22,40,0.6)', lineHeight: 1.6 }}>
          Candidates are scored across six weighted signals — amount match, date proximity, vendor/payee match, reference match, description similarity, and category match — then combined into a single confidence percentage.
        </p>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(42,22,40,0.6)', lineHeight: 1.6 }}>
          Duplicate detection flags candidates that closely resemble another transaction already reconciled in the same statement period.
        </p>
      </DrawerSection>
    </>
  );
}


// ============================================================================
// drawer/ManualMatchTab.tsx
// ============================================================================


interface Candidate { id: string; label: string; amount: number; date: string; }

function ManualMatchTab({ tx, actions }: DrawerTabProps) {
  const { pushToast } = useReconciliation();
  const [staged, setStaged] = useState<Candidate | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');

  const candidates: Candidate[] = useMemo(() => [
    { id: 'cand1', label: 'Ledger Entry #4200 (unreconciled)', amount: tx.amount, date: tx.transactionDate },
    { id: 'cand2', label: 'Ledger Entry #4201 (unreconciled)', amount: tx.amount - tx.difference, date: tx.transactionDate },
    { id: 'cand3', label: 'Suspense Account Holding', amount: Math.round(tx.amount * 0.85), date: tx.transactionDate },
  ], [tx]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const id = e.dataTransfer.getData('text/candidate-id');
    const found = candidates.find((c) => c.id === id);
    if (found) setStaged(found);
  };

  const liveDifference = staged ? tx.amount - staged.amount : tx.amount;
  const adjustedAmount = adjustmentAmount ? parseFloat(adjustmentAmount) || 0 : 0;
  const resultingBalance = liveDifference - adjustedAmount;

  return (
    <>
      <div>
        <EyebrowLabel>Drag &amp; Drop Match</EyebrowLabel>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '160px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {candidates.map((c) => (
              <div
                key={c.id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/candidate-id', c.id)}
                style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 0.75rem', cursor: 'grab', fontSize: '0.75rem' }}
              >
                <div style={{ fontWeight: 600, color: '#2A1628' }}>{c.label}</div>
                <div style={{ color: 'rgba(42,22,40,0.5)', fontSize: '0.7rem' }}>{tx.currency} {c.amount.toLocaleString()} &middot; {c.date}</div>
              </div>
            ))}
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{
              flex: 1, minWidth: '160px', border: `1.5px dashed ${dragOver ? '#E8760A' : '#DDD0C4'}`, borderRadius: '10px',
              background: dragOver ? 'rgba(232,118,10,0.05)' : '#FAF8F5', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '90px',
            }}
          >
            {staged ? (
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2A1628' }}>{staged.label}</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.5)' }}>Staged for {tx.id}</div>
              </div>
            ) : (
              <span style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.45)' }}>Drop a ledger candidate here to stage a manual match</span>
            )}
          </div>
        </div>
        <div style={{ marginTop: '0.65rem', display: 'flex', gap: '0.5rem' }}>
          <GhostButton label="Open Manual Match" onClick={() => actions.openManualMatch(tx)} disabled={!staged} title={!staged ? 'Stage a candidate first' : undefined} />
          <GhostButton label="Merge Transaction" tone="#8B5CF6" onClick={() => actions.openMerge(tx)} />
          <GhostButton label="Split Transaction" tone="#E8760A" onClick={() => actions.openSplit(tx)} />
          <GhostButton label="Auto-Create Vendor" tone="#137333" onClick={() => actions.autoCreateVendor(tx)} />
        </div>
      </div>

      <DrawerSection title="Manual Adjustment">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <input
            type="number" placeholder="Adjustment amount" value={adjustmentAmount} onChange={(e) => setAdjustmentAmount(e.target.value)}
            style={{ border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.5rem 0.65rem', fontSize: '0.78rem', outline: 'none', fontFamily: 'inherit' }}
          />
          <textarea
            placeholder="Adjustment reason…" value={adjustmentReason} onChange={(e) => setAdjustmentReason(e.target.value)}
            rows={2}
            style={{ border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.5rem 0.65rem', fontSize: '0.78rem', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }}
          />
          <button
            onClick={() => { pushToast({ message: 'Manual adjustment saved.', tone: 'success' }); setAdjustmentAmount(''); setAdjustmentReason(''); }}
            disabled={!adjustmentAmount || !adjustmentReason}
            style={{ alignSelf: 'flex-start', background: '#2A1628', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: 700, cursor: adjustmentAmount && adjustmentReason ? 'pointer' : 'not-allowed', opacity: adjustmentAmount && adjustmentReason ? 1 : 0.5, fontFamily: 'inherit' }}
          >
            Save Adjustment
          </button>
        </div>
      </DrawerSection>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
        <DrawerSection title="Difference Calculator">
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: liveDifference === 0 ? '#137333' : '#D32F2F' }}>{tx.currency} {liveDifference.toLocaleString()}</div>
          <div style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.5)', marginTop: '0.2rem' }}>Statement amount vs. staged match</div>
        </DrawerSection>
        <DrawerSection title="Balance Preview">
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: resultingBalance === 0 ? '#137333' : '#D32F2F' }}>{tx.currency} {resultingBalance.toLocaleString()}</div>
          <div style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.5)', marginTop: '0.2rem' }}>Projected after adjustment</div>
        </DrawerSection>
      </div>
    </>
  );
}


// ============================================================================
// drawer/ValidationTab.tsx
// ============================================================================


const STATUS_ICON: Record<string, React.ReactNode> = {
  pass: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>,
  fail: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  warning: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  pending: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="9" /></svg>,
};

function ValidationTab({ tx, actions, drawerData }: DrawerTabProps & { drawerData?: any }) {
  const checks: ValidationCheck[] = drawerData?.validationChecks ?? getValidationChecksForTransaction(tx);
  const failingOrWarning = checks.filter((c) => c.status === 'fail' || c.status === 'warning');

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Validation Checklist</span>
        <GhostButton label="Retry Validation" onClick={() => actions.requestRetryValidation(tx)} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {checks.map((c) => {
          const colors = VALIDATION_COLORS[c.status];
          return (
            <div key={c.key} style={{ border: '1px solid rgba(42,22,40,0.08)', borderRadius: '10px', padding: '0.75rem', background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: colors.bg, color: colors.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {STATUS_ICON[c.status]}
                  </span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#2A1628' }}>{c.label}</span>
                </div>
                <Pill label={c.status.toUpperCase()} bg={colors.bg} color={colors.color} size="sm" />
              </div>
              {c.detail && <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: 'rgba(42,22,40,0.6)', lineHeight: 1.5 }}>{c.detail}</p>}
            </div>
          );
        })}
      </div>

      {failingOrWarning.length > 0 && (
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Exception Panel</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
            {failingOrWarning.map((c) => (
              <div key={c.key} style={{ background: c.status === 'fail' ? '#FEE2E2' : '#FFF3E0', border: `1px solid ${c.status === 'fail' ? 'rgba(211,47,47,0.25)' : 'rgba(230,81,0,0.25)'}`, borderRadius: '10px', padding: '0.75rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.78rem', color: c.status === 'fail' ? '#D32F2F' : '#E65100' }}>{c.label}</div>
                {c.suggestedFix && <p style={{ margin: '0.35rem 0 0.6rem', fontSize: '0.75rem', color: 'rgba(42,22,40,0.65)' }}>Suggested fix: {c.suggestedFix}</p>}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <GhostButton label="View Exception Details" onClick={() => actions.openExceptionDetails(tx, c.label)} />
                  <GhostButton label="Manual Override" tone="#E8760A" onClick={() => actions.requestManualOverride(tx, c.label)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}


// ============================================================================
// drawer/TimelineTab.tsx
// ============================================================================


const DOT_COLOR: Record<string, string> = { done: '#137333', current: '#E8760A', pending: '#DDD0C4', skipped: '#DDD0C4' };

function TimelineTab({ tx, drawerData }: DrawerTabProps & { drawerData?: any }) {
  const events: TimelineEvent[] = drawerData?.timeline ?? getTimelineForTransaction(tx);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {events.map((evt, idx) => (
        <div key={evt.stage} style={{ display: 'flex', gap: '0.85rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span
              style={{
                width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                background: evt.status === 'done' ? DOT_COLOR.done : evt.status === 'current' ? DOT_COLOR.current : '#fff',
                border: `2px solid ${DOT_COLOR[evt.status]}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: evt.status === 'current' ? '0 0 0 4px rgba(232,118,10,0.15)' : undefined,
              }}
            >
              {evt.status === 'done' && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg>
              )}
            </span>
            {idx < events.length - 1 && <span style={{ width: '2px', flex: 1, minHeight: '28px', background: evt.status === 'done' ? DOT_COLOR.done : '#EDE6DE' }} />}
          </div>
          <div style={{ paddingBottom: '1.1rem', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: evt.status === 'pending' ? 'rgba(42,22,40,0.4)' : '#2A1628' }}>{evt.stage}</span>
              {evt.timestamp && <span style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.45)', whiteSpace: 'nowrap' }}>{evt.timestamp.replace('T', ' ')}</span>}
            </div>
            {evt.actor && <div style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.5)', marginTop: '0.15rem' }}>by {evt.actor}</div>}
            {evt.note && <div style={{ fontSize: '0.7rem', color: '#E8760A', marginTop: '0.15rem', fontWeight: 600 }}>{evt.note}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}


// ============================================================================
// drawer/ActivityTab.tsx
// ============================================================================


function describeAuditEntry(log: any): string {
  const verb = log.operation === 'INSERT' ? 'created' : log.operation === 'DELETE' ? 'removed' : 'updated';
  const table = String(log.tableName || '').replace(/_/g, ' ');
  return `${table} ${verb}`;
}

function ActivityTab({ tx, actions, drawerData }: DrawerTabProps & { drawerData?: any }) {
  const logs: ActivityLogEntry[] = drawerData?.activityLog
    ? drawerData.activityLog.map((log: any) => ({
        id: log.id,
        transactionId: tx.id,
        timestamp: log.changedAt,
        user: log.changedBy || 'System',
        action: describeAuditEntry(log),
        oldValue: '',
        newValue: '',
        ipAddress: 'N/A',
        system: 'Web App',
      }))
    : getActivityLogForTransaction(tx);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Audit Trail</span>
        <GhostButton label="Export Audit Log" onClick={() => actions.openAuditExport(tx)} />
      </div>
      <div className="activity-table-scroll" style={{ overflowX: 'auto', border: '1px solid rgba(42,22,40,0.08)', borderRadius: '10px' }}>
        <style>{`
          
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
.activity-table-scroll::-webkit-scrollbar {
            display: none !important;
            height: 0 !important;
            width: 0 !important;
          }
          .activity-table-scroll {
            -ms-overflow-style: none !important;
            scrollbar-width: none !important;
          }
        `}</style>
        <table style={{ width: '100%', minWidth: '620px', borderCollapse: 'collapse', fontSize: '0.72rem' }}>
          <thead>
            <tr style={{ background: '#FAF8F5', color: 'rgba(42,22,40,0.5)', fontWeight: 700, textAlign: 'left' }}>
              <th style={{ padding: '0.6rem 0.75rem' }}>TIMESTAMP</th>
              <th style={{ padding: '0.6rem 0.75rem' }}>USER</th>
              <th style={{ padding: '0.6rem 0.75rem' }}>ACTION</th>
              <th style={{ padding: '0.6rem 0.75rem' }}>OLD VALUE</th>
              <th style={{ padding: '0.6rem 0.75rem' }}>NEW VALUE</th>
              <th style={{ padding: '0.6rem 0.75rem' }}>IP ADDRESS</th>
              <th style={{ padding: '0.6rem 0.75rem' }}>SYSTEM</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} style={{ borderTop: '1px solid rgba(42,22,40,0.05)' }}>
                <td style={{ padding: '0.6rem 0.75rem', whiteSpace: 'nowrap', color: 'rgba(42,22,40,0.6)' }}>{log.timestamp.replace('T', ' ')}</td>
                <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: '#2A1628', whiteSpace: 'nowrap' }}>{log.user}</td>
                <td style={{ padding: '0.6rem 0.75rem', color: '#2A1628' }}>{log.action}</td>
                <td style={{ padding: '0.6rem 0.75rem', color: 'rgba(42,22,40,0.5)' }}>{log.oldValue || '—'}</td>
                <td style={{ padding: '0.6rem 0.75rem', color: '#2A1628', fontWeight: 600 }}>{log.newValue || '—'}</td>
                <td style={{ padding: '0.6rem 0.75rem', color: 'rgba(42,22,40,0.5)', fontFamily: 'monospace' }}>{log.ipAddress}</td>
                <td style={{ padding: '0.6rem 0.75rem', color: 'rgba(42,22,40,0.5)', whiteSpace: 'nowrap' }}>{log.system}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}


// ============================================================================
// drawer/DocumentsTab.tsx
// ============================================================================


const TYPE_ICON: Record<string, React.ReactNode> = {
  'Bank Statement': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  Receipt: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
  Invoice: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /></svg>,
  'Supporting Doc': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a5 5 0 0 1-7.07-7.07l9.19-9.19a3 3 0 0 1 4.24 4.24l-9.19 9.19a1 1 0 0 1-1.41-1.41l8.48-8.49" /></svg>,
};

function DocumentsTab({ tx, drawerData }: DrawerTabProps & { drawerData?: any }) {
  const { pushToast } = useReconciliation();
  const [addDocument] = usePostDocumentMutation();
  const docs: (ReconciliationDocument & { fileKey?: string })[] = drawerData?.documents
    ? drawerData.documents.map((d: any) => ({ ...d, uploadedAt: d.createdAt }))
    : getDocumentsForTransaction(tx);

  const handleUpload = () => {
    const name = window.prompt('Document name (metadata only — no real file upload in this build):');
    if (!name) return;
    addDocument({ id: tx.id, name, type: 'Supporting Doc' })
      .unwrap()
      .then(() => pushToast({ message: 'Document recorded.', tone: 'success' }))
      .catch(() => pushToast({ message: 'Failed to record document.', tone: 'error' }));
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Attached Documents</span>
        <GhostButton label="Upload Document" onClick={handleUpload} />
      </div>

      {docs.length === 0 && <p style={{ fontSize: '0.8125rem', color: 'rgba(42,22,40,0.5)' }}>No documents attached yet.</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {docs.map((doc) => (
          <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid rgba(42,22,40,0.08)', borderRadius: '10px', padding: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(232,118,10,0.08)', color: '#E8760A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {TYPE_ICON[doc.type]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#2A1628', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</div>
              <div style={{ fontSize: '0.68rem', color: 'rgba(42,22,40,0.5)' }}>{doc.type} &middot; {doc.sizeKb} KB &middot; {doc.uploadedBy} &middot; {doc.uploadedAt.replace('T', ' ')}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}


// ============================================================================
// drawer/QuickBooksSyncTab.tsx
// ============================================================================


function QuickBooksSyncTab({ tx, actions }: DrawerTabProps) {
  const mappedCategory = tx.description.includes('Rent') ? 'Rent Expense'
    : tx.description.includes('Salary') ? 'Salary Expense'
      : tx.description.includes('Payment') ? 'Accounts Receivable'
        : 'General Ledger';

  return (
    <>
      <DrawerSection title="Sync Status">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <QbPill status={tx.quickBooksStatus} />
          {(tx.quickBooksStatus === 'Pending' || tx.quickBooksStatus === 'Not Synced') && (
            <GhostButton label="Post To QuickBooks" onClick={() => actions.requestPostToQuickBooks(tx)} />
          )}
          {tx.quickBooksStatus === 'Failed' && (
            <GhostButton label="Retry Sync" tone="#D32F2F" onClick={() => actions.requestPostToQuickBooks(tx)} />
          )}
        </div>
      </DrawerSection>

      <DrawerSection title="Sync Details">
        <KeyValueRow label="QuickBooks Account" value="Checking - 6100" />
        <KeyValueRow label="Mapped Category" value={mappedCategory} />
        <KeyValueRow label="Sync Direction" value="Ledger → QuickBooks Online" />
        <KeyValueRow label="Last Sync Attempt" value={tx.lastUpdated.replace('T', ' ')} />
      </DrawerSection>

      {tx.quickBooksStatus === 'Failed' && (
        <div style={{ background: '#FEE2E2', border: '1px solid rgba(211,47,47,0.25)', borderRadius: '10px', padding: '0.85rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#D32F2F', marginBottom: '0.35rem' }}>Sync Failed</div>
          <p style={{ margin: '0 0 0.65rem', fontSize: '0.75rem', color: 'rgba(42,22,40,0.65)' }}>
            QuickBooks rejected this entry — the account mapping for &ldquo;{mappedCategory}&rdquo; could not be resolved.
          </p>
          <GhostButton label="View Exception Details" tone="#D32F2F" onClick={() => actions.openExceptionDetails(tx, 'QuickBooks sync failure')} />
        </div>
      )}

      {tx.quickBooksStatus === 'Synced' && (
        <div style={{ background: '#E6F4EA', border: '1px solid rgba(19,115,51,0.2)', borderRadius: '10px', padding: '0.85rem', fontSize: '0.78rem', color: '#137333', fontWeight: 600 }}>
          Successfully synced to QuickBooks Online.
        </div>
      )}
    </>
  );
}


// ============================================================================
// drawer/NotesTab.tsx
// ============================================================================


function renderBody(body: string) {
  return body.split(/(@[A-Za-z ]+(?=[.,!?]|$))/g).map((part, i) =>
    part.startsWith('@') ? <span key={i} style={{ color: '#E8760A', fontWeight: 700 }}>{part}</span> : <span key={i}>{part}</span>
  );
}

function NotesTab({ tx, actions, drawerData }: DrawerTabProps & { drawerData?: any }) {
  const { pushToast } = useReconciliation();
  const [addNote] = usePostNoteMutation();
  const notes: ReconciliationNote[] = drawerData?.notes
    ? drawerData.notes.map((n: any) => ({ ...n, timestamp: n.createdAt, attachments: n.attachments || [] }))
    : getNotesForTransaction(tx);
  const [quickNote, setQuickNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAddNote = () => {
    if (!quickNote.trim()) return;
    setSubmitting(true);
    addNote({ id: tx.id, body: quickNote })
      .unwrap()
      .then(() => {
        setQuickNote('');
        pushToast({ message: 'Note added.', tone: 'success' });
      })
      .catch(() => pushToast({ message: 'Failed to add note.', tone: 'error' }))
      .finally(() => setSubmitting(false));
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {notes.length === 0 && <p style={{ fontSize: '0.8125rem', color: 'rgba(42,22,40,0.5)' }}>No notes yet on this transaction.</p>}
        {notes.map((note) => (
          <div key={note.id} style={{ background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '10px', padding: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.78rem', color: '#2A1628' }}>{note.author}</span>
              <span style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.45)' }}>{note.timestamp.replace('T', ' ')}</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(42,22,40,0.75)', lineHeight: 1.55 }}>{renderBody(note.body)}</p>
            {note.attachments.length > 0 && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'rgba(42,22,40,0.5)' }}>
                Attachments: {note.attachments.join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <textarea
          placeholder="Write a quick note… mention a reviewer with @Name"
          value={quickNote}
          onChange={(e) => setQuickNote(e.target.value)}
          rows={3}
          style={{ border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 0.75rem', fontSize: '0.8rem', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }}
        />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleAddNote}
            disabled={submitting || !quickNote.trim()}
            style={{ background: '#2A1628', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.55rem 1.1rem', fontSize: '0.78rem', fontWeight: 700, cursor: submitting || !quickNote.trim() ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: submitting || !quickNote.trim() ? 0.6 : 1 }}
          >
            Add Note
          </button>
          <button
            onClick={() => actions.openAddNotes(tx)}
            style={{ alignSelf: 'flex-start', background: '#fff', color: '#2A1628', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.55rem 1.1rem', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Open Rich Note Editor
          </button>
        </div>
      </div>
    </>
  );
}


// ============================================================================
// drawer/index.tsx
// ============================================================================



interface ReconciliationDrawerProps {
  transaction: ReconciliationTransaction | null;
  activeTab: DrawerTabKey;
  onTabChange: (tab: DrawerTabKey) => void;
  onClose: () => void;
  actions: DrawerActionHandlers;
}

const TABS: { key: DrawerTabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'transactions', label: 'Transactions' },
  { key: 'aiMatching', label: 'AI Matching' },
  { key: 'manualMatch', label: 'Manual Match' },
  { key: 'validation', label: 'Validation' },
  { key: 'timeline', label: 'Timeline' },
  { key: 'activity', label: 'Activity' },
  { key: 'documents', label: 'Documents' },
  { key: 'quickBooksSync', label: 'QuickBooks Sync' },
  { key: 'notes', label: 'Notes' },
];

function ReconciliationDrawer({ transaction, activeTab, onTabChange, onClose, actions }: ReconciliationDrawerProps) {
  if (!transaction) return null;
  return (
    <ReconciliationDrawerContent
      key={transaction.id}
      transaction={transaction}
      activeTab={activeTab}
      onTabChange={onTabChange}
      onClose={onClose}
      actions={actions}
    />
  );
}

function ReconciliationDrawerContent({ transaction, activeTab, onTabChange, onClose, actions }: ReconciliationDrawerProps & { transaction: ReconciliationTransaction }) {
  const { role } = useReconciliation();
  const { data: drawerRes, isFetching: loading } = useGetDrawerDetailsQuery(transaction.id);
  const drawerData = drawerRes?.data;
  const [postSubmitting, setPostSubmitting] = useState(false);

  const tx = transaction;

  const handlePost = () => {
    setPostSubmitting(true);
    setTimeout(() => {
      actions.requestPostToQuickBooks(tx);
      setPostSubmitting(false);
    }, 500);
  };

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .recon-drawer-panel { width: 100vw !important; }
        }
      `}</style>
      <div
        role="presentation"
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(42,22,40,0.3)', backdropFilter: 'blur(2px)', zIndex: 1020 }}
      />
      <FocusTrap onEscape={onClose}>
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Reconciliation detail for ${tx.id}`}
          className="recon-drawer-panel"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: '560px', maxWidth: '100vw',
            background: '#ffffff', zIndex: 1021, boxShadow: '-8px 0 48px rgba(42,22,40,0.18)',
            display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-sans), Inter, sans-serif',
          }}
        >
          {/* Header */}
          <div style={{ background: '#FAF8F5', padding: '1.25rem 1.5rem', borderBottom: '1px solid #DDD0C4', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(232,118,10,0.1)', color: '#E8760A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9375rem', flexShrink: 0 }}>
                  {tx.client.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#2A1628' }}>{tx.client}</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.5)', fontFamily: 'monospace' }}>{tx.id}</div>
                </div>
              </div>
              <button onClick={onClose} aria-label="Close drawer" style={{ background: 'rgba(42,22,40,0.06)', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2A1628', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.85rem' }}>
              <StatusPill status={tx.status} size="sm" />
              <PriorityPill priority={tx.priority} size="sm" />
            </div>
          </div>

          {/* Tab strip */}
          <div style={{ display: 'flex', alignItems: 'stretch', borderBottom: '1px solid #DDD0C4', position: 'relative', flexShrink: 0, background: '#fff' }}>
            <button 
              onClick={() => {
                const el = document.getElementById('drawer-tab-container');
                if (el) el.scrollBy({ left: -200, behavior: 'smooth' });
              }} 
              style={{ background: '#FAF8F5', border: 'none', cursor: 'pointer', padding: '0 0.5rem', zIndex: 2, borderRight: '1px solid #DDD0C4', display: 'flex', alignItems: 'center', color: '#2A1628' }}
              aria-label="Scroll left"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>

            <div id="drawer-tab-container" className="drawer-tabs-scroll" style={{ display: 'flex', overflowX: 'auto', flex: 1, scrollBehavior: 'smooth' }} role="tablist">
              <style>{`
                .drawer-tabs-scroll::-webkit-scrollbar {
                  display: none !important;
                  height: 0 !important;
                  width: 0 !important;
                }
                .drawer-tabs-scroll {
                  -ms-overflow-style: none !important;
                  scrollbar-width: none !important;
                }
              `}</style>
              {TABS.map((t) => {
                const isActive = activeTab === t.key;
                return (
                  <button
                    key={t.key}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => onTabChange(t.key)}
                    style={{
                      background: 'transparent', border: 'none', borderBottom: isActive ? '2px solid #E8760A' : '2px solid transparent',
                      color: isActive ? '#E8760A' : 'rgba(42,22,40,0.5)', fontWeight: isActive ? 700 : 500, fontSize: '0.7rem',
                      cursor: 'pointer', padding: '0.75rem 0.85rem', whiteSpace: 'nowrap', fontFamily: 'inherit', flexShrink: 0,
                    }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            <button 
              onClick={() => {
                const el = document.getElementById('drawer-tab-container');
                if (el) el.scrollBy({ left: 200, behavior: 'smooth' });
              }} 
              style={{ background: '#FAF8F5', border: 'none', cursor: 'pointer', padding: '0 0.5rem', zIndex: 2, borderLeft: '1px solid #DDD0C4', display: 'flex', alignItems: 'center', color: '#2A1628' }}
              aria-label="Scroll right"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: loading ? 0 : '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }} className="hide-scrollbar">
            {loading ? (
              <DrawerSkeleton />
            ) : (
              <>
                {activeTab === 'overview' && <OverviewTab tx={tx} actions={actions} />}
                {activeTab === 'transactions' && <TransactionsTab tx={tx} actions={actions} />}
                {activeTab === 'aiMatching' && <AiMatchingTab tx={tx} actions={actions} drawerData={drawerData} />}
                {activeTab === 'manualMatch' && <ManualMatchTab tx={tx} actions={actions} />}
                {activeTab === 'validation' && <ValidationTab tx={tx} actions={actions} drawerData={drawerData} />}
                {activeTab === 'timeline' && <TimelineTab tx={tx} actions={actions} drawerData={drawerData} />}
                {activeTab === 'activity' && <ActivityTab tx={tx} actions={actions} drawerData={drawerData} />}
                {activeTab === 'documents' && <DocumentsTab tx={tx} actions={actions} drawerData={drawerData} />}
                {activeTab === 'quickBooksSync' && <QuickBooksSyncTab tx={tx} actions={actions} />}
                {activeTab === 'notes' && <NotesTab tx={tx} actions={actions} drawerData={drawerData} />}
              </>
            )}
          </div>

          {/* Bottom action bar */}
          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #DDD0C4', background: '#FAF8F5', display: 'flex', gap: '0.6rem', flexWrap: 'wrap', flexShrink: 0 }}>
            <button
              onClick={() => actions.requestApprove(tx)}
              disabled={!can(role, 'approve')}
              title={restrictionReason(role, 'approve') || undefined}
              style={{ flex: 1, minWidth: '110px', background: '#137333', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.65rem', fontSize: '0.78rem', fontWeight: 700, cursor: can(role, 'approve') ? 'pointer' : 'not-allowed', opacity: can(role, 'approve') ? 1 : 0.5, fontFamily: 'inherit' }}
            >
              Approve
            </button>
            <button
              onClick={() => actions.requestReject(tx)}
              disabled={!can(role, 'reject')}
              title={restrictionReason(role, 'reject') || undefined}
              style={{ flex: 1, minWidth: '100px', background: '#fff', color: '#D32F2F', border: '1px solid #D32F2F55', borderRadius: '8px', padding: '0.65rem', fontSize: '0.78rem', fontWeight: 700, cursor: can(role, 'reject') ? 'pointer' : 'not-allowed', opacity: can(role, 'reject') ? 1 : 0.5, fontFamily: 'inherit' }}
            >
              Reject
            </button>
            <button
              onClick={() => actions.requestChanges(tx)}
              style={{ flex: 1, minWidth: '130px', background: '#fff', color: '#2A1628', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.65rem', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Request Changes
            </button>
            <button
              onClick={handlePost}
              disabled={!can(role, 'postToQuickBooks') || postSubmitting}
              title={restrictionReason(role, 'postToQuickBooks') || undefined}
              style={{ flex: 1, minWidth: '150px', background: '#2A1628', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.65rem', fontSize: '0.78rem', fontWeight: 700, cursor: can(role, 'postToQuickBooks') ? 'pointer' : 'not-allowed', opacity: can(role, 'postToQuickBooks') ? 1 : 0.5, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            >
              {postSubmitting && <ButtonSpinner />}
              Post To QuickBooks
            </button>
            <button
              onClick={onClose}
              style={{ width: '100%', background: 'transparent', color: 'rgba(42,22,40,0.55)', border: 'none', padding: '0.4rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Close Drawer
            </button>
          </div>
        </div>
      </FocusTrap>
    </>
  );
}


// ============================================================================
// popups/ImportBankStatementModal.tsx
// ============================================================================


interface ImportBankStatementModalProps {
  onClose: () => void;
  onImported: (fileName: string, bank: string) => void;
}

type SourceTab = 'Local Upload' | 'Google Drive' | 'OneDrive' | 'CSV' | 'Excel';

const TABS_ImportBankStatementModal: SourceTab[] = ['Local Upload', 'Google Drive', 'OneDrive', 'CSV', 'Excel'];

const BANKS_ImportBankStatementModal = ['Emirates NBD', 'ADCB', 'Mashreq Bank', 'FAB', 'RAKBank', 'Dubai Islamic Bank'];


interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  icon?: React.ReactNode;
}

function CustomSelect({ value, onChange, options, placeholder = 'Select...', icon }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', fontFamily: 'var(--font-sans), Inter, sans-serif' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.625rem 0.75rem',
          paddingLeft: icon ? '2.25rem' : '0.75rem',
          borderRadius: '10px',
          border: isOpen ? '1.5px solid #E8760A' : '1px solid #DDD0C4',
          background: '#ffffff',
          color: value ? '#2A1628' : 'rgba(42,22,40,0.4)',
          fontSize: '0.8125rem',
          fontFamily: 'inherit',
          textAlign: 'left',
          cursor: 'pointer',
          outline: 'none',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {icon && (
          <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
            {icon}
          </div>
        )}
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
          {value || placeholder}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#2A1628"
          strokeWidth="2"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s',
            flexShrink: 0,
            opacity: 0.6,
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            background: '#ffffff',
            border: '1px solid #DDD0C4',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(42,22,40,0.1)',
            zIndex: 1000,
            maxHeight: '220px',
            overflowY: 'auto',
            padding: '4px',
          }}
        >
          {options.map((opt) => {
            const isSelected = opt === value;
            return (
              <div
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                style={{
                  padding: '0.55rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  color: isSelected ? '#E8760A' : '#2A1628',
                  background: isSelected ? 'rgba(232,118,10,0.08)' : 'transparent',
                  cursor: 'pointer',
                  fontWeight: isSelected ? 700 : 500,
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'rgba(232,118,10,0.04)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                {opt}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface CustomDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function CustomDatePicker({ value, onChange, placeholder = 'Select date...' }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => (value ? new Date(value) : new Date()));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayIndex = new Date(year, month, 1).getDay();

  const days = [];
  for (let i = 0; i < startDayIndex; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  const formatSelectedDate = (dayNum: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(dayNum).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const handleSelectDay = (dayNum: number) => {
    onChange(formatSelectedDate(dayNum));
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    onChange(`${today.getFullYear()}-${mm}-${dd}`);
    setCurrentDate(today);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  const displayValue = () => {
    if (!value) return '';
    const parts = value.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return value;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', fontFamily: 'var(--font-sans), Inter, sans-serif' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.625rem 0.75rem',
          paddingLeft: '2.25rem',
          borderRadius: '10px',
          border: isOpen ? '1.5px solid #E8760A' : '1px solid #DDD0C4',
          background: '#ffffff',
          color: value ? '#2A1628' : 'rgba(42,22,40,0.4)',
          fontSize: '0.8125rem',
          fontFamily: 'inherit',
          textAlign: 'left',
          cursor: 'pointer',
          outline: 'none',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(42,22,40,0.4)" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <span style={{ flex: 1, fontWeight: 500 }}>{displayValue() || placeholder}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(42,22,40,0.4)" strokeWidth="2" style={{ flexShrink: 0, opacity: 0.6 }}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            marginBottom: '4px',
            background: '#ffffff',
            border: '1px solid #DDD0C4',
            borderRadius: '12px',
            boxShadow: '0 12px 32px rgba(42,22,40,0.15)',
            zIndex: 1000,
            width: '270px',
            padding: '12px',
            boxSizing: 'border-box',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <button
              type="button"
              onClick={handlePrevMonth}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#2A1628', padding: '4px' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2A1628' }}>
              {monthNames[month]}, {year}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#2A1628', padding: '4px' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Week Days */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '6px' }}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <span key={d} style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.45)' }}>
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {days.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} />;
              }
              const isSelected = formatSelectedDate(day) === value;
              const isToday = (() => {
                const t = new Date();
                return t.getDate() === day && t.getMonth() === month && t.getFullYear() === year;
              })();

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  style={{
                    border: 'none',
                    background: isSelected ? '#E8760A' : 'transparent',
                    color: isSelected ? '#ffffff' : '#2A1628',
                    borderRadius: '8px',
                    height: '28px',
                    fontSize: '0.75rem',
                    fontWeight: isSelected || isToday ? 700 : 500,
                    cursor: 'pointer',
                    outline: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isToday && !isSelected ? 'inset 0 0 0 1.5px #2A1628' : 'none',
                    transition: 'all 0.1s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'rgba(232,118,10,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer links */}
          <div style={{ borderTop: '1px solid rgba(42,22,40,0.06)', marginTop: '10px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <button
              type="button"
              onClick={handleClear}
              style={{ background: 'transparent', border: 'none', color: 'rgba(42,22,40,0.5)', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleToday}
              style={{ background: 'transparent', border: 'none', color: '#E8760A', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface CustomMonthPickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function CustomMonthPicker({ value, onChange, placeholder = 'Select month...' }: CustomMonthPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [year, setYear] = useState(() => (value ? Number(value.split('-')[0]) : new Date().getFullYear()));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const months = [
    { key: '01', label: 'Jan' }, { key: '02', label: 'Feb' }, { key: '03', label: 'Mar' }, { key: '04', label: 'Apr' },
    { key: '05', label: 'May' }, { key: '06', label: 'Jun' }, { key: '07', label: 'Jul' }, { key: '08', label: 'Aug' },
    { key: '09', label: 'Sep' }, { key: '10', label: 'Oct' }, { key: '11', label: 'Nov' }, { key: '12', label: 'Dec' }
  ];

  const handleSelectMonth = (monthKey: string) => {
    onChange(`${year}-${monthKey}`);
    setIsOpen(false);
  };

  const displayValue = () => {
    if (!value) return '';
    const parts = value.split('-');
    if (parts.length === 2) {
      const idx = Number(parts[1]) - 1;
      return `${months[idx]?.label} ${parts[0]}`;
    }
    return value;
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', fontFamily: 'var(--font-sans), Inter, sans-serif' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.625rem 0.75rem',
          paddingLeft: '2.25rem',
          borderRadius: '10px',
          border: isOpen ? '1.5px solid #E8760A' : '1px solid #DDD0C4',
          background: '#ffffff',
          color: value ? '#2A1628' : 'rgba(42,22,40,0.4)',
          fontSize: '0.8125rem',
          fontFamily: 'inherit',
          textAlign: 'left',
          cursor: 'pointer',
          outline: 'none',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(42,22,40,0.4)" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <span style={{ flex: 1, fontWeight: 500 }}>{displayValue() || placeholder}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(42,22,40,0.4)" strokeWidth="2" style={{ flexShrink: 0, opacity: 0.6 }}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            marginBottom: '4px',
            background: '#ffffff',
            border: '1px solid #DDD0C4',
            borderRadius: '12px',
            boxShadow: '0 12px 32px rgba(42,22,40,0.15)',
            zIndex: 1000,
            width: '240px',
            padding: '12px',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <button
              type="button"
              onClick={() => setYear(year - 1)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#2A1628', padding: '4px' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2A1628' }}>{year}</span>
            <button
              type="button"
              onClick={() => setYear(year + 1)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#2A1628', padding: '4px' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            {months.map((m) => {
              const isSelected = `${year}-${m.key}` === value;
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => handleSelectMonth(m.key)}
                  style={{
                    border: 'none',
                    background: isSelected ? '#E8760A' : 'transparent',
                    color: isSelected ? '#ffffff' : '#2A1628',
                    borderRadius: '8px',
                    height: '32px',
                    fontSize: '0.75rem',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.1s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'rgba(232,118,10,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}


const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.7rem',
  fontWeight: 700,
  color: 'rgba(42,22,40,0.55)',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  marginBottom: '0.4rem',
};

function ImportBankStatementModal({ onClose, onImported }: ImportBankStatementModalProps) {
  const { pushToast } = useReconciliation();
  const [activeTab, setActiveTab] = useState<SourceTab>('Local Upload');
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [bank, setBank] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const [connecting, setConnecting] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const acceptForTab = activeTab === 'CSV' ? '.csv' : activeTab === 'Excel' ? '.xlsx,.xls' : '.csv,.xlsx,.ofx,.qif';

  const handleFiles = (files: FileList | null) => {
    if (files && files.length > 0) {
      setFileName(files[0].name);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDownloadTemplate = () => {
    pushToast({ message: 'Statement template download started.', tone: 'info' });
  };

  const handleConnect = (provider: string) => {
    setConnecting(provider);
    setTimeout(() => {
      setConnecting(null);
      setConnected((prev) => ({ ...prev, [provider]: true }));
      pushToast({ message: `${provider} connected successfully.`, tone: 'success' });
    }, 600);
  };

  const canUpload = Boolean(bank) && (activeTab !== 'Local Upload' || Boolean(fileName));

  const handleUpload = () => {
    if (!canUpload || submitting) return;
    setSubmitting(true);
    setTimeout(() => {
      const resolvedFileName = fileName || (activeTab === 'CSV' ? 'bank_statement.csv' : activeTab === 'Excel' ? 'bank_statement.xlsx' : 'bank_statement.csv');
      setSubmitting(false);
      onImported(resolvedFileName, bank);
      pushToast({ message: 'Bank statement imported successfully.', tone: 'success' });
      onClose();
    }, 600);
  };

  const renderDropzone = () => (
    <div
      role="button"
      tabIndex={0}
      onClick={() => fileInputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        border: isDragging ? '1.5px solid #E8760A' : '1.5px dashed #DDD0C4',
        background: isDragging ? 'rgba(232,118,10,0.05)' : '#FAF8F5',
        borderRadius: '12px',
        padding: '2rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.6rem',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'border 0.15s ease, background 0.15s ease',
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptForTab}
        onChange={(e) => handleFiles(e.target.files)}
        style={{ display: 'none' }}
      />
      <div
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '10px',
          background: isDragging ? 'rgba(232,118,10,0.12)' : 'rgba(42,22,40,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isDragging ? '#E8760A' : '#2A1628',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 16V4M12 4l-4 4M12 4l4 4" />
          <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        </svg>
      </div>
      {fileName ? (
        <div>
          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#2A1628' }}>{fileName}</p>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.7rem', color: '#137333', fontWeight: 600 }}>File selected — click to replace</p>
        </div>
      ) : (
        <div>
          <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, color: '#2A1628' }}>
            {isDragging ? 'Drop file to upload' : 'Drag & drop your statement here'}
          </p>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.7rem', color: 'rgba(42,22,40,0.5)' }}>or click to browse from your device</p>
        </div>
      )}
    </div>
  );

  const renderCloudTab = (provider: 'Google Drive' | 'OneDrive') => {
    const isConnected = connected[provider];
    const isConnecting = connecting === provider;
    const isGDrive = provider === 'Google Drive';

    return (
      <div
        style={{
          border: '1.5px dashed #DDD0C4',
          background: '#FAF8F5',
          borderRadius: '12px',
          padding: '2.5rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          textAlign: 'center',
        }}
      >
        {isConnected ? (
          <>
            <div style={{
              width: '56px',
              height: '56px',
              background: isGDrive ? 'rgba(66,133,244,0.05)' : 'rgba(0,120,212,0.05)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {isGDrive ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="8" height="8" rx="1.5" fill="#4285F4" />
                  <rect x="13" y="3" width="8" height="8" rx="1.5" fill="#34A853" />
                  <rect x="3" y="13" width="8" height="8" rx="1.5" fill="#FBBC05" />
                  <rect x="13" y="13" width="8" height="8" rx="1.5" fill="#EA4335" />
                </svg>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="8" height="8" rx="1.5" fill="#0078D4" />
                  <rect x="13" y="3" width="8" height="8" rx="1.5" fill="#00B7C3" />
                  <rect x="3" y="13" width="8" height="8" rx="1.5" fill="#0078D4" />
                  <rect x="13" y="13" width="8" height="8" rx="1.5" fill="#0078D4" />
                </svg>
              )}
            </div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#137333',
                background: '#E6F4EA',
                borderRadius: '999px',
                padding: '0.25rem 0.6rem',
              }}
            >
              Account connected
            </span>
            {renderDropzone()}
          </>
        ) : (
          <>
            <div style={{
              width: '56px',
              height: '56px',
              background: isGDrive ? 'rgba(66,133,244,0.05)' : 'rgba(0,120,212,0.05)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {isGDrive ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="8" height="8" rx="1.5" fill="#4285F4" />
                  <rect x="13" y="3" width="8" height="8" rx="1.5" fill="#34A853" />
                  <rect x="3" y="13" width="8" height="8" rx="1.5" fill="#FBBC05" />
                  <rect x="13" y="13" width="8" height="8" rx="1.5" fill="#EA4335" />
                </svg>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="8" height="8" rx="1.5" fill="#0078D4" />
                  <rect x="13" y="3" width="8" height="8" rx="1.5" fill="#00B7C3" />
                  <rect x="3" y="13" width="8" height="8" rx="1.5" fill="#0078D4" />
                  <rect x="13" y="13" width="8" height="8" rx="1.5" fill="#0078D4" />
                </svg>
              )}
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: '#2A1628' }}>
                {isGDrive ? 'Connect Google Drive' : 'Connect OneDrive'}
              </h4>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.8125rem', color: 'rgba(42,22,40,0.5)', maxWidth: '300px' }}>
                {isGDrive 
                  ? 'Sign in with Google to browse and pick an Excel sheet from your Drive'
                  : 'Sign in with Microsoft to browse and pick an Excel sheet from your OneDrive'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleConnect(provider)}
              disabled={isConnecting}
              style={{
                background: isGDrive ? '#4285F4' : '#0078D4',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.625rem 1.5rem',
                fontSize: '0.8125rem',
                fontWeight: 700,
                cursor: isConnecting ? 'default' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontFamily: 'inherit',
                boxShadow: isGDrive ? '0 4px 12px rgba(66,133,244,0.2)' : '0 4px 12px rgba(0,120,212,0.2)',
                opacity: isConnecting ? 0.85 : 1,
              }}
            >
              {isConnecting && <ButtonSpinner />}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="8" height="8" rx="1" fill="#fff" fillOpacity="0.9" />
                <rect x="13" y="3" width="8" height="8" rx="1" fill="#fff" fillOpacity="0.9" />
                <rect x="3" y="13" width="8" height="8" rx="1" fill="#fff" fillOpacity="0.9" />
                <rect x="13" y="13" width="8" height="8" rx="1" fill="#fff" fillOpacity="0.9" />
              </svg>
              {isConnecting ? 'Connecting…' : (isGDrive ? 'Sign in with Google' : 'Sign in with Microsoft')}
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <ModalShell
      onClose={onClose}
      eyebrow="Reconciliation Center"
      titlePlain="Import Bank"
      titleAccent="Statement"
      maxWidth="800px"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            style={{
              background: '#fff',
              border: '1px solid #DDD0C4',
              borderRadius: '10px',
              padding: '0.625rem 1.5rem',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: submitting ? 'default' : 'pointer',
              color: '#2A1628',
              fontFamily: 'inherit',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!canUpload || submitting}
            style={{
              background: !canUpload ? 'rgba(42,22,40,0.12)' : '#2A1628',
              color: !canUpload ? 'rgba(42,22,40,0.3)' : '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '0.625rem 1.5rem',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: !canUpload || submitting ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            {submitting && <ButtonSpinner />}
            Upload
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Segmented tab strip */}
        <div
          style={{
            display: 'flex',
            gap: '4px',
            background: 'rgba(42,22,40,0.04)',
            borderRadius: '12px',
            padding: '4px',
          }}
        >
          {TABS_ImportBankStatementModal.map((tab) => {
            const active = tab === activeTab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: '1 1 auto',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.625rem',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: active ? '#ffffff' : 'transparent',
                  color: active ? '#2A1628' : 'rgba(42,22,40,0.5)',
                  boxShadow: active ? '0 2px 8px rgba(42,22,40,0.05)' : 'none',
                  transition: 'all 0.15s ease',
                  fontFamily: 'inherit',
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div>
          {['Local Upload', 'CSV', 'Excel'].includes(activeTab) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {renderDropzone()}
              <div style={{ background: '#FFFDF9', border: '1px solid #FFE7D0', borderRadius: '12px', padding: '1rem', fontSize: '0.75rem', lineHeight: 1.4, color: 'rgba(42,22,40,0.7)', textAlign: 'left' }}>
                Supported formats: <span style={{ color: 'rgba(42,22,40,0.45)' }}>CSV, Excel (.xlsx, .xls), OFX, QIF</span>.{' '}
                <span onClick={handleDownloadTemplate} style={{ cursor: 'pointer', color: '#E8760A', fontWeight: 600 }}>Download template →</span>
              </div>
            </div>
          )}

          {activeTab === 'Google Drive' && renderCloudTab('Google Drive')}
          {activeTab === 'OneDrive' && renderCloudTab('OneDrive')}
        </div>

        {/* Bank + period — always visible */}
        <div style={{ borderTop: '1px solid rgba(42,22,40,0.06)', paddingTop: '1.1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Bank Name</label>
            <CustomSelect
              value={bank}
              onChange={setBank}
              options={BANKS_ImportBankStatementModal}
              placeholder="Select bank..."
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(42,22,40,0.4)" strokeWidth="2.5">
                  <path d="M3 21h18M3 10h18M5 6h14a2 2 0 0 1 2 2v11H3V8a2 2 0 0 1 2-2z" />
                </svg>
              }
            />
          </div>

          <div>
            <label style={labelStyle}>Statement Period</label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ flex: 1 }}>
                <CustomMonthPicker
                  value={periodStart}
                  onChange={setPeriodStart}
                  placeholder="Start month"
                />
              </div>
              <div style={{ flex: 1 }}>
                <CustomMonthPicker
                  value={periodEnd}
                  onChange={setPeriodEnd}
                  placeholder="End month"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}


// ============================================================================
// popups/CreateBatchModal.tsx
// ============================================================================


interface CreateBatchModalProps {
  onClose: () => void;
  onCreate: (batch: { name: string; description: string; reviewer: string; priority: string; dueDate: string; clients: string[] }) => void;
}

const REVIEWER_OPTIONS = ['Priya Nair', 'Omar Haddad', 'Lucia Ferreira', 'Ahmed Zaid', 'Kevin Park', 'Unassigned'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Urgent'];
const CLIENT_OPTIONS = [
  'ABC Trading LLC',
  'XYZ Holdings Limited',
  'Delta Properties FZCO',
  'Alpha Tech FZCO',
  'Beta Industries LLC',
  'Gamma Solutions FZCO',
  'Nova Hospitality LLC',
  'Prime Consultants FZCO',
];

const labelStyle_CreateBatchModal: React.CSSProperties = {
  display: 'block',
  fontSize: '0.7rem',
  fontWeight: 600,
  color: 'rgba(42,22,40,0.55)',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  marginBottom: '0.4rem',
};

const fieldStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '0.6rem 0.75rem',
  borderRadius: '8px',
  border: '1px solid #DDD0C4',
  fontSize: '0.875rem',
  color: '#2A1628',
  fontFamily: 'var(--font-sans), Inter, sans-serif',
  background: '#ffffff',
  outline: 'none',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1.1rem' }}>
      <label style={labelStyle_CreateBatchModal}>{label}</label>
      {children}
    </div>
  );
}

function CreateBatchModal({ onClose, onCreate }: CreateBatchModalProps) {
  const { pushToast } = useReconciliation();
  const { data: metaRes } = useGetMetadataQuery();

  const dynamicClients = metaRes?.data?.clients || CLIENT_OPTIONS;
  const dynamicReviewers = metaRes?.data?.reviewers ? [...metaRes.data.reviewers, 'Unassigned'] : REVIEWER_OPTIONS;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [reviewer, setReviewer] = useState('Priya Nair');
  const [priority, setPriority] = useState(PRIORITY_OPTIONS[1]);
  const [dueDate, setDueDate] = useState('');
  const [clients, setClients] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (metaRes?.data?.reviewers?.length > 0 && reviewer === 'Priya Nair' && !metaRes.data.reviewers.includes('Priya Nair')) {
      setReviewer(metaRes.data.reviewers[0]);
    }
  }, [metaRes, reviewer]);

  const expectedJobs = useMemo(() => clients.length, [clients]);
  const canSubmit = name.trim().length > 0 && clients.length > 0 && !isSubmitting;

  const toggleClient = (clientName: string) => {
    setClients((prev) =>
      prev.includes(clientName) ? prev.filter((c) => c !== clientName) : [...prev, clientName]
    );
  };

  const handleCreate = () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setTimeout(() => {
      onCreate({
        name: name.trim(),
        description: description.trim(),
        reviewer,
        priority,
        dueDate,
        clients,
      });
      pushToast({ message: 'Reconciliation batch created successfully.', tone: 'success' });
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <ModalShell
      onClose={onClose}
      eyebrow="Reconciliation Center"
      titlePlain="Create Reconciliation"
      titleAccent="Batch"
      maxWidth="800px"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              background: '#fff',
              border: '1px solid #DDD0C4',
              borderRadius: '10px',
              padding: '0.625rem 1.5rem',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: isSubmitting ? 'default' : 'pointer',
              color: '#2A1628',
              fontFamily: 'inherit',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!canSubmit}
            style={{
              background: !canSubmit ? 'rgba(42,22,40,0.12)' : '#2A1628',
              color: !canSubmit ? 'rgba(42,22,40,0.3)' : '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '0.625rem 1.5rem',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: !canSubmit ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: 'inherit',
            }}
          >
            {isSubmitting && <ButtonSpinner />}
            Create Batch
          </button>
        </>
      }
    >
      <Field label="Batch Name">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Q3 Bank Reconciliation — UAE Clients"
          style={fieldStyle}
        />
      </Field>

      <Field label="Description">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Brief context for this reconciliation batch…"
          style={{ ...fieldStyle, resize: 'vertical', fontFamily: 'var(--font-sans), Inter, sans-serif' }}
        />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Field label="Assign Reviewer">
          <CustomSelect
            value={reviewer}
            onChange={setReviewer}
            options={dynamicReviewers}
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(42,22,40,0.4)" strokeWidth="2.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
              </svg>
            }
          />
        </Field>

        <Field label="Priority">
          <CustomSelect
            value={priority}
            onChange={setPriority}
            options={PRIORITY_OPTIONS}
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(42,22,40,0.4)" strokeWidth="2.5">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" />
              </svg>
            }
          />
        </Field>
      </div>

      <Field label="Due Date">
        <CustomDatePicker
          value={dueDate}
          onChange={setDueDate}
          placeholder="Select due date..."
        />
      </Field>

      <Field label="Clients Included">
        <div
          style={{
            border: '1px solid #DDD0C4',
            borderRadius: '8px',
            maxHeight: '160px',
            overflowY: 'auto',
            background: '#FAF8F5',
          }}
        >
          {dynamicClients.map((clientName: string, idx: number) => (
            <label
              key={clientName}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.55rem 0.75rem',
                borderBottom: idx === dynamicClients.length - 1 ? 'none' : '1px solid rgba(42,22,40,0.06)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                color: '#2A1628',
              }}
            >
              <input
                type="checkbox"
                checked={clients.includes(clientName)}
                onChange={() => toggleClient(clientName)}
                style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#E8760A' }}
              />
              {clientName}
            </label>
          ))}
        </div>
      </Field>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(232,118,10,0.08)',
          border: '1px solid rgba(232,118,10,0.25)',
          borderRadius: '10px',
          padding: '0.75rem 1rem',
          marginTop: '0.25rem',
        }}
      >
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(42,22,40,0.65)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Expected Jobs
        </span>
        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#E8760A', fontFamily: 'var(--font-serif), Georgia, serif' }}>
          {expectedJobs}
        </span>
      </div>
    </ModalShell>
  );
}


// ============================================================================
// popups/ExportCenterModal.tsx
// ============================================================================

type ExportScope = 'all' | 'filtered' | 'selected' | 'currentPage' | 'custom';
type ExportFormat = 'excel' | 'csv' | 'pdf' | 'print';

interface ExportCenterModalProps {
  onClose: () => void;
  counts: { all: number; filtered: number; selected: number; currentPage: number };
  onExport: (scope: ExportScope, format: ExportFormat) => void;
}

function ExportCenterModal({ onClose, counts, onExport }: ExportCenterModalProps) {
  const { pushToast } = useReconciliation();
  const [activeTab, setActiveTab] = useState<'standard' | 'qbo'>('standard');
  const [scope, setScope] = useState<ExportScope>('filtered');
  const [format, setFormat] = useState<ExportFormat>('excel');
  const [customCount, setCustomCount] = useState('10');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // QBO Export states
  const [qboYear, setQboYear] = useState('');
  const [qboMonth, setQboMonth] = useState('');

  const handleSubmit = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setTimeout(() => {
      onExport(scope, format);
      pushToast({ message: 'Export completed successfully.', tone: 'success' });
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  const handleQboExport = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token') || '';
      const queryParams = new URLSearchParams();
      if (qboYear) queryParams.append('year', qboYear);
      if (qboMonth) queryParams.append('month', qboMonth);
      
      const response = await fetch(`http://localhost:5000/api/bookkeeping/reconciliation/export/qbo?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `QBO_GL_Export_${qboYear || 'ALL'}_${qboMonth || 'ALL'}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      pushToast({ message: 'QBO GL CSV exported successfully.', tone: 'success' });
      onClose();
    } catch (err) {
      console.error('[QBO Export Error]', err);
      pushToast({ message: 'Failed to export QBO GL.', tone: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const scopeOptions = [
    { key: 'all' as const, label: 'All Transactions', sublabel: 'Export all transactions in the system', count: counts.all },
    { key: 'filtered' as const, label: 'Filtered Results', sublabel: 'Only transactions matching current filters', count: counts.filtered },
    { key: 'selected' as const, label: 'Selected Transactions', sublabel: 'Only the transactions you have checked', count: counts.selected },
    { key: 'custom' as const, label: 'Custom Count', sublabel: 'Specify exactly how many to export', count: null },
  ];

  const formatOptions = [
    { key: 'excel' as const, label: '.XLSX' },
    { key: 'csv' as const, label: '.CSV' },
    { key: 'pdf' as const, label: '.PDF' },
    { key: 'print' as const, label: 'PRINT' },
  ];

  return (
    <ModalShell
      onClose={onClose}
      eyebrow="Reconciliation Center"
      titlePlain="Export"
      titleAccent={activeTab === 'standard' ? 'Transactions' : 'QBO Ledger'}
      maxWidth="500px"
      bodyStyle={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <span style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.45)', fontWeight: 500 }}>
            {activeTab === 'standard' ? (
              <>Exporting as <strong style={{ color: '#2A1628' }}>.{format === 'excel' ? 'XLSX' : format.toUpperCase()}</strong></>
            ) : (
              <>Format: <strong style={{ color: '#2A1628' }}>QBO GL CSV</strong></>
            )}
          </span>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                background: '#fff',
                border: '1px solid #DDD0C4',
                borderRadius: '10px',
                padding: '0.625rem 1.5rem',
                fontSize: '0.8125rem',
                fontWeight: 700,
                cursor: isSubmitting ? 'default' : 'pointer',
                color: '#2A1628',
                fontFamily: 'inherit',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={activeTab === 'standard' ? handleSubmit : handleQboExport}
              disabled={isSubmitting}
              style={{
                background: '#E8760A',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                padding: '0.625rem 1.5rem',
                fontSize: '0.8125rem',
                fontWeight: 700,
                cursor: isSubmitting ? 'default' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontFamily: 'inherit',
                boxShadow: '0 4px 12px rgba(232,118,10,0.25)',
              }}
            >
              {isSubmitting && <ButtonSpinner />}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              {activeTab === 'standard' ? 'Download Export' : 'Export QBO CSV'}
            </button>
          </div>
        </div>
      }
    >
      {/* Tab Selector */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(42,22,40,0.08)', gap: '1.5rem', marginBottom: '0.25rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('standard')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'standard' ? '3px solid #E8760A' : 'none',
            color: activeTab === 'standard' ? '#E8760A' : 'rgba(42,22,40,0.5)',
            fontSize: '0.85rem',
            fontWeight: 800,
            cursor: 'pointer',
            padding: '0.5rem 1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          Export Center
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('qbo')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'qbo' ? '3px solid #E8760A' : 'none',
            color: activeTab === 'qbo' ? '#E8760A' : 'rgba(42,22,40,0.5)',
            fontSize: '0.85rem',
            fontWeight: 800,
            cursor: 'pointer',
            padding: '0.5rem 1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          QuickBooks GL Export
        </button>
      </div>

      {activeTab === 'standard' ? (
        <>
          <div>
            <p
              style={{
                margin: '0 0 0.75rem',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: 'rgba(42,22,40,0.5)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Which transactions to export?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {scopeOptions.map((opt) => {
                const isSelected = scope === opt.key;
                return (
                  <div
                    key={opt.key}
                    onClick={() => setScope(opt.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: `1.5px solid ${isSelected ? '#E8760A' : '#DDD0C4'}`,
                      background: isSelected ? 'rgba(232,118,10,0.04)' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: `2px solid ${isSelected ? '#E8760A' : '#DDD0C4'}`,
                        background: isSelected ? '#E8760A' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {isSelected && <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ffffff' }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#2A1628' }}>{opt.label}</div>
                      <div style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.5)', marginTop: '0.1rem' }}>{opt.sublabel}</div>
                    </div>
                    {opt.count !== null && (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: isSelected ? '#E8760A' : 'rgba(42,22,40,0.4)',
                          background: isSelected ? 'rgba(232,118,10,0.08)' : 'rgba(42,22,40,0.04)',
                          borderRadius: '4px',
                          padding: '0.15rem 0.5rem',
                        }}
                      >
                        {opt.count} transactions
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {scope === 'custom' && (
              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '0.25rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'rgba(42,22,40,0.6)', fontWeight: 600, whiteSpace: 'nowrap' }}>Number of rows:</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={customCount}
                  onChange={(e) => setCustomCount(e.target.value)}
                  style={{ border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.45rem 0.75rem', fontSize: '0.8125rem', color: '#2A1628', outline: 'none', width: '90px', fontFamily: 'inherit' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.45)' }}>top rows</span>
              </div>
            )}
          </div>

          <div>
            <p
              style={{
                margin: '0 0 0.75rem',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: 'rgba(42,22,40,0.5)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              File Format
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {formatOptions.map((opt) => {
                const isSelected = format === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setFormat(opt.key)}
                    style={{
                      flex: '1 1 calc(50% - 0.25rem)',
                      padding: '0.6rem',
                      border: `1.5px solid ${isSelected ? '#E8760A' : '#DDD0C4'}`,
                      borderRadius: '8px',
                      background: isSelected ? 'rgba(232,118,10,0.04)' : '#ffffff',
                      color: isSelected ? '#E8760A' : '#2A1628',
                      fontWeight: 700,
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ background: 'rgba(232,118,10,0.05)', border: '1px solid rgba(232,118,10,0.15)', borderRadius: '10px', padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: '0.1rem' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(42,22,40,0.7)', lineHeight: 1.4 }}>
              QBO GL Export filters reconciled journal rows specifically mapped to QuickBooks Online import guidelines. You can optionally restrict the export scope to a specific year and month.
            </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'rgba(42,22,40,0.5)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Filter Year</label>
              <input
                type="number"
                placeholder="All Years"
                value={qboYear}
                onChange={(e) => setQboYear(e.target.value)}
                style={{ border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.8125rem', color: '#2A1628', width: '100%', outline: 'none', fontFamily: 'inherit' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'rgba(42,22,40,0.5)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Filter Month</label>
              <input
                type="number"
                placeholder="All Months (1-12)"
                min="1"
                max="12"
                value={qboMonth}
                onChange={(e) => setQboMonth(e.target.value)}
                style={{ border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.8125rem', color: '#2A1628', width: '100%', outline: 'none', fontFamily: 'inherit' }}
              />
            </div>
          </div>
        </div>
      )}
    </ModalShell>
  );
}


// ============================================================================
// popups/ManualMatchModal.tsx
// ============================================================================


interface ManualMatchModalProps {
  onClose: () => void;
  tx: ReconciliationTransaction;
  onConfirm: (ledgerEntryLabel: string) => void;
}

interface Candidate_ManualMatchModal {
  id: string;
  label: string;
  sub: string;
  amount: number;
}

function formatMoney(currency: string, amount: number): string {
  const sign = amount < 0 ? '-' : '';
  return `${sign}${currency} ${Math.abs(amount).toFixed(2)}`;
}

function ManualMatchModal({ onClose, tx, onConfirm }: ManualMatchModalProps) {
  const { pushToast } = useReconciliation();
  const [ledgerQuery, setLedgerQuery] = useState('');
  const [bankQuery, setBankQuery] = useState('');
  const [selectedLedgerId, setSelectedLedgerId] = useState<string | null>(null);
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [isMatching, setIsMatching] = useState(false);

  const ledgerCandidates: Candidate_ManualMatchModal[] = useMemo(
    () => [
      { id: 'le-420', label: 'Ledger Entry #420 — Accounts Receivable', sub: `${tx.client} · ${tx.financialYear}`, amount: tx.amount },
      { id: 'le-421', label: 'Ledger Entry #421 — Operating Expenses', sub: `${tx.bookkeeper} · ${tx.month}`, amount: Number((tx.amount + 12.5).toFixed(2)) },
      { id: 'le-422', label: 'Ledger Entry #422 — Vendor Payments', sub: `${tx.manager} · ${tx.financialYear}`, amount: Number((tx.amount - 8).toFixed(2)) },
      { id: 'le-423', label: 'Ledger Entry #423 — Miscellaneous Income', sub: `${tx.client} · ${tx.month}`, amount: Number((tx.amount + 45).toFixed(2)) },
    ],
    [tx]
  );

  const bankCandidates: Candidate_ManualMatchModal[] = useMemo(
    () => [
      { id: 'bk-orig', label: tx.description, sub: `${tx.bank} · ${tx.statementReference}`, amount: tx.amount },
      { id: 'bk-fee', label: `${tx.bank} — Wire Transfer Fee`, sub: `${tx.bankAccount}`, amount: Number((tx.amount - 15).toFixed(2)) },
      { id: 'bk-dd', label: `${tx.bank} — Recurring Direct Debit`, sub: `${tx.bankAccount}`, amount: Number((tx.amount + 22).toFixed(2)) },
      { id: 'bk-batch', label: `${tx.bank} — Card Settlement Batch`, sub: `${tx.bankAccount}`, amount: Number((tx.amount + 3.4).toFixed(2)) },
    ],
    [tx]
  );

  const filteredLedger = useMemo(
    () => ledgerCandidates.filter((c) => c.label.toLowerCase().includes(ledgerQuery.trim().toLowerCase())),
    [ledgerCandidates, ledgerQuery]
  );

  const filteredBank = useMemo(
    () => bankCandidates.filter((c) => c.label.toLowerCase().includes(bankQuery.trim().toLowerCase())),
    [bankCandidates, bankQuery]
  );

  const selectedLedger = ledgerCandidates.find((c) => c.id === selectedLedgerId) ?? null;
  const selectedBank = bankCandidates.find((c) => c.id === selectedBankId) ?? null;

  const canMatch = !!selectedLedger && !!selectedBank && !isMatching;

  const difference = useMemo(() => {
    if (!selectedLedger || !selectedBank) return null;
    return Number(Math.abs(selectedLedger.amount - selectedBank.amount).toFixed(2));
  }, [selectedLedger, selectedBank]);

  function handleMatch() {
    if (!selectedLedger || !selectedBank) return;
    setIsMatching(true);
    setTimeout(() => {
      onConfirm(selectedLedger.label);
      pushToast({ message: 'Transaction matched manually.', tone: 'success' });
      onClose();
    }, 600);
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '0.55rem 0.75rem',
    borderRadius: '9px',
    border: '1px solid #DDD0C4',
    fontSize: '0.82rem',
    color: '#2A1628',
    fontFamily: 'var(--font-sans), Inter, sans-serif',
    outline: 'none',
    background: '#ffffff',
  };

  const columnLabelStyle: React.CSSProperties = {
    margin: '0 0 0.5rem',
    fontSize: '0.68rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'rgba(42,22,40,0.5)',
  };

  function renderCandidateItem(c: Candidate_ManualMatchModal, selected: boolean, onSelect: () => void) {
    return (
      <button
        key={c.id}
        type="button"
        onClick={onSelect}
        style={{
          width: '100%',
          textAlign: 'left',
          padding: '0.6rem 0.7rem',
          marginBottom: '0.5rem',
          borderRadius: '10px',
          border: selected ? '1.5px solid #E8760A' : '1px solid #DDD0C4',
          background: selected ? 'rgba(232,118,10,0.07)' : '#ffffff',
          cursor: 'pointer',
          display: 'block',
          fontFamily: 'var(--font-sans), Inter, sans-serif',
          transition: 'border-color 0.15s ease, background 0.15s ease',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2A1628', lineHeight: 1.3 }}>{c.label}</span>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2A1628', whiteSpace: 'nowrap' }}>{formatMoney(tx.currency, c.amount)}</span>
        </div>
        <div style={{ marginTop: '0.2rem', fontSize: '0.7rem', color: 'rgba(42,22,40,0.5)' }}>{c.sub}</div>
      </button>
    );
  }

  return (
    <ModalShell
      onClose={onClose}
      eyebrow="Reconciliation Center"
      titlePlain="Manual"
      titleAccent="Match"
      maxWidth="800px"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isMatching}
            style={{
              padding: '0.6rem 1.1rem',
              borderRadius: '9px',
              border: '1px solid #DDD0C4',
              background: '#ffffff',
              color: '#2A1628',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: isMatching ? 'default' : 'pointer',
              fontFamily: 'var(--font-sans), Inter, sans-serif',
              opacity: isMatching ? 0.6 : 1,
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleMatch}
            disabled={!canMatch}
            style={{
              padding: '0.6rem 1.3rem',
              borderRadius: '9px',
              border: 'none',
              background: canMatch ? '#E8760A' : 'rgba(232,118,10,0.35)',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: canMatch ? 'pointer' : 'not-allowed',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: 'var(--font-sans), Inter, sans-serif',
            }}
          >
            {isMatching && <ButtonSpinner />}
            {isMatching ? 'Matching…' : 'Match'}
          </button>
        </>
      }
    >
      {/* Summary of the bank transaction being matched */}
      <div
        style={{
          background: '#FAF8F5',
          border: '1px solid #DDD0C4',
          borderRadius: '12px',
          padding: '0.85rem 1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(42,22,40,0.45)' }}>
            Matching Bank Transaction
          </p>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', fontWeight: 600, color: '#2A1628', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {tx.description}
          </p>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#2A1628' }}>{formatMoney(tx.currency, tx.amount)}</p>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.72rem', color: 'rgba(42,22,40,0.5)' }}>{tx.transactionDate}</p>
        </div>
      </div>

      {/* Two search columns */}
      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 260px', minWidth: '240px' }}>
          <p style={columnLabelStyle}>Search Ledger</p>
          <input
            type="text"
            value={ledgerQuery}
            onChange={(e) => setLedgerQuery(e.target.value)}
            placeholder="Search ledger entries…"
            style={{ ...inputStyle, marginBottom: '0.75rem' }}
          />
          <div>
            {filteredLedger.length === 0 && (
              <p style={{ fontSize: '0.78rem', color: 'rgba(42,22,40,0.45)', padding: '0.5rem 0' }}>No ledger entries found.</p>
            )}
            {filteredLedger.map((c) => renderCandidateItem(c, c.id === selectedLedgerId, () => setSelectedLedgerId(c.id)))}
          </div>
        </div>

        <div style={{ flex: '1 1 260px', minWidth: '240px' }}>
          <p style={columnLabelStyle}>Search Bank Transaction</p>
          <input
            type="text"
            value={bankQuery}
            onChange={(e) => setBankQuery(e.target.value)}
            placeholder="Search bank transactions…"
            style={{ ...inputStyle, marginBottom: '0.75rem' }}
          />
          <div>
            {filteredBank.length === 0 && (
              <p style={{ fontSize: '0.78rem', color: 'rgba(42,22,40,0.45)', padding: '0.5rem 0' }}>No bank transactions found.</p>
            )}
            {filteredBank.map((c) => renderCandidateItem(c, c.id === selectedBankId, () => setSelectedBankId(c.id)))}
          </div>
        </div>
      </div>

      {/* Preview panel */}
      {selectedLedger && selectedBank && difference !== null && (
        <div
          style={{
            marginTop: '1.5rem',
            border: '1px solid #DDD0C4',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <div style={{ background: '#FAF8F5', padding: '0.65rem 1rem', borderBottom: '1px solid #DDD0C4' }}>
            <p style={{ margin: 0, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(42,22,40,0.5)' }}>
              Preview
            </p>
          </div>
          <div style={{ padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 220px' }}>
              <p style={{ margin: '0 0 0.3rem', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(42,22,40,0.45)' }}>
                Ledger
              </p>
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#2A1628' }}>{selectedLedger.label}</p>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.95rem', fontWeight: 700, color: '#2A1628' }}>{formatMoney(tx.currency, selectedLedger.amount)}</p>
            </div>
            <div style={{ flex: '1 1 220px' }}>
              <p style={{ margin: '0 0 0.3rem', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(42,22,40,0.45)' }}>
                Bank Transaction
              </p>
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#2A1628' }}>{selectedBank.label}</p>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.95rem', fontWeight: 700, color: '#2A1628' }}>{formatMoney(tx.currency, selectedBank.amount)}</p>
            </div>
          </div>
          <div
            style={{
              padding: '0.75rem 1rem',
              borderTop: '1px solid #DDD0C4',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#ffffff',
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(42,22,40,0.5)' }}>
              Difference
            </span>
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: difference === 0 ? '#137333' : '#D32F2F' }}>
              {formatMoney(tx.currency, difference)}
            </span>
          </div>
        </div>
      )}
    </ModalShell>
  );
}


// ============================================================================
// popups/SplitTransactionModal.tsx
// ============================================================================


interface SplitTransactionModalProps {
  onClose: () => void;
  tx: ReconciliationTransaction;
  onConfirm: (rows: { label: string; amount: number }[]) => void;
}

interface SplitRow {
  id: number;
  label: string;
  amount: string;
}

const labelStyle_SplitTransactionModal: React.CSSProperties = {
  display: 'block',
  fontSize: '0.7rem',
  fontWeight: 600,
  color: 'rgba(42,22,40,0.55)',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  marginBottom: '0.4rem',
};

const fieldStyle_SplitTransactionModal: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '0.6rem 0.75rem',
  borderRadius: '8px',
  border: '1px solid #DDD0C4',
  fontSize: '0.875rem',
  color: '#2A1628',
  fontFamily: 'var(--font-sans), Inter, sans-serif',
  background: '#ffffff',
  outline: 'none',
};

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function makeInitialRows(amount: number): SplitRow[] {
  const first = round2(amount * 0.6);
  const second = round2(amount * 0.4);
  return [
    { id: 1, label: 'Allocation 1', amount: String(first) },
    { id: 2, label: 'Allocation 2', amount: String(second) },
  ];
}

function SplitTransactionModal({ onClose, tx, onConfirm }: SplitTransactionModalProps) {
  const { pushToast } = useReconciliation();
  const [rows, setRows] = useState<SplitRow[]>(() => makeInitialRows(tx.amount));
  const [nextId, setNextId] = useState(3);
  const [validated, setValidated] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const rowsTotal = useMemo(
    () => round2(rows.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0)),
    [rows]
  );

  const remaining = useMemo(() => round2(tx.amount - rowsTotal), [tx.amount, rowsTotal]);
  const isBalanced = Math.abs(remaining) < 0.005;

  const updateRow = (id: number, patch: Partial<SplitRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    setValidated(false);
  };

  const addRow = () => {
    setRows((prev) => [...prev, { id: nextId, label: `Allocation ${prev.length + 1}`, amount: '0' }]);
    setNextId((n) => n + 1);
    setValidated(false);
  };

  const removeRow = (id: number) => {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)));
    setValidated(false);
  };

  const handleValidate = () => {
    setValidated(isBalanced);
  };

  const canConfirm = validated && isBalanced && !isConfirming;

  const handleConfirm = () => {
    if (!canConfirm) return;
    setIsConfirming(true);
    setTimeout(() => {
      const finalRows = rows.map((r) => ({ label: r.label.trim() || 'Untitled Allocation', amount: parseFloat(r.amount) || 0 }));
      onConfirm(finalRows);
      pushToast({ message: 'Transaction split successfully.', tone: 'success' });
      setIsConfirming(false);
      onClose();
    }, 600);
  };

  return (
    <ModalShell
      onClose={onClose}
      eyebrow="Reconciliation Center"
      titlePlain="Split"
      titleAccent="Transaction"
      maxWidth="560px"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isConfirming}
            style={{
              background: '#ffffff',
              color: '#2A1628',
              border: '1px solid #DDD0C4',
              borderRadius: '8px',
              padding: '0.6rem 1.25rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: isConfirming ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-sans), Inter, sans-serif',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            style={{
              background: '#E8760A',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.6rem 1.4rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: canConfirm ? 'pointer' : 'not-allowed',
              opacity: canConfirm ? 1 : 0.5,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: 'var(--font-sans), Inter, sans-serif',
            }}
          >
            {isConfirming && <ButtonSpinner />}
            Confirm Split
          </button>
        </>
      }
    >
      <div style={{ marginBottom: '1.1rem' }}>
        <label style={labelStyle_SplitTransactionModal}>Original Amount</label>
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            background: '#FAF8F5',
            border: '1px solid #DDD0C4',
            fontSize: '1.15rem',
            fontWeight: 700,
            color: '#2A1628',
            fontFamily: 'var(--font-serif), Georgia, serif',
          }}
        >
          {tx.currency} {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      <div style={{ marginBottom: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label style={{ ...labelStyle_SplitTransactionModal, marginBottom: 0 }}>Split Rows</label>
        <button
          type="button"
          onClick={addRow}
          style={{
            background: 'rgba(232,118,10,0.1)',
            color: '#E8760A',
            border: '1px solid rgba(232,118,10,0.3)',
            borderRadius: '7px',
            padding: '0.35rem 0.7rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'var(--font-sans), Inter, sans-serif',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <span style={{ fontSize: '0.95rem', lineHeight: 1 }}>+</span> Add Row
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.1rem' }}>
        {rows.map((row, idx) => (
          <div key={row.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="text"
              value={row.label}
              onChange={(e) => updateRow(row.id, { label: e.target.value })}
              placeholder={`Allocation ${idx + 1}`}
              style={{ ...fieldStyle_SplitTransactionModal, flex: '1.4 1 0%' }}
            />
            <div style={{ position: 'relative', flex: '1 1 0%' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '0.8rem',
                  color: 'rgba(42,22,40,0.45)',
                  pointerEvents: 'none',
                }}
              >
                {tx.currency}
              </span>
              <input
                type="number"
                step="0.01"
                value={row.amount}
                onChange={(e) => updateRow(row.id, { amount: e.target.value })}
                style={{ ...fieldStyle_SplitTransactionModal, paddingLeft: tx.currency.length > 2 ? '2.75rem' : '2.25rem', textAlign: 'right' }}
              />
            </div>
            <button
              type="button"
              onClick={() => removeRow(row.id)}
              disabled={rows.length <= 1}
              aria-label={`Remove row ${idx + 1}`}
              style={{
                background: 'rgba(211,47,47,0.08)',
                color: rows.length <= 1 ? 'rgba(211,47,47,0.3)' : '#D32F2F',
                border: 'none',
                borderRadius: '7px',
                width: '32px',
                height: '32px',
                flexShrink: 0,
                cursor: rows.length <= 1 ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                lineHeight: 1,
                fontWeight: 700,
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: isBalanced ? 'rgba(19,115,51,0.08)' : 'rgba(211,47,47,0.08)',
          border: `1px solid ${isBalanced ? 'rgba(19,115,51,0.3)' : 'rgba(211,47,47,0.3)'}`,
          borderRadius: '10px',
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
        }}
      >
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(42,22,40,0.65)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Adjustment
        </span>
        <span
          style={{
            fontSize: '1.3rem',
            fontWeight: 700,
            color: isBalanced ? '#137333' : '#D32F2F',
            fontFamily: 'var(--font-serif), Georgia, serif',
          }}
        >
          {tx.currency} {remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      {validated && (
        <div
          role="status"
          style={{
            padding: '0.7rem 1rem',
            borderRadius: '10px',
            marginBottom: '1rem',
            fontSize: '0.82rem',
            fontWeight: 600,
            background: isBalanced ? 'rgba(19,115,51,0.1)' : 'rgba(211,47,47,0.1)',
            color: isBalanced ? '#137333' : '#D32F2F',
            border: `1px solid ${isBalanced ? 'rgba(19,115,51,0.3)' : 'rgba(211,47,47,0.3)'}`,
          }}
        >
          {isBalanced
            ? 'Split validated — rows balance to the original amount.'
            : 'Rows do not sum to the original amount. Adjust before confirming.'}
        </div>
      )}

      <button
        type="button"
        onClick={handleValidate}
        style={{
          width: '100%',
          background: '#2A1628',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          padding: '0.65rem 1rem',
          fontSize: '0.85rem',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'var(--font-sans), Inter, sans-serif',
        }}
      >
        Validate
      </button>
    </ModalShell>
  );
}


// ============================================================================
// popups/MergeTransactionsModal.tsx
// ============================================================================


interface MergeTransactionsModalProps {
  onClose: () => void;
  tx: ReconciliationTransaction;
  onConfirm: (mergedWithLabels: string[]) => void;
}

interface MockNearbyTransaction {
  id: string;
  description: string;
  amount: number;
  date: string;
}

const MOCK_NEARBY_TRANSACTIONS: MockNearbyTransaction[] = [
  { id: 'nearby-1', description: 'Bank Fee Adjustment', amount: 25, date: '2026-07-06' },
  { id: 'nearby-2', description: 'Rounding Correction', amount: 5, date: '2026-07-07' },
  { id: 'nearby-3', description: 'Partial Settlement', amount: 120, date: '2026-07-07' },
];

function formatAmount(amount: number, currency: string) {
  const sign = amount < 0 ? '-' : '';
  return `${sign}${currency} ${Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

const sectionLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.7rem',
  fontWeight: 600,
  color: 'rgba(42,22,40,0.55)',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  marginBottom: '0.6rem',
};

function MergeTransactionsModal({ onClose, tx, onConfirm }: MergeTransactionsModalProps) {
  const { pushToast } = useReconciliation();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedTransactions = useMemo(
    () => MOCK_NEARBY_TRANSACTIONS.filter((t) => selectedIds.includes(t.id)),
    [selectedIds]
  );

  const mergedTotal = useMemo(
    () => tx.amount + selectedTransactions.reduce((sum, t) => sum + t.amount, 0),
    [tx.amount, selectedTransactions]
  );

  const hasSelection = selectedIds.length > 0;
  const canConfirm = hasSelection && !isSubmitting;

  const toggleTransaction = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleConfirmMerge = () => {
    if (!canConfirm) return;
    setIsSubmitting(true);
    const mergedWithLabels = selectedTransactions.map((t) => `${t.description} (${formatAmount(t.amount, tx.currency)})`);
    setTimeout(() => {
      onConfirm(mergedWithLabels);
      pushToast({ message: 'Transactions merged successfully.', tone: 'success' });
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <ModalShell
      onClose={onClose}
      eyebrow="Reconciliation Center"
      titlePlain="Merge"
      titleAccent="Transactions"
      maxWidth="560px"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              background: '#ffffff',
              color: '#2A1628',
              border: '1px solid #DDD0C4',
              borderRadius: '8px',
              padding: '0.6rem 1.25rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-sans), Inter, sans-serif',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmMerge}
            disabled={!canConfirm}
            style={{
              background: '#2A1628',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.6rem 1.4rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: canConfirm ? 'pointer' : 'not-allowed',
              opacity: canConfirm ? 1 : 0.5,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: 'var(--font-sans), Inter, sans-serif',
            }}
          >
            {isSubmitting && <ButtonSpinner />}
            Confirm Merge
          </button>
        </>
      }
    >
      {/* Primary transaction */}
      <div style={{ marginBottom: '1.25rem' }}>
        <span style={sectionLabelStyle}>Primary Transaction</span>
        <div
          style={{
            background: '#FAF8F5',
            border: '1px solid #DDD0C4',
            borderRadius: '10px',
            padding: '0.9rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#2A1628', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {tx.description}
            </p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'rgba(42,22,40,0.55)' }}>
              {formatDate(tx.transactionDate)} &middot; {tx.client}
            </p>
          </div>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#2A1628', fontFamily: 'var(--font-serif), Georgia, serif', flexShrink: 0 }}>
            {formatAmount(tx.amount, tx.currency)}
          </span>
        </div>
      </div>

      {/* Multiple transactions */}
      <div style={{ marginBottom: '1.25rem' }}>
        <span style={sectionLabelStyle}>Multiple Transactions</span>
        <p style={{ margin: '0 0 0.6rem', fontSize: '0.75rem', color: 'rgba(42,22,40,0.55)', lineHeight: 1.5 }}>
          Nearby transactions found for the same client. Select the ones to fold into a single ledger entry.
        </p>
        <div style={{ border: '1px solid #DDD0C4', borderRadius: '10px', overflow: 'hidden' }}>
          {MOCK_NEARBY_TRANSACTIONS.map((t, idx) => {
            const checked = selectedIds.includes(t.id);
            return (
              <label
                key={t.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderBottom: idx === MOCK_NEARBY_TRANSACTIONS.length - 1 ? 'none' : '1px solid rgba(42,22,40,0.06)',
                  background: checked ? 'rgba(232,118,10,0.06)' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleTransaction(t.id)}
                    style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#E8760A', flexShrink: 0 }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#2A1628', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.description}
                    </p>
                    <p style={{ margin: '0.15rem 0 0', fontSize: '0.7rem', color: 'rgba(42,22,40,0.5)' }}>{formatDate(t.date)}</p>
                  </div>
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2A1628', flexShrink: 0 }}>
                  {formatAmount(t.amount, tx.currency)}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Merged total */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(232,118,10,0.08)',
          border: '1px solid rgba(232,118,10,0.25)',
          borderRadius: '10px',
          padding: '0.85rem 1.1rem',
          marginBottom: '1rem',
        }}
      >
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(42,22,40,0.65)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Merged Total
        </span>
        <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#E8760A', fontFamily: 'var(--font-serif), Georgia, serif' }}>
          {formatAmount(mergedTotal, tx.currency)}
        </span>
      </div>

      {/* Validation */}
      <div>
        <span style={sectionLabelStyle}>Validation</span>
        {hasSelection ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#137333', fontWeight: 600 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
              <path d="M20 6L9 17l-5-5" />
            </svg>
            Ready to merge into a single ledger entry.
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'rgba(42,22,40,0.5)', fontWeight: 500 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="9" />
              <line x1="12" y1="8" x2="12" y2="12.5" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Select at least one transaction to merge.
          </div>
        )}
      </div>
    </ModalShell>
  );
}


// ============================================================================
// popups/PostToQuickBooksModal.tsx
// ============================================================================


interface PostToQuickBooksModalProps {
  onClose: () => void;
  transactions: ReconciliationTransaction[]; // 1 (single row action) or many (bulk action)
  onConfirm: () => void;
}

const QUICKBOOKS_ACCOUNTS = ['Checking - 6100', 'Operating Account - 6200', 'Reserve Account - 6300'];

const sectionLabelStyle_PostToQuickBooksModal: React.CSSProperties = {
  display: 'block',
  fontSize: '0.7rem',
  fontWeight: 600,
  color: 'rgba(42,22,40,0.55)',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  marginBottom: '0.55rem',
};

const fieldStyle_PostToQuickBooksModal: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '0.6rem 0.75rem',
  borderRadius: '8px',
  border: '1px solid #DDD0C4',
  fontSize: '0.875rem',
  color: '#2A1628',
  fontFamily: 'var(--font-sans), Inter, sans-serif',
  background: '#ffffff',
  outline: 'none',
  cursor: 'pointer',
};

function formatAmount_PostToQuickBooksModal(amount: number, currency: string): string {
  const sign = amount < 0 ? '-' : '';
  return `${sign}${currency} ${Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function PostToQuickBooksModal({ onClose, transactions, onConfirm }: PostToQuickBooksModalProps) {
  const { pushToast } = useReconciliation();
  const [account, setAccount] = useState(QUICKBOOKS_ACCOUNTS[0]);
  const [isPosting, setIsPosting] = useState(false);

  const total = transactions.length;

  const currencyTotals = useMemo(() => {
    const totals = new Map<string, number>();
    for (const t of transactions) {
      totals.set(t.currency, (totals.get(t.currency) ?? 0) + t.amount);
    }
    return Array.from(totals.entries());
  }, [transactions]);

  const differenceCount = useMemo(
    () => transactions.filter((t) => t.differenceType !== 'None').length,
    [transactions]
  );

  const handlePost = () => {
    if (isPosting || total === 0) return;
    setIsPosting(true);
    setTimeout(() => {
      onConfirm();
      pushToast({ message: 'Entries posted to QuickBooks successfully.', tone: 'success' });
      setIsPosting(false);
      onClose();
    }, 700);
  };

  return (
    <ModalShell
      onClose={onClose}
      eyebrow="Reconciliation Center"
      titlePlain="Post To"
      titleAccent="QuickBooks"
      maxWidth="560px"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isPosting}
            style={{
              background: '#ffffff',
              color: '#2A1628',
              border: '1px solid #DDD0C4',
              borderRadius: '8px',
              padding: '0.6rem 1.25rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: isPosting ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-sans), Inter, sans-serif',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePost}
            disabled={isPosting || total === 0}
            style={{
              background: '#E8760A',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.6rem 1.4rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: isPosting || total === 0 ? 'not-allowed' : 'pointer',
              opacity: isPosting || total === 0 ? 0.7 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: 'var(--font-sans), Inter, sans-serif',
            }}
          >
            {isPosting && <ButtonSpinner />}
            Post
          </button>
        </>
      }
    >
      {/* Summary */}
      <div style={{ marginBottom: '1.25rem' }}>
        <span style={sectionLabelStyle_PostToQuickBooksModal}>Summary</span>
        <div
          style={{
            border: '1px solid #DDD0C4',
            borderRadius: '10px',
            background: '#FAF8F5',
            padding: '0.9rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'rgba(42,22,40,0.65)', fontWeight: 500 }}>
              {total} {total === 1 ? 'transaction' : 'transactions'} selected
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', paddingTop: '0.35rem', borderTop: '1px solid rgba(42,22,40,0.08)' }}>
            {currencyTotals.map(([currency, sum]) => (
              <div key={currency} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(42,22,40,0.55)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Total ({currency})
                </span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#E8760A', fontFamily: 'var(--font-serif), Georgia, serif' }}>
                  {formatAmount_PostToQuickBooksModal(sum, currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Affected Entries */}
      <div style={{ marginBottom: '1.25rem' }}>
        <span style={sectionLabelStyle_PostToQuickBooksModal}>Affected Entries</span>
        <div
          className="hide-scrollbar"
          style={{
            border: '1px solid #DDD0C4',
            borderRadius: '10px',
            maxHeight: '200px',
            overflowY: 'auto',
            background: '#ffffff',
          }}
        >
          {transactions.map((t, idx) => (
            <div
              key={t.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                padding: '0.6rem 0.85rem',
                borderBottom: idx === transactions.length - 1 ? 'none' : '1px solid rgba(42,22,40,0.06)',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2A1628' }}>{t.id}</div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'rgba(42,22,40,0.55)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '280px',
                  }}
                >
                  {t.description}
                </div>
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2A1628', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                {formatAmount_PostToQuickBooksModal(t.amount, t.currency)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* QuickBooks Account */}
      <div style={{ marginBottom: differenceCount > 0 ? '1.25rem' : 0 }}>
        <span style={sectionLabelStyle_PostToQuickBooksModal}>QuickBooks Account</span>
        <select value={account} onChange={(e) => setAccount(e.target.value)} style={fieldStyle_PostToQuickBooksModal}>
          {QUICKBOOKS_ACCOUNTS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {/* Warnings */}
      {differenceCount > 0 && (
        <div>
          <span style={sectionLabelStyle_PostToQuickBooksModal}>Warnings</span>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.6rem',
              background: '#FFF3E0',
              color: '#E65100',
              border: '1px solid rgba(230,81,0,0.25)',
              borderRadius: '10px',
              padding: '0.75rem 0.9rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              lineHeight: 1.4,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ flexShrink: 0, marginTop: '1px' }}
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>
              {differenceCount} of {total} transactions have unresolved differences and will post with a variance.
            </span>
          </div>
        </div>
      )}
    </ModalShell>
  );
}


// ============================================================================
// popups/ExceptionDetailsModal.tsx
// ============================================================================


interface ExceptionDetailsModalProps {
  onClose: () => void;
  tx: ReconciliationTransaction;
  problem: string;
  onRetry: () => void;
  onManualOverride: () => void;
}

const sectionLabelStyle_ExceptionDetailsModal: React.CSSProperties = {
  display: 'block',
  fontSize: '0.7rem',
  fontWeight: 600,
  color: 'rgba(42,22,40,0.55)',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  marginBottom: '0.5rem',
};

function formatCurrency(amount: number, currency: string) {
  const sign = amount < 0 ? '-' : '';
  return `${sign}${currency} ${Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function buildExplanation(tx: ReconciliationTransaction, problem: string): string {
  const riskPhrase =
    tx.riskLevel === 'High'
      ? 'a high risk score, which typically indicates a larger deviation from expected matching patterns'
      : tx.riskLevel === 'Medium'
      ? 'a moderate risk score, suggesting some deviation from the expected matching pattern'
      : 'a comparatively low risk score, so this is likely a minor discrepancy';

  const scorePhrase =
    tx.aiMatchScore === null
      ? 'the AI matching engine was unable to produce a confidence score for this transaction'
      : tx.aiMatchScore < 60
      ? `the AI matching engine only reached a confidence score of ${tx.aiMatchScore}%, well below the threshold required for automatic matching`
      : `the AI matching engine reached a confidence score of ${tx.aiMatchScore}%, which was still not sufficient to clear automatically`;

  const diffPhrase =
    tx.difference !== 0
      ? `A recorded difference of ${formatCurrency(tx.difference, tx.currency)} was detected against the matched ledger entry, consistent with a ${tx.differenceType.toLowerCase()} condition.`
      : `No numeric difference was recorded, so the exception is most likely structural or procedural rather than a value mismatch.`;

  return (
    `Based on the transaction dated ${tx.transactionDate} for ${formatCurrency(tx.amount, tx.currency)}, ${scorePhrase}. ` +
    `${diffPhrase} The system flagged this transaction with ${riskPhrase}. ` +
    `Combined with the reported issue — "${problem}" — this pattern is consistent with cases that require a human reviewer to confirm the correct ledger treatment before the transaction can proceed.`
  );
}

function buildSuggestedFixes(problem: string, tx: ReconciliationTransaction): string[] {
  const lower = problem.toLowerCase();
  const fixes: string[] = [];

  if (lower.includes('quickbooks') || lower.includes('qb') || lower.includes('sync')) {
    fixes.push('Re-check the QuickBooks account mapping for this bank feed and re-map the ledger account if it has changed.');
    fixes.push('Confirm the QuickBooks connection token is still valid, then retry the sync for this transaction.');
    fixes.push('If the sync continues to fail, post the entry manually in QuickBooks and mark it reconciled here.');
  } else if (lower.includes('duplicate')) {
    fixes.push('Compare this transaction against the suspected duplicate entry and merge the two records if they represent the same payment.');
    fixes.push('Check the statement reference and transaction date to confirm whether this is a genuine repeat charge or a system re-import.');
    fixes.push('Archive the redundant entry once the merge is confirmed to keep the ledger balance accurate.');
  } else if (lower.includes('amount') || lower.includes('mismatch')) {
    fixes.push('Open the matched ledger entry and compare the amount field for rounding, fee, or FX conversion differences.');
    fixes.push(`Verify whether the ${formatCurrency(tx.difference, tx.currency)} difference should be booked as a bank charge or write-off.`);
    fixes.push('Adjust the matched entry or split the transaction, then re-run matching to confirm the exception clears.');
  } else if (lower.includes('date')) {
    fixes.push('Confirm the correct transaction date against the original bank statement.');
    fixes.push('Adjust the posting date on the ledger entry so it falls within the same reconciliation period.');
    fixes.push('Re-run AI matching after the date correction to confirm the exception is resolved.');
  } else if (lower.includes('missing')) {
    fixes.push('Search the ledger for an entry that may not have been imported for this period.');
    fixes.push('If no matching entry exists, create one manually with the correct account and amount, then link it here.');
    fixes.push('Re-run the import for the affected statement range to rule out a partial import failure.');
  } else {
    fixes.push('Review the transaction details against the original bank statement line for accuracy.');
    fixes.push('Re-run AI matching in case the exception was caused by a transient data issue.');
    fixes.push('If the issue persists, escalate to a manual override with a note describing the resolution applied.');
  }

  return fixes;
}

function ExceptionDetailsModal({ onClose, tx, problem, onRetry, onManualOverride }: ExceptionDetailsModalProps) {
  const { pushToast } = useReconciliation();
  const [isRetrying, setIsRetrying] = useState(false);

  const explanation = useMemo(() => buildExplanation(tx, problem), [tx, problem]);
  const suggestedFixes = useMemo(() => buildSuggestedFixes(problem, tx), [problem, tx]);

  const handleManualOverride = () => {
    onManualOverride();
    onClose();
  };

  const handleRetry = () => {
    if (isRetrying) return;
    setIsRetrying(true);
    setTimeout(() => {
      onRetry();
      pushToast({ message: 'Retry initiated.', tone: 'info' });
      setIsRetrying(false);
      onClose();
    }, 600);
  };

  return (
    <ModalShell
      onClose={onClose}
      eyebrow="Reconciliation Center"
      titlePlain="Exception"
      titleAccent="Details"
      maxWidth="540px"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isRetrying}
            style={{
              background: '#ffffff',
              color: '#2A1628',
              border: '1px solid #DDD0C4',
              borderRadius: '8px',
              padding: '0.6rem 1.25rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: isRetrying ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-sans), Inter, sans-serif',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleManualOverride}
            disabled={isRetrying}
            style={{
              background: '#ffffff',
              color: '#E8760A',
              border: '1px solid #E8760A',
              borderRadius: '8px',
              padding: '0.6rem 1.25rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: isRetrying ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-sans), Inter, sans-serif',
            }}
          >
            Manual Override
          </button>
          <button
            type="button"
            onClick={handleRetry}
            disabled={isRetrying}
            style={{
              background: '#2A1628',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.6rem 1.4rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: isRetrying ? 'not-allowed' : 'pointer',
              opacity: isRetrying ? 0.75 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: 'var(--font-sans), Inter, sans-serif',
            }}
          >
            {isRetrying && <ButtonSpinner />}
            Retry
          </button>
        </>
      }
    >
      <div>
        <span style={sectionLabelStyle_ExceptionDetailsModal}>Problem</span>
        <div
          style={{
            background: '#FEE2E2',
            border: '1px solid rgba(211,47,47,0.25)',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
            marginBottom: '1.4rem',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#D32F2F' }}>{problem}</p>
          <p style={{ margin: '0.4rem 0 0', fontSize: '0.8rem', color: 'rgba(42,22,40,0.65)' }}>
            {tx.id} &middot; {tx.client} &middot; {formatCurrency(tx.amount, tx.currency)}
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '1.4rem' }}>
        <span style={sectionLabelStyle_ExceptionDetailsModal}>AI Explanation</span>
        <p
          style={{
            margin: 0,
            fontSize: '0.875rem',
            lineHeight: 1.6,
            color: '#2A1628',
            background: '#FAF8F5',
            border: '1px solid #DDD0C4',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
          }}
        >
          {explanation}
        </p>
      </div>

      <div>
        <span style={sectionLabelStyle_ExceptionDetailsModal}>Suggested Fix</span>
        <ul style={{ margin: 0, padding: '0 0 0 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {suggestedFixes.map((fix, idx) => (
            <li key={idx} style={{ fontSize: '0.875rem', lineHeight: 1.5, color: '#2A1628' }}>
              {fix}
            </li>
          ))}
        </ul>
      </div>
    </ModalShell>
  );
}


// ============================================================================
// popups/DifferenceExplanationModal.tsx
// ============================================================================


interface DifferenceExplanationModalProps {
  onClose: () => void;
  tx: ReconciliationTransaction;
}

interface BreakdownLine {
  label: string;
  detail: string;
  amount: number;
}

function formatAmount_DifferenceExplanationModal(amount: number): string {
  return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function buildBreakdown(difference: number): BreakdownLine[] {
  // Deterministically split the total difference into contributing factors.
  // ~60% bank service fee, ~25% FX rate variance, remainder absorbs rounding.
  const bankFee = Math.round(difference * 0.6 * 100) / 100;
  const fxVariance = Math.round(difference * 0.25 * 100) / 100;
  const rounding = Math.round((difference - bankFee - fxVariance) * 100) / 100;

  const lines: BreakdownLine[] = [
    { label: 'Bank Service Fee', detail: 'Deducted by the bank as part of transaction processing.', amount: bankFee },
    { label: 'FX Rate Variance', detail: 'Difference arising from exchange rate applied at settlement.', amount: fxVariance },
  ];

  if (Math.abs(rounding) > 0.001) {
    lines.push({
      label: 'Rounding Adjustment',
      detail: 'Residual amount reconciling the breakdown to the exact total difference.',
      amount: rounding,
    });
  }

  return lines;
}

function DifferenceExplanationModal({ onClose, tx }: DifferenceExplanationModalProps) {
  const hasDifference = tx.difference > 0;

  const breakdown = useMemo(() => (hasDifference ? buildBreakdown(tx.difference) : []), [hasDifference, tx.difference]);

  const breakdownTotal = useMemo(
    () => Math.round(breakdown.reduce((sum, line) => sum + line.amount, 0) * 100) / 100,
    [breakdown]
  );

  return (
    <ModalShell
      onClose={onClose}
      eyebrow="Reconciliation Center"
      titlePlain="Difference"
      titleAccent="Explanation"
      maxWidth="520px"
      footer={
        <button
          type="button"
          onClick={onClose}
          style={{
            background: '#2A1628',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.6rem 1.4rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-sans), Inter, sans-serif',
          }}
        >
          Close
        </button>
      }
    >
      <div style={{ marginBottom: '1.25rem' }}>
        <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.45)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Transaction
        </p>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.95rem', fontWeight: 600, color: '#2A1628' }}>{tx.description}</p>
        <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: 'rgba(42,22,40,0.55)' }}>
          {tx.id} &middot; {tx.bank} &middot; {tx.statementReference}
        </p>
      </div>

      {hasDifference ? (
        <>
          <p style={{ margin: '0 0 1.25rem', fontSize: '0.9rem', lineHeight: 1.6, color: '#2A1628' }}>
            This transaction shows a difference of <strong>{tx.currency} {formatAmount_DifferenceExplanationModal(tx.difference)}</strong> between the
            bank statement and the matched ledger entry. The breakdown below shows the likely contributing factors.
          </p>

          <div
            style={{
              border: '1px solid #DDD0C4',
              borderRadius: '12px',
              overflow: 'hidden',
              background: '#FAF8F5',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                padding: '0.6rem 1rem',
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(42,22,40,0.45)',
                borderBottom: '1px solid #DDD0C4',
              }}
            >
              <span>Contributing Factor</span>
              <span>Amount</span>
            </div>

            {breakdown.map((line, idx) => (
              <div
                key={line.label}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  alignItems: 'start',
                  gap: '1rem',
                  padding: '0.75rem 1rem',
                  borderBottom: idx === breakdown.length - 1 ? 'none' : '1px solid rgba(42,22,40,0.06)',
                  background: '#ffffff',
                }}
              >
                <div>
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#2A1628' }}>{line.label}</p>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: 'rgba(42,22,40,0.55)', lineHeight: 1.4 }}>
                    {line.detail}
                  </p>
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2A1628', whiteSpace: 'nowrap' }}>
                  {tx.currency} {formatAmount_DifferenceExplanationModal(line.amount)}
                </span>
              </div>
            ))}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                alignItems: 'center',
                padding: '0.85rem 1rem',
                background: 'rgba(232,118,10,0.08)',
                borderTop: '1px solid rgba(232,118,10,0.25)',
              }}
            >
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2A1628', letterSpacing: '0.02em' }}>
                Total Difference
              </span>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#E8760A', whiteSpace: 'nowrap' }}>
                {tx.currency} {formatAmount_DifferenceExplanationModal(breakdownTotal)}
              </span>
            </div>
          </div>

          <p style={{ margin: '1rem 0 0', fontSize: '0.75rem', color: 'rgba(42,22,40,0.5)', lineHeight: 1.5 }}>
            This breakdown is a system-generated estimate intended to guide manual review. Confirm the exact cause against
            the bank advice before posting an adjustment.
          </p>
        </>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 1.1rem',
            borderRadius: '12px',
            background: 'rgba(19,115,51,0.08)',
            border: '1px solid rgba(19,115,51,0.25)',
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#137333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#137333' }}>
            No difference detected — this transaction reconciles exactly.
          </p>
        </div>
      )}
    </ModalShell>
  );
}


// ============================================================================
// popups/AssignReviewerModal.tsx
// ============================================================================


interface AssignReviewerModalProps {
  onClose: () => void;
  count: number; // number of transactions being assigned — 1 for a single row action, N for a bulk action
  onAssign: (reviewer: string, priority: string, deadline: string, notes: string) => void;
}

const REVIEWER_OPTIONS_AssignReviewerModal = ['Priya Nair', 'Omar Haddad', 'Lucia Ferreira', 'Ahmed Zaid', 'Kevin Park'];
const PRIORITY_OPTIONS_AssignReviewerModal = ['Low', 'Medium', 'High', 'Urgent'];

const labelStyle_AssignReviewerModal: React.CSSProperties = {
  display: 'block',
  fontSize: '0.7rem',
  fontWeight: 600,
  color: 'rgba(42,22,40,0.55)',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  marginBottom: '0.4rem',
};

const fieldStyle_AssignReviewerModal: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '0.6rem 0.75rem',
  borderRadius: '8px',
  border: '1px solid #DDD0C4',
  fontSize: '0.875rem',
  color: '#2A1628',
  fontFamily: 'var(--font-sans), Inter, sans-serif',
  background: '#ffffff',
  outline: 'none',
};

function Field_AssignReviewerModal({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1.1rem' }}>
      <label style={labelStyle_AssignReviewerModal}>{label}</label>
      {children}
    </div>
  );
}

function AssignReviewerModal({ onClose, count, onAssign }: AssignReviewerModalProps) {
  const { pushToast } = useReconciliation();
  const [reviewer, setReviewer] = useState('');
  const [priority, setPriority] = useState(PRIORITY_OPTIONS_AssignReviewerModal[1]);
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = reviewer.trim().length > 0 && !isSubmitting;

  const handleAssign = () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setTimeout(() => {
      onAssign(reviewer, priority, deadline, notes.trim());
      pushToast({ message: 'Reviewer assigned successfully.', tone: 'success' });
      setIsSubmitting(false);
      onClose();
    }, 500);
  };

  return (
    <ModalShell
      onClose={onClose}
      eyebrow="Reconciliation Center"
      titlePlain="Assign"
      titleAccent="Reviewer"
      maxWidth="480px"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              background: '#ffffff',
              color: '#2A1628',
              border: '1px solid #DDD0C4',
              borderRadius: '8px',
              padding: '0.6rem 1.25rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-sans), Inter, sans-serif',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAssign}
            disabled={!canSubmit}
            style={{
              background: '#2A1628',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.6rem 1.4rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              opacity: canSubmit ? 1 : 0.5,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: 'var(--font-sans), Inter, sans-serif',
            }}
          >
            {isSubmitting && <ButtonSpinner />}
            Assign
          </button>
        </>
      }
    >
      <p style={{ margin: '0 0 1.25rem', fontSize: '0.875rem', color: 'rgba(42,22,40,0.7)', lineHeight: 1.5 }}>
        Assign a reviewer to {count} transaction{count === 1 ? '' : 's'}.
      </p>

      <Field_AssignReviewerModal label="Reviewer">
        <select value={reviewer} onChange={(e) => setReviewer(e.target.value)} style={{ ...fieldStyle_AssignReviewerModal, cursor: 'pointer', color: reviewer ? '#2A1628' : 'rgba(42,22,40,0.4)' }}>
          <option value="" disabled>
            Select a reviewer…
          </option>
          {REVIEWER_OPTIONS_AssignReviewerModal.map((opt) => (
            <option key={opt} value={opt} style={{ color: '#2A1628' }}>
              {opt}
            </option>
          ))}
        </select>
      </Field_AssignReviewerModal>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Field_AssignReviewerModal label="Priority">
          <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ ...fieldStyle_AssignReviewerModal, cursor: 'pointer' }}>
            {PRIORITY_OPTIONS_AssignReviewerModal.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </Field_AssignReviewerModal>

        <Field_AssignReviewerModal label="Deadline">
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            style={{ ...fieldStyle_AssignReviewerModal, cursor: 'pointer' }}
          />
        </Field_AssignReviewerModal>
      </div>

      <Field_AssignReviewerModal label="Notes (optional)">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Add any context or instructions for the reviewer…"
          style={{ ...fieldStyle_AssignReviewerModal, resize: 'vertical', fontFamily: 'var(--font-sans), Inter, sans-serif' }}
        />
      </Field_AssignReviewerModal>
    </ModalShell>
  );
}


// ============================================================================
// popups/AddNotesModal.tsx
// ============================================================================


interface AddNotesModalProps {
  onClose: () => void;
  count: number; // number of transactions this note applies to
  onSave: (body: string, mentions: string[], attachments: string[]) => void;
}

const REVIEWERS_AddNotesModal = ['Priya Nair', 'Omar Haddad', 'Lucia Ferreira', 'Ahmed Zaid', 'Kevin Park'];

const textStyle: React.CSSProperties = { fontFamily: 'var(--font-sans), Inter, sans-serif', color: '#2A1628' };

function AddNotesModal({ onClose, count, onSave }: AddNotesModalProps) {
  const { pushToast } = useReconciliation();
  const [body, setBody] = useState('');
  const [mentions, setMentions] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [reviewer, setReviewer] = useState(REVIEWERS_AddNotesModal[0]);
  const [saving, setSaving] = useState(false);
  const attachmentCounter = useRef(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertBold = () => {
    setBody((prev) => (prev.length ? `${prev} **bold text**` : '**bold text**'));
    focusTextarea();
  };

  const insertItalic = () => {
    setBody((prev) => (prev.length ? `${prev} *italic text*` : '*italic text*'));
    focusTextarea();
  };

  const insertBullet = () => {
    setBody((prev) => (prev.length ? `${prev}\n- ` : '- '));
    focusTextarea();
  };

  const focusTextarea = () => {
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (el) {
        el.focus();
        el.selectionStart = el.selectionEnd = el.value.length;
      }
    });
  };

  const insertMention = () => {
    setBody((prev) => (prev.length ? `${prev} @${reviewer} ` : `@${reviewer} `));
    setMentions((prev) => (prev.includes(reviewer) ? prev : [...prev, reviewer]));
    focusTextarea();
  };

  const removeMention = (name: string) => {
    setMentions((prev) => prev.filter((m) => m !== name));
  };

  const attachFile = () => {
    attachmentCounter.current += 1;
    setAttachments((prev) => [...prev, `attachment-${attachmentCounter.current}.pdf`]);
  };

  const removeAttachment = (name: string) => {
    setAttachments((prev) => prev.filter((a) => a !== name));
  };

  const canSave = body.trim().length > 0 && !saving;

  const handleSave = () => {
    if (!body.trim() || saving) return;
    setSaving(true);
    setTimeout(() => {
      onSave(body, mentions, attachments);
      pushToast({ message: 'Note saved successfully.', tone: 'success' });
      setSaving(false);
      onClose();
    }, 500);
  };

  const toolbarButtonStyle: React.CSSProperties = {
    background: '#FAF8F5',
    border: '1px solid #DDD0C4',
    borderRadius: '7px',
    padding: '0.35rem 0.65rem',
    fontSize: '0.78rem',
    fontWeight: 600,
    color: '#2A1628',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
  };

  return (
    <ModalShell
      onClose={onClose}
      eyebrow="Reconciliation Center"
      titlePlain="Add"
      titleAccent="Notes"
      maxWidth="520px"
      footer={
        <>
          <button
            onClick={onClose}
            disabled={saving}
            style={{
              ...textStyle,
              background: 'transparent',
              border: '1px solid #DDD0C4',
              borderRadius: '10px',
              padding: '0.6rem 1.2rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            style={{
              ...textStyle,
              background: canSave ? '#E8760A' : 'rgba(232,118,10,0.4)',
              border: 'none',
              borderRadius: '10px',
              padding: '0.6rem 1.4rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#ffffff',
              cursor: canSave ? 'pointer' : 'not-allowed',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            {saving && <ButtonSpinner />}
            Save Note
          </button>
        </>
      }
    >
      <div style={{ ...textStyle, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(42,22,40,0.7)' }}>
          Add a note to {count} transaction{count === 1 ? '' : 's'}.
        </p>

        <div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <button type="button" onClick={insertBold} style={{ ...toolbarButtonStyle, fontStyle: 'normal' }} title="Bold" aria-label="Bold">
              <strong>B</strong>
            </button>
            <button type="button" onClick={insertItalic} style={toolbarButtonStyle} title="Italic" aria-label="Italic">
              <em>I</em>
            </button>
            <button type="button" onClick={insertBullet} style={toolbarButtonStyle} title="Bullet List" aria-label="Bullet List">
              <span aria-hidden="true">&#8226;</span> List
            </button>
          </div>
          <textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            placeholder="Type your note here…"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              resize: 'vertical',
              border: '1px solid #DDD0C4',
              borderRadius: '10px',
              padding: '0.75rem 0.85rem',
              fontSize: '0.88rem',
              lineHeight: 1.5,
              fontFamily: 'var(--font-sans), Inter, sans-serif',
              color: '#2A1628',
              background: '#ffffff',
              outline: 'none',
            }}
          />
        </div>

        <div>
          <p style={{ margin: '0 0 0.45rem', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(42,22,40,0.5)' }}>
            Mention Reviewer
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select
              value={reviewer}
              onChange={(e) => setReviewer(e.target.value)}
              style={{
                flex: 1,
                border: '1px solid #DDD0C4',
                borderRadius: '9px',
                padding: '0.55rem 0.65rem',
                fontSize: '0.85rem',
                color: '#2A1628',
                background: '#ffffff',
                fontFamily: 'var(--font-sans), Inter, sans-serif',
              }}
            >
              {REVIEWERS_AddNotesModal.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={insertMention}
              style={{
                ...toolbarButtonStyle,
                background: '#FAF8F5',
                whiteSpace: 'nowrap',
              }}
            >
              Insert Mention
            </button>
          </div>
          {mentions.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.6rem' }}>
              {mentions.map((name) => (
                <span
                  key={name}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: 'rgba(232,118,10,0.1)',
                    color: '#E8760A',
                    border: '1px solid rgba(232,118,10,0.3)',
                    borderRadius: '999px',
                    padding: '0.25rem 0.6rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  @{name}
                  <button
                    type="button"
                    onClick={() => removeMention(name)}
                    aria-label={`Remove mention ${name}`}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#E8760A',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      lineHeight: 1,
                      padding: 0,
                      display: 'inline-flex',
                    }}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <p style={{ margin: '0 0 0.45rem', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(42,22,40,0.5)' }}>
            Attachments
          </p>
          <button
            type="button"
            onClick={attachFile}
            style={{
              ...toolbarButtonStyle,
              background: '#FAF8F5',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
            </svg>
            Attach File
          </button>
          {attachments.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.6rem' }}>
              {attachments.map((name) => (
                <span
                  key={name}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: '#FAF8F5',
                    color: '#2A1628',
                    border: '1px solid #DDD0C4',
                    borderRadius: '999px',
                    padding: '0.25rem 0.6rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  {name}
                  <button
                    type="button"
                    onClick={() => removeAttachment(name)}
                    aria-label={`Remove attachment ${name}`}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2A1628',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      lineHeight: 1,
                      padding: 0,
                      display: 'inline-flex',
                    }}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </ModalShell>
  );
}


// ============================================================================
// popups/DeleteConfirmationModal.tsx
// ============================================================================


interface DeleteConfirmationModalProps {
  onClose: () => void;
  count: number;
  onConfirm: () => void;
}

function DeleteConfirmationModal({ onClose, count, onConfirm }: DeleteConfirmationModalProps) {
  return (
    <ConfirmationModal
      config={{
        title: count === 1 ? 'Delete Transaction' : `Delete ${count} Transactions`,
        message: `This action cannot be undone from this dialog, but a brief Undo option will appear after deletion. Are you sure you want to permanently delete ${count === 1 ? 'this transaction' : `these ${count} transactions`}?`,
        confirmLabel: 'Delete',
        tone: 'danger',
        onConfirm,
      }}
      onClose={onClose}
    />
  );
}


// ============================================================================
// popups/FilterPresetsModal.tsx
// ============================================================================


interface FilterPresetsModalProps {
  onClose: () => void;
  currentFilters: FilterState;
  savedViews: SavedView[];
  onSave: (name: string) => void;
  onApply: (view: SavedView) => void;
  onDelete: (id: string) => void;
}

function countActiveFilters(filters: FilterState): number {
  let count = 0;
  for (const [key, value] of Object.entries(filters)) {
    if (key === 'tags') {
      if (Array.isArray(value) && value.length > 0) count += 1;
      continue;
    }
    if (typeof value === 'string' && value.trim() !== '' && value !== 'All') {
      count += 1;
    }
  }
  return count;
}

function FilterPresetsModal({ onClose, currentFilters, savedViews, onSave, onApply, onDelete }: FilterPresetsModalProps) {
  const { pushToast } = useReconciliation();
  const [name, setName] = useState('');

  const activeCount = useMemo(() => countActiveFilters(currentFilters), [currentFilters]);
  const canSave = name.trim().length > 0;

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed);
    pushToast({ message: 'View saved.', tone: 'success' });
    setName('');
  };

  const handleApply = (view: SavedView) => {
    onApply(view);
    onClose();
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    pushToast({ message: 'View deleted.', tone: 'info' });
  };

  return (
    <ModalShell
      onClose={onClose}
      eyebrow="Reconciliation Center"
      titlePlain="Filter"
      titleAccent="Presets"
      maxWidth="480px"
      footer={
        <button
          onClick={onClose}
          style={{
            background: '#2A1628',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.6rem 1.5rem',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Done
        </button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Save current filters as a view */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, color: '#2A1628' }}>Save current filters as a view</h3>
            {activeCount > 0 && (
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#E8760A', background: 'rgba(232,118,10,0.08)', borderRadius: '999px', padding: '0.15rem 0.55rem' }}>
                {activeCount} active {activeCount === 1 ? 'filter' : 'filters'}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && canSave) handleSave(); }}
              placeholder="e.g. High Priority — This Month"
              style={{
                flex: 1,
                minWidth: 0,
                padding: '0.6rem 0.85rem',
                fontSize: '0.8125rem',
                border: '1px solid #DDD0C4',
                borderRadius: '8px',
                background: '#FAF8F5',
                outline: 'none',
                color: '#2A1628',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />
            <button
              onClick={handleSave}
              disabled={!canSave}
              style={{
                padding: '0.6rem 1.1rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
                border: 'none',
                borderRadius: '8px',
                background: canSave ? '#E8760A' : 'rgba(42,22,40,0.12)',
                color: canSave ? '#fff' : 'rgba(42,22,40,0.4)',
                cursor: canSave ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              Save
            </button>
          </div>
        </div>

        {/* Saved views list */}
        <div>
          <h3 style={{ margin: '0 0 0.6rem', fontSize: '0.8125rem', fontWeight: 700, color: '#2A1628' }}>Saved Views</h3>
          {savedViews.length === 0 ? (
            <div
              style={{
                padding: '1.5rem 1rem',
                textAlign: 'center',
                fontSize: '0.8125rem',
                color: 'rgba(42,22,40,0.45)',
                border: '1px dashed #DDD0C4',
                borderRadius: '10px',
                background: '#FAF8F5',
              }}
            >
              No saved views yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {savedViews.map((view) => (
                <div
                  key={view.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    padding: '0.7rem 0.85rem',
                    border: '1px solid #DDD0C4',
                    borderRadius: '10px',
                    background: '#ffffff',
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, color: '#2A1628', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {view.name}
                    </p>
                    <p style={{ margin: '0.15rem 0 0', fontSize: '0.7rem', color: 'rgba(42,22,40,0.45)' }}>
                      created {view.createdAt}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                    <button
                      onClick={() => handleApply(view)}
                      style={{
                        padding: '0.4rem 0.85rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        border: '1px solid #DDD0C4',
                        borderRadius: '7px',
                        background: '#FAF8F5',
                        color: '#2A1628',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#E8760A'; e.currentTarget.style.color = '#E8760A'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#DDD0C4'; e.currentTarget.style.color = '#2A1628'; }}
                    >
                      Apply
                    </button>
                    <button
                      onClick={() => handleDelete(view.id)}
                      aria-label={`Delete ${view.name}`}
                      title="Delete view"
                      style={{
                        width: '30px',
                        height: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #DDD0C4',
                        borderRadius: '7px',
                        background: '#fff',
                        color: '#D32F2F',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(211,47,47,0.08)'; e.currentTarget.style.borderColor = '#D32F2F'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#DDD0C4'; }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ModalShell>
  );
}


// ============================================================================
// popups/ManageColumnsModal.tsx
// ============================================================================


interface ManageColumnsModalProps {
  onClose: () => void;
  columns: ColumnDef[]; // already in current display order
  density: Density;
  freezeFirstColumn: boolean;
  onToggleVisible: (key: string) => void;
  onReorder: (newOrderKeys: string[]) => void;
  onDensityChange: (d: Density) => void;
  onFreezeToggle: (v: boolean) => void;
}

const DENSITY_OPTIONS: { key: Density; label: string }[] = [
  { key: 'compact', label: 'Compact' },
  { key: 'comfortable', label: 'Comfortable' },
  { key: 'spacious', label: 'Spacious' },
];

const sectionLabelStyle_ManageColumnsModal: React.CSSProperties = {
  margin: '0 0 0.75rem',
  fontSize: '0.7rem',
  fontWeight: 600,
  color: 'rgba(42,22,40,0.55)',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
};

function DragHandleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );
}

function ManageColumnsModal({
  onClose,
  columns,
  density,
  freezeFirstColumn,
  onToggleVisible,
  onReorder,
  onDensityChange,
  onFreezeToggle,
}: ManageColumnsModalProps) {
  const [draggedKey, setDraggedKey] = useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, key: string) => {
    setDraggedKey(key);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', key);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, key: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (key !== dragOverKey) setDragOverKey(key);
  };

  const handleDragLeave = (key: string) => {
    setDragOverKey((prev) => (prev === key ? null : prev));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetKey: string) => {
    e.preventDefault();
    const sourceKey = draggedKey ?? e.dataTransfer.getData('text/plain');
    setDraggedKey(null);
    setDragOverKey(null);
    if (!sourceKey || sourceKey === targetKey) return;

    const order = columns.map((c) => c.key);
    const fromIndex = order.indexOf(sourceKey);
    const toIndex = order.indexOf(targetKey);
    if (fromIndex === -1 || toIndex === -1) return;

    order.splice(fromIndex, 1);
    order.splice(toIndex, 0, sourceKey);
    onReorder(order);
  };

  const handleDragEnd = () => {
    setDraggedKey(null);
    setDragOverKey(null);
  };

  return (
    <ModalShell
      onClose={onClose}
      eyebrow="Reconciliation Center"
      titlePlain="Manage"
      titleAccent="Columns"
      maxWidth="480px"
      footer={
        <button
          type="button"
          onClick={onClose}
          style={{
            background: '#2A1628',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.6rem 1.4rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-sans), Inter, sans-serif',
          }}
        >
          Done
        </button>
      }
    >
      {/* Density */}
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={sectionLabelStyle_ManageColumnsModal}>Density</p>
        <div
          role="radiogroup"
          aria-label="Density"
          style={{
            display: 'flex',
            background: 'rgba(42,22,40,0.04)',
            borderRadius: '12px',
            padding: '4px',
            gap: '4px',
          }}
        >
          {DENSITY_OPTIONS.map((opt) => {
            const isActive = density === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => onDensityChange(opt.key)}
                style={{
                  flex: 1,
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem 0.5rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  fontFamily: 'var(--font-sans), Inter, sans-serif',
                  cursor: 'pointer',
                  background: isActive ? '#ffffff' : 'transparent',
                  color: isActive ? '#2A1628' : 'rgba(42,22,40,0.55)',
                  boxShadow: isActive ? '0 1px 4px rgba(42,22,40,0.12)' : 'none',
                  transition: 'background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Freeze first column */}
      <div
        style={{
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1rem',
          borderRadius: '10px',
          border: '1px solid #DDD0C4',
          background: '#FAF8F5',
        }}
      >
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2A1628' }}>Freeze First Column</div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(42,22,40,0.5)', marginTop: '0.15rem' }}>
            Keep the leading column pinned while scrolling horizontally.
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={freezeFirstColumn}
          aria-label="Freeze First Column"
          onClick={() => onFreezeToggle(!freezeFirstColumn)}
          style={{
            flexShrink: 0,
            width: '36px',
            height: '20px',
            borderRadius: '999px',
            border: 'none',
            padding: '2px',
            background: freezeFirstColumn ? '#E8760A' : '#DDD0C4',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: freezeFirstColumn ? 'flex-end' : 'flex-start',
            transition: 'background 0.15s ease, justify-content 0.15s ease',
          }}
        >
          <span
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: '#ffffff',
              boxShadow: '0 1px 3px rgba(42,22,40,0.3)',
              display: 'block',
              transition: 'transform 0.15s ease',
            }}
          />
        </button>
      </div>

      {/* Columns list */}
      <div>
        <p style={sectionLabelStyle_ManageColumnsModal}>Columns</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {columns.map((col) => {
            const isDragging = draggedKey === col.key;
            const isDragOver = dragOverKey === col.key && draggedKey !== col.key;
            return (
              <div
                key={col.key}
                draggable
                onDragStart={(e) => handleDragStart(e, col.key)}
                onDragOver={(e) => handleDragOver(e, col.key)}
                onDragLeave={() => handleDragLeave(col.key)}
                onDrop={(e) => handleDrop(e, col.key)}
                onDragEnd={handleDragEnd}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '8px',
                  border: isDragOver ? '1.5px dashed #E8760A' : '1px solid #DDD0C4',
                  background: isDragging ? 'rgba(232,118,10,0.06)' : '#ffffff',
                  opacity: isDragging ? 0.5 : 1,
                  cursor: 'grab',
                  transition: 'border-color 0.12s ease, background 0.12s ease, opacity 0.12s ease',
                }}
              >
                <span style={{ color: 'rgba(42,22,40,0.35)', display: 'flex', cursor: 'grab' }} aria-hidden="true">
                  <DragHandleIcon />
                </span>
                <span style={{ flex: 1, fontSize: '0.85rem', color: '#2A1628', fontWeight: 500, userSelect: 'none' }}>
                  {col.label}
                </span>
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={col.visible}
                    onChange={() => onToggleVisible(col.key)}
                    style={{
                      width: '16px',
                      height: '16px',
                      accentColor: '#E8760A',
                      cursor: 'pointer',
                    }}
                    aria-label={`Toggle visibility of ${col.label} column`}
                  />
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </ModalShell>
  );
}


// ============================================================================
// popups/AuditExportModal.tsx
// ============================================================================


type AuditExportFormat = 'csv' | 'pdf';

interface AuditExportModalProps {
  onClose: () => void;
  tx?: ReconciliationTransaction;
  onExport: (format: AuditExportFormat) => void;
}

const FORMAT_OPTIONS_AuditExportModal: { key: AuditExportFormat; label: string; sublabel: string; icon: React.ReactNode }[] = [
  {
    key: 'csv',
    label: 'CSV',
    sublabel: 'Raw log rows for spreadsheets',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="13" y2="17" />
      </svg>
    ),
  },
  {
    key: 'pdf',
    label: 'PDF',
    sublabel: 'Formatted report for records',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="15" x2="9" y2="18" />
        <line x1="12" y1="15" x2="12" y2="18" />
        <line x1="15" y1="15" x2="15" y2="18" />
      </svg>
    ),
  },
];

function AuditExportModal({ onClose, tx, onExport }: AuditExportModalProps) {
  const { pushToast } = useReconciliation();
  const [format, setFormat] = useState<AuditExportFormat>('csv');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setTimeout(() => {
      onExport(format);
      pushToast({ message: 'Audit log exported successfully.', tone: 'success' });
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <ModalShell
      onClose={onClose}
      eyebrow="Reconciliation Center"
      titlePlain="Audit"
      titleAccent="Export"
      maxWidth="460px"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              background: '#ffffff',
              color: '#2A1628',
              border: '1px solid #DDD0C4',
              borderRadius: '8px',
              padding: '0.6rem 1.25rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-sans), Inter, sans-serif',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              background: '#2A1628',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.6rem 1.4rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.75 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: 'var(--font-sans), Inter, sans-serif',
              minWidth: '96px',
              justifyContent: 'center',
            }}
          >
            {isSubmitting && <ButtonSpinner />}
            Export
          </button>
        </>
      }
    >
      <div
        style={{
          marginBottom: '1.5rem',
          padding: '0.85rem 1rem',
          borderRadius: '10px',
          background: '#FAF8F5',
          border: '1px solid #DDD0C4',
          fontSize: '0.82rem',
          lineHeight: 1.5,
          color: '#2A1628',
        }}
      >
        {tx ? (
          <>
            Exporting the audit log for transaction{' '}
            <strong>{tx.id}</strong> (<strong>{tx.client}</strong>).
          </>
        ) : (
          <>Exporting the full reconciliation workspace audit log.</>
        )}
      </div>

      <div>
        <p
          style={{
            margin: '0 0 0.75rem',
            fontSize: '0.7rem',
            fontWeight: 600,
            color: 'rgba(42,22,40,0.55)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          File Format
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
          {FORMAT_OPTIONS_AuditExportModal.map((opt) => {
            const isSelected = format === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setFormat(opt.key)}
                aria-pressed={isSelected}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '1rem 0.75rem',
                  borderRadius: '10px',
                  border: isSelected ? '1.5px solid #E8760A' : '1.5px solid #DDD0C4',
                  background: isSelected ? 'rgba(232,118,10,0.04)' : '#ffffff',
                  color: isSelected ? '#E8760A' : '#2A1628',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans), Inter, sans-serif',
                  transition: 'border-color 0.15s ease, background 0.15s ease, color 0.15s ease',
                }}
              >
                {opt.icon}
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{opt.label}</span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    color: isSelected ? 'rgba(232,118,10,0.85)' : 'rgba(42,22,40,0.5)',
                    textAlign: 'center',
                  }}
                >
                  {opt.sublabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </ModalShell>
  );
}


// ============================================================================
// popups/RetryFailedJobsModal.tsx
// ============================================================================


interface RetryFailedJobsModalProps {
  onClose: () => void;
}

type JobStatus = 'failed' | 'retrying' | 'succeeded';

interface FailedJob {
  id: string;
  type: string;
  failedAt: string;
  errorMessage: string;
}

function RetryFailedJobsModal({ onClose }: RetryFailedJobsModalProps) {
  const { pushToast } = useReconciliation();
  const { data: jobsRes, isLoading: jobsLoading } = useGetFailedJobsQuery();
  const [retryOne] = useRetryFailedJobMutation();
  const [retryAllMutation, { isLoading: retryingAll }] = useRetryAllFailedJobsMutation();

  const jobs: FailedJob[] = (jobsRes?.data || []).map((j: any) => ({
    id: j.id,
    type: j.jobType,
    failedAt: new Date(j.failedAt).toLocaleString(),
    errorMessage: j.errorMessage,
  }));

  const [statuses, setStatuses] = useState<Record<string, JobStatus>>({});

  useEffect(() => {
    setStatuses((prev) => {
      const next = { ...prev };
      jobs.forEach((j) => { if (!next[j.id]) next[j.id] = 'failed'; });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobsRes]);

  const allSucceeded = jobs.length > 0 && jobs.every((job) => statuses[job.id] === 'succeeded');
  const anyRetrying = jobs.some((job) => statuses[job.id] === 'retrying') || retryingAll;

  const retryJob = (job: FailedJob) => {
    if (statuses[job.id] !== 'failed') return;
    setStatuses((prev) => ({ ...prev, [job.id]: 'retrying' }));
    retryOne(job.id)
      .unwrap()
      .then(() => {
        setStatuses((prev) => ({ ...prev, [job.id]: 'succeeded' }));
        pushToast({ message: `${job.type} job retried successfully.`, tone: 'success' });
      })
      .catch(() => {
        setStatuses((prev) => ({ ...prev, [job.id]: 'failed' }));
        pushToast({ message: `Failed to retry ${job.type} job.`, tone: 'error' });
      });
  };

  const retryAll = () => {
    jobs.forEach((job) => setStatuses((prev) => ({ ...prev, [job.id]: 'retrying' })));
    retryAllMutation()
      .unwrap()
      .then((res: any) => {
        setStatuses((prev) => {
          const next = { ...prev };
          jobs.forEach((j) => { next[j.id] = 'succeeded'; });
          return next;
        });
        pushToast({ message: `Retried ${res?.data?.succeeded ?? jobs.length} of ${res?.data?.total ?? jobs.length} job(s).`, tone: 'success' });
      })
      .catch(() => pushToast({ message: 'Failed to retry jobs.', tone: 'error' }));
  };

  const remainingCount = jobs.filter((job) => statuses[job.id] === 'failed').length;

  if (jobsLoading) {
    return (
      <ModalShell onClose={onClose} eyebrow="Reconciliation Center" titlePlain="Retry Failed" titleAccent="Jobs" maxWidth="560px">
        <p style={{ fontSize: '0.85rem', color: 'rgba(42,22,40,0.5)' }}>Loading failed jobs…</p>
      </ModalShell>
    );
  }

  if (jobs.length === 0) {
    return (
      <ModalShell onClose={onClose} eyebrow="Reconciliation Center" titlePlain="Retry Failed" titleAccent="Jobs" maxWidth="560px">
        <p style={{ fontSize: '0.85rem', color: 'rgba(42,22,40,0.5)' }}>No failed jobs — everything is running smoothly.</p>
      </ModalShell>
    );
  }

  return (
    <ModalShell
      onClose={onClose}
      eyebrow="Reconciliation Center"
      titlePlain="Retry Failed"
      titleAccent="Jobs"
      maxWidth="560px"
      footer={
        <button
          onClick={onClose}
          style={{
            background: '#2A1628',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            padding: '0.65rem 1.5rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-sans), Inter, sans-serif',
          }}
        >
          Close
        </button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontFamily: 'var(--font-sans), Inter, sans-serif' }}>
        {allSucceeded && (
          <div
            style={{
              background: '#E6F4EA',
              color: '#137333',
              border: '1px solid rgba(19,115,51,0.2)',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span aria-hidden="true">✓</span>
            All failed jobs have been retried successfully.
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(42,22,40,0.55)' }}>
            {allSucceeded
              ? `${jobs.length} job${jobs.length === 1 ? '' : 's'} recovered`
              : `${remainingCount} of ${jobs.length} job${jobs.length === 1 ? '' : 's'} still failing`}
          </p>
          <button
            onClick={retryAll}
            disabled={allSucceeded || anyRetrying}
            style={{
              background: allSucceeded || anyRetrying ? 'rgba(232,118,10,0.35)' : '#E8760A',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: allSucceeded || anyRetrying ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontFamily: 'var(--font-sans), Inter, sans-serif',
            }}
          >
            {anyRetrying && <ButtonSpinner />}
            Retry All
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {jobs.map((job) => {
            const status = statuses[job.id];
            return (
              <div
                key={job.id}
                style={{
                  border: '1px solid #DDD0C4',
                  borderRadius: '12px',
                  padding: '0.9rem 1rem',
                  background: status === 'succeeded' ? '#FAF8F5' : '#ffffff',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  transition: 'background 0.2s ease',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2A1628' }}>{job.type}</span>
                    <span style={{ fontSize: '0.72rem', color: 'rgba(42,22,40,0.45)' }}>{job.failedAt}</span>
                  </div>
                  <p
                    style={{
                      margin: '0.35rem 0 0',
                      fontSize: '0.78rem',
                      color: '#D32F2F',
                      background: status === 'succeeded' ? 'transparent' : '#FEE2E2',
                      display: 'inline-block',
                      padding: status === 'succeeded' ? 0 : '0.2rem 0.5rem',
                      borderRadius: '6px',
                      textDecoration: status === 'succeeded' ? 'line-through' : 'none',
                      opacity: status === 'succeeded' ? 0.55 : 1,
                    }}
                  >
                    {job.errorMessage}
                  </p>
                </div>

                <div style={{ flexShrink: 0 }}>
                  {status === 'succeeded' ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        background: '#E6F4EA',
                        color: '#137333',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        borderRadius: '999px',
                        padding: '0.35rem 0.7rem',
                      }}
                    >
                      Retried <span aria-hidden="true">✓</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => retryJob(job)}
                      disabled={status === 'retrying'}
                      style={{
                        background: status === 'retrying' ? 'rgba(42,22,40,0.08)' : 'rgba(42,22,40,0.06)',
                        color: '#2A1628',
                        border: '1px solid #DDD0C4',
                        borderRadius: '8px',
                        padding: '0.4rem 0.85rem',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: status === 'retrying' ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontFamily: 'var(--font-sans), Inter, sans-serif',
                      }}
                    >
                      {status === 'retrying' && <ButtonSpinner color="#2A1628" />}
                      {status === 'retrying' ? 'Retrying…' : 'Retry'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ModalShell>
  );
}


// ============================================================================
// Header.tsx
// ============================================================================


interface HeaderProps {
  onImportBankStatement: () => void;
  onCreateBatch: () => void;
  onExportCenter: () => void;
  onRefresh: () => void;
  refreshing: boolean;
}

function ToolbarButton({
  label, icon, primary, disabled, disabledReason, onClick,
}: {
  label: string; icon: React.ReactNode; primary?: boolean; disabled?: boolean; disabledReason?: string | null; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={disabled && disabledReason ? disabledReason : undefined}
      aria-disabled={disabled}
      style={{
        background: primary ? '#2A1628' : '#ffffff',
        border: primary ? 'none' : '1px solid #DDD0C4',
        padding: '0.625rem 1.25rem',
        borderRadius: '8px',
        fontSize: '0.8125rem',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: primary ? '#ffffff' : '#2A1628',
        display: 'flex',
        alignItems: 'center',
        gap: '0.375rem',
        opacity: disabled ? 0.5 : 1,
        boxShadow: primary ? '0 4px 12px rgba(42,22,40,0.15)' : undefined,
        fontFamily: 'inherit',
        whiteSpace: 'nowrap',
      }}
    >
      {icon}
      {label}
      {disabled && (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true" style={{ marginLeft: '4px' }}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      )}
    </button>
  );
}

function getRoleInitials(r: string) {
  if (r === 'ADMIN') return 'AD';
  if (r === 'MANAGER') return 'MN';
  if (r === 'BOOKKEEPER') return 'BK';
  if (r === 'REVIEWER') return 'RV';
  if (r === 'READ ONLY') return 'RO';
  return r.slice(0, 2).toUpperCase();
}

function Header({ onImportBankStatement, onCreateBatch, onExportCenter, onRefresh, refreshing }: HeaderProps) {
  const { role, setRole } = useReconciliation();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      paddingBottom: '1rem',
      borderBottom: '1px solid #DDD0C4',
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#E8760A', display: 'inline-block' }} />
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(42,22,40,0.5)', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>
            Accounting &gt; Reconciliation Center
          </p>
        </div>
        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 300, color: '#2A1628', letterSpacing: '-0.02em', fontFamily: 'var(--font-serif), Georgia, serif' }}>
          Reconciliation <span style={{ fontStyle: 'italic', color: '#E8760A' }}>Center</span>
        </h1>
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: 'rgba(42,22,40,0.6)' }}>
          Monitor, review and reconcile transactions across all clients before posting to QuickBooks.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        {/* Role switcher (mock "logged in as") */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setRoleMenuOpen((o) => !o)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#ffffff',
              border: '1px solid #DDD0C4',
              borderRadius: '8px',
              padding: '0.485rem 0.75rem 0.485rem 0.5rem',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
            aria-haspopup="listbox"
            aria-expanded={roleMenuOpen}
          >
            <span style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: '#E8760A',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              fontWeight: 700,
              fontFamily: 'Inter, sans-serif'
            }}>
              {getRoleInitials(role)}
            </span>
            <span style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: '#2A1628',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginRight: '2px'
            }}>
              {role}
            </span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'rgba(42,22,40,0.4)' }}><polyline points="6 9 12 15 18 9" /></svg>
          </button>
          {roleMenuOpen && (
            <div role="listbox" className="hide-scrollbar" style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px', boxShadow: '0 8px 24px rgba(42,22,40,0.12)', zIndex: 60, minWidth: '180px', padding: '4px' }}>
              <div style={{ padding: '0.4rem 0.65rem', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Viewing as</div>
              {ROLES.map((r: Role) => (
                <div
                  key={r}
                  role="option"
                  aria-selected={role === r}
                  onClick={() => { setRole(r); setRoleMenuOpen(false); }}
                  style={{
                    padding: '0.4rem 0.5rem',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    background: role === r ? 'rgba(232,118,10,0.06)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => { if (role !== r) e.currentTarget.style.background = 'rgba(232,118,10,0.04)'; }}
                  onMouseLeave={(e) => { if (role !== r) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#E8760A',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    {getRoleInitials(r)}
                  </span>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#2A1628',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}>
                    {r}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <ToolbarButton
          label={refreshing ? 'Refreshing…' : 'Refresh'}
          onClick={onRefresh}
          icon={
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#E8760A', animation: refreshing ? 'reconSpin 0.8s linear infinite' : undefined }}>
              <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          }
        />

        {!isHidden(role, 'export') && (
          <ToolbarButton
            label="Export Center"
            onClick={onExportCenter}
            disabled={!can(role, 'export')}
            disabledReason={restrictionReason(role, 'export')}
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#E8760A' }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            }
          />
        )}

        {!isHidden(role, 'createBatch') && (
          <ToolbarButton
            label="Create Reconciliation Batch"
            onClick={onCreateBatch}
            disabled={!can(role, 'createBatch')}
            disabledReason={restrictionReason(role, 'createBatch')}
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#E8760A' }}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>}
          />
        )}

        {!isHidden(role, 'importStatement') && (
          <ToolbarButton
            label="Import Bank Statement"
            primary
            onClick={onImportBankStatement}
            disabled={!can(role, 'importStatement')}
            disabledReason={restrictionReason(role, 'importStatement')}
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>}
          />
        )}
      </div>
    </div>
  );
}


// ============================================================================
// KpiGrid.tsx
// ============================================================================


interface KpiGridProps {
  transactions: ReconciliationTransaction[];
  loading?: boolean;
  stats?: {
    total: number; pending: number; autoMatched: number; manualReview: number; differenceFound: number;
    readyToPost: number; postedToday: number; unmatched: number; qbPending: number; highRisk: number; avgAccuracy: number;
  } | null;
}

const ICONS_KpiGrid = {
  pending: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  auto: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
  manual: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  diff: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><path d="M5 12h14" /></svg>,
  ready: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
  posted: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>,
  unmatched: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>,
  qb: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
  risk: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /></svg>,
  accuracy: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>,
};

function KpiGrid({ transactions, loading, stats }: KpiGridProps) {
  const metrics = useMemo(() => {
    // Prefer the real, whole-dataset backend aggregate over a client-side count of the loaded page
    if (stats) {
      const total = stats.total || 1;
      return [
        { label: 'Pending Reconciliation', value: stats.pending === 1 ? '1 item' : `${stats.pending} items`, sub: `${Math.round((stats.pending / total) * 100)}% of total`, icon: ICONS_KpiGrid.pending },
        { label: 'Matched Automatically', value: stats.autoMatched === 1 ? '1 item' : `${stats.autoMatched} items`, sub: `${Math.round((stats.autoMatched / total) * 100)}% of total`, icon: ICONS_KpiGrid.auto },
        { label: 'Manual Review Required', value: stats.manualReview === 1 ? '1 item' : `${stats.manualReview} items`, sub: `${Math.round((stats.manualReview / total) * 100)}% of total`, icon: ICONS_KpiGrid.manual },
        { label: 'Difference Found', value: stats.differenceFound === 1 ? '1 item' : `${stats.differenceFound} items`, sub: `${Math.round((stats.differenceFound / total) * 100)}% of total`, icon: ICONS_KpiGrid.diff },
        { label: 'Ready For Posting', value: stats.readyToPost === 1 ? '1 item' : `${stats.readyToPost} items`, sub: `${Math.round((stats.readyToPost / total) * 100)}% of total`, icon: ICONS_KpiGrid.ready },
        { label: 'Posted Today', value: stats.postedToday === 1 ? '1 item' : `${stats.postedToday} items`, sub: 'Synced to QuickBooks', icon: ICONS_KpiGrid.posted },
        { label: 'Unmatched Transactions', value: stats.unmatched === 1 ? '1 item' : `${stats.unmatched} items`, sub: 'No AI candidate found', icon: ICONS_KpiGrid.unmatched },
        { label: 'QuickBooks Pending', value: stats.qbPending === 1 ? '1 item' : `${stats.qbPending} items`, sub: 'Awaiting sync', icon: ICONS_KpiGrid.qb },
        { label: 'High Risk Transactions', value: stats.highRisk === 1 ? '1 item' : `${stats.highRisk} items`, sub: 'Elevated risk score', icon: ICONS_KpiGrid.risk },
        { label: 'Average Match Accuracy', value: `${stats.avgAccuracy}%`, sub: 'Across all AI-scored items', icon: ICONS_KpiGrid.accuracy },
      ];
    }

    const total = transactions.length || 1;
    const pending = transactions.filter((t) => t.status === 'Pending').length;
    const autoMatched = transactions.filter((t) => t.status === 'Auto Matched').length;
    const manualReview = transactions.filter((t) => t.status === 'Manual Review').length;
    const differenceFound = transactions.filter((t) => t.status === 'Difference Found').length;
    const readyToPost = transactions.filter((t) => t.status === 'Ready To Post').length;
    const postedToday = transactions.filter((t) => t.status === 'Posted' && t.lastUpdated.startsWith(TODAY_ISO)).length;
    const unmatched = transactions.filter((t) => t.aiMatchScore === null).length;
    const qbPending = transactions.filter((t) => t.quickBooksStatus === 'Pending').length;
    const highRisk = transactions.filter((t) => t.riskLevel === 'High').length;
    const scored = transactions.filter((t) => t.aiMatchScore !== null);
    const avgAccuracy = scored.length ? Math.round(scored.reduce((s, t) => s + (t.aiMatchScore || 0), 0) / scored.length) : 0;

    return [
      { label: 'Pending Reconciliation', value: pending === 1 ? '1 item' : `${pending} items`, sub: `${Math.round((pending / total) * 100)}% of total`, icon: ICONS_KpiGrid.pending },
      { label: 'Matched Automatically', value: autoMatched === 1 ? '1 item' : `${autoMatched} items`, sub: `${Math.round((autoMatched / total) * 100)}% of total`, icon: ICONS_KpiGrid.auto },
      { label: 'Manual Review Required', value: manualReview === 1 ? '1 item' : `${manualReview} items`, sub: `${Math.round((manualReview / total) * 100)}% of total`, icon: ICONS_KpiGrid.manual },
      { label: 'Difference Found', value: differenceFound === 1 ? '1 item' : `${differenceFound} items`, sub: `${Math.round((differenceFound / total) * 100)}% of total`, icon: ICONS_KpiGrid.diff },
      { label: 'Ready For Posting', value: readyToPost === 1 ? '1 item' : `${readyToPost} items`, sub: `${Math.round((readyToPost / total) * 100)}% of total`, icon: ICONS_KpiGrid.ready },
      { label: 'Posted Today', value: postedToday === 1 ? '1 item' : `${postedToday} items`, sub: 'Synced to QuickBooks', icon: ICONS_KpiGrid.posted },
      { label: 'Unmatched Transactions', value: unmatched === 1 ? '1 item' : `${unmatched} items`, sub: 'No AI candidate found', icon: ICONS_KpiGrid.unmatched },
      { label: 'QuickBooks Pending', value: qbPending === 1 ? '1 item' : `${qbPending} items`, sub: 'Awaiting sync', icon: ICONS_KpiGrid.qb },
      { label: 'High Risk Transactions', value: highRisk === 1 ? '1 item' : `${highRisk} items`, sub: 'Elevated risk score', icon: ICONS_KpiGrid.risk },
      { label: 'Average Match Accuracy', value: `${avgAccuracy}%`, sub: 'Across all AI-scored items', icon: ICONS_KpiGrid.accuracy },
    ];
  }, [transactions, stats]);

  return (
    <>
      <style>{`
        .recon-kpi-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.75rem; }
        @media (max-width: 1400px) { .recon-kpi-grid { grid-template-columns: repeat(4, 1fr); } }
        @media (max-width: 1100px) { .recon-kpi-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 760px) { .recon-kpi-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px) { .recon-kpi-grid { grid-template-columns: 1fr; } }
      `}</style>
      <div className="recon-kpi-grid">
        {loading
          ? Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '12px', padding: '1rem', minHeight: '105px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <SkeletonBar width="70%" height="12px" />
              <SkeletonBar width="40%" height="24px" />
            </div>
          ))
          : metrics.map((card, i) => (
            <div
              key={i}
              style={{
                background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '12px', padding: '1rem',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 10px rgba(42,22,40,0.02)', minHeight: '105px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'rgba(42,22,40,0.6)', lineHeight: 1.2, flex: 1, marginRight: '0.5rem' }}>{card.label}</span>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#FAF2EC', border: '1px solid #F3DEC9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E8760A', flexShrink: 0 }}>
                  {card.icon}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 300, color: '#2A1628', lineHeight: 1.1, fontFamily: 'var(--font-serif), Georgia, serif' }}>{ loading ? (
                  <div style={{ width: '48px', height: '32px', background: 'rgba(42,22,40,0.06)', borderRadius: '6px', animation: 'pulse 1.5s infinite ease-in-out' }} />
                ) : (
                  card.value
                )}</div>
                <div style={{ fontSize: '0.6875rem', color: 'rgba(42,22,40,0.45)', marginTop: '0.125rem', fontWeight: 500 }}>{card.sub}</div>
              </div>
            </div>
          ))}
      </div>
    </>
  );
}


// ============================================================================
// StatusChips.tsx
// ============================================================================


interface StatusChipsProps {
  transactions: ReconciliationTransaction[];
  active: string;
  onChange: (key: string) => void;
}

function StatusChips({ transactions, active, onChange }: StatusChipsProps) {
  const counts = React.useMemo(() => {
    const map: Record<string, number> = { All: transactions.length };
    for (const chip of STATUS_CHIPS) {
      if (!chip.status) continue;
      if (chip.status === 'Archived') {
        map[chip.key] = transactions.filter((t) => t.archived).length;
      } else {
        map[chip.key] = transactions.filter((t) => t.status === chip.status && !t.archived).length;
      }
    }
    return map;
  }, [transactions]);

  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', overflowX: 'auto', justifyContent: 'center' }} role="tablist" aria-label="Reconciliation status filter">
      {STATUS_CHIPS.map((chip) => {
        const isActive = active === chip.key;
        return (
          <button
            key={chip.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(chip.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.375rem 0.875rem', borderRadius: '20px',
              border: isActive ? '1.5px solid #E8760A' : '1px solid #DDD0C4',
              background: isActive ? 'rgba(232,118,10,0.06)' : '#ffffff',
              color: isActive ? '#E8760A' : 'rgba(42,22,40,0.6)',
              fontWeight: isActive ? 700 : 500,
              fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
              transition: 'all 150ms ease',
            }}
          >
            {chip.label}
            <span style={{
              fontSize: '0.65rem', fontWeight: 700, borderRadius: '999px', padding: '0.05rem 0.4rem',
              background: isActive ? '#E8760A' : 'rgba(42,22,40,0.08)', color: isActive ? '#fff' : 'rgba(42,22,40,0.55)',
            }}>
              {counts[chip.key] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}


// ============================================================================
// FilterBar.tsx
// ============================================================================


interface FilterBarProps {
  filters: FilterState;
  onChange: (patch: Partial<FilterState>) => void;
  onReset: () => void;
  onOpenSaveView: () => void;
  savedViews: SavedView[];
  onApplyView: (view: SavedView) => void;
  onManageColumns: () => void;
}

function DropdownFilter({
  label, value, options, onSelect, width,
}: { label: string; value: string; options: string[]; onSelect: (v: string) => void; width?: string }) {
  const [open, setOpen] = useState(false);
  const isFiltered = value !== 'All' && value !== '';
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0.75rem', fontSize: '0.75rem',
          border: `1px solid ${isFiltered ? '#E8760A' : '#DDD0C4'}`, borderRadius: '8px', background: isFiltered ? 'rgba(232,118,10,0.04)' : '#FAF8F5', color: isFiltered ? '#E8760A' : '#2A1628', cursor: 'pointer',
          fontWeight: isFiltered ? 600 : 500, whiteSpace: 'nowrap', fontFamily: 'inherit', justifyContent: 'space-between', minWidth: width || '120px',
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}: {value}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms ease', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div
          className="hide-scrollbar"
          role="listbox"
          style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px', boxShadow: '0 4px 12px rgba(42,22,40,0.08)', zIndex: 30, minWidth: '160px', padding: '4px', maxHeight: '220px', overflowY: 'auto' }}
        >
          {options.map((opt) => (
            <div
              key={opt}
              role="option"
              aria-selected={value === opt}
              onClick={() => { onSelect(opt); setOpen(false); }}
              style={{ padding: '0.4rem 0.625rem', fontSize: '0.75rem', color: '#2A1628', cursor: 'pointer', borderRadius: '6px', background: value === opt ? 'rgba(232,118,10,0.06)' : 'transparent', fontWeight: value === opt ? 600 : 400, whiteSpace: 'nowrap' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(232,118,10,0.06)'; e.currentTarget.style.color = '#E8760A'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = value === opt ? 'rgba(232,118,10,0.06)' : 'transparent'; e.currentTarget.style.color = '#2A1628'; }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TagsFilter({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const toggle = (tag: string) => {
    onChange(value.includes(tag) ? value.filter((t) => t !== tag) : [...value, tag]);
  };
  const isFiltered = value.length > 0;
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0.75rem', fontSize: '0.75rem', border: `1px solid ${isFiltered ? '#E8760A' : '#DDD0C4'}`, borderRadius: '8px', background: isFiltered ? 'rgba(232,118,10,0.04)' : '#FAF8F5', color: isFiltered ? '#E8760A' : '#2A1628', cursor: 'pointer', fontWeight: isFiltered ? 600 : 500, whiteSpace: 'nowrap', fontFamily: 'inherit', minWidth: '120px', justifyContent: 'space-between' }}
      >
        <span>Tags{value.length ? ` (${value.length})` : ': All'}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: open ? 'rotate(180deg)' : 'none' }}><polyline points="6 9 12 15 18 9" /></svg>
      </button>
      {open && (
        <div className="hide-scrollbar" style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px', boxShadow: '0 4px 12px rgba(42,22,40,0.08)', zIndex: 30, minWidth: '180px', padding: '6px' }}>
          {TAGS.map((tag) => (
            <label key={tag} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.5rem', fontSize: '0.75rem', color: '#2A1628', cursor: 'pointer', borderRadius: '6px' }}>
              <input type="checkbox" checked={value.includes(tag)} onChange={() => toggle(tag)} />
              {tag}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterBar({ filters, onChange, onReset, onOpenSaveView, savedViews, onApplyView, onManageColumns }: FilterBarProps) {
  const [viewsOpen, setViewsOpen] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const isDateFiltered = filters.dateStart !== '' || filters.dateEnd !== '';
  const isAmountFiltered = filters.amountMin !== '' || filters.amountMax !== '';

  return (
    <div
      style={{
        background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '12px', padding: '0.85rem 1rem',
        display: 'flex', flexDirection: 'column', gap: '0.65rem', boxShadow: '0 4px 12px rgba(42,22,40,0.01)',
      }}
    >
      {/* Search + Save View / Reset + Advanced */}
      <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(42,22,40,0.35)' }}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search transactions, client, reference, description…"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            style={{ width: '100%', padding: '0.55rem 1rem 0.55rem 2.25rem', fontSize: '0.8125rem', border: '1px solid #DDD0C4', borderRadius: '8px', background: '#FAF8F5', outline: 'none', color: '#2A1628', boxSizing: 'border-box', fontFamily: 'inherit' }}
          />
        </div>

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setViewsOpen((o) => !o)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 0.9rem', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #DDD0C4', borderRadius: '8px', background: '#FAF8F5', color: '#2A1628', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Saved Views
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
          </button>
          {viewsOpen && (
            <div className="hide-scrollbar" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '4px', background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px', boxShadow: '0 8px 24px rgba(42,22,40,0.12)', zIndex: 50, minWidth: '220px', padding: '6px', maxHeight: '240px', overflowY: 'auto' }}>
              {savedViews.length === 0 && <div style={{ padding: '0.5rem 0.65rem', fontSize: '0.75rem', color: 'rgba(42,22,40,0.45)' }}>No saved views yet.</div>}
              {savedViews.map((v) => (
                <div key={v.id} onClick={() => { onApplyView(v); setViewsOpen(false); }} style={{ padding: '0.5rem 0.65rem', fontSize: '0.75rem', color: '#2A1628', cursor: 'pointer', borderRadius: '6px' }}
                   onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(232,118,10,0.06)'; }}
                   onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  {v.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onOpenSaveView}
          style={{ padding: '0.55rem 0.9rem', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #DDD0C4', borderRadius: '8px', background: '#FAF8F5', color: '#2A1628', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
        >
          Save View
        </button>

        <button
          onClick={onReset}
          style={{ padding: '0.55rem 1.1rem', fontSize: '0.75rem', border: '1px solid #DDD0C4', borderRadius: '8px', background: '#FAF8F5', color: 'rgba(42,22,40,0.6)', cursor: 'pointer', fontWeight: 600 }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#E8760A'; e.currentTarget.style.borderColor = '#E8760A'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(42,22,40,0.6)'; e.currentTarget.style.borderColor = '#DDD0C4'; }}
        >
          Reset Filters
        </button>

        <button
          onClick={onManageColumns}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 0.9rem', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #DDD0C4', borderRadius: '8px', background: '#FAF8F5', color: '#2A1628', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" /><path d="M1 14h6M9 8h6M17 16h6" /></svg>
          Manage Columns
        </button>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvancedFilters((v) => !v)}
          style={{ padding: '0.55rem 1rem', fontSize: '0.8125rem', border: `1px solid ${showAdvancedFilters ? '#E8760A' : '#DDD0C4'}`, borderRadius: '8px', background: showAdvancedFilters ? 'rgba(232,118,10,0.06)' : '#FAF8F5', color: showAdvancedFilters ? '#E8760A' : 'rgba(42,22,40,0.6)', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.375rem', whiteSpace: 'nowrap', transition: 'all 150ms', fontFamily: 'inherit' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
          Advanced
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: showAdvancedFilters ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      </div>

      {/* Main filters row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        <DropdownFilter label="Client" value={filters.client} options={['All', ...CLIENTS.map((c) => c.name)]} onSelect={(v) => onChange({ client: v })} width="170px" />
        <DropdownFilter label="Manager" value={filters.manager} options={['All', ...MANAGERS]} onSelect={(v) => onChange({ manager: v })} />
        <DropdownFilter label="Bookkeeper" value={filters.bookkeeper} options={['All', ...BOOKKEEPERS]} onSelect={(v) => onChange({ bookkeeper: v })} />
        <DropdownFilter label="Status" value={filters.status} options={['All', ...STATUSES]} onSelect={(v) => onChange({ status: v })} />

        {/* Date range */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', border: `1px solid ${isDateFiltered ? '#E8760A' : '#DDD0C4'}`, borderRadius: '8px', background: isDateFiltered ? 'rgba(232,118,10,0.04)' : '#FAF8F5', padding: '0.35rem 0.6rem' }}>
          <span style={{ fontSize: '0.7rem', color: isDateFiltered ? '#E8760A' : 'rgba(42,22,40,0.5)', fontWeight: 600 }}>From</span>
          <input type="date" value={filters.dateStart} onChange={(e) => onChange({ dateStart: e.target.value })} style={{ border: 'none', background: 'transparent', fontSize: '0.75rem', color: '#2A1628', outline: 'none', fontFamily: 'inherit', width: '128px' }} />
          <span style={{ fontSize: '0.7rem', color: isDateFiltered ? '#E8760A' : 'rgba(42,22,40,0.5)', fontWeight: 600 }}>To</span>
          <input type="date" value={filters.dateEnd} onChange={(e) => onChange({ dateEnd: e.target.value })} style={{ border: 'none', background: 'transparent', fontSize: '0.75rem', color: '#2A1628', outline: 'none', fontFamily: 'inherit', width: '128px' }} />
        </div>

        {/* Amount range */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', border: `1px solid ${isAmountFiltered ? '#E8760A' : '#DDD0C4'}`, borderRadius: '8px', background: isAmountFiltered ? 'rgba(232,118,10,0.04)' : '#FAF8F5', padding: '0.35rem 0.6rem' }}>
          <span style={{ fontSize: '0.7rem', color: isAmountFiltered ? '#E8760A' : 'rgba(42,22,40,0.5)', fontWeight: 600 }}>Amt</span>
          <input type="number" placeholder="Min" value={filters.amountMin} onChange={(e) => onChange({ amountMin: e.target.value })} style={{ border: 'none', background: 'transparent', fontSize: '0.75rem', color: '#2A1628', outline: 'none', fontFamily: 'inherit', width: '60px' }} />
          <span style={{ color: 'rgba(42,22,40,0.3)' }}>–</span>
          <input type="number" placeholder="Max" value={filters.amountMax} onChange={(e) => onChange({ amountMax: e.target.value })} style={{ border: 'none', background: 'transparent', fontSize: '0.75rem', color: '#2A1628', outline: 'none', fontFamily: 'inherit', width: '60px' }} />
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div style={{ marginTop: '0.4rem', padding: '1rem', background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '10px', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <DropdownFilter label="Bank" value={filters.bank} options={['All', ...BANKS]} onSelect={(v) => onChange({ bank: v })} />
          <DropdownFilter label="Financial Year" value={filters.financialYear} options={['All', ...FINANCIAL_YEARS]} onSelect={(v) => onChange({ financialYear: v })} />
          <DropdownFilter label="Month" value={filters.month} options={['All', ...MONTHS]} onSelect={(v) => onChange({ month: v })} />
          <DropdownFilter label="Currency" value={filters.currency} options={['All', ...CURRENCIES]} onSelect={(v) => onChange({ currency: v })} width="100px" />
          <DropdownFilter label="Difference Type" value={filters.differenceType} options={['All', ...DIFFERENCE_TYPES]} onSelect={(v) => onChange({ differenceType: v })} />
          <DropdownFilter label="QuickBooks" value={filters.quickBooksStatus} options={['All', ...QB_STATUSES]} onSelect={(v) => onChange({ quickBooksStatus: v })} />
          <DropdownFilter label="Priority" value={filters.priority} options={['All', ...PRIORITIES]} onSelect={(v) => onChange({ priority: v })} width="100px" />
          <DropdownFilter label="Reviewer" value={filters.reviewer} options={['All', ...REVIEWERS]} onSelect={(v) => onChange({ reviewer: v })} />

          <TagsFilter value={filters.tags} onChange={(tags) => onChange({ tags })} />
        </div>
      )}
    </div>
  );
}


// ============================================================================
// BulkActionBar.tsx
// ============================================================================


interface BulkActionBarProps {
  selectedCount: number;
  onAction: (action: BulkActionKey) => void;
}

const ACTIONS: { key: BulkActionKey; label: string; permission?: PermissionAction; danger?: boolean; icon: React.ReactNode }[] = [
  { key: 'assignReviewer', label: 'Assign Reviewer', permission: 'assignReviewer', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
  { key: 'approve', label: 'Approve Selected', permission: 'approve', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="20 6 9 17 4 12" /></svg> },
  { key: 'reject', label: 'Reject Selected', permission: 'reject', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg> },
  { key: 'retryMatching', label: 'Retry Matching', permission: 'retryMatching', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="23 4 23 10 17 10" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" /></svg> },
  { key: 'merge', label: 'Merge Transactions', permission: 'merge', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 3v12a4 4 0 0 0 4 4h4" /><polyline points="18 13 22 17 18 21" /></svg> },
  { key: 'moveToException', label: 'Move To Exception', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg> },
  { key: 'exportBatch', label: 'Export Batch', permission: 'export', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg> },
  { key: 'postToQuickBooks', label: 'Post To QuickBooks', permission: 'postToQuickBooks', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg> },
  { key: 'archive', label: 'Archive', permission: 'archive', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" /></svg> },
  { key: 'delete', label: 'Delete', permission: 'delete', danger: true, icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg> },
  { key: 'addNotes', label: 'Add Notes', permission: 'addNotes', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z" /></svg> },
];

function BulkActionBar({ selectedCount, onAction }: BulkActionBarProps) {
  const { role } = useReconciliation();
  if (selectedCount === 0) return null;

  return (
    <div
      style={{
        position: 'sticky', top: 'calc(var(--topbar-height, 0px) + 0.5rem)', zIndex: 45,
        background: '#2A1628', borderRadius: '12px', padding: '0.6rem 1rem',
        display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto',
        boxShadow: '0 12px 32px rgba(42,22,40,0.25)',
      }}
      className="bulk-action-bar-scroll"
    >
      <style>{`
        .bulk-action-bar-scroll::-webkit-scrollbar {
          display: none !important;
          height: 0 !important;
          width: 0 !important;
        }
        .bulk-action-bar-scroll {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}</style>
      <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap', paddingRight: '0.5rem' }}>
        {selectedCount} selected
      </span>
      <span style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.12)', flexShrink: 0 }} />

      {ACTIONS.map((action) => {
        const hidden = action.permission ? isHidden(role, action.permission) : false;
        if (hidden) return null;
        const disabled = action.permission ? !can(role, action.permission) : false;
        const reason = action.permission ? restrictionReason(role, action.permission) : null;
        return (
          <button
            key={action.key}
            onClick={() => onAction(action.key)}
            disabled={disabled}
            title={disabled && reason ? reason : undefined}
            style={{
              background: disabled ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '6px', padding: '0.35rem 0.7rem',
              color: disabled ? 'rgba(255,255,255,0.35)' : action.danger ? '#FCA5A5' : '#fff',
              fontSize: '0.6875rem', fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap',
              fontFamily: 'inherit', flexShrink: 0,
            }}
            onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
            onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
          >
            {action.icon}
            {action.label}
          </button>
        );
      })}

      <span style={{ flex: 1 }} />
      <button
        onClick={() => onAction('clearSelection')}
        style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '0.6875rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit', flexShrink: 0 }}
      >
        Clear Selection
      </button>
    </div>
  );
}


// ============================================================================
// ReconciliationTable.tsx
// ============================================================================


interface ReconciliationTableProps {
  transactions: ReconciliationTransaction[];
  loading?: boolean;
  errorState?: boolean;
  offline?: boolean;
  columns: ColumnDef[];
  density: Density;
  freezeFirstColumn: boolean;
  onColumnResize: (key: string, width: number) => void;
  onColumnReorder: (dragKey: string, dropKey: string) => void;
  sortKey: string;
  sortDir: 'asc' | 'desc';
  onSort: (key: string) => void;
  selectedIds: string[];
  onToggleSelect: (id: string, index: number, shiftKey: boolean) => void;
  onToggleSelectAll: () => void;
  onFocusRow: (id: string) => void;
  onRowAction: (action: RowActionKey, tx: ReconciliationTransaction) => void;
  onResetFilters: () => void;
  hasAnyData: boolean;
}

const DENSITY_PADDING: Record<Density, string> = { compact: '0.3rem 0.75rem', comfortable: '0.5rem 0.75rem', spacious: '0.75rem 0.75rem' };

const ROW_ACTIONS: { key: RowActionKey; label: string; icon: React.ReactNode; permission?: PermissionAction; hideForReadOnly?: boolean; danger?: boolean; group: number }[] = [
  { key: 'openDrawer', label: 'Open Reconciliation Drawer', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>, group: 1 },
  { key: 'viewTimeline', label: 'View Timeline', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>, group: 1 },
  { key: 'autoCreateVendor', label: 'Auto-Create Vendor', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>, group: 1 },
  { key: 'previewTransactions', label: 'Preview Transactions', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, group: 1 },
  { key: 'aiMatchAnalysis', label: 'AI Match Analysis', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>, group: 1 },
  { key: 'manualMatch', label: 'Manual Match', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, hideForReadOnly: true, group: 2 },
  { key: 'splitTransaction', label: 'Split Transaction', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3v12a4 4 0 0 0 4 4h4"/><polyline points="18 13 22 17 18 21"/></svg>, permission: 'split', group: 2 },
  { key: 'mergeTransaction', label: 'Merge Transaction', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, permission: 'merge', group: 2 },
  { key: 'postToQuickBooks', label: 'Post To QuickBooks', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, permission: 'postToQuickBooks', group: 2 },
  { key: 'duplicate', label: 'Duplicate', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>, hideForReadOnly: true, group: 3 },
  { key: 'clone', label: 'Clone', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>, hideForReadOnly: true, group: 3 },
  { key: 'export', label: 'Export', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>, permission: 'export', group: 3 },
  { key: 'downloadPdf', label: 'Download PDF', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>, group: 3 },
  { key: 'downloadCsv', label: 'Download CSV', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>, group: 3 },
  { key: 'copyTransactionId', label: 'Copy Transaction ID', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M9 15H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"/></svg>, group: 3 },
  { key: 'openClient', label: 'Open Client', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>, group: 4 },
  { key: 'jumpToAiQueue', label: 'Jump to AI Queue', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>, group: 4 },
  { key: 'jumpToVat', label: 'Jump to VAT', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>, group: 4 },
  { key: 'jumpToQuickBooks', label: 'Jump to QuickBooks', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>, group: 4 },
  { key: 'notes', label: 'Notes', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, permission: 'addNotes', group: 5 },
  { key: 'auditLog', label: 'Audit Log', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, group: 5 },
  { key: 'archive', label: 'Archive', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/></svg>, permission: 'archive', group: 6 },
  { key: 'delete', label: 'Delete', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>, permission: 'delete', danger: true, group: 6 },
];

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  return mounted ? createPortal(children, document.body) : null;
}

function RowMenu({ tx, index, total, onAction }: { tx: ReconciliationTransaction; index: number; total: number; onAction: (a: RowActionKey) => void }) {
  const { role } = useReconciliation();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownHeight = 350; // estimation
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < dropdownHeight && rect.top > dropdownHeight;
      setCoords({
        top: openUp
          ? rect.top + window.scrollY - dropdownHeight - 4
          : rect.bottom + window.scrollY + 4,
        left: Math.max(10, rect.right + window.scrollX - 220) // align to right
      });
    }
  }, []);

  const handleToggle = () => {
    if (!open) {
      updatePosition();
    }
    setOpen((o) => !o);
  };

  useEffect(() => {
    if (!open) return;
    const clickHandler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        (buttonRef.current && buttonRef.current.contains(target)) ||
        (menuRef.current && menuRef.current.contains(target))
      ) {
        return;
      }
      setOpen(false);
    };

    const scrollHandler = (e: Event) => {
      if (menuRef.current && menuRef.current.contains(e.target as Node)) {
        return;
      }
      setOpen(false);
    };

    document.addEventListener('mousedown', clickHandler);
    window.addEventListener('scroll', scrollHandler, true);
    window.addEventListener('resize', scrollHandler);

    return () => {
      document.removeEventListener('mousedown', clickHandler);
      window.removeEventListener('scroll', scrollHandler, true);
      window.removeEventListener('resize', scrollHandler);
    };
  }, [open]);

  const visibleActions = ROW_ACTIONS.filter((action) => {
    if (action.hideForReadOnly && role === 'Read Only') return false;
    if (action.permission && isHidden(role, action.permission)) return false;
    return true;
  });
  const menuItems: { action: (typeof visibleActions)[number]; showDivider: boolean }[] = [];
  for (let i = 0; i < visibleActions.length; i++) {
    const action = visibleActions[i];
    const previousGroup = i > 0 ? visibleActions[i - 1].group : 0;
    menuItems.push({ action, showDivider: previousGroup !== 0 && action.group !== previousGroup });
  }

  return (
    <div style={{ display: 'inline-block' }}>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        aria-label={`Actions for ${tx.id}`}
        aria-haspopup="menu"
        aria-expanded={open}
        style={{ background: 'transparent', border: '1px solid rgba(42,22,40,0.1)', borderRadius: '6px', padding: '4px 6px', cursor: 'pointer', color: 'rgba(42,22,40,0.55)', display: 'flex' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>
      </button>
      {open && (
        <Portal>
          <div
            ref={menuRef}
            role="menu"
            className="hide-scrollbar"
            style={{ 
              position: 'absolute', 
              top: `${coords.top}px`, 
              left: `${coords.left}px`, 
              background: '#fff', 
              border: '1px solid #DDD0C4', 
              borderRadius: '12px', 
              boxShadow: '0 12px 36px rgba(42,22,40,0.14)', 
              zIndex: 99999, 
              minWidth: '220px', 
              padding: '6px', 
              maxHeight: '350px', 
              overflowY: 'auto' 
            }}
          >
            {menuItems.map(({ action, showDivider }) => {
              const disabled = action.permission ? !can(role, action.permission) : false;
              const reason = action.permission ? restrictionReason(role, action.permission) : null;
              return (
                <React.Fragment key={action.key}>
                  {showDivider && <div style={{ height: '1px', background: 'rgba(42,22,40,0.06)', margin: '4px 2px' }} />}
                  <div
                    role="menuitem"
                    tabIndex={disabled ? -1 : 0}
                    aria-disabled={disabled}
                    title={disabled && reason ? reason : undefined}
                    onClick={() => { if (disabled) return; setOpen(false); onAction(action.key); }}
                    onKeyDown={(e) => { if (!disabled && (e.key === 'Enter' || e.key === ' ')) { setOpen(false); onAction(action.key); } }}
                    style={{
                      padding: '0.45rem 0.75rem',
                      fontSize: '0.775rem',
                      borderRadius: '8px',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      color: disabled ? 'rgba(42,22,40,0.3)' : action.danger ? '#EF4444' : '#2A1628',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'background 150ms ease'
                    }}
                    onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = action.danger ? 'rgba(239,68,68,0.06)' : 'rgba(232,118,10,0.06)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', color: disabled ? 'rgba(42,22,40,0.3)' : action.danger ? '#EF4444' : '#E8760A' }}>
                      {action.icon}
                    </span>
                    {action.label}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </Portal>
      )}
    </div>
  );
}

function SortHeader({ column, sortKey, sortDir, onSort }: { column: ColumnDef; sortKey: string; sortDir: 'asc' | 'desc'; onSort: (k: string) => void }) {
  if (!column.sortable) return <span>{column.label.toUpperCase()}</span>;
  const active = sortKey === column.key;
  return (
    <button
      onClick={() => onSort(column.key)}
      style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', font: 'inherit', color: active ? '#E8760A' : 'inherit', padding: 0 }}
    >
      {column.label.toUpperCase()}
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ opacity: active ? 1 : 0.35, transform: active && sortDir === 'desc' ? 'rotate(180deg)' : 'none' }}>
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  );
}

function ReconciliationTable({
  transactions, loading, errorState, offline, columns, density, freezeFirstColumn,
  onColumnResize, onColumnReorder, sortKey, sortDir, onSort,
  selectedIds, onToggleSelect, onToggleSelectAll, onFocusRow, onRowAction, onResetFilters, hasAnyData,
}: ReconciliationTableProps) {
  const resizeState = useRef<{ key: string; startX: number; startWidth: number } | null>(null);
  const dragKeyRef = useRef<string | null>(null);

  const startResize = (e: React.MouseEvent, col: ColumnDef) => {
    e.preventDefault();
    e.stopPropagation();
    resizeState.current = { key: col.key, startX: e.clientX, startWidth: col.width };
    const onMove = (ev: MouseEvent) => {
      if (!resizeState.current) return;
      const delta = ev.clientX - resizeState.current.startX;
      const next = Math.max(col.minWidth, resizeState.current.startWidth + delta);
      onColumnResize(resizeState.current.key, next);
    };
    const onUp = () => {
      resizeState.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const padding = DENSITY_PADDING[density];

  const renderCell = (tx: ReconciliationTransaction, key: string) => {
    switch (key) {
      case 'client':
        const clientInitials = tx.client
          .split(' ')
          .map((w) => w[0])
          .join('')
          .slice(0, 2)
          .toUpperCase();
        
        let clientEmail = 'info@' + tx.client.toLowerCase().replace(/[^a-z0-9]/g, '') + '.ae';
        if (tx.client === 'ABC Trading LLC') clientEmail = 'info@abctrading.ae';
        else if (tx.client === 'XYZ Holdings Limited') clientEmail = 'contact@xyzholdings.com';
        else if (tx.client === 'Delta Properties FZCO') clientEmail = 'admin@deltaproperties.ae';
        else if (tx.client === 'Alpha Tech FZCO') clientEmail = 'finance@alphatech.ae';
        else if (tx.client === 'Beta Industries LLC') clientEmail = 'operations@betaind.ae';
        else if (tx.client === 'Gamma Solutions FZCO') clientEmail = 'info@gammasolutions.ae';

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(232, 118, 10, 0.08)',
              color: '#E8760A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
              flexShrink: 0
            }}>
              {clientInitials}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#2A1628' }}>{tx.client}</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.45)' }}>{clientEmail}</div>
            </div>
          </div>
        );
      case 'bankAccount':
        return <span style={{ fontWeight: 500, color: '#2A1628', fontFamily: 'Inter, sans-serif' }}>{tx.bankAccount}</span>;
      case 'statementReference':
        return (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: '0.7rem',
              fontWeight: 600,
              padding: '0.25rem 0.55rem',
              borderRadius: '6px',
              background: 'rgba(42,22,40,0.06)',
              color: '#2A1628',
              fontFamily: 'monospace',
              whiteSpace: 'nowrap',
            }}>
              {tx.statementReference}
            </span>
          </div>
        );
      case 'transactionDate':
        return <span style={{ fontWeight: 500, color: '#2A1628', fontFamily: 'Inter, sans-serif' }}>{tx.transactionDate}</span>;
      case 'description':
        return (
          <div>
            <div style={{ fontWeight: 600, color: '#2A1628' }}>{tx.description}</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.45)' }}>{tx.descriptionSub}</div>
          </div>
        );
      case 'amount':
        return <span style={{ fontWeight: 600, color: '#2A1628', fontFamily: 'Inter, sans-serif' }}>{tx.currency} {tx.amount.toLocaleString()}</span>;
      case 'aiMatchScore': {
        if (tx.aiMatchScore === null) {
          return <span style={{ color: 'rgba(42,22,40,0.4)' }}>—</span>;
        }
        let lvl = 1, col = '#ef4444', lbl = 'Unlikely';
        if (tx.aiMatchScore >= 95) { lvl = 6; col = '#166534'; lbl = 'Exact Match'; }
        else if (tx.aiMatchScore >= 85) { lvl = 5; col = '#15803d'; lbl = 'High Conf.'; }
        else if (tx.aiMatchScore >= 75) { lvl = 4; col = '#22c55e'; lbl = 'Probable'; }
        else if (tx.aiMatchScore >= 50) { lvl = 3; col = '#eab308'; lbl = 'Possible'; }
        else if (tx.aiMatchScore >= 30) { lvl = 2; col = '#f97316'; lbl = 'Weak'; }
        
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '14px' }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} style={{
                  width: '3px',
                  height: `${4 + i * 1.5}px`,
                  background: i <= lvl ? col : '#E5E7EB',
                  borderRadius: '1px'
                }} />
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 700, fontSize: '0.7rem', color: col, lineHeight: 1.2 }}>{lbl}</span>
              <span style={{ fontSize: '0.6rem', color: 'rgba(42,22,40,0.5)', lineHeight: 1.2 }}>Score: {tx.aiMatchScore}%</span>
            </div>
          </div>
        );
      }
      case 'matchedEntry':
        return <span style={{ fontWeight: 500, color: tx.matchedEntry ? '#2A1628' : 'rgba(42,22,40,0.4)', fontFamily: 'Inter, sans-serif' }}>{tx.matchedEntry || 'Unmatched'}</span>;
      case 'difference':
        return <span style={{ fontWeight: 600, color: tx.difference > 0 ? '#D32F2F' : '#2A1628', fontFamily: 'Inter, sans-serif' }}>{tx.currency} {tx.difference.toLocaleString()}</span>;
      case 'status':
        return <StatusPill status={tx.status} />;
      case 'assignedReviewer':
        return <span style={{ fontWeight: 500, color: tx.assignedReviewer ? '#2A1628' : 'rgba(42,22,40,0.4)', fontFamily: 'Inter, sans-serif' }}>{tx.assignedReviewer || 'Unassigned'}</span>;
      case 'quickBooksStatus':
        return <QbPill status={tx.quickBooksStatus} />;
      case 'priority':
        return <PriorityPill priority={tx.priority} />;
      case 'lastUpdated':
        return <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'rgba(42,22,40,0.6)', fontFamily: 'Inter, sans-serif' }}>{tx.lastUpdated.replace('T', ' ')}</span>;
      default:
        return null;
    }
  };

  return (
    <div
      className="client-table-scroll hide-scrollbar"
      style={{
        background: '#ffffff',
        border: '1px solid rgba(42,22,40,0.06)',
        borderRadius: '16px',
        overflowX: 'auto',
        position: 'relative',
        minHeight: '380px',
        boxShadow: '0 4px 12px rgba(42,22,40,0.01)',
        fontFamily: 'var(--font-sans), Inter, sans-serif'
      }}
    >
      <style>{`
        .client-table-scroll::-webkit-scrollbar { height: 6px; }
        .client-table-scroll::-webkit-scrollbar-track { background: rgba(42,22,40,0.03); border-radius: 4px; }
        .client-table-scroll::-webkit-scrollbar-thumb { background: rgba(42,22,40,0.15); border-radius: 4px; }
        .client-table-scroll::-webkit-scrollbar-thumb:hover { background: rgba(42,22,40,0.25); }
        .recon-row:focus-visible { outline: none; }
      `}</style>

      {loading ? (
        <TableSkeleton columns={columns.length + 2} />
      ) : (
        <table style={{ width: '100%', minWidth: `${columns.reduce((s, c) => s + c.width, 100)}px`, borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem', fontFamily: 'var(--font-sans), Inter, sans-serif' }}>
          <thead>
            <tr style={{ background: '#FAF8F5', borderBottom: '1px solid rgba(42,22,40,0.06)', color: 'rgba(42,22,40,0.5)', fontWeight: 600, whiteSpace: 'nowrap' }}>
              <th style={{ padding: '1rem 0.75rem', width: '48px', textAlign: 'center', position: 'sticky', top: 0, left: 0, background: '#FAF8F5', zIndex: 12 }}>
                <input type="checkbox" aria-label="Select all rows" onChange={onToggleSelectAll} checked={transactions.length > 0 && transactions.every((t) => selectedIds.includes(t.id))} />
              </th>
              {columns.map((col, idx) => (
                <th
                  key={col.key}
                  draggable
                  onDragStart={() => { dragKeyRef.current = col.key; }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => { if (dragKeyRef.current && dragKeyRef.current !== col.key) onColumnReorder(dragKeyRef.current, col.key); dragKeyRef.current = null; }}
                  style={{
                    padding: '1rem 0.75rem', position: 'sticky', top: 0,
                    left: freezeFirstColumn && idx === 0 ? '48px' : undefined,
                    background: '#FAF8F5', zIndex: freezeFirstColumn && idx === 0 ? 12 : 11,
                    borderRight: freezeFirstColumn && idx === 0 ? '1px solid #DDD0C4' : undefined,
                    width: `${col.width}px`, minWidth: `${col.minWidth}px`, cursor: 'grab', userSelect: 'none',
                  }}
                >
                  <div style={{ position: 'relative', paddingRight: '10px', display: 'flex', justifyContent: col.key === 'statementReference' ? 'center' : 'flex-start' }}>
                    <SortHeader column={col} sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
                    <span
                      onMouseDown={(e) => startResize(e, col)}
                      style={{ position: 'absolute', right: -12, top: '-8px', bottom: '-8px', width: '10px', cursor: 'col-resize' }}
                    />
                  </div>
                </th>
              ))}
              <th style={{ padding: '1rem', textAlign: 'center', position: 'sticky', top: 0, background: '#FAF8F5', zIndex: 11 }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} style={{ padding: 0 }}>
                  <div style={{ position: 'sticky', left: 0, display: 'flex', justifyContent: 'center', width: '100vw', maxWidth: '100%', boxSizing: 'border-box', padding: '2rem' }}>
                    <EmptyState
                      variant={offline ? 'offline' : errorState ? 'error' : hasAnyData ? 'no-results' : 'no-data'}
                      actionLabel={hasAnyData ? 'Reset Filters' : undefined}
                      onAction={hasAnyData ? onResetFilters : undefined}
                    />
                  </div>
                </td>
              </tr>
            ) : (
              transactions.map((tx, idx) => {
                const isSelected = selectedIds.includes(tx.id);
                const rowBg = isSelected ? '#FAF4EE' : '#ffffff';
                return (
                  <tr
                    key={tx.id}
                    className="recon-row"
                    tabIndex={0}
                    onFocus={() => onFocusRow(tx.id)}
                    onClick={() => onRowAction('openDrawer', tx)}
                    style={{ borderBottom: idx < transactions.length - 1 ? '1px solid rgba(42,22,40,0.04)' : 'none', background: isSelected ? 'rgba(232,118,10,0.02)' : 'transparent', cursor: 'pointer' }}
                  >
                    <td onClick={(e) => e.stopPropagation()} style={{ padding: `${padding}`, textAlign: 'center', position: 'sticky', left: 0, background: rowBg, zIndex: 5 }}>
                      <input
                        type="checkbox"
                        aria-label={`Select ${tx.id}`}
                        checked={isSelected}
                        onChange={(e) => onToggleSelect(tx.id, idx, (e.nativeEvent as MouseEvent).shiftKey)}
                      />
                    </td>
                    {columns.map((col, cidx) => (
                      <td
                        key={col.key}
                        style={{
                          padding, whiteSpace: cidx < 2 ? 'nowrap' : undefined,
                          position: freezeFirstColumn && cidx === 0 ? 'sticky' : undefined,
                          left: freezeFirstColumn && cidx === 0 ? '48px' : undefined,
                          background: freezeFirstColumn && cidx === 0 ? rowBg : undefined,
                          zIndex: freezeFirstColumn && cidx === 0 ? 5 : undefined,
                          borderRight: freezeFirstColumn && cidx === 0 ? '1px solid #DDD0C4' : undefined,
                          width: `${col.width}px`, minWidth: `${col.minWidth}px`,
                        }}
                      >
                        {renderCell(tx, col.key)}
                      </td>
                    ))}
                    <td style={{ padding, textAlign: 'center', position: 'relative', zIndex: 100 }}>
                      <RowMenu tx={tx} index={idx} total={transactions.length} onAction={(action) => onRowAction(action, tx)} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}




// ============================================================================
// RightAnalyticsPanel.tsx
// ============================================================================


interface RightAnalyticsPanelProps {
  transactions: ReconciliationTransaction[];
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid rgba(42,22,40,0.06)',
      borderRadius: '12px',
      padding: '1rem',
      boxShadow: '0 4px 10px rgba(42,22,40,0.02)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: '115px',
    }}>
      <h4 style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', margin: '0 0 0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: 'var(--font-sans), Inter, sans-serif' }}>{title}</h4>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {children}
      </div>
    </div>
  );
}

function ProgressRow({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', fontWeight: 500 }}>
        <span style={{ color: 'rgba(42,22,40,0.5)' }}>{label}</span>
        <span style={{ fontWeight: 700, color: '#2A1628' }}>{value}</span>
      </div>
      <div style={{ height: '5px', background: '#F6F2EE', borderRadius: '9999px', overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: color, borderRadius: '9999px' }} />
      </div>
    </div>
  );
}

function RightAnalyticsPanel({ transactions }: RightAnalyticsPanelProps) {
  const stats = useMemo(() => {
    const total = transactions.length || 1;
    const matched = transactions.filter((t) => t.matchedEntry !== null).length;
    const autoMatched = transactions.filter((t) => t.status === 'Auto Matched').length;
    const manualMatched = transactions.filter((t) => t.status === 'Manual Review' || t.status === 'Posted').length - autoMatched;
    const qbSynced = transactions.filter((t) => t.quickBooksStatus === 'Synced').length;
    const qbEligible = transactions.filter((t) => t.quickBooksStatus !== 'Not Synced').length || 1;
    const inReview = transactions.filter((t) => t.status === 'Manual Review' || t.status === 'Exception').length;
    const diffTotal = transactions.reduce((s, t) => s + t.difference, 0);
    const withDiff = transactions.filter((t) => t.difference > 0).length;
    const healthScore = Math.round((matched / total) * 100);
    const matchAccuracy = Math.round((autoMatched / total) * 100);

    return { total, matched, autoMatched, manualMatched: Math.max(0, manualMatched), qbSynced, qbEligible, inReview, diffTotal, withDiff, healthScore, matchAccuracy };
  }, [transactions]);

  return (
    <div>
      <style>{`
        .recon-right-panel-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 0.75rem; }
        @media (max-width: 1400px) { .recon-right-panel-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 760px) { .recon-right-panel-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px) { .recon-right-panel-grid { grid-template-columns: 1fr; } }
      `}</style>
      <div className="recon-right-panel-grid">
        <Card title="Overall Reconciliation Health">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ position: 'relative', width: '48px', height: '48px', flexShrink: 0 }}>
              <svg width="48" height="48" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F0E8DF" strokeWidth="4.5" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#E8760A" strokeWidth="4.5" strokeDasharray={`${stats.healthScore} ${100 - stats.healthScore}`} strokeLinecap="round" />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-sans), Inter, sans-serif', color: '#2A1628' }}>{stats.healthScore}%</span>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '0.6875rem', color: 'rgba(42,22,40,0.5)', lineHeight: 1.3, fontWeight: 500 }}>
              {stats.matched} of {stats.total} entries matched
            </p>
          </div>
        </Card>

        <Card title="Difference Analysis">
          <div style={{ fontSize: '1.6rem', fontWeight: 300, color: stats.diffTotal > 0 ? '#b91c1c' : '#047857', fontFamily: 'var(--font-serif), Georgia, serif', lineHeight: 1.1 }}>
            AED {stats.diffTotal.toLocaleString()}
          </div>
          <p style={{ margin: '0.125rem 0 0', fontSize: '0.6875rem', color: 'rgba(42,22,40,0.45)', fontWeight: 500 }}>{stats.withDiff} items with difference</p>
        </Card>

        <Card title="Match Accuracy">
          <ProgressRow label="AI Auto-Match Accuracy" value={`${stats.matchAccuracy}%`} pct={stats.matchAccuracy} color="#E8760A" />
        </Card>

        <Card title="Auto vs Manual Match">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <ProgressRow label="Auto Match %" value={`${Math.round((stats.autoMatched / stats.total) * 100)}%`} pct={(stats.autoMatched / stats.total) * 100} color="#047857" />
            <ProgressRow label="Manual Match %" value={`${Math.round((stats.manualMatched / stats.total) * 100)}%`} pct={(stats.manualMatched / stats.total) * 100} color="#B8892A" />
          </div>
        </Card>

        <Card title="QuickBooks Success Rate">
          <ProgressRow label="Synced Successfully" value={`${Math.round((stats.qbSynced / stats.qbEligible) * 100)}%`} pct={(stats.qbSynced / stats.qbEligible) * 100} color="#2A1628" />
        </Card>

        <Card title="Review Queue">
          <div style={{ fontSize: '1.8rem', fontWeight: 300, color: '#b45309', fontFamily: 'var(--font-serif), Georgia, serif', lineHeight: 1.1 }}>{stats.inReview}</div>
          <p style={{ margin: '0.125rem 0 0', fontSize: '0.6875rem', color: 'rgba(42,22,40,0.45)', fontWeight: 500 }}>awaiting manual review</p>
        </Card>
      </div>
    </div>
  );
}


// ============================================================================
// BottomAnalytics.tsx
// ============================================================================


interface BottomAnalyticsProps {
  transactions: ReconciliationTransaction[];
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid rgba(42,22,40,0.06)',
      borderRadius: '16px',
      padding: '1.25rem',
      boxShadow: '0 4px 12px rgba(42,22,40,0.02)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2A1628', margin: '0 0 1rem', fontFamily: 'var(--font-sans), Inter, sans-serif' }}>{title}</h4>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
}

function StatTile({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: string }) {
  const isLongText = value.length > 10;
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid rgba(42,22,40,0.06)',
        borderRadius: '12px',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 4px 10px rgba(42,22,40,0.02)',
        minHeight: '105px',
      }}
    >
      <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'rgba(42,22,40,0.6)', textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.2, marginBottom: '0.5rem' }}>
        {label}
      </div>
      <div>
        <div style={{ fontSize: isLongText ? '1.5rem' : '2rem', fontWeight: 300, color: tone || '#2A1628', lineHeight: 1.1, fontFamily: 'var(--font-serif), Georgia, serif', wordBreak: 'break-word' }}>
          {value}
        </div>
        {sub && (
          <div style={{ fontSize: '0.6875rem', color: 'rgba(42,22,40,0.45)', marginTop: '0.25rem', fontWeight: 500 }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

const PALETTE = ['#E8760A', '#2A1628', '#B8892A', '#047857', '#b91c1c', '#b45309'];

function ReconciliationStatCards({ transactions }: BottomAnalyticsProps) {
  const data = useMemo(() => {
    const total = transactions.length || 1;

    // Difference categories
    const diffCategories = DIFFERENCE_TYPES.filter((d) => d !== 'None').map((d) => ({
      label: d,
      count: transactions.filter((t) => t.differenceType === d).length,
    })).sort((a, b) => b.count - a.count);

    // Monthly volume trend
    const monthOrder = MONTHS;
    const monthsPresent = Array.from(new Set(transactions.map((t) => t.month))).sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));
    const monthlyVolume = monthsPresent.map((m) => ({ month: m.slice(0, 3), count: transactions.filter((t) => t.month === m).length }));

    const avgProcessing = Math.round(transactions.reduce((s, t) => s + t.processingMinutes, 0) / total);
    const topError = diffCategories[0];
    const pendingCount = transactions.filter((t) => t.status === 'Pending').length;
    const exceptionCount = transactions.filter((t) => t.status === 'Exception').length;
    const successCount = transactions.length - pendingCount - exceptionCount;
    const successPct = Math.round((successCount / total) * 100);
    const withinSla = transactions.filter((t) => t.processingMinutes <= t.slaHours * 60).length;
    const slaPct = Math.round((withinSla / total) * 100);
    const qbEligible = transactions.filter((t) => t.quickBooksStatus !== 'Not Synced').length || 1;
    const qbFailed = transactions.filter((t) => t.quickBooksStatus === 'Failed').length;
    const qbFailRate = Math.round((qbFailed / qbEligible) * 100);
    const volDelta = monthlyVolume.length >= 2 ? monthlyVolume[monthlyVolume.length - 1].count - monthlyVolume[monthlyVolume.length - 2].count : 0;

    return { avgProcessing, topError, successPct, slaPct, qbFailRate, volDelta };
  }, [transactions]);

  return (
    <div>
      <style>{`
        .recon-stat-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 0.75rem; }
        @media (max-width: 1200px) { .recon-stat-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 760px) { .recon-stat-grid { grid-template-columns: repeat(2, 1fr); } }
      `}</style>
      <div className="recon-stat-grid">
        <StatTile label="Average Processing Time" value={`${data.avgProcessing}m`} />
        <StatTile label="Top Error Type" value={data.topError?.label || '—'} sub={data.topError ? `${data.topError.count} occurrences` : undefined} tone="#b91c1c" />
        <StatTile label="Most Common Difference" value={data.topError?.label || '—'} tone="#b45309" />
        <StatTile label="Reconciliation Success %" value={`${data.successPct}%`} tone="#047857" />
        <StatTile label="Reviewer SLA Compliance" value={`${data.slaPct}%`} tone={data.slaPct >= 80 ? '#047857' : '#b45309'} />
        <StatTile label="QuickBooks Failure Rate" value={`${data.qbFailRate}%`} tone={data.qbFailRate > 10 ? '#b91c1c' : '#047857'} sub={`${data.volDelta >= 0 ? '+' : ''}${data.volDelta} vs prior month volume`} />
      </div>
    </div>
  );
}

function BottomAnalytics({ transactions }: BottomAnalyticsProps) {
  const data = useMemo(() => {
    const total = transactions.length || 1;

    // Pipeline funnel
    const funnel = [
      { label: 'Imported', count: total },
      { label: 'AI Matched', count: transactions.filter((t) => t.aiMatchScore !== null).length },
      { label: 'Reviewed', count: transactions.filter((t) => ['Manual Review', 'Difference Found', 'Ready To Post', 'Posted', 'Exception'].includes(t.status)).length },
      { label: 'Ready To Post', count: transactions.filter((t) => ['Ready To Post', 'Posted'].includes(t.status)).length },
      { label: 'Posted', count: transactions.filter((t) => t.status === 'Posted').length },
    ];

    // Difference categories
    const diffCategories = DIFFERENCE_TYPES.filter((d) => d !== 'None').map((d) => ({
      label: d,
      count: transactions.filter((t) => t.differenceType === d).length,
    })).sort((a, b) => b.count - a.count);

    // Matching trend (avg AI score per month present in data, in calendar order)
    const monthOrder = MONTHS;
    const monthsPresent = Array.from(new Set(transactions.map((t) => t.month))).sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));
    const matchingTrend = monthsPresent.map((m) => {
      const scored = transactions.filter((t) => t.month === m && t.aiMatchScore !== null);
      const avg = scored.length ? Math.round(scored.reduce((s, t) => s + (t.aiMatchScore || 0), 0) / scored.length) : 0;
      return { month: m.slice(0, 3), avg };
    });

    // Monthly volume trend
    const monthlyVolume = monthsPresent.map((m) => ({ month: m.slice(0, 3), count: transactions.filter((t) => t.month === m).length }));

    // Daily throughput (by transaction date, top 8 most recent distinct dates)
    const byDate = new Map<string, number>();
    transactions.forEach((t) => byDate.set(t.transactionDate, (byDate.get(t.transactionDate) || 0) + 1));
    const dailyThroughput = Array.from(byDate.entries()).sort((a, b) => a[0].localeCompare(b[0])).slice(-8);

    // Reviewer performance
    const reviewerPerf = REVIEWERS.filter((r) => r !== 'Unassigned').map((r) => {
      const assigned = transactions.filter((t) => t.assignedReviewer === r);
      const avgTime = assigned.length ? Math.round(assigned.reduce((s, t) => s + t.processingMinutes, 0) / assigned.length) : 0;
      return { reviewer: r, count: assigned.length, avgTime };
    }).sort((a, b) => b.count - a.count);

    // Bank-wise accuracy
    const banks = Array.from(new Set(transactions.map((t) => t.bank)));
    const bankAccuracy = banks.map((b) => {
      const scored = transactions.filter((t) => t.bank === b && t.aiMatchScore !== null);
      const avg = scored.length ? Math.round(scored.reduce((s, t) => s + (t.aiMatchScore || 0), 0) / scored.length) : 0;
      return { label: b, value: avg };
    }).sort((a, b) => b.value - a.value);

    // Client-wise accuracy (top 5)
    const clients = Array.from(new Set(transactions.map((t) => t.client)));
    const clientAccuracy = clients.map((c) => {
      const scored = transactions.filter((t) => t.client === c && t.aiMatchScore !== null);
      const avg = scored.length ? Math.round(scored.reduce((s, t) => s + (t.aiMatchScore || 0), 0) / scored.length) : 0;
      return { label: c, value: avg };
    }).sort((a, b) => b.value - a.value).slice(0, 5);

    return { funnel, diffCategories, matchingTrend, monthlyVolume, dailyThroughput, reviewerPerf, bankAccuracy, clientAccuracy };
  }, [transactions]);

  const maxFunnel = data.funnel[0]?.count || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <style>{`
        .recon-analytics-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; }
        .recon-analytics-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
        @media (max-width: 1200px) {
          .recon-analytics-grid-4 { grid-template-columns: repeat(2, 1fr); }
          .recon-analytics-grid-3 { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 760px) {
          .recon-analytics-grid-4 { grid-template-columns: 1fr; }
          .recon-analytics-grid-3 { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Row 1: The 4 list/progress cards */}
      <div className="recon-analytics-grid-4">
        <Panel title="Pipeline Funnel">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {data.funnel.map((f, i) => (
              <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.68rem', color: 'rgba(42,22,40,0.6)', width: '110px', flexShrink: 0 }}>{f.label}</span>
                <div style={{ flex: 1, height: '8px', borderRadius: '4px', background: '#F6F2EE', overflow: 'hidden' }}>
                  <div style={{ width: `${(f.count / maxFunnel) * 100}%`, height: '100%', background: PALETTE[i % PALETTE.length] }} />
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2A1628', width: '22px', textAlign: 'right' }}>{f.count}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Difference Categories">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {data.diffCategories.map((d, i) => (
              <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.68rem', color: 'rgba(42,22,40,0.6)', width: '110px', flexShrink: 0 }}>{d.label}</span>
                <div style={{ flex: 1, height: '8px', borderRadius: '4px', background: '#F6F2EE', overflow: 'hidden' }}>
                  <div style={{ width: `${(d.count / (data.diffCategories[0]?.count || 1)) * 100}%`, height: '100%', background: PALETTE[i % PALETTE.length] }} />
                </div>
                 <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2A1628', width: '22px', textAlign: 'right' }}>{d.count}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Bank-wise Accuracy">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', minHeight: '100px', justifyContent: 'center' }}>
            {data.bankAccuracy.length === 0 ? (
              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'rgba(42,22,40,0.4)', padding: '1rem 0' }}>
                No bank data available
              </div>
            ) : (
              data.bankAccuracy.map((b, i) => (
                <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.68rem', color: 'rgba(42,22,40,0.6)', width: '110px', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.label}</span>
                  <div style={{ flex: 1, height: '8px', borderRadius: '4px', background: '#F6F2EE', overflow: 'hidden' }}>
                    <div style={{ width: `${b.value}%`, height: '100%', background: PALETTE[i % PALETTE.length] }} />
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2A1628', width: '30px', textAlign: 'right' }}>{b.value}%</span>
                </div>
              ))
            )}
          </div>
        </Panel>

        <Panel title="Client-wise Accuracy (Top 5)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', minHeight: '100px', justifyContent: 'center' }}>
            {data.clientAccuracy.length === 0 ? (
              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'rgba(42,22,40,0.4)', padding: '1rem 0' }}>
                No client data available
              </div>
            ) : (
              data.clientAccuracy.map((c, i) => (
                <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.68rem', color: 'rgba(42,22,40,0.6)', width: '110px', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.label}</span>
                  <div style={{ flex: 1, height: '8px', borderRadius: '4px', background: '#F6F2EE', overflow: 'hidden' }}>
                    <div style={{ width: `${c.value}%`, height: '100%', background: PALETTE[i % PALETTE.length] }} />
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2A1628', width: '30px', textAlign: 'right' }}>{c.value}%</span>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>

      {/* Row 2: The 3 charts/performance cards */}
      <div className="recon-analytics-grid-3">
        <Panel title="Matching Trend">
          {(() => {
            const width = 260;
            const height = 100;
            const paddingX = 15;
            const paddingY = 20;
            const points = data.matchingTrend.map((p, i) => {
              const x = paddingX + (i / Math.max(1, data.matchingTrend.length - 1)) * (width - 2 * paddingX);
              const y = paddingY + ((100 - p.avg) / 100) * (height - 2 * paddingY);
              return { x, y, month: p.month, avg: p.avg };
            });
            return (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '140px', justifyContent: 'center' }}>
                {points.length === 0 ? (
                  <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'rgba(42,22,40,0.4)', padding: '2rem 0' }}>
                    No matching trend data to display
                  </div>
                ) : (
                  <>
                    <svg width="100%" height="100%" viewBox="0 0 260 100" preserveAspectRatio="none" style={{ flex: 1, maxHeight: '200px' }}>
                      <defs>
                        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#E8760A" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#E8760A" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      
                      {/* Grid Lines */}
                      <line x1="15" y1="20" x2="245" y2="20" stroke="rgba(42,22,40,0.06)" strokeDasharray="3 3" />
                      <line x1="15" y1="50" x2="245" y2="50" stroke="rgba(42,22,40,0.06)" strokeDasharray="3 3" />
                      <line x1="15" y1="80" x2="245" y2="80" stroke="rgba(42,22,40,0.06)" strokeDasharray="3 3" />

                      {/* Gradient Area Fill */}
                      {points.length > 0 && (
                        <path
                          d={`M ${points[0].x} 80 ` + points.map(p => `L ${p.x} ${p.y}`).join(' ') + ` L ${points[points.length - 1].x} 80 Z`}
                          fill="url(#trendGrad)"
                        />
                      )}

                      {/* Trend Line */}
                      {points.length > 0 && (
                        <polyline
                          fill="none" stroke="#E8760A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                          points={points.map(p => `${p.x},${p.y}`).join(' ')}
                        />
                      )}

                      {/* Dots */}
                      {points.length > 0 && points.map((p) => (
                        <g key={p.month}>
                          <circle cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke="#E8760A" strokeWidth="1.5" />
                          <circle cx={p.x} cy={p.y} r="1.75" fill="#E8760A" />
                        </g>
                      ))}
                    </svg>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'rgba(42,22,40,0.5)', marginTop: '0.5rem', padding: '0 5px' }}>
                      {data.matchingTrend.map((p) => <span key={p.month}>{p.month}</span>)}
                    </div>
                  </>
                )}
              </div>
            );
          })()}
        </Panel>

        <Panel title="Daily Throughput">
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '140px', justifyContent: 'center' }}>
            {data.dailyThroughput.length === 0 ? (
              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'rgba(42,22,40,0.4)', padding: '2rem 0' }}>
                No throughput data recorded
              </div>
            ) : (
              <>
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '0.4rem', maxHeight: '200px' }}>
                  {data.dailyThroughput.map(([date, count]) => {
                    const max = Math.max(...data.dailyThroughput.map(([, c]) => c), 1);
                    return (
                      <div key={date} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <div style={{ width: '100%', height: `${(count / max) * 100}%`, background: '#2A1628', borderRadius: '3px 3px 0 0' }} />
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', color: 'rgba(42,22,40,0.45)', marginTop: '0.5rem' }}>
                  {data.dailyThroughput.map(([date]) => (
                    <span key={date} style={{ flex: 1, textAlign: 'center' }}>{date.slice(5)}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        </Panel>

        <Panel title="Reviewer Performance">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {data.reviewerPerf.map((r) => (
              <div key={r.reviewer} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', borderBottom: '1px solid rgba(42,22,40,0.05)', paddingBottom: '0.35rem' }}>
                <span style={{ fontWeight: 600, color: '#2A1628' }}>{r.reviewer}</span>
                <span style={{ color: 'rgba(42,22,40,0.55)' }}>{r.count} items &middot; {r.avgTime}m avg</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}


// ============================================================================
// index.tsx
// ============================================================================





const STORAGE_KEY = 'reconciliation-center-state-v1';

const DEFAULT_FILTERS: FilterState = {
  search: '', client: 'All', manager: 'All', bookkeeper: 'All', bank: 'All', financialYear: 'All',
  month: 'All', currency: 'All', status: 'All', differenceType: 'All', quickBooksStatus: 'All',
  priority: 'All', reviewer: 'All', dateStart: '', dateEnd: '', amountMin: '', amountMax: '', tags: [],
};

function loadPersistedState(): Partial<PersistedState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<PersistedState>) : {};
  } catch {
    return {};
  }
}

type PopupState =
  | { type: 'importStatement' }
  | { type: 'createBatch' }
  | { type: 'exportCenter' }
  | { type: 'manualMatch'; tx: ReconciliationTransaction }
  | { type: 'split'; tx: ReconciliationTransaction }
  | { type: 'merge'; tx: ReconciliationTransaction; extraIds: string[] }
  | { type: 'postToQuickBooks'; transactions: ReconciliationTransaction[] }
  | { type: 'exceptionDetails'; tx: ReconciliationTransaction; problem: string }
  | { type: 'differenceExplanation'; tx: ReconciliationTransaction }
  | { type: 'assignReviewer'; ids: string[] }
  | { type: 'addNotes'; ids: string[] }
  | { type: 'delete'; ids: string[] }
  | { type: 'filterPresets' }
  | { type: 'manageColumns' }
  | { type: 'auditExport'; tx?: ReconciliationTransaction }
  | { type: 'retryFailedJobs' }
  | { type: 'autoCreateVendor'; tx: ReconciliationTransaction }
  | null;

function bumpMatchScore(t: ReconciliationTransaction): ReconciliationTransaction {
  const nextScore = Math.min(97, (t.aiMatchScore ?? 35) + 20);
  const shouldPromote = nextScore >= 70 && (t.status === 'Pending' || t.status === 'Manual Review');
  return { ...t, aiMatchScore: nextScore, status: shouldPromote ? 'Auto Matched' : t.status };
}

function AutoCreateVendorModal({ tx, onClose, onConfirm }: { tx: ReconciliationTransaction, onClose: () => void, onConfirm: (tx: ReconciliationTransaction, vendorData: any) => void }) {
  const [vendorName, setVendorName] = useState(tx.description || 'New Vendor');
  const [category, setCategory] = useState('General');
  
  return (
    <ModalShell
      onClose={onClose}
      eyebrow="Reconciliation"
      titlePlain="Auto-Create"
      titleAccent="Vendor"
      footer={
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', width: '100%' }}>
          <GhostButton label="Cancel" onClick={onClose} />
          <button 
            onClick={() => onConfirm(tx, { name: vendorName, category })}
            style={{ padding: '0.4rem 0.75rem', background: '#137333', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
          >
            Create & Map Vendor
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
        <p style={{ fontSize: '0.85rem', color: 'rgba(42,22,40,0.7)', margin: 0, lineHeight: 1.5 }}>
          Create a new vendor profile based on this transaction. Future transactions matching this payee will automatically map to this vendor.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2A1628' }}>Vendor Name</label>
          <input
            value={vendorName}
            onChange={(e) => setVendorName(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.875rem' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2A1628' }}>Default Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.875rem', background: '#fff' }}
          >
            <option value="General">General Expenses</option>
            <option value="IT Services">IT & Software</option>
            <option value="Marketing">Marketing</option>
            <option value="Travel">Travel & Meals</option>
          </select>
        </div>
      </div>
    </ModalShell>
  );
}


function ReconciliationCenterInner() {
  const { role, pushToast, requestConfirmation, closeConfirmation, confirmation, isOffline } = useReconciliation();

  const [persisted] = useState(loadPersistedState);
  const [mainTab, setMainTab] = useState<'queue' | 'suspense'>('queue');

  const { data: queueRes, isLoading: queueLoading, refetch: refetchQueue } = useGetQueueQuery({ limit: 1000 });
  const { data: statsRes } = useGetStatsQuery();
  const { data: analyticsRes } = useGetAnalyticsQuery();
  const [manualMatch] = usePostManualMutation();
  const [acceptMatch] = usePostAcceptMutation();
  const [rejectMatch] = usePostRejectMutation();
  const [splitTx] = usePostSplitMutation();
  const [mergeTx] = usePostMergeMutation();
  const [undoRecon] = usePostUndoMutation();
  const [postBulk] = usePostBulkMutation();
  const [addVendor] = useAddVendorMutation();

  const { data: savedViewsRes } = useGetSavedViewsQuery();
  const [createSavedView] = usePostSavedViewMutation();
  const [removeSavedView] = useDeleteSavedViewMutation();

  const { data: preferencesRes } = useGetPreferencesQuery();
  const [savePreferences] = usePutPreferencesMutation();

  const runBulk = (action: string, ids: string[], value?: any) => {
    postBulk({ ids, action, value })
      .unwrap()
      .then((res: any) => {
        pushToast({ message: res?.message || `Bulk action '${action}' applied.`, tone: 'success' });
        refetchQueue();
        clearSelection();
      })
      .catch((err: any) => pushToast({ message: err?.data?.message || `Bulk action '${action}' failed.`, tone: 'error' }));
  };

  const [transactions, setTransactions] = useState<ReconciliationTransaction[]>([]);


  useEffect(() => {
    if (queueRes?.data) {
      setTransactions(queueRes.data);
    }
  }, [queueRes]);

  const [filters, setFiltersState] = useState<FilterState>(persisted.filters ?? DEFAULT_FILTERS);
  const [statusChip, setStatusChip] = useState<string>(persisted.statusChip ?? 'All');
  const savedViews: SavedView[] = savedViewsRes?.data || [];

  const [sortKey, setSortKey] = useState<string>(persisted.sortKey ?? 'transactionDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(persisted.sortDir ?? 'desc');

  const [columnOrder, setColumnOrder] = useState<string[]>(persisted.columnOrder ?? DEFAULT_COLUMNS.map((c) => c.key));
  const [hiddenColumns, setHiddenColumns] = useState<string[]>(persisted.hiddenColumns ?? []);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(persisted.columnWidths ?? {});
  const [density, setDensity] = useState<Density>(persisted.density ?? 'comfortable');
  const [freezeFirstColumn, setFreezeFirstColumn] = useState(true);

  const [pageSize, setPageSize] = useState(persisted.pageSize ?? 10);
  const [currentPage, setCurrentPage] = useState(1);

  const [drawerTxId, setDrawerTxId] = useState<string | null>(null);
  const [drawerTab, setDrawerTab] = useState<DrawerTabKey>(persisted.lastDrawerTab ?? 'overview');

  // Hydrate column/density preferences from the server-side store once, then keep it in sync on change.
  const preferencesHydrated = useRef(false);
  useEffect(() => {
    if (preferencesHydrated.current || !preferencesRes?.data) return;
    preferencesHydrated.current = true;
    const p = preferencesRes.data;
    if (p.columnOrder?.length) setColumnOrder(p.columnOrder);
    if (p.hiddenColumns) setHiddenColumns(p.hiddenColumns);
    if (p.columnWidths) setColumnWidths(p.columnWidths);
    if (p.density) setDensity(p.density);
    if (p.freezeFirstColumn !== undefined && p.freezeFirstColumn !== null) setFreezeFirstColumn(p.freezeFirstColumn);
    if (p.pageSize) setPageSize(p.pageSize);
  }, [preferencesRes]);

  useEffect(() => {
    if (!preferencesHydrated.current) return;
    const handle = setTimeout(() => {
      savePreferences({ columnOrder, hiddenColumns, columnWidths, density, freezeFirstColumn, pageSize, lastDrawerTab: drawerTab });
    }, 800);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnOrder, hiddenColumns, columnWidths, density, freezeFirstColumn, pageSize, drawerTab]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [focusedRowId, setFocusedRowId] = useState<string | null>(null);

  const [popup, setPopup] = useState<PopupState>(null);
  const [refreshing, setRefreshing] = useState(false);
  const initialLoading = queueLoading;

  const idCounterRef = useRef(2000 + TRANSACTIONS.length);
  const generateId = () => `RC-${idCounterRef.current++}`;

  // ---------- Initial mount: brief loading spinner ----------
  useEffect(() => {
    // keeping signature compatibility
  }, []);


  // ---------- Persist state on change ----------
  useEffect(() => {
    const state: PersistedState = { filters, statusChip, sortKey, sortDir, columnWidths, hiddenColumns, columnOrder, density, pageSize, lastDrawerTab: drawerTab };
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage failures (e.g. private browsing quota)
    }
  }, [filters, statusChip, sortKey, sortDir, columnWidths, hiddenColumns, columnOrder, density, pageSize, drawerTab]);

  // ---------- Derived data ----------
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (mainTab === 'suspense' && t.status !== 'Exception') {
        return false;
      }
      if (statusChip !== 'All') {
        const chipDef = STATUS_CHIPS.find((c) => c.key === statusChip);
        if (chipDef?.status === 'Archived') {
          if (!t.archived) return false;
        } else if (chipDef?.status && t.status !== chipDef.status) {
          return false;
        }
      }
      if (filters.search) {
        const s = filters.search.toLowerCase();
        if (![t.client, t.description, t.statementReference, t.id].some((f) => f.toLowerCase().includes(s))) return false;
      }
      if (filters.client !== 'All' && t.client !== filters.client) return false;
      if (filters.manager !== 'All' && t.manager !== filters.manager) return false;
      if (filters.bookkeeper !== 'All' && t.bookkeeper !== filters.bookkeeper) return false;
      if (filters.bank !== 'All' && t.bank !== filters.bank) return false;
      if (filters.financialYear !== 'All' && t.financialYear !== filters.financialYear) return false;
      if (filters.month !== 'All' && t.month !== filters.month) return false;
      if (filters.currency !== 'All' && t.currency !== filters.currency) return false;
      if (filters.status !== 'All' && t.status !== filters.status) return false;
      if (filters.differenceType !== 'All' && t.differenceType !== filters.differenceType) return false;
      if (filters.quickBooksStatus !== 'All' && t.quickBooksStatus !== filters.quickBooksStatus) return false;
      if (filters.priority !== 'All' && t.priority !== filters.priority) return false;
      if (filters.reviewer !== 'All' && (t.assignedReviewer || 'Unassigned') !== filters.reviewer) return false;
      if (filters.dateStart && t.transactionDate < filters.dateStart) return false;
      if (filters.dateEnd && t.transactionDate > filters.dateEnd) return false;
      if (filters.amountMin && t.amount < parseFloat(filters.amountMin)) return false;
      if (filters.amountMax && t.amount > parseFloat(filters.amountMax)) return false;
      if (filters.tags.length > 0 && !filters.tags.some((tag) => t.tags.includes(tag))) return false;
      return true;
    });
  }, [transactions, filters, statusChip]);

  const sortedTransactions = useMemo(() => {
    const arr = [...filteredTransactions];
    arr.sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[sortKey];
      const bv = (b as unknown as Record<string, unknown>)[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return arr;
  }, [filteredTransactions, sortKey, sortDir]);

  // Reset to page 1 whenever the active filter/status/page-size criteria change.
  // Adjusting state directly during render (rather than in an effect) avoids an extra
  // render-then-correct flash — this mirrors React's documented "adjusting state when a
  // prop changes" pattern.
  const filterSignature = JSON.stringify([filters, statusChip, pageSize]);
  const [lastFilterSignature, setLastFilterSignature] = useState(filterSignature);
  if (filterSignature !== lastFilterSignature) {
    setLastFilterSignature(filterSignature);
    setCurrentPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(sortedTransactions.length / pageSize));
  if (currentPage > totalPages) {
    setCurrentPage(totalPages);
  }

  const pagedTransactions = useMemo(
    () => sortedTransactions.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [sortedTransactions, currentPage, pageSize]
  );

  const orderedColumns: ColumnDef[] = useMemo(() => {
    const byKey = new Map(DEFAULT_COLUMNS.map((c) => [c.key, c]));
    return columnOrder
      .map((key) => byKey.get(key))
      .filter((c): c is ColumnDef => !!c)
      .map((c) => ({ ...c, width: columnWidths[c.key] ?? c.width, visible: !hiddenColumns.includes(c.key) }));
  }, [columnOrder, columnWidths, hiddenColumns]);

  const visibleColumns = useMemo(() => orderedColumns.filter((c) => c.visible), [orderedColumns]);

  const activeDrawerTx = drawerTxId ? transactions.find((t) => t.id === drawerTxId) ?? null : null;

  // ---------- Mutation helpers ----------
  const mutateMany = (ids: string[], patch: Partial<ReconciliationTransaction> | ((t: ReconciliationTransaction) => Partial<ReconciliationTransaction>)) => {
    setTransactions((prev) => prev.map((t) => (ids.includes(t.id) ? { ...t, ...(typeof patch === 'function' ? patch(t) : patch), lastUpdated: new Date().toISOString() } : t)));
  };

  const withUndo = (newTransactions: ReconciliationTransaction[], message: string) => {
    const snapshot = transactions;
    setTransactions(newTransactions);
    pushToast({ message, tone: 'success', actionLabel: 'Undo', onAction: () => setTransactions(snapshot) });
  };

  const clearSelection = () => { setSelectedIds([]); setLastSelectedIndex(null); };

  // ---------- Filter / view handlers ----------
  const handleFilterChange = (patch: Partial<FilterState>) => setFiltersState((f) => ({ ...f, ...patch }));
  const handleResetFilters = () => { setFiltersState(DEFAULT_FILTERS); setStatusChip('All'); };
  const handleApplyView = (view: SavedView) => setFiltersState(view.filters);
  const handleSaveView = (name: string) => {
    createSavedView({ name, filters })
      .unwrap()
      .then(() => pushToast({ message: `Saved view "${name}" created.`, tone: 'success' }))
      .catch(() => pushToast({ message: 'Failed to save view.', tone: 'error' }));
  };
  const handleDeleteView = (id: string) => {
    removeSavedView(id)
      .unwrap()
      .catch(() => pushToast({ message: 'Failed to delete saved view.', tone: 'error' }));
  };

  // ---------- Table interaction handlers ----------
  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const handleToggleSelect = (id: string, index: number, shiftKey: boolean) => {
    if (shiftKey && lastSelectedIndex !== null) {
      const [start, end] = [Math.min(lastSelectedIndex, index), Math.max(lastSelectedIndex, index)];
      const rangeIds = pagedTransactions.slice(start, end + 1).map((t) => t.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...rangeIds])));
    } else {
      setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    }
    setLastSelectedIndex(index);
  };

  const handleToggleSelectAll = () => {
    const pageIds = pagedTransactions.map((t) => t.id);
    const allSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
    setSelectedIds((prev) => (allSelected ? prev.filter((id) => !pageIds.includes(id)) : Array.from(new Set([...prev, ...pageIds]))));
  };

  const handleColumnResize = (key: string, width: number) => setColumnWidths((prev) => ({ ...prev, [key]: width }));
  const handleTableColumnReorder = (dragKey: string, dropKey: string) => {
    setColumnOrder((prev) => {
      const arr = [...prev];
      const from = arr.indexOf(dragKey);
      const to = arr.indexOf(dropKey);
      if (from < 0 || to < 0) return prev;
      arr.splice(from, 1);
      arr.splice(to, 0, dragKey);
      return arr;
    });
  };

  const openDrawerFor = (tx: ReconciliationTransaction, tab?: DrawerTabKey) => {
    setDrawerTxId(tx.id);
    if (tab) setDrawerTab(tab);
  };

  const handleArchiveIds = (ids: string[]) => {
    requestConfirmation({
      title: ids.length === 1 ? 'Archive Transaction' : `Archive ${ids.length} Transactions`,
      message: 'Archived transactions are moved out of active workspaces but remain fully auditable.',
      confirmLabel: 'Archive',
      tone: 'warning',
      onConfirm: () => runBulk('archive', ids),
    });
  };

  // ---------- Row action handler ----------
  const handleRowAction = (action: RowActionKey, tx: ReconciliationTransaction) => {
    switch (action) {
      case 'openDrawer': openDrawerFor(tx, drawerTab); return;
      case 'viewTimeline': openDrawerFor(tx, 'timeline'); return;
      case 'previewTransactions': openDrawerFor(tx, 'transactions'); return;
      case 'aiMatchAnalysis': openDrawerFor(tx, 'aiMatching'); return;
      case 'manualMatch': setPopup({ type: 'manualMatch', tx }); return;
      case 'splitTransaction': setPopup({ type: 'split', tx }); return;
      case 'mergeTransaction': setPopup({ type: 'merge', tx, extraIds: [] }); return;
      case 'postToQuickBooks': setPopup({ type: 'postToQuickBooks', transactions: [tx] }); return;
      case 'autoCreateVendor': drawerActions.autoCreateVendor(tx); return;
      case 'export': pushToast({ message: `Transaction ${tx.id} exported.`, tone: 'success' }); return;
      case 'notes': setPopup({ type: 'addNotes', ids: [tx.id] }); return;
      case 'auditLog': openDrawerFor(tx, 'activity'); return;
      case 'archive': handleArchiveIds([tx.id]); return;
      case 'delete': setPopup({ type: 'delete', ids: [tx.id] }); return;
      case 'duplicate': {
        const id = generateId();
        setTransactions((prev) => [{ ...tx, id, lastUpdated: new Date().toISOString() }, ...prev]);
        pushToast({ message: `Duplicated as ${id}.`, tone: 'success' });
        return;
      }
      case 'clone': {
        const id = generateId();
        setTransactions((prev) => [{ ...tx, id, status: 'Pending', aiMatchScore: null, matchedEntry: null, difference: 0, differenceType: 'None', quickBooksStatus: 'Not Synced', lastUpdated: new Date().toISOString() }, ...prev]);
        pushToast({ message: `Cloned as new pending job ${id}.`, tone: 'success' });
        return;
      }
      case 'downloadPdf': pushToast({ message: `Downloading PDF for ${tx.id}…`, tone: 'info' }); return;
      case 'downloadCsv': pushToast({ message: `Downloading CSV for ${tx.id}…`, tone: 'info' }); return;
      case 'openClient': pushToast({ message: `Would open Client List for ${tx.client}.`, tone: 'info' }); return;
      case 'jumpToAiQueue': pushToast({ message: 'Would navigate to the AI Bookkeeping Queue.', tone: 'info' }); return;
      case 'jumpToVat': pushToast({ message: 'Would navigate to the VAT workspace.', tone: 'info' }); return;
      case 'jumpToQuickBooks': pushToast({ message: 'Would navigate to QuickBooks Integration.', tone: 'info' }); return;
      case 'copyTransactionId':
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          navigator.clipboard.writeText(tx.id).catch(() => undefined);
        }
        pushToast({ message: 'Transaction ID copied to clipboard.', tone: 'success' });
        return;
      default: return;
    }
  };

  // ---------- Bulk action handler ----------
  const handleBulkAction = (action: BulkActionKey) => {
    const ids = [...selectedIds];
    if (ids.length === 0 && action !== 'clearSelection') {
      pushToast({ message: 'Select at least one transaction first.', tone: 'warning' });
      return;
    }
    switch (action) {
      case 'clearSelection': clearSelection(); return;
      case 'assignReviewer': setPopup({ type: 'assignReviewer', ids }); return;
      case 'addNotes': setPopup({ type: 'addNotes', ids }); return;
      case 'exportBatch': setPopup({ type: 'exportCenter' }); return;
      case 'postToQuickBooks': setPopup({ type: 'postToQuickBooks', transactions: transactions.filter((t) => ids.includes(t.id)) }); return;
      case 'merge': {
        const primary = transactions.find((t) => t.id === ids[0])!;
        setPopup({ type: 'merge', tx: primary, extraIds: ids.slice(1) });
        return;
      }
      case 'retryMatching':
        requestConfirmation({
          title: 'Retry Matching', message: `Re-run AI matching for ${ids.length} transaction(s)?`, confirmLabel: 'Retry Matching', tone: 'neutral',
          onConfirm: () => runBulk('retryMatching', ids),
        });
        return;
      case 'approve':
        requestConfirmation({
          title: ids.length === 1 ? 'Approve Transaction' : `Approve ${ids.length} Transactions`,
          message: 'Approves the best AI-suggested match (where one exists) and reconciles the transaction.', confirmLabel: 'Approve', tone: 'neutral',
          onConfirm: () => runBulk('approve', ids),
        });
        return;
      case 'reject':
        requestConfirmation({
          title: ids.length === 1 ? 'Reject Transaction' : `Reject ${ids.length} Transactions`,
          message: 'Rejects the best AI-suggested match for review by a bookkeeper.', confirmLabel: 'Reject', tone: 'warning',
          onConfirm: () => runBulk('reject', ids),
        });
        return;
      case 'moveToException':
        runBulk('moveToException', ids);
        return;
      case 'archive':
        requestConfirmation({
          title: ids.length === 1 ? 'Archive Transaction' : `Archive ${ids.length} Transactions`,
          message: 'Archived transactions are moved out of active workspaces but remain fully auditable.',
          confirmLabel: 'Archive', tone: 'warning',
          onConfirm: () => runBulk('archive', ids),
        });
        return;
      case 'delete': setPopup({ type: 'delete', ids }); return;
      default: return;
    }
  };

  // ---------- Drawer action handlers ----------
  const drawerActions: DrawerActionHandlers = {
    requestApprove: (tx) => requestConfirmation({
      title: 'Approve Transaction', message: `Approve ${tx.id}? This accepts the best AI-suggested match and reconciles it.`, confirmLabel: 'Approve', tone: 'neutral',
      onConfirm: () => runBulk('approve', [tx.id]),
    }),
    requestReject: (tx) => requestConfirmation({
      title: 'Reject Transaction', message: `Reject ${tx.id}? This rejects the best AI-suggested match.`, confirmLabel: 'Reject', tone: 'warning',
      onConfirm: () => runBulk('reject', [tx.id]),
    }),
    requestChanges: (tx) => pushToast({ message: `Change request sent to ${tx.bookkeeper} for ${tx.id}.`, tone: 'info' }),
    requestPostToQuickBooks: (tx) => setPopup({ type: 'postToQuickBooks', transactions: [tx] }),
    requestRetryMatching: (tx) => requestConfirmation({
      title: 'Retry Matching', message: `Re-run AI matching for ${tx.id}?`, confirmLabel: 'Retry Matching', tone: 'neutral',
      onConfirm: () => runBulk('retryMatching', [tx.id]),
    }),
    requestRetryValidation: (tx) => requestConfirmation({
      title: 'Retry Validation', message: `Re-run validation checks for ${tx.id}?`, confirmLabel: 'Retry Validation', tone: 'neutral',
      onConfirm: () => { mutateMany([tx.id], { differenceType: 'None', difference: 0 }); pushToast({ message: 'Validation retried.', tone: 'success' }); },
    }),
    requestManualOverride: (tx, checkLabel) => requestConfirmation({
      title: 'Manual Override', message: `Manually override the "${checkLabel}" check for ${tx.id}? This is recorded in the audit trail.`, confirmLabel: 'Override', tone: 'warning',
      onConfirm: () => {
        mutateMany([tx.id], (t) => ({ status: (t.status === 'Exception' || t.status === 'Difference Found') ? 'Ready To Post' : t.status }));
        pushToast({ message: 'Manual override applied.', tone: 'warning' });
      },
    }),
    openManualMatch: (tx) => setPopup({ type: 'manualMatch', tx }),
    openSplit: (tx) => setPopup({ type: 'split', tx }),
    openMerge: (tx) => setPopup({ type: 'merge', tx, extraIds: [] }),
    openExceptionDetails: (tx, problem) => setPopup({ type: 'exceptionDetails', tx, problem: problem || 'Unresolved reconciliation exception' }),
    openDifferenceExplanation: (tx) => setPopup({ type: 'differenceExplanation', tx }),
    openAssignReviewer: (tx) => setPopup({ type: 'assignReviewer', ids: [tx.id] }),
    openAddNotes: (tx) => setPopup({ type: 'addNotes', ids: [tx.id] }),
    openAuditExport: (tx) => setPopup({ type: 'auditExport', tx }),
    openRetryFailedJobs: () => setPopup({ type: 'retryFailedJobs' }),
    autoCreateVendor: (tx) => setPopup({ type: 'autoCreateVendor', tx }),
    acceptSuggestion: (tx, matchId) => {
      if (matchId.includes('-sm-')) {
        pushToast({ message: 'This is a mock AI suggestion for testing the UI. Real matches will be saved to the database.', tone: 'info' });
        return;
      }
      acceptMatch({ candidate_id: matchId })
        .unwrap()
        .then(() => {
          pushToast({ message: 'Suggested match accepted and reconciled.', tone: 'success' });
          refetchQueue();
        })
        .catch((err: any) => pushToast({ message: err?.data?.message || 'Failed to accept suggested match.', tone: 'error' }));
    },
    rejectSuggestion: (tx, matchId) => {
      if (matchId.includes('-sm-')) {
        pushToast({ message: 'This is a mock AI suggestion for testing the UI.', tone: 'info' });
        return;
      }
      rejectMatch({ candidate_id: matchId })
        .unwrap()
        .then(() => {
          pushToast({ message: 'Suggested match rejected.', tone: 'info' });
          refetchQueue();
        })
        .catch((err: any) => pushToast({ message: err?.data?.message || 'Failed to reject suggested match.', tone: 'error' }));
    },
  };

  // ---------- Keyboard support (only when no popup/drawer owns focus) ----------
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (popup || drawerTxId) return;
      const target = e.target as HTMLElement;
      const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable;
      if (isTyping) return;

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const ids = pagedTransactions.map((t) => t.id);
        setFocusedRowId((prev) => {
          const idx = prev ? ids.indexOf(prev) : -1;
          const nextIdx = e.key === 'ArrowDown' ? Math.min(ids.length - 1, idx + 1) : Math.max(0, idx - 1);
          return ids[nextIdx] ?? prev;
        });
      } else if (e.key === 'Enter') {
        if (focusedRowId) {
          const tx = transactions.find((t) => t.id === focusedRowId);
          if (tx) handleRowAction('openDrawer', tx);
        }
      } else if (e.key === ' ') {
        if (focusedRowId) {
          e.preventDefault();
          const idx = pagedTransactions.findIndex((t) => t.id === focusedRowId);
          handleToggleSelect(focusedRowId, idx, false);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setSelectedIds(pagedTransactions.map((t) => t.id));
      } else if (e.key === 'Delete') {
        if (selectedIds.length > 0) {
          e.preventDefault();
          handleArchiveIds([...selectedIds]);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popup, drawerTxId, pagedTransactions, focusedRowId, selectedIds, transactions]);

  const handleRefresh = () => {
    setRefreshing(true);
    refetchQueue().finally(() => {
      setRefreshing(false);
      pushToast({ message: 'Reconciliation data refreshed.', tone: 'info' });
    });
  };

  const closePopup = () => setPopup(null);

  const addImportedTransaction = (fileName: string, bank: string) => {
    const id = generateId();
    const newTx: ReconciliationTransaction = {
      id, client: CLIENTS[0].name, clientId: CLIENTS[0].id, bankAccount: `${bank} •••• 0001`, bank,
      statementReference: fileName, transactionDate: TODAY_ISO, description: `Imported line item — ${fileName}`,
      amount: 1000, currency: 'AED', aiMatchScore: null, matchedEntry: null, difference: 0, differenceType: 'None', status: 'Pending',
      assignedReviewer: null, manager: MANAGERS[0], bookkeeper: BOOKKEEPERS[0], quickBooksStatus: 'Not Synced', priority: 'Medium', riskLevel: 'Low',
      lastUpdated: new Date().toISOString(), financialYear: 'FY2026', month: MONTHS[6], tags: [], archived: false, slaHours: 24, processingMinutes: 0,
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const confirmMerge = () => {
    if (popup?.type !== 'merge') return;
    const { tx, extraIds } = popup;
    if (extraIds.length > 0) {
      const extras = transactions.filter((t) => extraIds.includes(t.id));
      const mergedAmount = tx.amount + extras.reduce((s, t) => s + t.amount, 0);
      withUndo(
        transactions.filter((t) => !extraIds.includes(t.id)).map((t) => (t.id === tx.id ? { ...t, amount: mergedAmount, status: 'Auto Matched', difference: 0, differenceType: 'None', lastUpdated: new Date().toISOString() } : t)),
        `${extraIds.length + 1} transactions merged into ${tx.id}.`
      );
      mergeTx({
        transaction_id: tx.id,
        allocations: [{ transaction_id: tx.id, allocated_amount: mergedAmount }, ...extraIds.map(id => ({ transaction_id: id, allocated_amount: 0 }))]
      });
      clearSelection();
    } else {
      withUndo(
        transactions.map((t) => (t.id === tx.id ? { ...t, status: 'Auto Matched', difference: 0, differenceType: 'None', lastUpdated: new Date().toISOString() } : t)),
        `Transaction ${tx.id} merged.`
      );
      mergeTx({
        transaction_id: tx.id,
        allocations: [{ transaction_id: tx.id, allocated_amount: tx.amount }]
      });
    }
  };

  return (
    <div style={{ color: '#2A1628', fontFamily: 'var(--font-sans), Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'transparent', position: 'relative' }}>
      <style>{`
        .recon-bottom-analytics-layout { display: flex; gap: 1.5rem; align-items: flex-start; }
        .recon-bottom-analytics-layout > .recon-right-analytics-col { width: 300px; flex-shrink: 0; }
        @media (max-width: 1200px) {
          .recon-bottom-analytics-layout { flex-direction: column; }
          .recon-bottom-analytics-layout > .recon-right-analytics-col { width: 100%; }
        }
      `}</style>

      <Header
        onImportBankStatement={() => setPopup({ type: 'importStatement' })}
        onCreateBatch={() => setPopup({ type: 'createBatch' })}
        onExportCenter={() => setPopup({ type: 'exportCenter' })}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(42,22,40,0.04)', padding: '0.25rem', borderRadius: '10px', width: 'fit-content' }}>
        <button
          onClick={() => setMainTab('queue')}
          style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: mainTab === 'queue' ? '#fff' : 'transparent', color: mainTab === 'queue' ? '#2A1628' : 'rgba(42,22,40,0.6)', fontWeight: mainTab === 'queue' ? 600 : 500, fontSize: '0.85rem', cursor: 'pointer', boxShadow: mainTab === 'queue' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
        >
          Reconciliation Queue
        </button>
        <button
          onClick={() => setMainTab('suspense')}
          style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: mainTab === 'suspense' ? '#fff' : 'transparent', color: mainTab === 'suspense' ? '#D32F2F' : 'rgba(42,22,40,0.6)', fontWeight: mainTab === 'suspense' ? 600 : 500, fontSize: '0.85rem', cursor: 'pointer', boxShadow: mainTab === 'suspense' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
        >
          Suspense Workspace
        </button>
      </div>

      <KpiGrid transactions={filteredTransactions} loading={initialLoading} stats={statsRes?.data} />

      <ReconciliationStatCards transactions={transactions} />

      <StatusChips transactions={transactions} active={statusChip} onChange={setStatusChip} />

      <FilterBar
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        onOpenSaveView={() => setPopup({ type: 'filterPresets' })}
        savedViews={savedViews}
        onApplyView={handleApplyView}
        onManageColumns={() => setPopup({ type: 'manageColumns' })}
      />

      <BulkActionBar selectedCount={selectedIds.length} onAction={handleBulkAction} />

      <ReconciliationTable
        transactions={pagedTransactions}
        loading={initialLoading}
        errorState={false}
        offline={isOffline}
        columns={visibleColumns}
        density={density}
        freezeFirstColumn={freezeFirstColumn}
        onColumnResize={handleColumnResize}
        onColumnReorder={handleTableColumnReorder}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        onFocusRow={setFocusedRowId}
        onRowAction={handleRowAction}
        onResetFilters={handleResetFilters}
        hasAnyData={transactions.length > 0}
      />
      <Pagination
        totalItems={sortedTransactions.length}
        currentPage={currentPage}
        rowsPerPage={pageSize}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={setPageSize}
        itemLabel="transactions"
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <RightAnalyticsPanel transactions={filteredTransactions} />
        <BottomAnalytics transactions={filteredTransactions} />
      </div>


      <ReconciliationDrawer
        transaction={activeDrawerTx}
        activeTab={drawerTab}
        onTabChange={setDrawerTab}
        onClose={() => setDrawerTxId(null)}
        actions={drawerActions}
      />

      {popup?.type === 'importStatement' && (
        <ImportBankStatementModal onClose={closePopup} onImported={(fileName, bank) => addImportedTransaction(fileName, bank)} />
      )}
      {popup?.type === 'createBatch' && (
        <CreateBatchModal onClose={closePopup} onCreate={() => undefined} />
      )}
      {popup?.type === 'exportCenter' && (
        <ExportCenterModal
          onClose={closePopup}
          counts={{ all: transactions.length, filtered: filteredTransactions.length, selected: selectedIds.length, currentPage: pagedTransactions.length }}
          onExport={() => undefined}
        />
      )}
      {popup?.type === 'manualMatch' && (
        <ManualMatchModal
          onClose={closePopup}
          tx={popup.tx}
          onConfirm={(ledgerEntryLabel) => {
            mutateMany([popup.tx.id], { status: 'Auto Matched', matchedEntry: ledgerEntryLabel, difference: 0, differenceType: 'None' });
            manualMatch({
              transaction_id: popup.tx.id,
              receipt_id: 'e65e4e7e-3ffb-449e-8c31-f19b88220002',
              override_reason: 'Manual match from UI'
            });
          }}
        />
      )}
      {popup?.type === 'split' && (
        <SplitTransactionModal
          onClose={closePopup}
          tx={popup.tx}
          onConfirm={() => {
            mutateMany([popup.tx.id], { status: 'Ready To Post', difference: 0, differenceType: 'None', tags: Array.from(new Set([...popup.tx.tags, 'Split'])) });
            splitTx({
              transaction_id: popup.tx.id,
              allocations: [{ receipt_id: 'e65e4e7e-3ffb-449e-8c31-f19b88220002', allocated_amount: popup.tx.amount }]
            });
          }}
        />
      )}
      {popup?.type === 'merge' && (
        <MergeTransactionsModal onClose={closePopup} tx={popup.tx} onConfirm={confirmMerge} />
      )}
      {popup?.type === 'postToQuickBooks' && (
        <PostToQuickBooksModal
          onClose={closePopup}
          transactions={popup.transactions}
          onConfirm={() => {
            const ids = popup.transactions.map((t) => t.id);
            runBulk('postToQuickBooks', ids);
          }}
        />
      )}
      {popup?.type === 'exceptionDetails' && (
        <ExceptionDetailsModal
          onClose={closePopup}
          tx={popup.tx}
          problem={popup.problem}
          onRetry={() => mutateMany([popup.tx.id], { differenceType: 'None', difference: 0 })}
          onManualOverride={() => {
            mutateMany([popup.tx.id], (t) => ({ status: (t.status === 'Exception' || t.status === 'Difference Found') ? 'Ready To Post' : t.status }));
            pushToast({ message: 'Manual override applied.', tone: 'warning' });
          }}
        />
      )}
      {popup?.type === 'differenceExplanation' && (
        <DifferenceExplanationModal onClose={closePopup} tx={popup.tx} />
      )}
      {popup?.type === 'assignReviewer' && (
        <AssignReviewerModal
          onClose={closePopup}
          count={popup.ids.length}
          onAssign={(reviewer, priority) => runBulk('assignReviewer', popup.ids, { reviewer, priority })}
        />
      )}
      {popup?.type === 'addNotes' && (
        <AddNotesModal onClose={closePopup} count={popup.ids.length} onSave={(body, mentions) => runBulk('addNotes', popup.ids, { body, mentions })} />
      )}
      {popup?.type === 'delete' && (
        <DeleteConfirmationModal
          onClose={closePopup}
          count={popup.ids.length}
          onConfirm={() => runBulk('delete', popup.ids)}
        />
      )}
      {popup?.type === 'filterPresets' && (
        <FilterPresetsModal
          onClose={closePopup}
          currentFilters={filters}
          savedViews={savedViews}
          onSave={handleSaveView}
          onApply={handleApplyView}
          onDelete={handleDeleteView}
        />
      )}
      {popup?.type === 'manageColumns' && (
        <ManageColumnsModal
          onClose={closePopup}
          columns={orderedColumns}
          density={density}
          freezeFirstColumn={freezeFirstColumn}
          onToggleVisible={(key) => setHiddenColumns((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))}
          onReorder={(newOrderKeys) => setColumnOrder(newOrderKeys)}
          onDensityChange={setDensity}
          onFreezeToggle={setFreezeFirstColumn}
        />
      )}
      {popup?.type === 'auditExport' && (
        <AuditExportModal onClose={closePopup} tx={popup.tx} onExport={() => undefined} />
      )}
      {popup?.type === 'retryFailedJobs' && (
        <RetryFailedJobsModal onClose={closePopup} />
      )}
      {popup?.type === 'autoCreateVendor' && (
        <AutoCreateVendorModal 
          tx={popup.tx} 
          onClose={closePopup} 
          onConfirm={(tx, data) => {
            addVendor({ name: data.name, status: 'Pending', category: data.category, country: 'UAE', vendorType: 'Local' })
              .unwrap()
              .then((res: any) => {
                pushToast({ message: `Vendor "${res.data?.name || res.name || data.name}" auto-created successfully.`, tone: 'success' });
                closePopup();
              })
              .catch(() => pushToast({ message: 'Failed to auto-create vendor.', tone: 'error' }));
          }} 
        />
      )}

      <ConfirmationModal config={confirmation} onClose={closeConfirmation} />
      <ToastStack />

      {/* role is available for any future in-page permission messaging */}
      <span style={{ display: 'none' }}>{role}</span>
    </div>
  );
}

export default function ReconciliationCenter() {
  return (
    <ReconciliationProvider>
      <ReconciliationCenterInner />
    </ReconciliationProvider>
  );
}
