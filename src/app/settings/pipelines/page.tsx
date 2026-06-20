'use client';

import { useState, useMemo } from 'react';

interface Stage {
  id: string;
  name: string;
  order: number; // Fractional order value
  color: string;
}

const INITIAL_STAGES: Stage[] = [
  { id: '1', name: 'Prospecting', order: 1000, color: '#2C1A0E' },
  { id: '2', name: 'Qualifying', order: 2000, color: '#8b5cf6' },
  { id: '3', name: 'Proposal', order: 3000, color: '#f59e0b' },
  { id: '4', name: 'Negotiation', order: 4000, color: '#10b981' },
  { id: '5', name: 'Closing', order: 5000, color: '#ef4444' },
];

export default function PipelineStagesEditor() {
  const [stages, setStages] = useState<Stage[]>(INITIAL_STAGES);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [newStageName, setNewStageName] = useState('');
  const [insertingIndex, setInsertingIndex] = useState<number | null>(null);
  const [logs, setLogs] = useState<string[]>(['Pipeline initialized with default stages (step-size 1000).']);

  // Sort stages by order ascending
  const sortedStages = useMemo(() => [...stages].sort((a, b) => a.order - b.order), [stages]);

  const addLog = (msg: string) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 19)]);
  };

  // Insert stage at index (0 = very beginning, stages.length = end, otherwise in-between)
  const handleInsertStage = (index: number) => {
    if (!newStageName.trim()) return;

    let newOrder = 1000;
    if (sortedStages.length === 0) {
      newOrder = 1000;
    } else if (index === 0) {
      // Very beginning: midpoint between 0 and first item's order
      newOrder = sortedStages[0].order / 2;
    } else if (index >= sortedStages.length) {
      // Very end: add 1000 to last item's order
      newOrder = sortedStages[sortedStages.length - 1].order + 1000;
    } else {
      // In between: midpoint between index - 1 and index
      const prevOrder = sortedStages[index - 1].order;
      const nextOrder = sortedStages[index].order;
      newOrder = (prevOrder + nextOrder) / 2;
    }

    const newStage: Stage = {
      id: `${Date.now()}-${Math.random()}`,
      name: newStageName.trim(),
      order: Number(newOrder.toFixed(4)),
      color: ['#2C1A0E', '#E8760A', '#B8892A', '#2A1628', '#C9A040', '#6B3F22', '#5A2D5A'][
        Math.floor(Math.random() * 7)
      ],
    };

    setStages((prev) => [...prev, newStage]);
    addLog(`Inserted stage "${newStage.name}" at order ${newStage.order.toFixed(2)} (Index ${index})`);
    setNewStageName('');
    setInsertingIndex(null);
  };

  // Re-order calculation on Drag & Drop
  const handleDrop = (targetIndex: number) => {
    if (draggedId === null) return;
    const draggedItem = stages.find((s) => s.id === draggedId);
    if (!draggedItem) return;

    // Filter out dragged item to compute new index positions
    const remaining = sortedStages.filter((s) => s.id !== draggedId);
    
    let newOrder = 1000;
    if (remaining.length === 0) {
      newOrder = 1000;
    } else if (targetIndex === 0) {
      // Drop at very beginning
      newOrder = remaining[0].order / 2;
    } else if (targetIndex >= remaining.length) {
      // Drop at very end
      newOrder = remaining[remaining.length - 1].order + 1000;
    } else {
      // Drop in middle
      const prevOrder = remaining[targetIndex - 1].order;
      const nextOrder = remaining[targetIndex].order;
      newOrder = (prevOrder + nextOrder) / 2;
    }

    // Round to 4 decimal places
    const calculatedOrder = Number(newOrder.toFixed(4));
    const oldOrder = draggedItem.order;

    setStages((prev) =>
      prev.map((s) => (s.id === draggedId ? { ...s, order: calculatedOrder } : s))
    );
    addLog(
      `Moved "${draggedItem.name}" order from ${oldOrder.toFixed(2)} to ${calculatedOrder.toFixed(2)} (midpoint calculation)`
    );
    setDraggedId(null);
  };

  // Move up/down buttons helper
  const handleMove = (id: string, direction: 'up' | 'down') => {
    const currIndex = sortedStages.findIndex((s) => s.id === id);
    if (currIndex === -1) return;

    if (direction === 'up' && currIndex > 0) {
      // Swap place with item at currIndex - 1
      // Drag item to target index (currIndex - 1)
      setDraggedId(id);
      setTimeout(() => {
        setDraggedId((currentDragged) => {
          if (currentDragged === id) {
            // drop before currIndex - 1
            const remaining = sortedStages.filter((s) => s.id !== id);
            const targetIndex = currIndex - 1;
            let order = 1000;
            if (targetIndex === 0) {
              order = remaining[0].order / 2;
            } else {
              order = (remaining[targetIndex - 1].order + remaining[targetIndex].order) / 2;
            }
            setStages((prev) =>
              prev.map((s) => (s.id === id ? { ...s, order: Number(order.toFixed(4)) } : s))
            );
            addLog(`Shifted "${sortedStages[currIndex].name}" Up. New order: ${Number(order.toFixed(4)).toFixed(2)}`);
          }
          return null;
        });
      }, 0);
    } else if (direction === 'down' && currIndex < sortedStages.length - 1) {
      // Swap place with item at currIndex + 1
      setDraggedId(id);
      setTimeout(() => {
        setDraggedId((currentDragged) => {
          if (currentDragged === id) {
            const remaining = sortedStages.filter((s) => s.id !== id);
            const targetIndex = currIndex + 1;
            let order = 1000;
            if (targetIndex >= remaining.length) {
              order = remaining[remaining.length - 1].order + 1000;
            } else {
              order = (remaining[targetIndex - 1].order + remaining[targetIndex].order) / 2;
            }
            setStages((prev) =>
              prev.map((s) => (s.id === id ? { ...s, order: Number(order.toFixed(4)) } : s))
            );
            addLog(`Shifted "${sortedStages[currIndex].name}" Down. New order: ${Number(order.toFixed(4)).toFixed(2)}`);
          }
          return null;
        });
      }, 0);
    }
  };

  const deleteStage = (id: string) => {
    const stage = stages.find((s) => s.id === id);
    if (!stage) return;
    setStages((prev) => prev.filter((s) => s.id !== id));
    addLog(`Deleted stage "${stage.name}" (Order ${stage.order.toFixed(2)})`);
  };

  const resetStages = () => {
    setStages(INITIAL_STAGES);
    addLog('Reset all stages to initial defaults.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 500 }}>System Settings</p>
          <h1 style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Pipeline Stage Configurator
          </h1>
        </div>
        <button
          onClick={resetStages}
          style={{
            height: 32, padding: '0 0.875rem', borderRadius: 6, border: '1px solid #cbd5e1',
            background: '#ffffff', color: '#475569', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
            transition: 'all 150ms'
          }}
        >
          Reset defaults
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left: Interactive Stage Re-order list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <p style={{ margin: '0 0 1.25rem', fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }}>
              Drag stages using the handle, use up/down buttons, or click in-between buttons to insert. The frontend computes midpoints instantly without affecting database integrity.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              
              {/* Insert at very beginning button */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={() => setInsertingIndex(0)}
                  style={{
                    height: 24, padding: '0 0.75rem', borderRadius: 12, border: '1px dashed #cbd5e1',
                    background: '#f8fafc', color: '#64748b', fontSize: '0.6875rem', fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '4px', outline: 'none'
                  }}
                >
                  ➕ Insert stage at start
                </button>
              </div>

              {sortedStages.map((stage, i) => (
                <div key={stage.id}>
                  {/* Stage Card */}
                  <div
                    draggable
                    onDragStart={() => setDraggedId(stage.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(i)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.875rem',
                      padding: '0.875rem 1.25rem', background: '#ffffff',
                      border: '1px solid #e2e8f0', borderRadius: 10,
                      boxShadow: draggedId === stage.id ? '0 10px 20px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.02)',
                      opacity: draggedId === stage.id ? 0.4 : 1,
                      cursor: 'grab',
                      transition: 'border-color 150ms'
                    }}
                    onDragEnd={() => setDraggedId(null)}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
                  >
                    {/* Drag Handle */}
                    <div style={{ color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '2px', cursor: 'grab' }}>
                      <span style={{ display: 'block', width: 12, height: 2, background: 'currentColor', borderRadius: 1 }} />
                      <span style={{ display: 'block', width: 12, height: 2, background: 'currentColor', borderRadius: 1 }} />
                      <span style={{ display: 'block', width: 12, height: 2, background: 'currentColor', borderRadius: 1 }} />
                    </div>

                    {/* Color dot */}
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: stage.color }} />

                    {/* Stage Details */}
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b' }}>
                        {stage.name}
                      </span>
                    </div>

                    {/* Order value badge */}
                    <span
                      style={{
                        fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 700,
                        padding: '0.15rem 0.45rem', background: '#f1f5f9', color: '#475569', borderRadius: 6
                      }}
                    >
                      {stage.order}
                    </span>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button
                        onClick={() => handleMove(stage.id, 'up')}
                        disabled={i === 0}
                        title="Move Up"
                        style={{
                          width: 26, height: 26, border: '1px solid #e2e8f0', borderRadius: 6,
                          background: '#ffffff', color: '#64748b', cursor: i === 0 ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: i === 0 ? 0.3 : 1
                        }}
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => handleMove(stage.id, 'down')}
                        disabled={i === sortedStages.length - 1}
                        title="Move Down"
                        style={{
                          width: 26, height: 26, border: '1px solid #e2e8f0', borderRadius: 6,
                          background: '#ffffff', color: '#64748b', cursor: i === sortedStages.length - 1 ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: i === sortedStages.length - 1 ? 0.3 : 1
                        }}
                      >
                        ▼
                      </button>
                      <button
                        onClick={() => deleteStage(stage.id)}
                        title="Delete Stage"
                        style={{
                          width: 26, height: 26, border: '1px solid #fecaca', borderRadius: 6,
                          background: '#fef2f2', color: '#ef4444', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Insert in-between button */}
                  <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
                    <button
                      onClick={() => setInsertingIndex(i + 1)}
                      style={{
                        height: 24, padding: '0 0.75rem', borderRadius: 12, border: '1px dashed #e2e8f0',
                        background: '#f8fafc', color: '#94a3b8', fontSize: '0.6875rem', fontWeight: 600, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '4px', outline: 'none'
                      }}
                    >
                      ➕ Insert stage after {stage.name}
                    </button>
                  </div>

                </div>
              ))}

            </div>
          </div>

        </div>

        {/* Right: Insert dialog & Event logger */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Insert inputs (if active) */}
          {insertingIndex !== null && (
            <div style={{ background: '#ffffff', border: '1px solid #B8892A', borderRadius: 12, padding: '1.5rem', boxShadow: '0 10px 20px rgba(184,137,42,0.03)' }}>
              <h3 style={{ margin: '0 0 0.875rem', fontSize: '0.875rem', fontWeight: 700, color: '#2C1A0E' }}>
                Add New Pipeline Stage
              </h3>
              <p style={{ margin: '0 0 0.875rem', fontSize: '0.75rem', color: '#64748b' }}>
                Inserting at target position {insertingIndex === 0 ? 'start' : insertingIndex === sortedStages.length ? 'end' : `after ${sortedStages[insertingIndex - 1]?.name}`}.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Stage name (e.g. Lead Met)"
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  style={{
                    flex: 1, height: 36, padding: '0 0.75rem', border: '1px solid #cbd5e1', borderRadius: 6,
                    fontSize: '0.8125rem', color: '#2C1A0E', outline: 'none'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleInsertStage(insertingIndex);
                  }}
                  autoFocus
                />
                <button
                  onClick={() => handleInsertStage(insertingIndex)}
                  style={{
                    height: 36, padding: '0 0.875rem', background: 'linear-gradient(135deg, #2C1A0E 0%, #B8892A 100%)', color: '#ffffff',
                    border: 'none', borderRadius: 6, fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Insert
                </button>
                <button
                  onClick={() => { setInsertingIndex(null); setNewStageName(''); }}
                  style={{
                    height: 36, padding: '0 0.875rem', background: '#f1f5f9', color: '#475569',
                    border: '1px solid #e2e8f0', borderRadius: 6, fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Event Logger Console */}
          <div style={{ background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                fractional-sort.log
              </span>
              <button
                onClick={() => setLogs([])}
                style={{ border: 'none', background: 'transparent', color: '#475569', fontSize: '0.6875rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Clear logs
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 220, overflowY: 'auto' }}>
              {logs.length === 0 ? (
                <div style={{ color: '#475569', fontSize: '0.75rem', fontFamily: 'monospace', textAlign: 'center', padding: '1rem 0' }}>
                  No event records.
                </div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} style={{ color: i === 0 ? '#38bdf8' : '#64748b', fontSize: '0.75rem', fontFamily: 'monospace', lineHeight: 1.4 }}>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
