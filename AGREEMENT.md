# Software Development Service Agreement - Project Blueprint Reference

This document contains the official Software Development Service Agreement between IncHub Corporate Services Providers LLC and Developer. It serves as a continuous reference for the agent AI and developers for the implementation of the CRM workspace modules.

---

## 1. Scope of Work (Summary of Sheets)

- **(a) Accounting Operations (Sheet 6 & 7):**
  - Monthly bookkeeping tracker with 10-item KYC compliance checklist (color-coded status, 24-hour refresh) and month-lock gate enforcing sequential month closure.
  - Transaction threshold logic across 3 consecutive months with escalating client notifications and addendum trigger.
  - VAT voluntary registration log starting from AED 185,000, plus quarterly tracking and mandatory registration alerts at AED 300K/350K/375K.
  - Corporate Tax (CT) filing with year-end document archive.
  - 9-Stage AI Bookkeeping Engine:
    1. OCR document ingestion
    2. Bank ledger construction
    3. Data extraction (with confidence scores)
    4. 6-level matching engine
    5. Reconciliation workspace (with in-workspace vendor/supplier creation)
    6. Suspense identification
    7. QuickBooks Online OAuth push
- **(b) Client Portal (Sheet 5):** 19 features across 7 unlock stages.
- **(c) AML/CFT Screening Module (Sheet 16):** RLS tenant isolation, CDD classification, 6 categories, 22 official data sources.
- **(d) Dual Pipelines (Sheets 2-4):** Dual sales (Corporate/Accounting) and operational pipelines.
- **(e) Builders & Admin Panel (Sheets 10-12):** Form builder, template builder, 11 admin settings modules.
- **(f) Marketing & Automations (Sheets 8-9):** 20 nurture tracks, 64 rules.
- **(g) HR Module (Sheet 14):** Attendance login/logout, 5 leave types, performance scores, break management with employee-configured intervals.
- **(h) AI Chatbot Module (Sheet 18):** Internal team chat, client portal chat, visitor chat, meeting auto-join transcription/summaries.
- **(i) Modules (Sheet 15):** Price book, referrals, recurring payments tracker, NPS.
- **(j) Project Templates (Sheet 17):** 10 templates.

---

## 2. Milestone 1 Focus Detail

### Accounting Operations & AI Document Processing
- **KYC Compliance Checklist:**
  - 10 specific checklist items.
  - Status color-coded; refreshes every 24 hours.
  - Expired item (e.g. Passport) forces a persistent RED indicator across all screens showing that client record.
- **Month-Lock Gate:**
  - Enforces sequential closure constraints.
  - Month N cannot open until month N-1 is complete (marked closed with report and invoice sent).
- **Transaction Threshold Logic:**
  - Track count against baseline (e.g. 250) across 3 consecutive months.
  - Month 3 exceeding trigger sends escalating notifications and forces an addendum/pricing adjustment review trigger.
- **VAT Quarter Tracker:**
  - Voluntary Registration Log starts logging from AED 185,000.
  - Alert levels: AED 300K (Voluntary), AED 350K (Critical), AED 375K (Mandatory / Urgent).
- **CT Filing Tracker:**
  - Dynamic year-end intake form.
  - Year-end document archive (CT return, payment receipt, financial statements, monthly reports/invoices) visible to client in portal.
- **Google Drive Integration:**
  - Auto-create client folder hierarchies per client per month.
- **9-Stage AI Engine:**
  - OCR extraction, bank ledger construction, confidence scores, 6-level matching checks, reconciliation grid with *in-workspace vendor creation*, suspense handling, and QuickBooks Online OAuth push.

---

## 3. Technology Stack Reference

- **Frontend:** React.js / Next.js
- **Backend:** Node.js with Express.js
- **Database:** PostgreSQL (with Row-Level Security for multi-tenant isolation)
- **UI:** Tailwind CSS (Custom components reflecting IncHub dual-brand system)
- **Integrations:**
  - WhatsApp Business API
  - Telr / PayTabs gateways
  - SendGrid SMTP
  - Cal.com
  - Google Drive API
  - QuickBooks Online API (OAuth 2.0)
  - Google Meet / Zoom / Teams APIs
  - Speech-to-Text: Whisper or Google Speech-to-Text
  - Vector DB: Chroma DB or Qdrant
  - LLM API: Anthropic Claude (Adverse media screening & chatbot)
- **Document Gen:** Puppeteer / PDFKit, ExcelJS / SheetJS
