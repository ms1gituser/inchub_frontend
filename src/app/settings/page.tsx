'use client';

import React, { useState } from 'react';
import PipelineStagesEditor from './pipelines/page';
import DynamicFormPlayground from './forms/page';

export default function SettingsDashboard() {
  const [activeTab, setActiveTab] = useState<'pipelines' | 'forms'>('pipelines');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', color: '#2C1A0E', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(44,26,14,0.6)', fontWeight: 600, letterSpacing: '0.2em', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase' }}>
          System Management • Settings Workspace
        </p>
        <h1 style={{ margin: '0.35rem 0 0', fontSize: '2.25rem', fontWeight: 300, color: '#2C1A0E', letterSpacing: '-0.02em', fontFamily: 'var(--font-serif)' }}>
          System <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>Settings</span>
        </h1>
      </div>

      {/* Tabs Selector Navigation */}
      <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '2px solid rgba(44,26,14,0.08)', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('pipelines')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'pipelines' ? '3px solid #2C1A0E' : '3px solid transparent',
            color: activeTab === 'pipelines' ? '#2C1A0E' : 'rgba(44,26,14,0.5)',
            fontSize: '0.85rem',
            fontWeight: 800,
            cursor: 'pointer',
            padding: '0.5rem 1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            transition: 'all 150ms'
          }}
        >
          Pipeline Stages Configurator
        </button>
        <button
          onClick={() => setActiveTab('forms')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'forms' ? '3px solid #2C1A0E' : '3px solid transparent',
            color: activeTab === 'forms' ? '#2C1A0E' : 'rgba(44,26,14,0.5)',
            fontSize: '0.85rem',
            fontWeight: 800,
            cursor: 'pointer',
            padding: '0.5rem 1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            transition: 'all 150ms'
          }}
        >
          Intake Forms Builder
        </button>
      </div>

      {/* Render Active Tab Workspace */}
      <div style={{ marginTop: '0.5rem' }}>
        {activeTab === 'pipelines' && <PipelineStagesEditor />}
        {activeTab === 'forms' && <DynamicFormPlayground />}
      </div>
    </div>
  );
}
