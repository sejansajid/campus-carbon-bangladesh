# Campus Carbon Bangladesh: Build Progress & Milestone Tracker

## Project Overview
* **Application:** Campus Carbon Bangladesh (HEI GHG Inventory, Spatial Mapping & Mitigation Platform)
* **Target Audience:** Universities, researchers, sustainability officers, facilities staff, and HEI decision-makers across Bangladesh.
* **Stack:**
  - **Engine & Shared Core:** TypeScript deterministic calculation engine (`shared/engine/calculator.ts`), Factor Registry with full provenance metadata (`shared/factors/registry.ts`), IPCC AR6/AR5/AR4 GWP sets (`shared/factors/gwp.ts`), Mitigation evaluation engine with interaction checks (`shared/scenarios/mitigation.ts`), Bilingual English/Bangla dictionary (`shared/i18n/`).
  - **Backend API & Data Persistence:** Node.js, Express, Atomic JSON database with audit trails (`server/src/db/storage.ts`), REST API for institutions, boundaries, activity batches, commuter surveys, peer comparisons, and sustainability action feedback.
  - **Frontend Application:** React 18, Vite, Tailwind CSS, Leaflet OpenStreetMap GIS mapping, Lucide icons, Bilingual toggle, Printable report generation.
  - **Acceptance Test Suite:** Built-in test runner (`tsx --test tests/acceptance.test.ts`) covering all 14 prompt invariants, failure modes, legacy reproduction, dimensional rules, and API endpoints.

---

## Milestone Progress Matrix

| Milestone | Description | Status | Evidence / Artifacts |
| :--- | :--- | :--- | :--- |
| **Milestone 1** | Evidence & Method Audit | **COMPLETED** | `docs/source-audit.md`, cell-by-cell matrix, 9 known issues analyzed, reference archive extracted. |
| **Milestone 2** | Working Vertical Slice | **COMPLETED** | Typed domain models (`shared/types.ts`), Factor registry (`shared/factors/`), Setup wizard, Route A & B data collection, Scope 1/2/3 calculations, Hotspot breakdown dashboard. |
| **Milestone 3** | Complete Core Workflows | **COMPLETED** | Template downloaders (CSV & Google Apps Script generator), Bulk CSV parser with validation, Interactive Leaflet Campus Map with $k \ge 5$ privacy suppression, Table 12 Peer comparison engine with lockdown caveat flags, Mitigation scenario planner & action feedback tracker. |
| **Milestone 4** | Multi-Institution Readiness | **COMPLETED** | Multi-campus boundary management, atomic JSON persistence (`server/data/db.json`), versioned calculation runs with formula audit traces, opt-in public comparison, and standalone fallback operation without external paid APIs. |
| **Milestone 5** | Verification & Handover | **COMPLETED** | Acceptance test suite (`tests/acceptance.test.ts`) with 20/20 passing tests, single-command launch, comprehensive README and documentation. |

---

## Verified Methodological Results

### 1. Legacy Reproduction Target vs Engine Verification
* **Scope 1:** 742.55 tCO₂e (Paper: 742.55 tCO₂e; Sheet: 742.551085 tCO₂e)
* **Scope 2:** 454.14 tCO₂e (Paper: 454.14 tCO₂e; Sheet: 454.136463 tCO₂e)
* **Scope 3:** 1,302.10 tCO₂e (Paper: 1,302.14 tCO₂e; Sheet: 1,302.102817 tCO₂e)
* **Total Gross Emissions:** 2,498.79 tCO₂e (Paper: 2,498.80 tCO₂e; Sheet: 2,498.790365 tCO₂e)
* **Per Capita Footprint:** 0.4671 tCO₂e/person (exact match with paper's 0.4671)

### 2. Current Standardized Inventory Method Improvements
* **LPG Dimensional Correction:** Replaced volumetric factor error ($1.612\text{ kg/L}$ applied to $\text{kg}$) with DEFRA/IPCC mass factor ($3.00\text{ kg CO}_2/\text{kg}$), adjusting cafeteria emissions from $20.65\text{ tCO}_2\text{e}$ to $38.20\text{ tCO}_2\text{e}$.
* **Grid Scope 2 Isolation:** Removed $1.11$ multiplier embedded in Scope 2. Generation ($409.13\text{ tCO}_2\text{e}$) remains in Scope 2 Location-Based; T&D losses ($45.00\text{ tCO}_2\text{e}$) reallocated to Scope 3 Category 3.
* **Montreal Protocol ODS Disclosure:** Segregated HCFC-22 ($319.48\text{ tCO}_2\text{e}$) into out-of-scope informational disclosure per standard UNFCCC/Kyoto reporting guidelines, leaving core Scope 1 at $441.18\text{ tCO}_2\text{e}$ (or $423.07\text{ tCO}_2\text{e}$ under legacy LPG).
* **Commuting Formulas:** Eliminated headcount/percentage factors in vehicle CH₄/N₂O formulas; enforced strict dimensional vehicle-km and passenger-km math with car occupancy division.

### 3. Mitigation Engine Interaction Rules Enforced
* Energy efficiency reductions (HVAC/LED) are deducted prior to sizing solar PV self-consumption to prevent double-counting.
* Electrification of shuttle minibuses reduces Scope 3 private vehicle emissions but dynamically adds charging electricity demand to Scope 2.
* AC transition to R-32 or R-290 verifies equipment replacement flag and warns against hazardous drop-in attempts.

---

## Test Execution Verification

```bash
$ npm test

> campus-carbon-bangladesh@1.0.0 test
> tsx --test tests/**/*.test.ts

▶ 1. Synthetic Test Institutional Run (Section 14)
  ✔ Exact mathematical verification of synthetic baseline run (0.78ms)
✔ 1. Synthetic Test Institutional Run (Section 14) (1.44ms)
▶ 2. Dimensional Consistency & Unit Conversion Invariants
  ✔ Electricity unit scaling: 1 MWh = 1000 kWh (0.24ms)
  ✔ LPG mass vs volume distinction: mass factor differs from volumetric factor (0.24ms)
  ✔ Commuting dimensional math: round-trip, occupancy division, and zero active emissions (0.16ms)
✔ 2. Dimensional Consistency & Unit Conversion Invariants (0.80ms)
▶ 3. GWP Set & Provenance Invariants
  ✔ AR6, AR5, AR4 values correctly defined and non-zero (0.21ms)
  ✔ Registry contains verified emission factors across provenance categories (0.12ms)
✔ 3. GWP Set & Provenance Invariants (0.44ms)
▶ 4. Legacy Reproduction Fixture vs Published Paper Figures
  ✔ Exact reproduction of ULAB 2022 dataset matches published figures (0.24ms)
  ✔ Current Standardized Method correctly isolates Scope 2 generation and Montreal Protocol R-22 (0.16ms)
✔ 4. Legacy Reproduction Fixture vs Published Paper Figures (0.53ms)
▶ 5. Mitigation Scenario Engine & Interaction Invariants
  ✔ Conventional Scenario (50 kWp solar + 1 hybrid minibus) (0.42ms)
  ✔ Interaction check: Energy efficiency is applied prior to solar sizing (0.20ms)
  ✔ Interaction check: Electric minibus fleet adds charging electricity to Scope 2 (0.12ms)
  ✔ Interaction check: Refrigerant replacement without equipment triggers critical safety warning (0.09ms)
✔ 5. Mitigation Scenario Engine & Interaction Invariants (0.96ms)
▶ 6. Spatial Clustering & Privacy Suppression Invariant
  ✔ Commuter origins with k < 5 respondents are suppressed from public spatial maps (0.14ms)
✔ 6. Spatial Clustering & Privacy Suppression Invariant (0.18ms)
▶ 7. Live Backend API Acceptance Tests
  ✔ GET /api/health responds with status ok and version (40.37ms)
  ✔ GET /api/institutions returns seeded institutions including ULAB (2.89ms)
  ✔ GET /api/factors returns full registry with provenance categories (9.22ms)
  ✔ POST /api/calculate executes deterministic calculation and returns audit trail (17.34ms)
  ✔ POST /api/scenarios/evaluate computes multi-lever mitigation projection (3.10ms)
  ✔ GET /api/reports/:id returns complete printable payload with methodology disclosures (3.47ms)
  ✔ GET /api/templates/commuter and /api/templates/google-forms-script deliver valid files (4.99ms)
✔ 7. Live Backend API Acceptance Tests (81.77ms)
ℹ tests 20
ℹ suites 7
ℹ pass 20
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 265.20ms
```
