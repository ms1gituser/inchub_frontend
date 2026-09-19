/**
 * IncHub Lead Widget — Public Embeddable Chat Widget
 * 
 * Usage (on any website):
 *   <script
 *     src="https://crm.inchub.ae/widget.js"
 *     data-backend="https://crm.inchub.ae"
 *     data-color="#b8892a"
 *     data-company="IncHub Financial Services"
 *   ></script>
 */
(function () {
  'use strict';

  const script = document.currentScript || document.querySelector('script[data-backend]');
  const BACKEND = (script && script.getAttribute('data-backend')) || window.location.origin;
  const BRAND_COLOR = (script && script.getAttribute('data-color')) || '#b8892a';
  const COMPANY = (script && script.getAttribute('data-company')) || 'IncHub';

  const STEPS = ['name', 'email', 'jurisdiction', 'visa', 'done'];
  const JURISDICTIONS = [
    { value: 'SHAMS', label: 'SHAMS — from AED 5,750' },
    { value: 'IFZA', label: 'IFZA — from AED 9,000' },
    { value: 'DMCC', label: 'DMCC — from AED 18,500' },
    { value: 'Mainland', label: 'Mainland DED (variable)' },
    { value: 'Other', label: 'Other / Not Sure' }
  ];

  let step = 0;
  let data = { name: '', email: '', jurisdiction: '', visa_count: 0, interest: 'UAE Company Setup' };
  let open = false;

  // ── Inject Styles ──────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #ih-widget-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: ${BRAND_COLOR};
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      color: #fff;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    #ih-widget-btn:hover { transform: scale(1.1); box-shadow: 0 8px 30px rgba(0,0,0,0.4); }
    #ih-widget-panel {
      position: fixed;
      bottom: 96px;
      right: 24px;
      width: 360px;
      max-height: 520px;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 12px 50px rgba(0,0,0,0.25);
      z-index: 99998;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
      transform-origin: bottom right;
    }
    #ih-widget-panel.hidden { transform: scale(0.8) translateY(20px); opacity: 0; pointer-events: none; }
    .ih-header {
      background: linear-gradient(135deg, #110c08 0%, #2a1a0e 100%);
      padding: 18px 20px 14px;
      color: #fff;
    }
    .ih-header h3 { margin: 0 0 4px; font-size: 16px; font-weight: 700; color: ${BRAND_COLOR}; }
    .ih-header p { margin: 0; font-size: 12px; opacity: 0.7; }
    .ih-body { padding: 20px; }
    .ih-progress { display: flex; gap: 6px; margin-bottom: 20px; }
    .ih-dot {
      height: 4px; flex: 1; border-radius: 4px;
      background: #e5e7eb; transition: background 0.3s;
    }
    .ih-dot.active { background: ${BRAND_COLOR}; }
    .ih-label { font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 8px; }
    .ih-input {
      width: 100%; padding: 10px 12px; border: 1.5px solid #e5e7eb; border-radius: 8px;
      font-size: 14px; outline: none; box-sizing: border-box; transition: border 0.2s;
    }
    .ih-input:focus { border-color: ${BRAND_COLOR}; }
    .ih-select-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .ih-select-btn {
      padding: 10px 8px; font-size: 12px; border: 1.5px solid #e5e7eb; border-radius: 8px;
      background: #f9fafb; cursor: pointer; text-align: center; transition: all 0.2s; line-height: 1.3;
    }
    .ih-select-btn:hover, .ih-select-btn.selected { border-color: ${BRAND_COLOR}; background: #fef9ef; color: #92400e; font-weight: 600; }
    .ih-btn {
      width: 100%; padding: 12px; border-radius: 8px; border: none; cursor: pointer;
      font-size: 14px; font-weight: 700; margin-top: 16px;
      background: ${BRAND_COLOR}; color: #fff;
      transition: opacity 0.2s, transform 0.1s;
    }
    .ih-btn:hover { opacity: 0.9; }
    .ih-btn:active { transform: scale(0.98); }
    .ih-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .ih-done { text-align: center; padding: 10px 0; }
    .ih-done .ih-check { font-size: 48px; margin-bottom: 12px; }
    .ih-done h4 { margin: 0 0 8px; font-size: 18px; color: #111; }
    .ih-done p { margin: 0 0 4px; font-size: 13px; color: #6b7280; }
    .ih-done a { color: ${BRAND_COLOR}; font-weight: 600; font-size: 13px; }
    .ih-error { font-size: 12px; color: #dc2626; margin-top: 6px; }
    .ih-number-row { display: flex; align-items: center; gap: 12px; }
    .ih-num-btn { width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid #e5e7eb; background: #f9fafb; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center; }
    .ih-num-btn:hover { border-color: ${BRAND_COLOR}; }
    .ih-num-val { font-size: 20px; font-weight: 700; color: #111; min-width: 32px; text-align: center; }
  `;
  document.head.appendChild(style);

  // ── Create DOM ─────────────────────────────────────────────────────────────
  const btn = document.createElement('button');
  btn.id = 'ih-widget-btn';
  btn.title = `Chat with ${COMPANY}`;
  btn.innerHTML = '💬';
  document.body.appendChild(btn);

  const panel = document.createElement('div');
  panel.id = 'ih-widget-panel';
  panel.className = 'hidden';
  document.body.appendChild(panel);

  // ── Render ─────────────────────────────────────────────────────────────────
  let bookingLink = '';

  function render() {
    const stepName = STEPS[step];
    const dots = STEPS.slice(0, -1).map((_, i) =>
      `<div class="ih-dot${i <= step ? ' active' : ''}"></div>`
    ).join('');

    let body = '';

    if (stepName === 'name') {
      body = `
        <div class="ih-label">What's your name?</div>
        <input class="ih-input" id="ih-name" type="text" placeholder="Your full name" value="${data.name}" />
        <button class="ih-btn" id="ih-next">Continue →</button>
      `;
    } else if (stepName === 'email') {
      body = `
        <div class="ih-label">What's your email address?</div>
        <input class="ih-input" id="ih-email" type="email" placeholder="you@company.com" value="${data.email}" />
        <button class="ih-btn" id="ih-next">Continue →</button>
      `;
    } else if (stepName === 'jurisdiction') {
      const opts = JURISDICTIONS.map(j =>
        `<button class="ih-select-btn${data.jurisdiction === j.value ? ' selected' : ''}" data-val="${j.value}">${j.label}</button>`
      ).join('');
      body = `
        <div class="ih-label">Which jurisdiction interests you?</div>
        <div class="ih-select-grid">${opts}</div>
        <button class="ih-btn" id="ih-next" ${!data.jurisdiction ? 'disabled' : ''}>Continue →</button>
      `;
    } else if (stepName === 'visa') {
      body = `
        <div class="ih-label">How many investor visas do you need?</div>
        <div class="ih-number-row">
          <button class="ih-num-btn" id="ih-minus">−</button>
          <span class="ih-num-val" id="ih-visa-val">${data.visa_count}</span>
          <button class="ih-num-btn" id="ih-plus">+</button>
        </div>
        <button class="ih-btn" id="ih-submit" style="margin-top:20px;">Book Free Consultation 🗓</button>
      `;
    } else if (stepName === 'done') {
      body = `
        <div class="ih-done">
          <div class="ih-check">✅</div>
          <h4>You're all set, ${data.name.split(' ')[0]}!</h4>
          <p>Our setup expert will reach out to <strong>${data.email}</strong> within 24 hours.</p>
          ${bookingLink ? `<p style="margin-top:12px;"><a href="${bookingLink}" target="_blank">📅 Book an immediate call →</a></p>` : ''}
        </div>
      `;
    }

    panel.innerHTML = `
      <div class="ih-header">
        <h3>${COMPANY}</h3>
        <p>UAE Company Setup &amp; Compliance Experts</p>
      </div>
      <div class="ih-body">
        ${stepName !== 'done' ? `<div class="ih-progress">${dots}</div>` : ''}
        ${body}
      </div>
    `;

    // Bind events
    const nextBtn = document.getElementById('ih-next');
    if (nextBtn) {
      nextBtn.addEventListener('click', handleNext);
    }
    const submitBtn = document.getElementById('ih-submit');
    if (submitBtn) {
      submitBtn.addEventListener('click', handleSubmit);
    }
    const minus = document.getElementById('ih-minus');
    if (minus) {
      minus.addEventListener('click', () => { data.visa_count = Math.max(0, data.visa_count - 1); renderVisa(); });
    }
    const plus = document.getElementById('ih-plus');
    if (plus) {
      plus.addEventListener('click', () => { data.visa_count = Math.min(20, data.visa_count + 1); renderVisa(); });
    }
    // Jurisdiction buttons
    document.querySelectorAll('.ih-select-btn').forEach(function(b) {
      b.addEventListener('click', function() {
        data.jurisdiction = b.getAttribute('data-val');
        const nextB = document.getElementById('ih-next');
        if (nextB) nextB.removeAttribute('disabled');
        document.querySelectorAll('.ih-select-btn').forEach(function(x) { x.classList.remove('selected'); });
        b.classList.add('selected');
      });
    });
  }

  function renderVisa() {
    const el = document.getElementById('ih-visa-val');
    if (el) el.textContent = String(data.visa_count);
  }

  function handleNext() {
    const stepName = STEPS[step];
    if (stepName === 'name') {
      const val = (document.getElementById('ih-name') as HTMLInputElement)?.value?.trim();
      if (!val) return;
      data.name = val;
    } else if (stepName === 'email') {
      const val = (document.getElementById('ih-email') as HTMLInputElement)?.value?.trim();
      if (!val || !val.includes('@')) return;
      data.email = val;
    }
    step++;
    render();
  }

  async function handleSubmit() {
    const submitBtn = document.getElementById('ih-submit') as HTMLButtonElement;
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Submitting...'; }

    try {
      const res = await fetch(`${BACKEND}/api/leads/qualify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          jurisdiction: data.jurisdiction,
          visa_count: data.visa_count,
          interest: data.interest,
          source: 'widget'
        })
      });
      const json = await res.json() as any;
      bookingLink = json?.data?.booking_link || '';
    } catch (err) {
      console.error('[IncHub Widget] Submission error:', err);
    }

    step++;
    render();
  }

  function togglePanel() {
    open = !open;
    panel.classList.toggle('hidden', !open);
    btn.innerHTML = open ? '✕' : '💬';
    if (open && step === 0) render();
  }

  btn.addEventListener('click', togglePanel);
})();
