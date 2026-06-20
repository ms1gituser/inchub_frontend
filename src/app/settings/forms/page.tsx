'use client';

import { useState } from 'react';
import DynamicJsonForm from '@/components/ui/DynamicJsonForm';
import type { DynamicFormSchema, FormValues } from '@/types/formSchema';

const PRESET_LEAD: DynamicFormSchema = {
  title: 'Lead Information',
  description: 'Manage sales lead data dynamically from database JSON.',
  layout: 'two-column',
  submitLabel: 'Create CRM Lead',
  sections: [
    {
      title: 'Company & Contact Details',
      description: 'Primary corporate info',
      fields: [
        {
          name: 'companyName',
          type: 'text',
          label: 'Company Name',
          placeholder: 'Acme Corp',
          width: 'full',
          validation: { required: 'Company name is required', minLength: 2 }
        },
        {
          name: 'contactName',
          type: 'text',
          label: 'Contact Name',
          placeholder: 'John Doe',
          width: 'half',
          validation: { required: 'Contact name is required' }
        },
        {
          name: 'email',
          type: 'email',
          label: 'Email Address',
          placeholder: 'john@company.com',
          width: 'half',
          validation: {
            required: 'Email is required',
            pattern: { value: '^[^@]+@[^@]+\\.[^@]+$', message: 'Enter a valid email' }
          }
        }
      ]
    },
    {
      title: 'Deal Metrics',
      collapsible: true,
      fields: [
        {
          name: 'dealValue',
          type: 'number',
          label: 'Deal Value (INR)',
          placeholder: '50000',
          step: 100,
          width: 'half',
          validation: { min: { value: 1000, message: 'Minimum deal value is ₹1000' } }
        },
        {
          name: 'leadSource',
          type: 'select',
          label: 'Lead Source',
          width: 'half',
          options: [
            { label: 'Website Inquiry', value: 'website' },
            { label: 'Cold Outreach', value: 'outreach' },
            { label: 'Referral', value: 'referral' },
            { label: 'Event/Expo', value: 'event' }
          ],
          validation: { required: 'Select a lead source' }
        }
      ]
    }
  ]
};

const PRESET_TICKET: DynamicFormSchema = {
  title: 'Support Escalation',
  description: 'Log and assign internal support issues.',
  layout: 'single-column',
  submitLabel: 'Escalate Ticket',
  fields: [
    {
      name: 'subject',
      type: 'text',
      label: 'Ticket Subject',
      placeholder: 'Database connection timeouts',
      validation: { required: true }
    },
    {
      name: 'priority',
      type: 'radio',
      label: 'Severity Level',
      layout: 'cards',
      options: [
        { label: '🔴 Critical', value: 'critical' },
        { label: '🟡 Major', value: 'major' },
        { label: '🟢 Minor', value: 'minor' }
      ],
      defaultValue: 'minor',
      validation: { required: true }
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Issue Details',
      placeholder: 'Provide steps to reproduce the timeout...',
      rows: 4
    },
    {
      name: 'terms',
      type: 'checkbox',
      label: 'Acknowledge terms',
      checkboxLabel: 'I confirm this issue blocks deployment activities.',
      validation: { required: 'You must confirm before escalating' }
    }
  ]
};

const PRESET_SIMPLE: DynamicFormSchema = {
  title: 'Quick Contact',
  submitLabel: 'Save Contact',
  fields: [
    { name: 'name', type: 'text', label: 'Full Name', placeholder: 'Amit Kumar', validation: { required: true } },
    { name: 'phone', type: 'phone', label: 'Phone Number', prefix: '+91', placeholder: '9876543210' },
    { name: 'dob', type: 'date', label: 'Date of Birth' }
  ]
};

const PRESETS = {
  lead: PRESET_LEAD,
  ticket: PRESET_TICKET,
  simple: PRESET_SIMPLE
};

// Structural validation logic for dynamic forms schemas
function validateSchema(parsed: unknown): void {
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Schema must be a valid JSON Object');
  }

  const data = parsed as Record<string, unknown>;
  const fields: unknown[] = [];

  if (data.fields) {
    if (!Array.isArray(data.fields)) {
      throw new Error('"fields" property must be a valid array.');
    }
    fields.push(...data.fields);
  } else if (data.sections) {
    if (!Array.isArray(data.sections)) {
      throw new Error('"sections" property must be a valid array.');
    }
    for (let i = 0; i < data.sections.length; i++) {
      const sec = data.sections[i] as Record<string, unknown>;
      if (typeof sec !== 'object' || sec === null) {
        throw new Error(`Section at index ${i} must be a valid object.`);
      }
      if (!Array.isArray(sec.fields)) {
        throw new Error(`Section "${sec.title ?? i}" is missing its "fields" array.`);
      }
      fields.push(...sec.fields);
    }
  } else {
    throw new Error('Schema must declare either a flat "fields" array or a multi-card "sections" array.');
  }

  const names = new Set<string>();
  const validTypes = new Set([
    'text', 'email', 'password', 'phone', 'url', 'number',
    'textarea', 'select', 'multiselect', 'radio', 'checkbox',
    'date', 'datetime-local', 'divider', 'heading'
  ]);

  for (let i = 0; i < fields.length; i++) {
    const f = fields[i] as Record<string, unknown>;
    if (typeof f !== 'object' || f === null) {
      throw new Error(`Field at index ${i} is not a valid object.`);
    }
    if (!f.type) {
      throw new Error(`Field at index ${i} is missing its "type" attribute.`);
    }
    if (typeof f.type !== 'string' || !validTypes.has(f.type)) {
      throw new Error(`Unsupported or missing field type: "${String(f.type)}" at index ${i}.`);
    }
    // headings and dividers do not require input names
    if (f.type !== 'divider' && f.type !== 'heading') {
      if (!f.name) {
        throw new Error(`Field of type "${f.type}" is missing its unique "name" registration key.`);
      }
      if (typeof f.name !== 'string') {
        throw new Error(`Field "name" must be a string. Got type: ${typeof f.name}`);
      }
      if (names.has(f.name)) {
        throw new Error(`Duplicate field name detected: "${f.name}". Every input field must have a unique identifier.`);
      }
      names.add(f.name);
    }
  }
}

export default function DynamicFormPlayground() {
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof PRESETS>('lead');
  const [jsonText, setJsonText] = useState<string>(JSON.stringify(PRESETS.lead, null, 2));
  const [submitData, setSubmitData] = useState<FormValues | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState<number>(0); // force re-render of form on schema update

  const handlePresetChange = (presetKey: keyof typeof PRESETS) => {
    setSelectedPreset(presetKey);
    const text = JSON.stringify(PRESETS[presetKey], null, 2);
    setJsonText(text);
    setParseError(null);
    setSubmitData(null);
    setFormKey((k) => k + 1);
  };

  const handleJsonEdit = (val: string) => {
    setJsonText(val);
    try {
      const parsed = JSON.parse(val);
      validateSchema(parsed);
      setParseError(null);
      setFormKey((k) => k + 1); // trigger dynamic rebuild
    } catch (e: unknown) {
      setParseError(e instanceof Error ? e.message : 'Invalid JSON format');
    }
  };

  let parsedSchema: DynamicFormSchema | null = null;
  if (!parseError) {
    try {
      parsedSchema = JSON.parse(jsonText) as DynamicFormSchema;
    } catch {
      // handled above
    }
  }

  const handleSubmit = (data: FormValues) => {
    setSubmitData(data);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 500 }}>System Settings</p>
          <h1 style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', fontWeight: 800, color: '#2C1A0E', letterSpacing: '-0.02em' }}>
            Zero-Developer Dynamic Forms
          </h1>
        </div>

        {/* Preset Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#475569' }}>Load Template:</span>
          {Object.keys(PRESETS).map((key) => (
            <button
              key={key}
              onClick={() => handlePresetChange(key as keyof typeof PRESETS)}
              style={{
                height: 32, padding: '0 0.875rem', borderRadius: 6,
                border: selectedPreset === key ? '1px solid #B8892A' : '1px solid #e2e8f0',
                background: selectedPreset === key ? '#F6F1E8' : '#ffffff',
                color: selectedPreset === key ? '#B8892A' : '#475569',
                fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 150ms'
              }}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Split layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left pane: JSON Schema Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #1e293b', background: '#1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#B8892A' }} />
                <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                  form-schema.json
                </span>
              </div>
              <span style={{ color: '#475569', fontSize: '0.7125rem', fontWeight: 500 }}>Editable Real-Time</span>
            </div>
            
            <textarea
              value={jsonText}
              onChange={(e) => handleJsonEdit(e.target.value)}
              style={{
                width: '100%',
                height: '480px',
                padding: '1.25rem',
                background: '#0f172a',
                color: '#38bdf8',
                fontSize: '0.8125rem',
                fontFamily: 'var(--font-mono), monospace',
                border: 'none',
                outline: 'none',
                resize: 'none',
                lineHeight: 1.6
              }}
            />
          </div>

          {/* JSON validation alerts */}
          {parseError ? (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '0.875rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 2, flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: '#991b1b', fontWeight: 700 }}>Schema Syntax Error</p>
                <p style={{ margin: '0.125rem 0 0', fontSize: '0.75rem', color: '#b91c1c', fontFamily: 'monospace' }}>{parseError}</p>
              </div>
            </div>
          ) : (
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 8, padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span style={{ fontSize: '0.8125rem', color: '#065f46', fontWeight: 600 }}>Schema parsed successfully — UI compiled!</span>
            </div>
          )}
        </div>

        {/* Right pane: Live Form Preview & Output */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Live Preview Card */}
          <div style={{ background: '#ffffff', border: '1px solid #DDD4BE', borderRadius: 12, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h2 style={{ margin: '0 0 1.25rem', fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>
              Form Live Preview
            </h2>
            {parsedSchema ? (
              <div style={{ display: 'block', pointerEvents: parseError ? 'none' : 'auto' }}>
                <DynamicJsonForm
                  key={formKey}
                  schema={parsedSchema}
                  onSubmit={handleSubmit}
                  successMessage="Form submitted successfully!"
                />
              </div>
            ) : (
              <div style={{ border: '2px dashed #e2e8f0', borderRadius: 8, padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                Please resolve the JSON syntax errors on the left to preview the form.
              </div>
            )}
          </div>

          {/* Form Output Card */}
          <div style={{ background: '#ffffff', border: '1px solid #DDD4BE', borderRadius: 12, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
              <h2 style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>
                Validated Output Values
              </h2>
              {submitData && (
                <button
                  onClick={() => setSubmitData(null)}
                  style={{
                    border: 'none', background: 'transparent', color: '#94a3b8', fontSize: '0.7125rem', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Clear
                </button>
              )}
            </div>
            {submitData ? (
              <pre
                style={{
                  margin: 0,
                  padding: '1rem',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: '0.75rem',
                  color: '#334155',
                  fontFamily: 'var(--font-mono), monospace',
                  overflowX: 'auto',
                  lineHeight: 1.5
                }}
              >
                {JSON.stringify(submitData, null, 2)}
              </pre>
            ) : (
              <div style={{ fontSize: '0.8125rem', color: '#94a3b8', padding: '1.5rem 0', textAlign: 'center' }}>
                Submit the form preview above to see the real-time validated outputs.
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
