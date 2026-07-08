'use client';

import React, { useState } from 'react';

interface PaginationProps {
  /** Total number of items across all pages */
  totalItems: number;
  /** Current active page (1-indexed) */
  currentPage: number;
  /** Number of rows shown per page */
  rowsPerPage: number;
  /** Callback when user changes page */
  onPageChange: (page: number) => void;
  /** Callback when user changes rows-per-page */
  onRowsPerPageChange: (rows: number) => void;
  /** Available rows-per-page options (default: 10, 20, 50) */
  rowsPerPageOptions?: number[];
  /** Label shown next to count e.g. "clients" or "jobs" */
  itemLabel?: string;
}

export default function Pagination({
  totalItems,
  currentPage,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 20, 50],
  itemLabel = 'items',
}: PaginationProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const from = totalItems === 0 ? 0 : Math.min((currentPage - 1) * rowsPerPage + 1, totalItems);
  const to = Math.min(currentPage * rowsPerPage, totalItems);

  const goTo = (page: number) => {
    const clamped = Math.max(1, Math.min(totalPages, page));
    onPageChange(clamped);
  };

  // Build visible page numbers: always show 1, 2, 3, ..., last
  const visiblePages: (number | '...')[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) visiblePages.push(i);
  } else {
    visiblePages.push(1, 2, 3);
    if (totalPages > 4) visiblePages.push('...');
    visiblePages.push(totalPages);
  }

  const btnBase: React.CSSProperties = {
    border: 'none',
    borderRadius: '4px',
    width: '26px',
    height: '26px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontFamily: 'var(--font-sans), Inter, sans-serif',
    transition: 'background 120ms',
  };

  return (
    <div
      style={{
        background: '#FAF8F5',
        border: '1px solid rgba(42,22,40,0.06)',
        borderTop: 'none',
        borderRadius: '0 0 16px 16px',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.75rem',
        color: 'rgba(42,22,40,0.6)',
        marginTop: '-1px',
      }}
    >
      {/* ── LEFT: Rows per page ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontWeight: 500 }}>Rows per page:</span>

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              border: '1px solid #DDD0C4',
              borderRadius: '6px',
              padding: '0.25rem 0.6rem',
              background: '#fff',
              fontSize: '0.75rem',
              color: '#2A1628',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans), Inter, sans-serif',
              fontWeight: 600,
            }}
          >
            {rowsPerPage}
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 4px)',
                left: 0,
                background: '#fff',
                border: '1px solid #DDD0C4',
                borderRadius: '8px',
                boxShadow: '0 4px 16px rgba(42,22,40,0.1)',
                zIndex: 200,
                minWidth: '60px',
                overflow: 'hidden',
              }}
            >
              {rowsPerPageOptions.map((n) => (
                <div
                  key={n}
                  onClick={() => {
                    onRowsPerPageChange(n);
                    onPageChange(1);
                    setDropdownOpen(false);
                  }}
                  style={{
                    padding: '0.4rem 0.75rem',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    color: rowsPerPage === n ? '#E8760A' : '#2A1628',
                    background: rowsPerPage === n ? 'rgba(232,118,10,0.06)' : 'transparent',
                    fontWeight: rowsPerPage === n ? 600 : 400,
                  }}
                  onMouseEnter={(e) => {
                    if (rowsPerPage !== n)
                      (e.currentTarget as HTMLDivElement).style.background = 'rgba(232,118,10,0.04)';
                  }}
                  onMouseLeave={(e) => {
                    if (rowsPerPage !== n)
                      (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                  }}
                >
                  {n}
                </div>
              ))}
            </div>
          )}
        </div>

        <span style={{ color: 'rgba(42,22,40,0.45)' }}>
          {from}–{to} of {totalItems} {itemLabel}
        </span>
      </div>

      {/* ── RIGHT: Page number pills ── */}
      <div style={{ display: 'flex', gap: '0.2rem', alignItems: 'center' }}>
        {/* Prev */}
        <button
          onClick={() => goTo(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            ...btnBase,
            width: 'auto',
            padding: '0 0.4rem',
            background: 'transparent',
            color: '#2A1628',
            opacity: currentPage === 1 ? 0.3 : 0.7,
            cursor: currentPage === 1 ? 'default' : 'pointer',
            fontSize: '0.7rem',
          }}
        >
          ◀
        </button>

        {visiblePages.map((pg, i) =>
          pg === '...' ? (
            <span
              key={`ellipsis-${i}`}
              style={{ padding: '0 0.2rem', color: 'rgba(42,22,40,0.4)', fontSize: '0.75rem' }}
            >
              ...
            </span>
          ) : (
            <button
              key={pg}
              onClick={() => goTo(pg as number)}
              style={{
                ...btnBase,
                background: currentPage === pg ? '#2A1628' : 'transparent',
                color: currentPage === pg ? '#fff' : '#2A1628',
                fontWeight: currentPage === pg ? 700 : 400,
                cursor: 'pointer',
              }}
            >
              {pg}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => goTo(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            ...btnBase,
            width: 'auto',
            padding: '0 0.4rem',
            background: 'transparent',
            color: '#2A1628',
            opacity: currentPage === totalPages ? 0.3 : 0.7,
            cursor: currentPage === totalPages ? 'default' : 'pointer',
            fontSize: '0.7rem',
          }}
        >
          ▶
        </button>
      </div>
    </div>
  );
}
