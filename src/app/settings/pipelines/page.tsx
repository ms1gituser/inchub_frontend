/* eslint-disable */
'use client';

import { useState, useMemo, useEffect } from 'react';
import { get, post, put, del } from '@/lib/apiClient';
import Link from 'next/link';

interface Stage {
  id: string;
  name: string;
  sort_order: number;
  color: string;
}

export default function PipelineStagesEditor() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [newStageName, setNewStageName] = useState('');
  const [insertingIndex, setInsertingIndex] = useState<number | null>(null);

  // Fetch configured stages from DB
  const fetchStages = async () => {
    setLoading(true);
    try {
      const res = await get<{ success: boolean; data: Stage[] }>('/pipelines/stages');
      if (res?.success) {
        setStages(res.data || []);
      }
    } catch (err: any) {
      console.error('[Fetch Stages Err]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStages();
  }, []);

  // Sort stages by sort_order ascending
  const sortedStages = useMemo(() => [...stages].sort((a, b) => a.sort_order - b.sort_order), [stages]);

  // Insert stage at index (0 = very beginning, stages.length = end, otherwise in-between)
  const handleInsertStage = async (index: number) => {
    if (!newStageName.trim()) return;

    let newOrder = 1000;
    if (sortedStages.length === 0) {
      newOrder = 1000;
    } else if (index === 0) {
      newOrder = Number(sortedStages[0].sort_order) / 2;
    } else if (index >= sortedStages.length) {
      newOrder = Number(sortedStages[sortedStages.length - 1].sort_order) + 1000;
    } else {
      const prevOrder = Number(sortedStages[index - 1].sort_order);
      const nextOrder = Number(sortedStages[index].sort_order);
      newOrder = (prevOrder + nextOrder) / 2;
    }

    const calculatedOrder = Number(newOrder.toFixed(4));
    const randomColor = ['#2C1A0E', '#E8760A', '#B8892A', '#2A1628', '#C9A040', '#6B3F22', '#5A2D5A'][
      Math.floor(Math.random() * 7)
    ];

    try {
      const res = await post<{ success: boolean; data: Stage }>('/pipelines/stages', {
        name: newStageName.trim(),
        sort_order: calculatedOrder,
        color: randomColor
      });
      if (res?.success && res.data) {
        setStages((prev) => [...prev, res.data]);
      }
    } catch (err: any) {
      console.error('[Insert Stage Err]', err);
    } finally {
      setNewStageName('');
      setInsertingIndex(null);
    }
  };

  // Re-order calculation on Drag & Drop
  const handleDrop = async (targetIndex: number) => {
    if (draggedId === null) return;
    const draggedItem = stages.find((s) => s.id === draggedId);
    if (!draggedItem) return;

    const remaining = sortedStages.filter((s) => s.id !== draggedId);

    let newOrder = 1000;
    if (remaining.length === 0) {
      newOrder = 1000;
    } else if (targetIndex === 0) {
      newOrder = Number(remaining[0].sort_order) / 2;
    } else if (targetIndex >= remaining.length) {
      newOrder = Number(remaining[remaining.length - 1].sort_order) + 1000;
    } else {
      const prevOrder = Number(remaining[targetIndex - 1].sort_order);
      const nextOrder = Number(remaining[targetIndex].sort_order);
      newOrder = (prevOrder + nextOrder) / 2;
    }

    const calculatedOrder = Number(newOrder.toFixed(4));

    try {
      const res = await put<{ success: boolean; data: Stage }>(`/pipelines/stages/${draggedId}`, {
        sort_order: calculatedOrder
      });
      if (res?.success && res.data) {
        setStages((prev) =>
          prev.map((s) => (s.id === draggedId ? { ...s, sort_order: calculatedOrder } : s))
        );
      }
    } catch (err: any) {
      console.error('[Drag Stage Err]', err);
    } finally {
      setDraggedId(null);
    }
  };

  // Move up/down buttons helper
  const handleMove = async (id: string, direction: 'up' | 'down') => {
    const currIndex = sortedStages.findIndex((s) => s.id === id);
    if (currIndex === -1) return;

    let targetIndex = currIndex;
    if (direction === 'up' && currIndex > 0) {
      targetIndex = currIndex - 1;
    } else if (direction === 'down' && currIndex < sortedStages.length - 1) {
      targetIndex = currIndex + 1;
    } else {
      return;
    }

    const remaining = sortedStages.filter((s) => s.id !== id);

    let newOrder = 1000;
    if (remaining.length === 0) {
      newOrder = 1000;
    } else if (targetIndex === 0) {
      newOrder = Number(remaining[0].sort_order) / 2;
    } else if (targetIndex >= remaining.length) {
      newOrder = Number(remaining[remaining.length - 1].sort_order) + 1000;
    } else {
      newOrder = (Number(remaining[targetIndex - 1].sort_order) + Number(remaining[targetIndex].sort_order)) / 2;
    }

    const calculatedOrder = Number(newOrder.toFixed(4));

    try {
      const res = await put<{ success: boolean; data: Stage }>(`/pipelines/stages/${id}`, {
        sort_order: calculatedOrder
      });
      if (res?.success && res.data) {
        setStages((prev) =>
          prev.map((s) => (s.id === id ? { ...s, sort_order: calculatedOrder } : s))
        );
      }
    } catch (err: any) {
      console.error('[Move Stage Err]', err);
    }
  };

  const deleteStage = async (id: string) => {
    const stage = stages.find((s) => s.id === id);
    if (!stage) return;
    try {
      const res = await del<{ success: boolean }>(`/pipelines/stages/${id}`);
      if (res?.success) {
        setStages((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err: any) {
      console.error('[Delete Stage Err]', err);
    }
  };

  const resetStages = async () => {
    try {
      const res = await post<{ success: boolean; data: Stage[] }>('/pipelines/stages/reset');
      if (res?.success) {
        setStages(res.data || []);
      }
    } catch (err: any) {
      console.error('[Reset Stages Err]', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', color: '#2C1A0E', maxWidth: '100%', margin: '0 auto' }}>

      {/* Insert inputs (if active) */}
      {insertingIndex !== null && (
        <div style={{ background: '#ffffff', border: '1px solid #B8892A', borderRadius: 12, padding: '1.5rem', boxShadow: '0 4px 12px rgba(184,137,42,0.06)' }}>
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', fontWeight: 700, color: '#2C1A0E' }}>
            Add New Pipeline Stage
          </h3>
          <p style={{ margin: '0 0 1rem', fontSize: '0.75rem', color: 'rgba(44,26,14,0.6)' }}>
            Inserting at target position {insertingIndex === 0 ? 'start' : insertingIndex === sortedStages.length ? 'end' : `after ${sortedStages[insertingIndex - 1]?.name}`}.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Stage name (e.g. Lead Met)"
              value={newStageName}
              onChange={(e) => setNewStageName(e.target.value)}
              style={{
                flex: 1, height: 40, padding: '0 0.75rem', border: '1px solid #DDD4BE', borderRadius: 6,
                fontSize: '0.875rem', color: '#2C1A0E', outline: 'none'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleInsertStage(insertingIndex);
              }}
              autoFocus
            />
            <button
              onClick={() => handleInsertStage(insertingIndex)}
              style={{
                height: 40, padding: '0 1.25rem', background: '#2C1A0E', color: '#ffffff',
                border: 'none', borderRadius: 6, fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer'
              }}
            >
              Insert Stage
            </button>
            <button
              onClick={() => { setInsertingIndex(null); setNewStageName(''); }}
              style={{
                height: 40, padding: '0 1.25rem', background: '#F6F1E8', color: '#2C1A0E',
                border: '1px solid #DDD0C4', borderRadius: 6, fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Interactive Stage Re-order list */}
      <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.08)', borderRadius: 16, padding: '1.75rem', boxShadow: '0 10px 30px -10px rgba(42,22,40,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'rgba(44,26,14,0.6)', lineHeight: 1.6, flex: 1, maxWidth: '650px' }}>
            Drag stages using the handle, use up/down buttons, or click in-between buttons to insert. Changes update database configuration in real-time.
          </p>
          <button
            onClick={resetStages}
            style={{
              height: 32, padding: '0 1rem', borderRadius: 6, border: '1px solid #DDD0C4',
              background: '#ffffff', color: '#2C1A0E', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer',
              transition: 'all 150ms'
            }}
          >
            RESET SYSTEM DEFAULTS
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'rgba(44,26,14,0.5)', fontSize: '0.875rem' }}>
            Loading pipeline stages configurations...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {/* Insert at very beginning button */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => setInsertingIndex(0)}
                style={{
                  height: 28, padding: '0 0.875rem', borderRadius: 14, border: '1px dashed #DDD0C4',
                  background: '#F6F1E8', color: '#B8892A', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer',
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
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '1rem 1.25rem', background: '#ffffff',
                    border: '1px solid #DDD0C4', borderRadius: 10,
                    boxShadow: draggedId === stage.id ? '0 10px 20px rgba(0,0,0,0.08)' : 'none',
                    opacity: draggedId === stage.id ? 0.4 : 1,
                    cursor: 'grab',
                    transition: 'border-color 150ms'
                  }}
                  onDragEnd={() => setDraggedId(null)}
                >
                  {/* Drag Handle */}
                  <div style={{ color: '#DDD0C4', display: 'flex', flexDirection: 'column', gap: '2px', cursor: 'grab' }}>
                    <span style={{ display: 'block', width: 12, height: 2, background: 'currentColor', borderRadius: 1 }} />
                    <span style={{ display: 'block', width: 12, height: 2, background: 'currentColor', borderRadius: 1 }} />
                    <span style={{ display: 'block', width: 12, height: 2, background: 'currentColor', borderRadius: 1 }} />
                  </div>

                  {/* Color dot */}
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: stage.color }} />

                  {/* Stage Details */}
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2C1A0E' }}>
                      {stage.name}
                    </span>
                  </div>

                  {/* Order value badge */}
                  <span
                    style={{
                      fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 700,
                      padding: '0.2rem 0.5rem', background: '#F6F1E8', color: '#2C1A0E', borderRadius: 6
                    }}
                  >
                    {Number(stage.sort_order).toFixed(2)}
                  </span>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button
                      onClick={() => handleMove(stage.id, 'up')}
                      disabled={i === 0}
                      title="Move Up"
                      style={{
                        width: 28, height: 28, border: '1px solid #DDD0C4', borderRadius: 6,
                        background: '#ffffff', color: '#2C1A0E', cursor: i === 0 ? 'not-allowed' : 'pointer',
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
                        width: 28, height: 28, border: '1px solid #DDD0C4', borderRadius: 6,
                        background: '#ffffff', color: '#2C1A0E', cursor: i === sortedStages.length - 1 ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: i === sortedStages.length - 1 ? 0.3 : 1
                      }}
                    >
                      ▼
                    </button>
                    <button
                      onClick={() => deleteStage(stage.id)}
                      title="Delete Stage"
                      style={{
                        width: 28, height: 28, border: '1px solid #fecaca', borderRadius: 6,
                        background: '#fef2f2', color: '#ef4444', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Insert in-between button */}
                <div style={{ display: 'flex', justifyContent: 'center', margin: '6px 0' }}>
                  <button
                    onClick={() => setInsertingIndex(i + 1)}
                    style={{
                      height: 24, padding: '0 0.875rem', borderRadius: 12, border: '1px dashed #DDD0C4',
                      background: '#F6F1E8', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '4px', outline: 'none'
                    }}
                  >
                    ➕ Insert stage after {stage.name}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
