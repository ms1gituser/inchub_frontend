'use client';

import { useState } from 'react';
import { post } from '@/lib/apiClient';

interface FormData {
  financial_year: string;
  accounting_profit: string;
  adjustments: string;
  taxable_profit: string;
  business_type: string;
  tax_relief_eligibility: boolean;
  previous_year_losses: string;
  supporting_documents_ready: boolean;
  notes: string;
}

/**
 * Enterprise-grade CT Year-End Intake Form
 * Dynamic form for gathering corporate tax filing information
 */
export default function CtYearEndIntakeForm() {
  const [formData, setFormData] = useState<FormData>({
    financial_year: new Date().getFullYear().toString(),
    accounting_profit: '',
    adjustments: '',
    taxable_profit: '',
    business_type: 'Mainland',
    tax_relief_eligibility: false,
    previous_year_losses: '',
    supporting_documents_ready: false,
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const fieldValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: fieldValue }));
  };

  const calculateTaxableProfit = () => {
    const accounting = parseFloat(formData.accounting_profit) || 0;
    const adjustments = parseFloat(formData.adjustments) || 0;
    const taxable = accounting + adjustments;
    setFormData((prev) => ({ ...prev, taxable_profit: taxable.toFixed(2) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus('idle');

    try {
      await post('/api/ct/intake-form', formData);
      setSubmitStatus('success');
      setTimeout(() => {
        setFormData({
          financial_year: new Date().getFullYear().toString(),
          accounting_profit: '',
          adjustments: '',
          taxable_profit: '',
          business_type: 'Mainland',
          tax_relief_eligibility: false,
          previous_year_losses: '',
          supporting_documents_ready: false,
          notes: '',
        });
        setSubmitStatus('idle');
      }, 2000);
    } catch (error) {
      setSubmitStatus('error');
      console.error('[CT Form] Submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const styles = {
    container: {
      background: '#f9fafb',
      borderRadius: 12,
      padding: '2rem',
      maxWidth: 800,
      margin: '0 auto',
      border: '1px solid #e5e7eb',
    },
    section: {
      marginBottom: '2rem',
    },
    sectionTitle: {
      fontSize: '0.875rem',
      fontWeight: 700,
      color: '#374151',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    formGroup: {
      marginBottom: '1.5rem',
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: 600,
      color: '#1f2937',
      marginBottom: '0.5rem',
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: 6,
      fontSize: '0.875rem',
      fontFamily: 'inherit',
      boxSizing: 'border-box' as const,
    },
    row: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
    },
    button: {
      padding: '0.875rem 1.5rem',
      background: '#2A1628',
      color: 'white',
      border: 'none',
      borderRadius: 6,
      fontWeight: 600,
      cursor: 'pointer',
      fontSize: '0.875rem',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      transition: 'all 0.2s',
    },
    checkbox: {
      marginRight: '0.5rem',
    },
    successMessage: {
      background: '#dcfce7',
      border: '1px solid #86efac',
      color: '#166534',
      padding: '0.75rem 1rem',
      borderRadius: 6,
      fontSize: '0.875rem',
      fontWeight: 600,
      marginBottom: '1rem',
    },
    errorMessage: {
      background: '#fee2e2',
      border: '1px solid #fca5a5',
      color: '#991b1b',
      padding: '0.75rem 1rem',
      borderRadius: 6,
      fontSize: '0.875rem',
      fontWeight: 600,
      marginBottom: '1rem',
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937', marginBottom: '1.5rem' }}>
        📋 Corporate Tax Year-End Intake Form
      </h2>

      {submitStatus === 'success' && (
        <div style={styles.successMessage}>✓ Form submitted successfully. Thank you!</div>
      )}
      {submitStatus === 'error' && (
        <div style={styles.errorMessage}>✗ Submission failed. Please try again.</div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Financial Year Section */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>📅 Period Information</div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Financial Year *</label>
            <input
              type="number"
              name="financial_year"
              value={formData.financial_year}
              onChange={handleInputChange}
              required
              style={styles.input}
              min="2020"
              max="2100"
            />
          </div>
        </div>

        {/* Profit Calculation Section */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>💰 Profit Calculation</div>

          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Accounting Profit (AED) *</label>
              <input
                type="number"
                name="accounting_profit"
                value={formData.accounting_profit}
                onChange={handleInputChange}
                onBlur={calculateTaxableProfit}
                required
                step="0.01"
                style={styles.input}
                placeholder="0.00"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Tax Adjustments (AED)</label>
              <input
                type="number"
                name="adjustments"
                value={formData.adjustments}
                onChange={handleInputChange}
                onBlur={calculateTaxableProfit}
                step="0.01"
                style={styles.input}
                placeholder="0.00"
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Taxable Profit (AED) *</label>
            <input
              type="number"
              name="taxable_profit"
              value={formData.taxable_profit}
              readOnly
              step="0.01"
              style={{ ...styles.input, background: '#f3f4f6', color: '#6b7280' }}
              placeholder="Auto-calculated"
            />
            <small style={{ color: '#6b7280', marginTop: '0.25rem', display: 'block' }}>
              {formData.taxable_profit ? `Est. CT Liability: AED ${Math.max(0, (parseFloat(formData.taxable_profit) - 375000) * 0.09).toFixed(2)}` : 'Will auto-calculate'}
            </small>
          </div>
        </div>

        {/* Entity Information */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>🏢 Entity Information</div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Business Type *</label>
            <select
              name="business_type"
              value={formData.business_type}
              onChange={handleInputChange}
              style={styles.input}
            >
              <option value="Mainland">Mainland DED</option>
              <option value="FreezoneIFZA">Free Zone (IFZA)</option>
              <option value="FreezoneJafza">Free Zone (JAFZA)</option>
              <option value="FreezoneDMCC">Free Zone (DMCC)</option>
              <option value="FreezoneRAK">Free Zone (RAK)</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              <input
                type="checkbox"
                name="tax_relief_eligibility"
                checked={formData.tax_relief_eligibility}
                onChange={handleInputChange}
                style={styles.checkbox}
              />
              Eligible for Small Business Relief (Revenue &lt; AED 3M)
            </label>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Previous Year Losses (AED)</label>
            <input
              type="number"
              name="previous_year_losses"
              value={formData.previous_year_losses}
              onChange={handleInputChange}
              step="0.01"
              style={styles.input}
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Supporting Documents */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>📄 Documentation</div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              <input
                type="checkbox"
                name="supporting_documents_ready"
                checked={formData.supporting_documents_ready}
                onChange={handleInputChange}
                style={styles.checkbox}
              />
              Supporting documents ready for upload
            </label>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Additional Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              style={{ ...styles.input, minHeight: 100, resize: 'vertical' }}
              placeholder="Any specific considerations or notes for this filing..."
            />
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            disabled={submitting}
            style={{
              ...styles.button,
              opacity: submitting ? 0.6 : 1,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => !submitting && (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => !submitting && (e.currentTarget.style.opacity = '1')}
          >
            {submitting ? '⏳ Submitting...' : '✓ Submit Intake Form'}
          </button>
        </div>
      </form>
    </div>
  );
}
