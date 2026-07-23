'use client';

import React, { useState, useEffect } from 'react';
import { get } from '@/lib/apiClient';
import { usePermission } from '@/context/PermissionContext';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function AddOnServicesPage() {
  const { currentBrand } = usePermission();
  const [stage, setStage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('All Services');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await get<{ success: boolean; data: any }>('/bookkeeping/profile');
        if (res?.success && res.data?.onboarding_stage) {
          setStage(res.data.onboarding_stage);
        } else {
          setStage(7); // FORCED FOR UI REVIEW
        }
      } catch (e) {
        setStage(7); // FORCED FOR UI REVIEW
      } finally {
        setStage(7); // FORCED FOR UI REVIEW
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
    return <LoadingScreen message="Loading service catalogue..." />;
  }

  // EMPTY STATE
  if (stage < 7) {
    return (
      <div style={{ padding: '1.5rem', maxWidth: '1536px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%', background: `color-mix(in srgb, ${accentColor} 15%, transparent)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: accentColor, marginBottom: '1rem'
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
        </div>
        <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 300, fontFamily: 'var(--font-serif)', color: primaryBg }}>
          Catalogue Not Available Yet
        </h2>
        <p style={{ margin: 0, fontSize: '0.9375rem', color: 'rgba(0,0,0,0.6)', textAlign: 'center', maxWidth: '400px', lineHeight: 1.5 }}>
          Our full service catalogue will be available here once your project is complete. You will be able to browse and purchase additional services directly.
        </p>
      </div>
    );
  }

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }).format(amount);
  };

  const tabs = ['All Services', 'Licensing', 'Visa & Immigration', 'Accounting', 'Banking'];

  const services = [
    { id: 1, name: 'Corporate Bank Account Opening', desc: 'End-to-end assistance for opening a UAE corporate bank account.', price: 15000, category: 'Banking', tat: '14-21 Days' },
    { id: 2, name: 'Golden Visa Processing', desc: 'Complete processing of UAE Golden Visa for eligible investors/talent.', price: 25000, category: 'Visa & Immigration', tat: '30 Days' },
    { id: 3, name: 'Tax Residency Certificate (TRC)', desc: 'Obtain a TRC from the FTA to benefit from double taxation agreements.', price: 4500, category: 'Accounting', tat: '7-10 Days' },
    { id: 4, name: 'VAT Registration', desc: 'Mandatory VAT registration for companies exceeding the revenue threshold.', price: 3000, category: 'Accounting', tat: '14 Days' },
    { id: 5, name: 'Trade License Amendment', desc: 'Add or remove business activities from your existing trade license.', price: 8500, category: 'Licensing', tat: '5-7 Days' },
    { id: 6, name: 'Dependent Visa Sponsoring', desc: 'Sponsorship processing for spouse, children, or parents.', price: 5500, category: 'Visa & Immigration', tat: '10 Days' },
  ];

  const filteredServices = activeTab === 'All Services' ? services : services.filter(s => s.category === activeTab);

  const handlePurchase = () => {
    setSelectedService(null);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1536px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
      
      {/* Toast Notification */}
      {showToast && (
        <div style={{
          position: 'fixed', top: '2rem', right: '2rem', background: '#10b981', color: '#fff', 
          padding: '1rem 1.5rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 1000, animation: 'fadeIn 0.3s ease'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9375rem' }}>Request Received</p>
            <p style={{ margin: 0, fontSize: '0.8125rem', opacity: 0.9 }}>Our team will contact you within 24 hours.</p>
          </div>
        </div>
      )}

      {/* Header Area */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem',
        paddingBottom: '0.75rem', borderBottom: `1px solid ${cardBorderColor}`,
      }}>
        <div>
          <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(44, 26, 14, 0.5)', fontFamily: 'Inter, sans-serif' }}>
            Growth & Planning
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginTop: '0.375rem' }}>
            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 300, letterSpacing: '-0.02em', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)' }}>
              Explore More Services
            </h1>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
              border: `1px solid ${activeTab === tab ? primaryBg : cardBorderColor}`,
              background: activeTab === tab ? primaryBg : '#ffffff',
              color: activeTab === tab ? '#ffffff' : 'rgba(0,0,0,0.6)',
              transition: 'all 200ms ease'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Catalogue Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {filteredServices.map(service => (
          <div key={service.id} style={{
            background: '#ffffff', border: `1px solid ${cardBorderColor}`, borderRadius: '8px', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', boxShadow: '0 1px 4px rgba(0,0,0,0.02)', transition: 'transform 200ms ease, box-shadow 200ms ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.02)';
          }}
          >
            <div style={{ padding: '1.25rem', borderBottom: `1px solid ${cardBorderColor}`, background: 'var(--bg-page)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: accentColor, background: `color-mix(in srgb, ${accentColor} 10%, transparent)`, padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                {service.category}
              </span>
            </div>
            <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.125rem', fontWeight: 600, color: primaryBg }}>{service.name}</h3>
              <p style={{ margin: '0 0 1.5rem', fontSize: '0.875rem', color: 'rgba(0,0,0,0.6)', lineHeight: 1.5, flex: 1 }}>{service.desc}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '0.6875rem', color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Starting From</p>
                  <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: primaryBg, fontFamily: 'monospace' }}>{formatMoney(service.price)}</p>
                </div>
                <button 
                  onClick={() => setSelectedService(service)}
                  style={{
                    padding: '0.5rem 1rem', background: primaryBg, color: '#ffffff',
                    border: 'none', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 600,
                    cursor: 'pointer'
                  }}>
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Service Detail Modal */}
      {selectedService && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '8px', width: '100%', maxWidth: '600px', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            
            <div style={{ padding: '1.5rem', borderBottom: `1px solid ${cardBorderColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: accentColor, background: `color-mix(in srgb, ${accentColor} 10%, transparent)`, padding: '0.25rem 0.5rem', borderRadius: '4px', marginBottom: '0.75rem', display: 'inline-block' }}>
                  {selectedService.category}
                </span>
                <h2 style={{ margin: '0', fontSize: '1.5rem', fontWeight: 300, color: primaryBg, fontFamily: 'var(--font-serif)' }}>{selectedService.name}</h2>
              </div>
              <button onClick={() => setSelectedService(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(0,0,0,0.5)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
              <p style={{ margin: '0 0 1.5rem', fontSize: '0.9375rem', color: 'rgba(0,0,0,0.7)', lineHeight: 1.6 }}>
                {selectedService.desc} Our team of experts will handle the entire process end-to-end, ensuring compliance with all local regulations.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'var(--bg-page)', padding: '1rem', borderRadius: '6px', border: `1px solid ${cardBorderColor}` }}>
                  <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Estimated Turnaround</p>
                  <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: primaryBg }}>{selectedService.tat}</p>
                </div>
                <div style={{ background: 'var(--bg-page)', padding: '1rem', borderRadius: '6px', border: `1px solid ${cardBorderColor}` }}>
                  <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Pricing Breakdown</p>
                  <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: primaryBg, fontFamily: 'monospace' }}>{formatMoney(selectedService.price)} <span style={{fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)'}}>(Base Fee)</span></p>
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.02)', padding: '1rem', borderRadius: '6px', border: `1px dashed ${cardBorderColor}` }}>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', fontWeight: 600, color: primaryBg }}>What's Included:</p>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'rgba(0,0,0,0.7)', lineHeight: 1.6 }}>
                  <li>Dedicated account manager assigned to your case</li>
                  <li>Document preparation and government liaising</li>
                  <li>Real-time status updates via the portal timeline</li>
                </ul>
              </div>
            </div>

            <div style={{ padding: '1.5rem', borderTop: `1px solid ${cardBorderColor}`, display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: 'var(--bg-page)' }}>
              <button onClick={() => setSelectedService(null)} style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: 'none', color: primaryBg, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handlePurchase} style={{ padding: '0.75rem 1.5rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)' }}>
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
