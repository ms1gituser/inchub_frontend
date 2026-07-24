'use client';

import React, { useState, useEffect } from 'react';
import { get } from '@/lib/apiClient';
import { usePermission } from '@/context/PermissionContext';
import { useNotification } from '@/context/NotificationContext';
import LoadingScreen from '@/components/ui/LoadingScreen';
import Image from 'next/image';

interface TenantProfile {
  onboarding_stage?: number;
}

export default function BookConsultationPage() {
  const { currentBrand } = usePermission();
  const { showToast } = useNotification();
  const [stage, setStage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookingNew, setIsBookingNew] = useState(false);

  // Calendar States
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 5, 1)); // Starts in June 2026
  const [selectedDate, setSelectedDate] = useState<number | null>(25);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customTimeInput, setCustomTimeInput] = useState<string>('');
  const [isConfirming, setIsConfirming] = useState(false);
  
  // Confirmed booking state
  const [confirmedDateStr, setConfirmedDateStr] = useState('Thursday, 25 June 2026');
  const [confirmedTimeStr, setConfirmedTimeStr] = useState('2:00 PM');

  // Helper for Calendar
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    setSelectedDate(null);
    setSelectedTime(null);
  };
  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    setSelectedDate(null);
    setSelectedTime(null);
  };
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const startDayOfWeek = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay(); // 0 is Sunday
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await get<{ success: boolean; data: TenantProfile }>('/bookkeeping/profile');
        if (res?.success && res.data?.onboarding_stage) {
          setStage(res.data.onboarding_stage);
        } else {
          setStage(1); // default
        }
      } catch (e) {
        setStage(1);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const isFinancial = currentBrand === 'financial';
  const primaryBg = isFinancial ? '#2A1628' : '#2C1A0E';
  const accentColor = isFinancial ? '#E8760A' : '#B8892A';
  const cardBorderColor = 'var(--border-subtle)';

  if (loading || stage === null) {
    return <LoadingScreen message="Initializing booking system..." />;
  }

  const isConfirmed = stage !== null && stage >= 2;

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1536px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Executive Clean Header Area */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        gap: '1rem',
        paddingBottom: '0.5rem',
        borderBottom: `1px solid ${cardBorderColor}`,
      }}>
        <div>
          <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(44, 26, 14, 0.5)', fontFamily: 'Inter, sans-serif' }}>
            Meetings & Consultations
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginTop: '0.25rem' }}>
            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 300, letterSpacing: '-0.02em', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)' }}>
              {isConfirmed ? 'Booking Confirmed' : 'Book a Consultation'}
            </h1>
          </div>
        </div>
      </div>

      <p style={{ margin: '-0.5rem 0 0.5rem', fontSize: '0.875rem', color: 'rgba(0,0,0,0.6)', fontFamily: 'Inter, sans-serif' }}>
        {isConfirmed && !isBookingNew
          ? 'Your meeting with the IncHub team is successfully scheduled.'
          : 'Choose a time that works for you — our team will confirm within a few hours.'}
      </p>

      {isConfirmed && !isBookingNew ? (
        <>
          {/* STAGE 2: CONFIRMED BOOKING UI */}
          <div style={{
            background: '#ffffff',
          border: `1px solid ${cardBorderColor}`,
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.01)',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ 
              width: 56, height: 56, borderRadius: '50%', background: `color-mix(in srgb, ${accentColor} 15%, transparent)`, 
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: accentColor 
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: primaryBg, margin: '0 0 0.25rem' }}>You&apos;re booked!</h2>
              <p style={{ fontSize: '1rem', color: primaryBg, margin: 0, fontWeight: 500 }}>
                {confirmedDateStr} at {confirmedTimeStr} (GST)
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: primaryBg, border: `1px solid ${cardBorderColor}`, fontSize: '0.625rem' }}>
                  AS
                </div>
                <span style={{ fontSize: '0.8125rem', color: 'rgba(0,0,0,0.6)' }}>Meeting with <strong style={{ color: primaryBg }}>Aisha Sultan</strong></span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => showToast('Calendar invite (.ics) downloaded.', 'success')}
              style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.625rem 1.25rem', background: primaryBg, color: '#ffffff',
              border: 'none', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 600,
              cursor: 'pointer', transition: 'all 200ms ease'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              Add to Calendar
            </button>
            <button 
              onClick={() => {
                setStage(1);
                showToast('Please select a new time for your consultation.', 'info');
              }}
              style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.625rem 1.25rem', background: 'transparent', color: primaryBg,
              border: `1px solid ${cardBorderColor}`, borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 600,
              cursor: 'pointer', transition: 'all 200ms ease'
            }}>
              Need to reschedule?
            </button>
          </div>
        </div>

        {/* Book Another Meeting Prompt */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', padding: '2rem', background: 'var(--bg-page)', borderRadius: '12px', border: `1px dashed ${accentColor}` }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: primaryBg, margin: '0 0 0.5rem' }}>Need to discuss something else?</h3>
          <p style={{ fontSize: '0.875rem', color: 'rgba(0,0,0,0.6)', margin: '0 0 1.5rem' }}>You can easily schedule a follow-up or a new consultation with your Relationship Manager.</p>
          <button 
            onClick={() => setIsBookingNew(true)}
            style={{
              padding: '0.625rem 1.5rem', background: 'transparent', color: primaryBg,
              border: `2px solid ${primaryBg}`, borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 600,
              cursor: 'pointer', transition: 'all 200ms ease'
            }}>
            Book Another Meeting
          </button>
        </div>
        </>
      ) : (
        // BOOKING WIDGET (Native Mock UI)
        <div style={{
          background: '#ffffff',
          border: `1px solid ${cardBorderColor}`,
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.01)',
          display: 'flex',
          overflow: 'hidden',
          flexDirection: 'column'
        }}>
          {/* Top rep info banner */}
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${cardBorderColor}`, background: 'var(--bg-page)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: primaryBg, border: `1px solid ${cardBorderColor}`, fontSize: '1.125rem' }}>
                AS
             </div>
             <div>
               <p style={{ margin: 0, fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: accentColor }}>IncHub Advisory</p>
               <h3 style={{ margin: '0.25rem 0 0', fontSize: '1.125rem', color: primaryBg, fontWeight: 600 }}>{isBookingNew ? 'Follow-up Consultation' : 'Initial Consultation'}</h3>
               <p style={{ margin: '0.125rem 0 0', fontSize: '0.8125rem', color: 'rgba(0,0,0,0.6)' }}>45 mins • Video Call</p>
             </div>
          </div>
          
          <div style={{ display: 'flex', flex: 1, flexDirection: 'row', flexWrap: 'wrap' }}>
            {/* Calendar Mock Left */}
            <div style={{ flex: '1 1 300px', padding: '1.5rem', borderRight: `1px solid ${cardBorderColor}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: primaryBg }}>
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h4>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button onClick={handlePrevMonth} style={{ padding: '0.25rem', background: 'transparent', border: 'none', cursor: 'pointer', color: primaryBg }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                  </button>
                  <button onClick={handleNextMonth} style={{ padding: '0.25rem', background: 'transparent', border: 'none', cursor: 'pointer', color: primaryBg }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', textAlign: 'center', marginBottom: '1rem' }}>
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                  <div key={day} style={{ fontSize: '0.625rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)', paddingBottom: '0.5rem' }}>{day}</div>
                ))}
                {/* Empty days before month starts */}
                {Array.from({ length: startDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}
                
                {/* Actual Days */}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => (
                  <div key={d} 
                    onClick={() => {
                      setSelectedDate(d);
                      setSelectedTime(null);
                    }}
                    style={{ 
                      padding: '0.375rem', borderRadius: '50%', 
                      background: d === selectedDate ? accentColor : 'transparent', 
                      color: d === selectedDate ? '#ffffff' : primaryBg,
                      cursor: 'pointer', fontWeight: d === selectedDate ? 700 : 500,
                      aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.8125rem', transition: 'all 150ms ease',
                      border: d === selectedDate ? 'none' : '1px solid transparent'
                    }}
                    onMouseEnter={(e) => { if (d !== selectedDate) e.currentTarget.style.border = `1px solid ${cardBorderColor}`; }}
                    onMouseLeave={(e) => { if (d !== selectedDate) e.currentTarget.style.border = '1px solid transparent'; }}
                  >
                    {d}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '0.6875rem', color: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '0.375rem', margin: 0 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                Timezone: Gulf Standard Time (GST)
              </p>
            </div>
            
            {/* Time Slots Right */}
            <div style={{ flex: '1 1 200px', padding: '1.5rem', background: '#fafafa', display: 'flex', flexDirection: 'column' }}>
              <p style={{ margin: '0 0 1.25rem', fontSize: '0.9375rem', fontWeight: 600, color: primaryBg }}>
                {selectedDate 
                  ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) 
                  : 'Select a Date'}
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                {selectedDate ? (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      {['10:00 AM', '11:30 AM', '02:00 PM', '04:00 PM'].map((time, idx) => (
                        <button 
                          key={idx}
                          onClick={() => {
                            setSelectedTime(time);
                            setCustomTimeInput('');
                          }}
                          style={{
                            padding: '0.625rem', background: selectedTime === time ? primaryBg : '#ffffff',
                            color: selectedTime === time ? '#ffffff' : primaryBg,
                            border: `1px solid ${selectedTime === time ? primaryBg : accentColor}`, borderRadius: '6px',
                            fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                            transition: 'all 200ms ease'
                          }}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                    
                    <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: `1px solid ${cardBorderColor}` }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(0,0,0,0.5)', marginBottom: '0.5rem' }}>
                        Or Choose Custom Time
                      </label>
                      <input 
                        type="time" 
                        value={customTimeInput}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomTimeInput(val);
                          if (val) {
                            const [h, m] = val.split(':');
                            const dt = new Date();
                            dt.setHours(parseInt(h, 10));
                            dt.setMinutes(parseInt(m, 10));
                            setSelectedTime(dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
                          } else {
                            setSelectedTime(null);
                          }
                        }}
                        style={{
                          width: '100%', padding: '0.75rem', border: `1px solid ${cardBorderColor}`, borderRadius: '6px',
                          fontSize: '0.875rem', fontFamily: 'inherit', color: primaryBg, outline: 'none', background: '#ffffff',
                          cursor: 'pointer'
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <p style={{ fontSize: '0.8125rem', color: 'rgba(0,0,0,0.5)', margin: 0 }}>
                    Please select a date from the calendar to view available time slots.
                  </p>
                )}
              </div>

              {/* Confirm Button Always Visible */}
              <button
                onClick={() => {
                  if (!selectedTime || !selectedDate) return;
                  setIsConfirming(true);
                  setTimeout(() => {
                    // Update confirmed state before transitioning
                    const dt = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate);
                    setConfirmedDateStr(dt.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
                    setConfirmedTimeStr(selectedTime);

                    setIsConfirming(false);
                    setStage(2);
                    setIsBookingNew(false);
                    showToast(`Successfully booked for ${selectedTime}!`, 'success');
                  }, 1500);
                }}
                disabled={!selectedTime || isConfirming}
                style={{
                  marginTop: '1.5rem', padding: '0.875rem', 
                  background: !selectedTime ? 'var(--border-subtle)' : accentColor, 
                  color: !selectedTime ? 'rgba(0,0,0,0.4)' : '#ffffff',
                  border: 'none', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600,
                  cursor: !selectedTime || isConfirming ? 'not-allowed' : 'pointer', width: '100%',
                  opacity: isConfirming ? 0.8 : 1, transition: 'all 200ms ease'
                }}
              >
                {!selectedTime ? 'Select a Time to Confirm' : isConfirming ? 'Confirming Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
