'use client';

import React, { useState } from 'react';
import { usePermission } from '@/context/PermissionContext';

export default function HelpCentrePage() {
  const { currentBrand } = usePermission();
  const isFinancial = currentBrand === 'financial';
  const primaryBg = isFinancial ? '#2A1628' : '#2C1A0E';
  const accentColor = isFinancial ? '#E8760A' : '#B8892A';
  const cardBorderColor = 'var(--border-subtle)';

  const categories = [
    'Getting Started',
    'UAE Business Setup Guides',
    'Free Zone Comparison',
    'Visas & Immigration',
    'Accounting & VAT/CT',
    'Payments & Invoices',
    'IncHub Services Overview'
  ];

  const [activeCategory, setActiveCategory] = useState('Getting Started');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(1); // 1 is open by default

  const faqs = [
    { id: 1, category: 'Getting Started', q: 'How long does the company setup process take?', a: 'The timeline varies depending on the jurisdiction. Free Zone setups typically take 3-7 working days, whereas Mainland setups can take 2-4 weeks due to external government approvals.' },
    { id: 2, category: 'Getting Started', q: 'What documents are required to start?', a: 'You will need a passport copy, a passport-size photograph, and 3 proposed company names. We will handle the rest.' },
    { id: 3, category: 'Getting Started', q: 'Can I track my application status?', a: 'Yes! You can track the real-time status of your application in the "Project Tracker" section of this portal.' },
    
    { id: 4, category: 'Visas & Immigration', q: 'What is a Golden Visa?', a: 'The UAE Golden Visa is a long-term residence visa (up to 10 years) for investors, entrepreneurs, specialized talents, and researchers.' },
    { id: 5, category: 'Visas & Immigration', q: 'Can I sponsor my family?', a: 'Yes, once your residency visa is stamped and you obtain your Emirates ID, you can apply to sponsor your spouse, children, and parents.' },

    { id: 6, category: 'Accounting & VAT/CT', q: 'When do I need to register for VAT?', a: 'Mandatory registration applies when taxable supplies and imports exceed AED 375,000 in the last 12 months.' },
    { id: 7, category: 'Accounting & VAT/CT', q: 'Is Corporate Tax applicable to Free Zones?', a: 'Yes, all UAE businesses are subject to the Corporate Tax regime, though Qualifying Free Zone Persons may benefit from a 0% rate on qualifying income.' },
  ];

  const guides = [
    { id: 1, title: 'Mainland vs Free Zone: Which is right for you?', desc: 'A comprehensive guide to choosing the right jurisdiction for your business model.', time: '5 min read' },
    { id: 2, title: 'Understanding UAE Corporate Tax', desc: 'Everything you need to know about the 9% CT rate and exemptions.', time: '8 min read' },
    { id: 3, title: 'How to Open a Corporate Bank Account', desc: 'Checklists and best practices to ensure smooth bank compliance.', time: '6 min read' },
  ];

  const freeZones = [
    { name: 'DMCC (Dubai Multi Commodities Centre)', cost: '$$$', time: '2-3 Weeks', bestFor: 'Trading, Commodities, Crypto' },
    { name: 'IFZA (International Free Zone Authority)', cost: '$$', time: '3-5 Days', bestFor: 'Consulting, E-commerce, General Services' },
    { name: 'Meydan Free Zone', cost: '$$', time: '4-7 Days', bestFor: 'Digital Business, Freelancers, Media' },
    { name: 'RAKEZ (Ras Al Khaimah)', cost: '$', time: '3-5 Days', bestFor: 'Manufacturing, Industrial, Cost-Effective Setup' },
  ];

  const filteredFaqs = faqs.filter(f => f.category === activeCategory && f.q.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1536px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Area & Search */}
      <div style={{
        paddingBottom: '1.5rem', borderBottom: `1px solid ${cardBorderColor}`, display: 'flex', flexDirection: 'column', gap: '1.5rem'
      }}>
        <div>
          <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(44, 26, 14, 0.5)', fontFamily: 'Inter, sans-serif' }}>
            Support & Resources
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginTop: '0.375rem' }}>
            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 300, letterSpacing: '-0.02em', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)' }}>
              Help Centre
            </h1>
          </div>
        </div>

        {/* Prominent Search Bar */}
        <div style={{ position: 'relative', maxWidth: '800px' }}>
          <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(0,0,0,0.4)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <input 
            type="text" 
            placeholder="Search for answers across FAQs, guides, and services..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              width: '100%', padding: '1.25rem 1rem 1.25rem 3rem', fontSize: '1rem', color: primaryBg,
              background: '#ffffff', border: `1px solid ${cardBorderColor}`, borderRadius: '8px',
              outline: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', transition: 'border-color 200ms ease'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start' }}>
        
        {/* Category Sidebar */}
        <div style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {categories.map(cat => {
            const isActive = activeCategory === cat;
            return (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.875rem 1rem', background: isActive ? 'rgba(0,0,0,0.04)' : 'transparent', 
                  border: 'none', borderRadius: '6px', cursor: 'pointer', textAlign: 'left',
                  color: isActive ? primaryBg : 'rgba(0,0,0,0.6)', fontWeight: isActive ? 600 : 500, fontSize: '0.9375rem',
                  transition: 'all 200ms ease'
                }}
              >
                {cat}
                {isActive && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>}
              </button>
            )
          })}
        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* FAQs Accordion */}
          {(activeCategory === 'Getting Started' || activeCategory === 'Visas & Immigration' || activeCategory === 'Accounting & VAT/CT') && (
            <div>
              <h2 style={{ margin: '0 0 1.25rem', fontSize: '1.25rem', fontWeight: 600, color: primaryBg, fontFamily: 'var(--font-serif)' }}>Frequently Asked Questions</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {filteredFaqs.length > 0 ? filteredFaqs.map(faq => {
                  const isOpen = openFaq === faq.id;
                  return (
                    <div key={faq.id} style={{ background: '#ffffff', border: `1px solid ${cardBorderColor}`, borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                      <button 
                        onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                        style={{ 
                          width: '100%', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left'
                        }}>
                        <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: primaryBg }}>{faq.q}</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms ease', color: 'rgba(0,0,0,0.4)' }}>
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </button>
                      {isOpen && (
                        <div style={{ padding: '0 1.25rem 1.25rem', fontSize: '0.9375rem', color: 'rgba(0,0,0,0.7)', lineHeight: 1.6 }}>
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                }) : (
                  <p style={{ color: 'rgba(0,0,0,0.5)', fontSize: '0.9375rem' }}>No results found for "{searchQuery}".</p>
                )}
              </div>
            </div>
          )}

          {/* Business Guides */}
          {activeCategory === 'UAE Business Setup Guides' && (
            <div>
              <h2 style={{ margin: '0 0 1.25rem', fontSize: '1.25rem', fontWeight: 600, color: primaryBg, fontFamily: 'var(--font-serif)' }}>In-Depth Guides</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {guides.map(guide => (
                  <div key={guide.id} style={{ background: '#ffffff', border: `1px solid ${cardBorderColor}`, borderRadius: '8px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.02)', transition: 'transform 200ms ease' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: accentColor }}>{guide.time}</span>
                    <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: primaryBg, lineHeight: 1.4 }}>{guide.title}</h3>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'rgba(0,0,0,0.6)', lineHeight: 1.5 }}>{guide.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Free Zone Comparison */}
          {activeCategory === 'Free Zone Comparison' && (
            <div>
              <h2 style={{ margin: '0 0 1.25rem', fontSize: '1.25rem', fontWeight: 600, color: primaryBg, fontFamily: 'var(--font-serif)' }}>Jurisdiction Comparison</h2>
              <div style={{ background: '#ffffff', border: `1px solid ${cardBorderColor}`, borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.02)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-page)', borderBottom: `1px solid ${cardBorderColor}` }}>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'left', fontWeight: 600, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', fontSize: '0.75rem' }}>Free Zone</th>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'left', fontWeight: 600, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', fontSize: '0.75rem' }}>Relative Cost</th>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'left', fontWeight: 600, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', fontSize: '0.75rem' }}>Avg. Setup Time</th>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'left', fontWeight: 600, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', fontSize: '0.75rem' }}>Best For</th>
                    </tr>
                  </thead>
                  <tbody>
                    {freeZones.map((fz, idx, arr) => (
                      <tr key={fz.name} style={{ borderBottom: idx === arr.length - 1 ? 'none' : `1px solid ${cardBorderColor}` }}>
                        <td style={{ padding: '1.25rem', color: primaryBg, fontWeight: 600 }}>{fz.name}</td>
                        <td style={{ padding: '1.25rem', color: 'rgba(0,0,0,0.8)', fontWeight: 700, fontFamily: 'monospace' }}>{fz.cost}</td>
                        <td style={{ padding: '1.25rem', color: 'rgba(0,0,0,0.7)' }}>{fz.time}</td>
                        <td style={{ padding: '1.25rem', color: 'rgba(0,0,0,0.7)' }}>{fz.bestFor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* IncHub Services Overview */}
          {activeCategory === 'IncHub Services Overview' && (
            <div>
              <h2 style={{ margin: '0 0 1.25rem', fontSize: '1.25rem', fontWeight: 600, color: primaryBg, fontFamily: 'var(--font-serif)' }}>Services Overview</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {['Company Formation', 'Visa Processing', 'Corporate Banking', 'Accounting & Tax', 'Compliance & AML'].map(svc => (
                  <div key={svc} style={{ background: '#ffffff', border: `1px solid ${cardBorderColor}`, borderRadius: '6px', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                    <span style={{ fontWeight: 600, color: primaryBg, fontSize: '0.9375rem' }}>{svc}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Fallback Support Banner */}
      <div style={{ marginTop: '3rem', background: 'var(--bg-page)', border: `1px solid ${cardBorderColor}`, padding: '2rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', textAlign: 'center' }}>
        <div>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 600, color: primaryBg, fontFamily: 'var(--font-serif)' }}>Didn't find what you need?</h2>
          <p style={{ margin: 0, fontSize: '0.9375rem', color: 'rgba(0,0,0,0.6)' }}>Our support team and AI assistant are available to help you immediately.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.75rem 1.25rem', background: primaryBg, color: '#ffffff',
            border: 'none', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600,
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>
            Ask AI Assistant
          </button>
          <button style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.75rem 1.25rem', background: '#ffffff', color: primaryBg,
            border: `1px solid ${cardBorderColor}`, borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600,
            cursor: 'pointer'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            Message Support Team
          </button>
        </div>
      </div>

    </div>
  );
}
