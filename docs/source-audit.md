# Source Audit: Bangladesh Higher Education Institution (HEI) Carbon Assessment

**Audited Paper:** *Assessment of Greenhouse Gas Emissions and Mitigation Strategies for a University in Bangladesh*  
**Publication:** IEEE Access, Vol. 13, 2025. DOI: [10.1109/ACCESS.2025.3605517](https://doi.org/10.1109/ACCESS.2025.3605517)  
**Authors:** Mirza Rasheduzzaman, Md. Sajid Hasan, Nayma Akther Jahan, Atik Jawad, M. Mofazzal Hossain  
**Institution Studied:** University of Liberal Arts Bangladesh (ULAB), Dhaka, Bangladesh  
**Reporting Period:** Calendar Year 2022 (noted in source records; titled as 2022 or 2022–2023 in paper tables)  
**Campus Population:** 5,350 individuals (4,860 students, 240 faculty members, 250 administrative staff)

---

## 1. Product Taxonomy & Reporting Boundaries

Throughout **Campus Carbon Bangladesh**, data and calculation traces are strictly classified into three distinct tiers:

1. **Published Study Reference:**
   * Values reported verbatim in the published IEEE Access paper. Displayed exclusively as historical literature benchmarks.
   * *Reported Headline Figures:* Total = **2,498.80 tCO₂e**, Scope 1 = **742.55 tCO₂e** (29.73%), Scope 2 = **454.14 tCO₂e** (18.18%), Scope 3 = **1,302.14 tCO₂e** (52.10%), Per capita = **0.4671 tCO₂e/person**.
   * *Note on Stated vs. Sum:* $742.55 + 454.14 + 1302.14 = 2,498.83\text{ tCO}_2\text{e}$. The rounded scope components in the paper text sum to 2,498.83 tCO₂e, while the published abstract states 2,498.80 tCO₂e.

2. **Legacy Study Reproduction:**
   * Reconstructs the exact calculations performed in the research spreadsheets (`ULAB GHG Emission Calculations (Scope 1, 2 and 3).xlsx`), adhering to all original cell formulas and assumptions (including known arithmetic and dimensional anomalies).
   * *Workbook Cached Totals:* Total = **2,498.790365 tCO₂e**, Scope 1 = **742.551085 tCO₂e**, Scope 2 = **454.136463 tCO₂e**, Scope 3 = **1,302.102817 tCO₂e**, Per capita = **0.467064 tCO₂e/person**.

3. **Current Inventory Method (Default for New Inventories):**
   * Review-standard, versioned greenhouse gas accounting method aligned with the GHG Protocol Corporate Standard, Scope 2 Guidance, and Scope 3 Calculation Guidance.
   * Corrects dimensional inconsistencies, properly isolates transmission and distribution (T&D) losses into Scope 3 Category 3, segregates Montreal Protocol HCFC-22 into a separate disclosure basket, uses survey-frame-matched commuting expansion, and validates all activity inputs.

---

## 2. In-Depth Audit of Known Methodological Issues

### Issue 1: LPG Units & Dimensional Mismatch (Scope 1 Cafeteria Cooking)
* **Workbook Reference:** `Scope1!J35` (Quantity = 12,720, label: "Gas Used in a Year (kg)"); `Scope1!K35` (Factor = 1.612, label: "Liquefied Petroleum Gas (LPG) CO2 Emission Factor (kg/liter)"); `Scope1!N35` formula: `=(J35*K$35)/(1000)` $\rightarrow$ 20.5046 tCO₂.
* **Paper Reference:** Table 6 labels the LPG emission factor as 1.612 kg CO₂/L.
* **Discrepancy:** The activity data is in mass units (**kg**), but the emission factor is volumetric (**kg/L**). 
* **Provenance & Root Cause:** The EPA GHG Emission Factors Hub specifies an emission factor of 1.612 kg CO₂/liter (5.68 kg CO₂/gallon) for LPG. Typical commercial LPG (mixture of propane and butane) has a liquid density of ~0.54 kg/L (or 1.85 L/kg).
* **Impact:** Multiplying 12,720 kg directly by 1.612 kg/L treats 1 kg as 1 liter, effectively assuming an LPG density of 1.0 kg/L. If 12,720 kg is the true mass purchased, the volume was approximately $12,720 / 0.54 \approx 23,555\text{ liters}$, yielding $23,555 \times 1.612 / 1000 \approx 37.97\text{ tCO}_2$ (an underestimation of ~17.47 tCO₂ in the legacy calculation). Conversely, a mass-based factor of ~3.0 kg CO₂/kg LPG gives ~38.16 tCO₂.
* **Platform Treatment:** 
  - *Legacy Reproduction:* Preserves $(12,720 \times 1.612)/1000 = 20.505\text{ tCO}_2$.
  - *Current Method:* Rejects dimensional mismatches. Requires explicit input unit (kg vs. L). If mass is provided, applies verified mass-based factor ($3.00\text{ kg CO}_2/\text{kg}$) or applies documented temperature/density conversion ($0.54\text{ kg/L}$).

---

### Issue 2: Commuting Formulas and Dimensional Errors (Scope 3)
* **Workbook Reference:** `Scope3!L8` and `Scope3!M8`
  - Cell `Scope3!K8` (CO₂ per motorcycle commuter): `=(H8*E8)/(1000*1000)` where `H8` = 40 g/km, `E8` = 4,915.68 km/yr $\rightarrow$ Correct formula ($0.1966\text{ tCO}_2/\text{person-yr}$).
  - Cell `Scope3!L8` (CH₄ per motorcycle commuter): formula is `=(I8*F8)/(1000*1000)` where `I8` = 0.08 g/km, and `F8` = **63** (the number of motorcycle commuters in the sample!). Distance `E8` is completely omitted.
  - Cell `Scope3!M8` (N₂O per motorcycle commuter): formula is `=(J8*G8)/(1000*1000)` where `J8` = 0.00516 g/km, and `G8` = **0.083113** (the percentage share of motorcycle commuters!).
* **Pattern Across Other Modes:**
  - `Scope3!L7` (Leguna CH₄): `=(I7*F7)/1e6` (multiplied by respondent count 14).
  - `Scope3!M7` (Leguna N₂O): `=(J7*G7)/1e6` (multiplied by percentage 0.0185).
  - `Scope3!L9` (Bus CH₄): `=(I9*F9)/1e6`.
  - `Scope3!L10` (CNG Auto-rickshaw CH₄): `=(I10*F10)/1e6`.
  - `Scope3!L11` (Car CH₄): `=(I11*F11)/1e6`.
  - `Scope3!L12` (Multiple transport CH₄): `=(I12*F12)/1e6`.
* **Impact:** The resulting CH₄ and N₂O numbers in Scope 3 are dimensionally invalid: multiplying an emission factor in g/km by a headcount (or a dimensionless fraction) produces g/km $\cdot$ persons, not mass of emissions. Because CH₄ and N₂O emissions from vehicles are small in absolute tonnage relative to CO₂, the numerical artifact is small (~1.52 tCO₂e total in Scope 3), but it represents a structural calculation flaw.
* **Platform Treatment:** 
  - *Legacy Reproduction:* Preserves exact spreadsheet cell formulas to match the 1,302.10 tCO₂e reproduction target.
  - *Current Method:* Replaces invalid formulas with dimensionally strict expressions:
    $$\text{Emissions}_{\text{gas}} (\text{t/yr}) = \frac{\text{EF}_{\text{gas}} (\text{g/km}) \times \text{Annual Distance (km)}}{1,000,000}$$

---

### Issue 3: Commuter Survey Expansion and Stratification Bias
* **Workbook Reference:** `Scope3!F13` (Total sample = 758), `Scope3!R16` / `Total_GHG_Emissions!L4` (Total population = 5,350), `Scope3!V21:V27` (`=(U_cell / 758) * 5350`).
* **Paper Reference:** Survey received 803 total responses. 45 respondents indicated they use university-provided transport and were excluded from the 758-person non-university commuting calculation.
* **Discrepancy:**
  1. The 758 respondents were used to calculate a sample average emission ($0.2431\text{ tCO}_2/\text{person-yr}$).
  2. This non-university-transport mean was multiplied across the **entire university headcount of 5,350**.
  3. If 45 out of 803 respondents (~5.6%) used university transport, then expanding the 758 respondents' non-fleet travel habits across 100% of the 5,350 population assumes zero people in the university use university transport, leading to overestimation.
  4. Furthermore, university transport fuel is already counted in **Scope 1** (`Scope1!B18:R18`, 9,112.8 L octane + fleet diesel). If university bus travel were also counted in Scope 3, that would create double-counting.
* **Sampling Distribution:**
  - Survey responses: Students = 707 (88.0%), Teachers = 49 (6.1%), Staff = 47 (5.9%).
  - Total population: Students = 4,860 (90.8%), Teachers = 240 (4.5%), Staff = 250 (4.7%).
* **Platform Treatment:**
  - *Legacy Reproduction:* Replicates `(sample_emissions / 758) * 5350`.
  - *Current Method:* Employs formal stratified sampling expansion:
    $$\text{Total Scope 3 Commuting} = \sum_{h \in \{\text{students, faculty, staff}\}} N_h \times \bar{e}_h$$
    where $N_h$ is the stratum population, and $\bar{e}_h$ is the stratum sample mean of non-institutional travel. Fleet travel legs assigned to institutional vehicles are verified as zero in Scope 3 to prevent double-counting Scope 1 fleet fuel.

---

### Issue 4: Grid Losses & T&D Uplift in Scope 2
* **Workbook Reference:** `Scope2!F18` = 409.1319 tCO₂; `Scope2!F19` formula: `=1.11*F18` $\rightarrow$ 454.1365 tCO₂.
* **Paper Reference:** Table 8 lists 641,412 kWh annual electricity consumption, a weighted grid emission factor of 637.86 gCO₂e/kWh, and an 11% transmission and distribution loss, reporting Scope 2 emissions as 454.14 tCO₂e.
* **Methodological Violation (GHG Protocol Scope 2 Guidance):**
  - Scope 2 accounts *strictly* for the indirect emissions from the **generation** of purchased electricity consumed by the reporting entity ($641,412\text{ kWh} \times 0.637861\text{ kgCO}_2\text{e/kWh} / 1000 = 409.13\text{ tCO}_2\text{e}$).
  - Transmission and distribution (T&D) losses that occur in the utility grid outside the organization's meters are upstream losses and **must be reported in Scope 3, Category 3** ("Fuel- and energy-related activities not included in Scope 1 or Scope 2"), NOT inside Scope 2.
  - In addition, multiplying billed consumption by $1.11$ uses $(1 + \text{loss})$. If 11% of grid generation is lost in transmission, then generated power required to deliver $E_{\text{delivered}}$ is $E_{\text{delivered}} / (1 - 0.11) = E_{\text{delivered}} \times 1.1236$, not $\times 1.11$.
* **Platform Treatment:**
  - *Legacy Reproduction:* Retains Scope 2 = 454.14 tCO₂e (with 1.11 multiplier).
  - *Current Method:* Isolates Scope 2 generation emissions ($409.13\text{ tCO}_2\text{e}$). Allocates grid T&D losses ($45.00\text{ tCO}_2\text{e}$) to Scope 3 Category 3 as a distinct line item.

---

### Issue 5: Refrigerant Gas Coverage (R-22 vs. Montreal Protocol)
* **Workbook Reference:** `Scope1!J46` = 136 kg R-410A; `Scope1!K46` = 2,255.5 kgCO₂e/kg $\rightarrow$ `Scope1!L46` = 306.748 tCO₂e; `Scope1!M46` = 163 kg R-22; `Scope1!N46` = 1,960 kgCO₂e/kg $\rightarrow$ `Scope1!O46` = 319.48 tCO₂e. Total AC emissions = 626.228 tCO₂e.
* **Accounting Boundary (GHG Protocol & Kyoto/Paris Baskets):**
  - **R-410A** is a blend of HFC-32 and HFC-125 (both hydrofluorocarbons). HFCs belong to the Kyoto/UNFCCC basket of six greenhouse gases and are fully included in Scope 1.
  - **R-22** (chlorodifluoromethane) is an HCFC governed by the **Montreal Protocol on Substances that Deplete the Ozone Layer**. Under the GHG Protocol Corporate Standard (Chapter 4), emissions of ozone-depleting substances (ODS) covered by the Montreal Protocol **must not be included in Scope 1**; they must be reported separately as an informational/out-of-scope disclosure.
* **Impact:** In the paper, R-22 (319.48 tCO₂e) accounts for 43.0% of Scope 1 emissions (and 12.8% of total university emissions). If R-22 is reported out-of-scope in accordance with the GHG Protocol standard boundary, core Scope 1 emissions fall from 742.55 tCO₂e to **423.07 tCO₂e**, and total core emissions drop to **2,179.31 tCO₂e**.
* **Platform Treatment:**
  - *Legacy Reproduction:* Preserves R-22 inside Scope 1 (matching 742.55 tCO₂e).
  - *Current Method:* Explicitly separates core Scope 1 emissions (including R-410A) from Montreal Protocol ODS emissions (R-22), offering toggleable boundary views ("Core UNFCCC Basket" vs. "All Climate Forcers including ODS").

---

### Issue 6: Refrigerant Emission Calculation Methodology
* **Workbook Reference:** `Scope1!J40` ("Fugitive GHG Emissions from Refrigerant in AC (Sales-based approach of GHG Protocol)").
* **Observation:** The workbook assumes that all 136 kg of R-410A and 163 kg of R-22 purchased/serviced during 2022 were 100% emitted to the atmosphere.
* **Context:** In air conditioning maintenance, refrigerant purchased for servicing existing units typically replaces leaked refrigerant (top-up). If the top-up represents full replacement of annual leakage from an established operating inventory, the sales-based/top-up assumption is a valid screening estimate. However, new equipment pre-charge and recovered gas must be distinguished from leakage.
* **Platform Treatment:** Supports both the top-up proxy method (with documented service records) and the full Tier 2 mass-balance method:
  $$\text{Emissions} = (\text{Beginning Inventory} - \text{Ending Inventory}) + \text{Purchases} - \text{Offsite Transfers} - \text{Capacity Additions}$$

---

### Issue 7: Timeframe Discrepancies and Scope 3 Completeness
* **Timeframe:** The primary survey and administrative records are dated Calendar Year 2022 (e.g. `Scope1!A35:A46` lists January to December 2022; water bills are from 2022). Several paper headings state "2022" while some tables label the period "2022–2023".
* **Scope 3 Boundary:** The published study quantifies only **Commuting** in its official Scope 3 total (plus an informational calculation for water in `Other_GHG_Emissions`). Major Scope 3 categories (purchased goods & services, capital goods, fuel-and-energy related activities, upstream waste, business travel, student air travel) were not collected.
* **Platform Treatment:** 
  - Standardizes reporting period definition: require explicit start date, end date, and designation (Calendar vs. Academic Year).
  - Clearly flags inventory completeness: Scope 3 is explicitly labelled as "Partial (Commuting Only)" when other categories have not been surveyed, preventing false comparisons with universities reporting comprehensive Scope 3.

---

### Issue 8: Mitigation Scenarios & Equipment Compatibility
* **Paper Scenarios:**
  - *Conventional:* Operational changes and behavioral awareness.
  - *Incremental:* R-32 replacement, 42 kWp rooftop solar (66.225 MWh/yr), shared hybrid minibus (14 faculty members).
  - *Comprehensive:* 42 kWp rooftop + 116.5 kWp floating solar (169 MWh/yr), shared electric minibus fleet.
* **Engineering Reality Check:**
  - R-32 operates at higher discharge temperatures and pressures than R-22, and is mildly flammable (ASHRAE safety group A2L). It **cannot be dropped into existing R-22 or R-410A compressors** without retrofitting or replacing the equipment.
* **Platform Treatment:**
  - Recomputes all scenario emission reductions dynamically from entered activity parameters rather than applying fixed percentages.
  - Adds engineering feasibility notes (e.g., equipment replacement required for R-32 transition).
  - Prevents interaction double-counting: energy efficiency savings are deducted before sizing renewable solar offsets; electric bus charging is added to electricity demand.

---

### Issue 9: Peer Comparison Incompatibilities (Literature Review)
* **Workbook Reference:** `per Capita.xlsx`, Table 12 of the paper.
* **Discrepancy:**
  - *Bournemouth University:* The reported per-capita emission of 0.16 tCO₂e was measured over **April–June 2020**—a single 3-month quarter during severe COVID-19 national lockdowns.
  - *American University of Sharjah (15.7 tCO₂e):* Full desert campus with high residential cooling, desalinated water, and extensive campus power plant.
* **Platform Treatment:** The comparison engine enforces strict compatibility checks. Quarterly/lockdown studies and partial-scope inventories are flagged as non-comparable. Literature values are presented with full boundary disclosures and cannot be ranked on arbitrary leaderboards.

---

## 3. Cell-by-Cell Reconciliation Matrix

| Component | Workbook Cell / Formula | Legacy Value | Paper Stated | Current Method Treatment |
| :--- | :--- | :--- | :--- | :--- |
| **Scope 1: Fleet Octane** | `Scope1!F18` | 21.037 tCO₂ | 21.04 tCO₂ | Retained in Scope 1 direct combustion |
| **Scope 1: Fleet Diesel** | `Scope1!M18` | 7.973 tCO₂ | 7.97 tCO₂ | Retained in Scope 1 direct combustion |
| **Scope 1: Generator Diesel**| `Scope1!F47` | 24.386 tCO₂ | 24.39 tCO₂ | Retained in Scope 1 stationary combustion |
| **Scope 1: Cafeteria LPG** | `Scope1!N35` `=(12720*1.612)/1000` | 20.505 tCO₂ | 20.50 tCO₂ | Flagged: kg $\times$ kg/L unit error. Current method requires kg-based factor (~38.16 tCO₂) |
| **Scope 1: AC R-410A** | `Scope1!L46` `=(136*2255.5)/1000` | 306.748 tCO₂e | 306.75 tCO₂e| Retained in Scope 1 (Kyoto HFC basket) |
| **Scope 1: AC R-22** | `Scope1!O46` `=(163*1960)/1000` | 319.480 tCO₂e | 319.48 tCO₂e| Disclosed separately as Montreal Protocol ODS |
| **Scope 1: CH₄ & N₂O** | `Scope1!V19`, `Scope1!W19` | 0.720 tCO₂e | 0.72 tCO₂e | Preserved with AR6 GWP values (CH₄: 27.9, N₂O: 273) |
| **Scope 1 Subtotal** | `Total_GHG_Emissions!B9` | **742.551 tCO₂e** | **742.55 tCO₂e**| Core Scope 1 = 423.07 tCO₂e; ODS R-22 = 319.48 tCO₂e |
| **Scope 2: Grid Generation** | `Scope2!F18` `=641412*0.637861/1000` | 409.132 tCO₂e | *Implicit* | Scope 2 (Location-Based) = **409.13 tCO₂e** |
| **Scope 2: Grid T&D Uplift**| `Scope2!F19` `=1.11*F18` | 454.136 tCO₂e | 454.14 tCO₂e| Re-allocated to Scope 3 Category 3 (45.00 tCO₂e) |
| **Scope 3: Commuting CO₂** | `Scope3!N16` `=(184.27/758)*5350` | 1300.583 tCO₂ | 1300.58 tCO₂| Stratified sample expansion by role |
| **Scope 3: Commuting CH₄** | `Scope3!O16` (multiplied by F/G) | 1.519 tCO₂e | 1.52 tCO₂e | Fixed dimensional formula to use distance |
| **Scope 3: Commuting N₂O** | `Scope3!P16` (multiplied by F/G) | 0.00017 tCO₂e | 0.0002 tCO₂e| Fixed dimensional formula to use distance |
| **Scope 3 Subtotal** | `Total_GHG_Emissions!H9` | **1302.103 tCO₂e** | **1302.14 tCO₂e**| Commuting + T&D losses |
| **Total Gross Emissions** | `Total_GHG_Emissions!K9` | **2498.790 tCO₂e** | **2498.80 tCO₂e**| Fully traced to inventory version and boundary |
| **Per Capita Footprint** | `Total_GHG_Emissions!N4` `=K9/5350`| **0.4671 tCO₂e** | **0.4671 tCO₂e**| Denominator verified against student+faculty+staff |

---

## 4. Architectural Implementation Directives

1. **Deterministic Calculation Engine:**
   - Implemented as a standalone, typed TypeScript module (`shared/engine/`).
   - Supports parameterization for both `legacy_study_reproduction` and `current_inventory_method`.
   - Generates granular audit traces ("How calculated") exposing raw input, converted units, emission factor ID, GWP basis, and formula text.
2. **Emission Factor Registry:**
   - Versioned factor objects with geographic tag (`BD`, `INT`), valid period, review status, and reference citation.
   - Includes official SREDA/BPDB grid mix, EPA GHG Hub factors, and historical ULAB factors.
3. **Data Ingestion (Routes A & B):**
   - Route A provides downloadable CSV/Excel templates, native hosted commuter surveys, and Google Forms specifications.
   - Route B provides step-by-step guided administrative input with live formula previews.
4. **Interactive Campus Mapping:**
   - Leaflet/MapLibre integration with OpenStreetMap tiles.
   - Campus polygon editing and area calculation.
   - Commuter origin cluster heatmaps with $k \ge 5$ aggregation threshold to safeguard survey privacy.
5. **Mitigation Scenario Simulator:**
   - Dynamic interactive simulator modeling equipment retrofit, solar generation, and mode shift.
   - Action item feedback loop tracking status: `proposed` $\rightarrow$ `approved` $\rightarrow$ `in_progress` $\rightarrow$ `completed` $\rightarrow$ `measured`.
