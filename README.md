# Campus Carbon Bangladesh 🇧🇩🌿

**Institutional Greenhouse Gas Emission Inventory, Spatial Footprint Mapping, and Mitigation Platform for Higher Education Institutions in Bangladesh**

Built on peer-reviewed research (*Assessment of Greenhouse Gas Emissions and Mitigation Strategies for a University in Bangladesh*, IEEE Access 2025, DOI: [10.1109/ACCESS.2025.3605517](https://doi.org/10.1109/ACCESS.2025.3605517)), this platform enables universities and higher education institutions across Bangladesh to measure Scope 1, 2, and 3 emissions, calculate per-capita footprints, explore campus spatial footprints on interactive GIS maps, compare inventories fairly against published literature, and simulate interactive mitigation scenarios with persistent action feedback.

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v24)
- **npm** v9+

### 2. Install & Start
```bash
# Clone or navigate to the repository
cd C:\Users\User\campus-carbon-bangladesh

# Run the acceptance test suite
npm test

# Start the full-stack platform (serves API and built UI on port 4000)
npm start
```
Open **[http://localhost:4000](http://localhost:4000)** in your browser.

---

## 🏛️ Methodological Foundation

The platform enforces a strict **three-tier taxonomy** to reconcile historical literature with modern GHG Protocol standards:

1. **Published Study Reference:**
   - Literature baseline values reported verbatim in the published IEEE Access paper:
   - **Headline Figures:** Total = `2,498.80 tCO₂e`, Scope 1 = `742.55 tCO₂e` (29.73%), Scope 2 = `454.14 tCO₂e` (18.18%), Scope 3 = `1,302.14 tCO₂e` (52.10%), Per capita = `0.4671 tCO₂e/person`.
2. **Legacy Study Reproduction:**
   - Replicates exact original spreadsheet formulas (`ULAB GHG Emission Calculations (Scope 1, 2 and 3).xlsx`), adhering to all cell formulas and known arithmetic quirks:
   - **Reproduction Figures:** Total = `2,498.79 tCO₂e`, Scope 1 = `742.55 tCO₂e`, Scope 2 = `454.14 tCO₂e`, Scope 3 = `1,302.10 tCO₂e`, Per capita = `0.4671 tCO₂e/person` (< 0.03% rounding difference).
3. **Current Inventory Method (Default for New Inventories):**
   - Standardized, reviewed GHG Protocol Corporate Standard accounting:
   - **LPG Mass Factor:** Replaces volumetric error ($1.612\text{ kg/L}$ applied to $\text{kg}$) with DEFRA/IPCC mass factor ($3.00\text{ kg CO}_2/\text{kg}$).
   - **Scope 2 Isolation:** Isolates generation in Scope 2 Location-Based ($409.13\text{ tCO}_2\text{e}$); reallocates the 11% T&D grid loss ($45.00\text{ tCO}_2\text{e}$) to Scope 3 Category 3.
   - **Montreal Protocol ODS Disclosure:** Segregates HCFC-22 ($319.48\text{ tCO}_2\text{e}$) into out-of-scope disclosure, keeping core Scope 1 focused on Kyoto gases ($441.18\text{ tCO}_2\text{e}$).
   - **Dimensional Commuting:** Replaces headcount/percentage multipliers with strict distance and passenger-km math, accounting for car occupancy.

For complete cell-by-cell mathematical derivations, see [`docs/source-audit.md`](file:///C:/Users/User/campus-carbon-bangladesh/docs/source-audit.md).

---

## 🗺️ Core Platform Features

* **Overview & Executive Dashboard:**
  - Dynamic KPI metric cards (Total Gross Emissions, Per-Capita Footprint, Scope 1, Scope 2, Scope 3).
  - Methodology tier switcher (`Current Inventory Method`, `Legacy Reproduction`, `Published Literature`).
  - Transparent mathematical audit trail modal displaying the exact formula, emission factor ID, and provenance for every line item.
* **Institutional Setup Wizard:**
  - Configure university metadata, division, campus boundary, operational control consolidation, and academic year.
  - Population headcounts (students, faculty, staff) with automatic validation.
* **Route A (Data Collection Kit):**
  - Downloadable CSV templates for Commuter Surveys, Electricity Billing, Generator Fuels, and Refrigerant Servicing.
  - Ready-to-run Google Apps Script (`CampusCarbon_CommuterSurvey_GoogleFormsGenerator.js`) generating institutional Google Forms surveys in one click.
  - Native in-app commuter survey and bulk CSV parser with live data validation.
* **Route B (Guided Scope Entry):**
  - Step-by-step guided entry for Facilities & Energy Managers covering Stationary Combustion, Fleet Transport, Cooking LPG, AC Fugitives, Grid Electricity, and Commuting.
* **Campus Spatial GIS Map (Leaflet / OpenStreetMap):**
  - Interactive map showing the 5.5-acre permanent campus boundary.
  - Origin commuter density clusters with strict **privacy protection** ($k \ge 5$ threshold: areas with fewer than 5 respondents are suppressed).
* **Fair Literature Comparison (Table 12 Benchmark):**
  - Normalizes emissions per capita and reveals organizational boundary differences.
  - Contextual alerts (e.g. Bournemouth University 0.16 tCO₂e lockdown-quarter distortion; American University of Sharjah 15.7 tCO₂e desert campus).
* **Mitigation Scenario Planner & Feedback Tracker:**
  - Interactive evaluation of *Conventional*, *Incremental*, and *Comprehensive* scenarios.
  - Engineering interaction checks: prevents double-counting energy efficiency vs. solar PV; accounts for electric vehicle charging added to Scope 2; warns against hazardous R-32 drop-in attempts.
  - Persistent collaborative action tracker with department assignments and status updates.
* **Emission Factor Registry Browser:**
  - Searchable registry categorized by provenance: `bangladesh_official`, `bangladesh_research_derived`, `international_proxy`.
* **Printable Summary Report:**
  - Formal publication-grade institutional summary report (`window.print()` / PDF export) with methodology disclosures and audit references.
* **Bilingual Support:**
  - Seamless English / Bangla (বাংলা) language toggle across the entire platform.

---

## 🧪 Automated Acceptance Test Suite

The acceptance test suite validates all 14 failure modes, dimensional invariants, and API contracts:

```bash
npm test
```

**Test Coverage Summary:**
1. **Synthetic Test Run:** Exact verification of 1,000 kWh electricity, 100 L generator diesel, 50 kg cafeteria LPG, 10 bus commuters over 200 days.
2. **Dimensional Consistency:** 1 MWh = 1,000 kWh scaling; LPG mass vs volumetric discrepancy; commuter round-trip and car occupancy division.
3. **GWP Set Application:** IPCC AR6, AR5, AR4 sets applied to pure chemicals without double-applying to composite CO₂e factors.
4. **Legacy Reproduction:** Scope 1 (742.55 tCO₂e), Scope 2 (454.14 tCO₂e), Scope 3 (1,302.10 tCO₂e), Total (2,498.79 tCO₂e), Per capita (0.4671).
5. **Mitigation Engine Interactions:** Solar capping after energy efficiency; EV fleet additions to Scope 2; R-32 equipment replacement safety warnings.
6. **Privacy Enforcement:** $k \ge 5$ privacy suppression on spatial commuting origins.
7. **Live Backend API Endpoints:** Health, institutions, factors, calculate, scenarios, reports, and template downloads.

---

## 📂 Project Structure

```
campus-carbon-bangladesh/
├── client/                     # Frontend Application (React 18 + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/         # UI Components (Setup, Dashboard, Map, Scenarios, etc.)
│   │   ├── App.tsx             # Main Application Container & Navigation
│   │   └── main.tsx            # Entry point
│   └── dist/                   # Production-compiled assets served by server
├── server/                     # Backend API & Storage (Node.js + Express)
│   ├── src/
│   │   ├── db/storage.ts       # Atomic JSON persistence & audit logging
│   │   └── index.ts            # Express REST API routes & static server
│   └── data/db.json            # Seeded database (ULAB 2022 baseline)
├── shared/                     # Shared Core Domain & Calculation Engine
│   ├── engine/
│   │   ├── calculator.ts       # Pure deterministic calculation engine
│   │   └── legacy-reproduction.ts # Exact ULAB 2022 dataset fixture
│   ├── factors/
│   │   ├── gwp.ts              # IPCC AR6, AR5, AR4 Global Warming Potentials
│   │   └── registry.ts         # Verified Emission Factor Registry
│   ├── scenarios/
│   │   └── mitigation.ts       # Mitigation levers & interaction logic
│   ├── i18n/                   # Bilingual English / Bangla dictionary
│   └── types.ts                # TypeScript domain models & interfaces
├── tests/
│   └── acceptance.test.ts      # Automated acceptance test suite (20 tests)
├── docs/
│   ├── source-audit.md         # Cell-by-cell mathematical audit & known issues
│   └── progress.md             # Execution tracker & test verification report
└── package.json                # Root package configuration
```

---

## 📜 Disclaimer
This platform is an institutional self-assessment and research tool designed for higher education institutions in Bangladesh. It does not constitute third-party certification or regulatory assurance. All emission factors and methodologies are transparently cited and documented for institutional and academic review.
