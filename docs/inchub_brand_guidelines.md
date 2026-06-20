# IncHub Group — Brand Identity Guidelines

This document serves as a developer and designer reference for the **IncHub Group** dual-brand system. These guidelines are to be followed **strictly** everywhere in the CRM and associated client portal.

---

## 1. Brand Architecture Overview

IncHub operates two separate legal entities under one parent brand. Each entity has its own primary color, secondary color, accent, background, and tone.
- **Parent Brand**: **IncHub Group** — represented by the **gold connector dot** and shared credentials.
- **Division I**: **Corporate Services** (`Inchub Corporate Services Providers LLC`)
- **Division II**: **Financial Services** (`Inchub Financial Services FZCO`)

> [!IMPORTANT]
> Division-specific colors, styling, logos, and UI markers must **never** be mixed across entities.

---

## 2. Color System Reference

### Shared Parent Brand Elements
- **Parent Gold**: `#B8892A` | RGB(184, 137, 42)
- **Gold Light** (Hover states / button shimmer): `#C9A040` | RGB(201, 160, 64)

### Division I — Corporate Services
*Covers Company Formation, Family Advisory, Governance, Succession, AML, Visa, PRO, Offshore, VARA*

| Variable / Token | Value | Color Code | Usage / Role |
| :--- | :--- | :--- | :--- |
| Primary (Deep Cognac) | `--color-cs-primary` | `#2C1A0E` | Nav bar background, Hero text, dark sections, all headlines |
| Secondary (Cognac Mid) | `--color-cs-mid` | `#4A2E1A` | Hover states, mid panels, card depth |
| Tertiary (Cognac Warm) | `--color-cs-warm` | `#6B3F22` | Borders, dividers, subtle text |
| Accent (Parent Gold) | `--color-cs-accent` | `#B8892A` | Primary CTAs, highlights |
| Background (Warm Parchment) | `--color-cs-bg` | `#F6F1E8` | Page background, light panels, cards |
| Alt Background (Parchment Dark)| `--color-cs-bg-dark` | `#EDE7D8` | Alternate sections, darker background panels |
| Border | `--color-cs-border` | `#DDD4BE` | Section/component borders |

### Division II — Financial Services
*Covers VAT, Corporate Tax, Accounting, Bookkeeping, Payroll, Transfer Pricing, CFO Services, e-Invoicing*

| Variable / Token | Value | Color Code | Usage / Role |
| :--- | :--- | :--- | :--- |
| Primary (Deep Aubergine) | `--color-fs-primary` | `#2A1628` | Nav bar background, Hero text, dark sections, all headlines |
| Secondary (Aubergine Mid) | `--color-fs-mid` | `#3D2040` | Hover states, mid panels, card depth |
| Tertiary (Aubergine Warm) | `--color-fs-warm` | `#5A2D5A` | Borders, dividers, subtle text |
| Accent (Deep Saffron) | `--color-fs-accent` | `#E8760A` | Primary CTAs, highlights, invoice headers |
| Accent Light (Saffron Light) | `--color-fs-accent-light`| `#F09040` | Hover states of saffron, button shimmer |
| Background (Warm White) | `--color-fs-bg` | `#F6F2EE` | Page background, light panels, cards |
| Alt Background (Warm White Dark)| `--color-fs-bg-dark` | `#EDE6DE` | Alternate sections, darker background panels |
| Border | `--color-fs-border` | `#DDD0C4` | Section/component borders |

---

## 3. Typography

Shared across both divisions:

- **Display / Headlines / Section Headings**:
  - Font: `Cormorant` (serif)
  - Weight: `300` - `500` (usually 400 for headings, 300 Italic for card/hero titles)
  - Style: Italic for emphasis (e.g., *Protect*, *Generational Wealth*)
  - Tracking/Letter-spacing: `-0.02em`
  - Sizes:
    - Display XL: `52px`
    - Section Headings: `36px` to `52px`
    - Card Headlines: `22px` to `28px` (Italic, weight 300)
- **Body Copy**:
  - Font: `Inter` (sans-serif)
  - Weight: `300`
  - Size: `13px` - `15px`
  - Line Height: `1.85`
- **UI / Navigation / Label elements**:
  - Font: `Inter` (sans-serif)
  - Style: **ALL CAPS**
  - Weight: `400` - `500`
  - Letter-spacing: `0.16em` to `0.28em` (Tracking: `0.16` - `0.28em`)
  - Sizes: `10px` - `12px`

---

## 4. Logo & Connector Dot

- The parent logo `Inc·Hub` has a **Gold** dot `#B8892A`.
- The division logo/header shifts dot color based on the context:
  - **Corporate Services**: Dot is **Gold** (`#B8892A`). Subtext "Corporate Services" in lightweight Cormorant.
  - **Financial Services**: Dot shifts to **Saffron** (`#E8760A`). Subtext "Financial Services" in lightweight Cormorant.

> [!CAUTION]
> **NEVER MIX THEM**: Do not use the saffron dot on Corporate Services, and do not use the gold dot on Financial Services. The dot color is the primary brand differentiator.

---

## 5. Strict Application Rules

### Do's:
1. **Corporate Services Pages**: Use Deep Cognac (`#2C1A0E`) + Gold (`#B8892A`) as accents, and Warm Parchment (`#F6F1E8`) as backgrounds.
2. **Financial Services / Accounting Pages**: Use Deep Aubergine (`#2A1628`) + Saffron (`#E8760A`) as accents, and Warm White (`#F6F2EE`) as backgrounds.
3. **CRM Pipeline Tags**: Tag every lead/deal/client record with the correct division color:
   - **Corporate tags**: Cognac background (`rgba(44, 26, 14, 0.08)`) and Cognac text, with a circular dot in primary/mid/warm/gold depending on stage.
   - **Financial tags**: Aubergine background (`rgba(42, 22, 40, 0.08)`) and Aubergine text, with a circular dot in primary/mid/warm/saffron depending on stage.
4. **Group Proposals**: Use the parent brand theme (Gold dot connector, Deep Cognac text, Parchment background) if a proposal spans both divisions, with clear styling sections for each.

### Don'ts:
1. **Never use blue, green, or generic browser colors** for layout or component designs. The palette is strictly bounded.
2. **Never mix division palettes** on a specific document (e.g. do not put a saffron dot on a Corporate Services invoice).
3. **Never display the logo without its sub-label** ("Corporate Services" or "Financial Services") when appearing on division-specific pages/materials.
