# Antigravity build prompt: Bangladesh HEI Carbon Platform

## How to use this prompt

Place this file, the research PDF, and `GHG - Copy.zip` in your Antigravity project workspace, ideally under `references/` for the source files. Give Antigravity the instruction below. This is a build specification, not a claim that the application has already been built or its methodology certified.

> Read HEI_Carbon_Bangladesh_Antigravity_Prompt.md in full. Implement the application described in its BUILD PROMPT section. First inspect the supplied paper and archive, then document the methodology issues and build the working application in milestones. Continue through implementation and testing; do not stop at a plan or visual mockup. Preserve all source files. If an external integration is unavailable, implement its documented local fallback and state the remaining setup accurately.

---

# BUILD PROMPT

## 1. Mission and execution

Act as a senior full-stack engineer with carbon-accounting and research-data expertise. Build **Campus Carbon Bangladesh**, a working web platform through which higher education institutions in Bangladesh can collect structured activity data, estimate greenhouse gas emissions by scope, understand per-capita emissions, explore their campus on a map, compare sufficiently compatible inventories, and turn findings into mitigation actions with feedback.

The primary audience is university researchers, sustainability officers, facilities staff, and institutional decision-makers. They should not need programming knowledge or carbon-accounting expertise to use the main workflow.

Build the application, not merely a landing page, presentation, implementation plan, or dashboard filled with invented numbers. Use a practical modular architecture and implement all core flows end to end. Work in milestones, keep a progress file, and validate each milestone before proceeding. Do not require repeated approval for ordinary reversible implementation choices. Do not publish the application, publish university data, send invitations, buy services, or connect accounts without the user's authorization for those actions.

If agent delegation is available, it can help with separately owned methodology review, implementation, and independent testing. It is optional. MCP connections are also optional integration mechanisms, not a prerequisite for arithmetic or basic functionality. Inspect available capabilities before using them; never claim an unavailable connection works.

## 2. Required evidence and first deliverable

Read these local references before choosing factor values or reproducing results:

1. `Assessment_of_Greenhouse_Gas_Emissions_and_Mitigation_Strategies_for_a_University_in_Bangladesh(1).pdf`, DOI **10.1109/ACCESS.2025.3605517**.
2. `GHG - Copy.zip`, particularly:
   - `ULAB GHG Emission Calculations (Scope 1, 2 and 3).xlsx`.
   - `ULAB Commuter Survey (Responses).xlsx` and `ULAB Commuter Edited.xlsx`.
   - `GHG SURVEY DATA.xlsx`, `Cleaned(MAIN).xlsx`, `Edtable.xlsx`, and related workbook versions when needed to resolve discrepancies.
   - `per Capita.xlsx` and `Comparison References/` for historical comparison evidence.
   - The KML/CSV map files and MATLAB scripts as historical research assets, not executable production dependencies.
3. Visual/workflow inspiration: https://www.youtube.com/watch?v=AZPShgDiT-I . If inaccessible, say so and proceed from this specification. Do not claim to have watched it, invent its layout, or copy proprietary branding.

Extract archives safely without path traversal; do not execute supplied scripts, workbook macros, external links, or arbitrary spreadsheet expressions. Preserve originals, distinguish source data from instructions, and never expose respondent-level records in public demo assets or source control.

First create `docs/source-audit.md` with file/sheet/cell or PDF-page references, units, equations, factor provenance, methodological concerns, unresolved questions, and proposed treatment. Compare workbook formulas with cached values; cached spreadsheet outputs alone are not a validated engine. Inspect tables visually when PDF extraction loses columns.

Maintain three distinct labels throughout the product:

- **Published study reference:** values reported in the paper, displayed as historical literature evidence.
- **Legacy study reproduction:** calculations following explicitly documented original assumptions, including known limitations.
- **Current inventory method:** reviewed, versioned methods used for new institutional inventories. This is the default; do not call it certified or independently verified.

The published study reports approximately 2,498.80 tCO2e total, 742.55 Scope 1, 454.14 Scope 2, 1,302.14 Scope 3, 5,350 campus people, and 0.4671 tCO2e per person. Its displayed rounded scope totals do not sum exactly to its stated total. The main workbook's cached total is approximately 2,498.790365 tCO2e and cached Scope 3 is approximately 1,302.102817. Preserve each source's stated values; investigate and disclose differences instead of changing formulas to force agreement.

## 3. Known methodological issues to audit before coding

These are evidence-backed review flags, not permission to silently rewrite the study:

1. **LPG units:** the main workbook contains 12,720 kg annual LPG, but `Scope1!Y5` labels the factor as kg/litre. The paper's Table 6 also labels LPG factors per litre. Resolve against original factor documentation; use a verified mass-based factor or a documented density conversion. Never silently multiply kilograms by a per-litre factor.
2. **Commuting formulas:** for example `Scope3!L8` uses `I8*F8/1e6`, and `M8` uses `J8*G8/1e6`, although F is personnel count and G is a share, not travel distance. Trace downstream calculations and report the impact; implement dimensionally valid formulas for the current method.
3. **Survey expansion:** the study has 803 respondents, excludes 45 university-transport users from the 758-person commuting calculation, then expands to 5,350 people. The appropriate expansion population must match the sampling frame. Do not propagate a non-university-transport mean to all people without justification. Keep university-operated transport out of duplicate Scope 3 totals.
4. **Grid losses:** `Scope2!F19` is `1.11*F18`, with 641,412 kWh consumed and a historical weighted factor of 637.861388 gCO2e/kWh. Separate electricity generation emissions from transmission/distribution losses. For an end user not owning the grid, upstream T&D losses belong in Scope 3 under the applicable guidance, not an automatic Scope 2 uplift. If a loss fraction is defined relative to generated energy, delivered energy divided by `(1-loss)` is not the same as multiplying by `(1+loss)`. Verify the factor boundary and denominator before applying any adjustment.
5. **Gas coverage:** R22 is an HCFC covered by the Montreal Protocol. Review current GHG Protocol guidance and report it separately from the core inventory where required; preserve the paper's inclusion only in its labelled historical reproduction. Track all refrigerant climate impacts visibly without mixing reporting boundaries.
6. **Refrigerant data:** gas bought, initial equipment charge, maintenance top-up, and gas actually emitted are different quantities. Support a documented mass-balance method, or a labelled top-up/leak-rate estimate with assumptions. Do not assume every purchase is a leak.
7. **Time and coverage:** source records mention calendar 2022 while some paper result tables say 2022–2023. Preserve the discrepancy and require explicit dates for new inventories. The paper's Scope 3 chiefly covers commuting; waste, procurement, business travel and other sources are excluded. Never label this complete Scope 3 coverage.
8. **Mitigation claims:** recompute reductions from scenario inputs and boundaries. Do not hard-code study percentages or treat replacing refrigerant gas as a universally safe retrofit. Recommend compatible equipment replacement and qualified assessment, not pouring R32 into equipment designed for R22/R410A.
9. **Historical comparison:** at least one supplied comparator uses April–June 2020. Do not treat a quarter, a pandemic interval, a full year, and different scope boundaries as equivalent annual footprints.

Use authoritative guidance and record access dates and editions. Starting references to verify:

- https://ghgprotocol.org/corporate-standard
- https://ghgprotocol.org/scope-2-guidance
- https://ghgprotocol.org/scope-3-calculation-guidance-2
- https://ghgprotocol.org/calculation-tools-faq
- https://ghgprotocol.org/sites/default/files/standards/ghg-protocol-revised.pdf
- https://www.ipcc.ch/report/ar6/wg1/

Check whether updates are final standards or consultations. Do not implement consultation proposals as mandatory rules. Distinguish organizational inventory factors from project avoided-emission/combined-margin factors.

## 4. Institutional setup and learning experience

Start with a short setup wizard:

- Institution and campus name; public/private/other institution type; Bangladesh division/district; campus search or map pin.
- Reporting start/end dates and calendar/academic year label.
- Organizational consolidation method, with operational control as an explained suggested choice requiring confirmation.
- Included campuses, buildings, hostels, labs, research centres, leased facilities, cafeterias and transport operations; whether owned, controlled or outsourced.
- Student, faculty and staff populations; deduplicated headcount and optional FTE; source and date of the denominator. Prevent double-counting people with multiple roles and students attending multiple campuses.
- Optional floor area in m², residential population and campus operating days. Floor area is not land area from the map.
- Scope/category checklist: included, not applicable, excluded with reason, or not yet collected.

Explain scopes before asking for data, using plain English, examples, units, and where to find records. Include English/Bangla UI support with a maintained translation dictionary. Keep technical identifiers stable across languages.

- Scope 1: direct emissions from owned/controlled combustion, vehicles, eligible refrigerant leakage and other applicable sources.
- Scope 2: purchased electricity and, where applicable, purchased heat, steam or cooling.
- Scope 3: other relevant indirect sources, with a documented mapping to the GHG Protocol categories and explicit HEI-specific extensions.

Explain classification by control and activity, not simply by campus location or who pays. An outsourced cafeteria or bus is not automatically Scope 1. Show employee commuting and student commuting separately; do not imply students are employees or force their travel into an unsupported category.

## 5. Two data-entry routes sharing one schema and engine

### Route A — Collect data using structured templates

Provide a **Create collection kit** workflow that generates:

1. Administrative forms for fuels, vehicles, refrigerants, electricity and optional Scope 3 activities.
2. A separate anonymous commuter questionnaire for students, faculty and staff.
3. Downloadable CSV/XLSX templates with exact headers, examples, units, enumerations, date format, validation rules and schema version.
4. A Google Forms question specification with question types and branching; provide an optional downloadable Apps Script that creates the forms when the institution runs and authorizes it. Verify actual API/script capabilities and use supported validation. Do not present a generated Google Forms URL unless creation really succeeded.
5. A native hosted-form alternative, with shareable collection links generated only within the institution's authorized project. Users distribute these links themselves.

Use one canonical question/data dictionary to generate forms, template headers, validation and imports. Support repeated commuting legs natively. For Google Forms, use a clearly documented finite number of leg sections plus an overflow template; never silently truncate extra legs.

Quantities must be numeric fields, categorical values must be dropdowns/radio choices, dates must be dates. Reserve text for identifiers, comments and evidence. Do not ask respondents to type strings like “bus 10 km + rickshaw 2 km” as the default format.

Accept uploaded CSV/XLSX, pasted spreadsheet grids, and Google Forms/Sheets CSV exports. Show sheet selection, header mapping, units, parsed preview, duplicate warnings and row-level errors before import. Support Bangla digits with visible normalization. Missing values are unknown, not zero. Handle decimal/thousands separators explicitly. Provide downloadable error rows and idempotent re-import behavior. Reject ambiguous data rather than guessing units.

### Route B — Enter existing data through guided questions

Provide scope-wise questions for independently collected data, monthly or annual inputs, repeatable source rows, draft saving, evidence attachments and live calculation previews.

Let users choose raw commuter responses, aggregate mode data or pre-calculated emissions. For aggregates require population/sample definition, travel-period basis, distance basis, occupancy/factor basis, weighting and source. For pre-calculated totals require scope/category, units, reporting period, calculation method, evidence, gas coverage and assurance status. Mark these as externally calculated; do not pretend to independently reproduce them.

Both routes feed the same validated activity model. An institution may mix routes across categories but cannot count the same activity twice. Detect monthly-versus-annual overlaps, repeated meter records, duplicate imports and commuting legs already accounted for through controlled fleet fuel.

## 6. Minimum data fields

Common activity fields: institution ID, campus ID, inventory ID, category, source/asset ID, period start/end, quantity, unit, method, evidence reference, data quality, notes and import provenance. Derive scope from reviewed classification rules and record any reviewed override.

Administrative modules:

- **Fuel:** fuel type, generator/vehicle/cooking/other use, quantity and unit, period, owned/controlled status. Currency-only inputs require a documented unit price and date and are flagged as estimates. Fuel purchases must be distinguished from consumption where inventories change.
- **Electricity:** meter ID, billed imported kWh, period, supplier if known, on-site generation, self-consumption and exported kWh as distinct fields. Prevent counting both total and peak/off-peak subtotals. Keep purchased energy separate from diesel-generated electricity already accounted for through fuel.
- **Refrigerants:** equipment ID, gas type, method, emitted mass or all method-specific stock/addition/recovery/transfer fields, documented service records and GWP source. Blend composition and GWP calculations must be traceable.
- **Optional Scope 3:** waste by material and disposal route; water supplied and wastewater treated; business travel; procurement and construction; upstream energy and T&D; other applicable institutional activities. Enable only implemented methods with usable factors. Show unsupported categories as not yet quantified, not zero.

Commuter fields:

- Random respondent ID, role/stratum, campus, survey period, applicable population group, campus attendance days per week and weeks per year OR directly recorded annual attendance days; never apply both multipliers.
- Coarse origin area; optional consent for location. Do not collect exact home address, phone number, name or student ID by default.
- Journey pattern and frequency. Each leg has mode, distance in km, one-way/round-trip basis, fuel/vehicle subtype if known, occupancy if required, and whether its emissions are already accounted for by institutional fleet or electricity records.
- Modes relevant to Bangladesh: walking, bicycle, human-powered rickshaw, battery rickshaw, CNG autorickshaw, motorcycle, private car, rideshare, public bus, leguna, institutional bus, rail/metro, ferry, and configurable other modes. Unknown factors stay unresolved.
- Car fuel shares must sum to 100% and must state their basis. Do not combine volumetric shares and per-km factors without an appropriate conversion. Unknown fuel/occupancy needs an explicitly accepted assumption.

An illustrative commuter-leg CSV header is:

`response_id,role,campus_id,journey_pattern_id,leg_index,mode,distance_km,distance_basis,annual_attendance_days,pattern_share,occupancy,vehicle_fuel,fleet_accounting_ref,origin_area`

Use separate institution/survey metadata for sampling frame and population. Keep unrelated monetary and traffic-time questions optional, as they are not necessary for basic emissions calculations.

## 7. Deterministic calculation engine

Implement a standalone, versioned calculation module with typed inputs, dimensional checks, explicit unit conversions and transparent output traces. Never use an LLM to perform authoritative calculations or select unreviewed factors silently.

- For gas-specific factors: `kg_gas = normalized_activity × EF_kg_gas_per_activity_unit`.
- Then `tCO2e = sum(kg_gas × GWP100_gas) / 1000` for gases included in the selected reporting boundary.
- For a factor already in kgCO2e/unit: multiply activity by that factor and divide by 1000 once. Never apply GWP a second time.
- Preserve CO2, CH4 and N2O breakdowns only when available. Do not fabricate gas decomposition for composite CO2e factors.
- Per-capita result equals emissions divided by the defined, positive, corresponding campus population. Show numerator coverage and denominator definition. Keep per student, per total headcount, per FTE and per m² separate.
- Total emissions are the sum of quantified included components; display exclusions and unresolved sources alongside totals.
- Unknown and zero must remain distinguishable in calculations, charts and exports.
- Store full precision; round only for presentation.

For commuting:

- Annual distance uses the entered direction basis, attendance days and journey-pattern share. Never double an already round-trip distance.
- A per-vehicle-km factor requires allocation by occupancy; a per-passenger-km factor must not be divided by occupancy again.
- Sum each multimodal leg separately. Do not apply the full journey distance to every mode.
- Keep walking/cycling/human-powered rickshaw as zero operational emissions under the declared boundary, without claiming zero lifecycle emissions.
- Electric transport has energy-related emissions; account for charging source and boundary and avoid duplication with campus electricity.
- Use `sum_h(N_h × mean_annual_emissions_h)` for documented stratified population estimation. Record each stratum's sample size, target population and coverage. Include zero Scope 3 legs for university fleet users when they belong to the sampled population, or scale only to the corresponding non-fleet population. Mixed journeys may include both fleet and non-fleet legs.
- Empty strata stay unestimated unless a specific imputation is selected and disclosed. A larger convenience sample does not automatically eliminate selection bias.
- Show sample emissions and estimated population emissions separately. Optional uncertainty intervals must disclose assumptions and cannot hide nonresponse bias; do not invent an uncertainty percentage.

For Scope 2, use consumed purchased energy and an appropriately bounded factor. Support location-based reporting first. Add market-based reporting only with the required instrument evidence and applicable guidance; do not assume a renewable tariff implies zero emissions. Do not deduct exports, offsets, tree planting or avoided-emission claims from gross totals automatically.

Every computed row must expose “How calculated”: original input, normalized unit, factor record/version, gas/GWP basis, equation, result, scope, assumptions and evidence.

## 8. Bangladesh emission-factor registry

Create a searchable **Emission factors** page and a reviewed registry. Each factor must store:

`id, version, activity_type, geography, reference_year, valid_period, value, numerator_unit, denominator_unit, gas_or_CO2e, GWP_basis, boundary, source_organization, source_title, source_URL_or_DOI, page_or_table, publication_date, accessed_date, derivation, uncertainty_if_known, licensing, review_status, supersedes_id`.

Distinguish **Bangladesh official**, **Bangladesh research-derived**, **international proxy**, **institution-specific**, and **synthetic test** factors. These are not interchangeable credibility labels. Choose factors by fitness for purpose, year, geography and boundary, with transparent fallbacks.

The study-derived grid value of 637.861388 gCO2e/kWh is a historical 2021–22 mix-based value, not a verified current official Bangladesh factor. Import it only as a labelled historical research factor. Do not automatically reuse historical grid mix, 294 academic days, vehicle occupancy or fuel shares for every institution.

Research primary Bangladesh sources such as DoE, BPDB and SREDA and trace their underlying methodology. Where an appropriate factor is unavailable, display “Factor unavailable” or an explicitly accepted, cited proxy. Do not scrape subscription-only values or invent a Bangladesh factor from general web text.

Draft/reviewed/retired status must be visible. Updating the registry creates a new version; it must not silently alter an approved historical inventory. Recalculation produces a new inventory version with a difference report. Keep a separate GWP registry, including fossil/non-fossil methane distinctions where relevant.

## 9. Dashboard and campus map

Build an accessible research workspace, not a marketing-only page. Use a restrained green/teal palette, readable typography, consistent cards, real tables and useful empty states. Responsive desktop/tablet/mobile layouts; keyboard navigation; charts with text/table alternatives.

Navigation: Overview, Institution & Boundaries, Collect Data, Enter/Import Data, Data Review, Results, Campus Map, Compare, Mitigation & Actions, Emission Factors, Reports, Settings.

Results should include:

- Total quantified emissions, Scope 1/2/3 totals, per-capita footprint, category coverage and unresolved-data indicators.
- Scope composition chart, ranked source contributions, commuting mode share versus emission share, campus breakdown, and monthly trend only when real monthly data exist.
- Filters for campus, reporting period, source/category and methodological profile; reconcile every chart with its filtered table.
- Survey population/sample summary and quality notes. Distinguish emissions inferred from a sample from directly recorded activity.
- Exportable chart PNG/SVG, accessible data tables, CSV/XLSX results and a printable/PDF report.

For geographic context use open-source mapping libraries and appropriately licensed open geographic data. MapLibre or Leaflet with compatible tiles, OpenStreetMap search and a bounded Overpass query are reasonable options after checking current provider terms.

Ask the institution to search its campus or enter coordinates. Offer browser geolocation only after a user click. Suggest a campus polygon from OSM when available, then require the user to confirm or edit it. Support drawing/editing, multiple disconnected campuses and GeoJSON upload/download. Record geometry source, retrieval date and confirmation state.

If no polygon exists, use an explicitly labelled illustrative buffer or ask the user to draw the boundary. A map-derived AOI is not proof of ownership or the organizational accounting boundary. Do not infer electricity, population, rooftop suitability or emissions from land area alone.

Show geodesic land area, available building footprints and aggregate commuting-origin heatmaps with suppression of small groups. A configurable small-cell threshold, default 5, is only one privacy measure; do not imply it guarantees anonymity. Never publicly show exact respondent homes or routes. Map missing building data as unavailable, not zero buildings.

Use provider adapters, caching, rate limiting and request timeouts. Follow OpenStreetMap attribution and licensing, tile policies and Nominatim rules. The public Nominatim instance must not power unrestricted client autocomplete or bulk geocoding. Provide manual entry and geometry fallback if map services fail.

## 10. Fair comparison between universities

Create two clearly separated views:

1. **Participating institutions:** versioned, institution-approved aggregate inventories explicitly opted into sharing.
2. **Published literature:** historical values transcribed with precise references, boundaries, year, population definition, gas coverage and limitations.

Do not fabricate live universities, use synthetic records without a prominent demo label, or publish private inventories automatically. Use anonymous synthetic names for demonstration records.

Compare total and per-capita emissions alongside coverage, reporting duration/year, campus type, residential/laboratory profile, denominator, methodology and assurance status. Show component availability, not a spurious precise “percentage of all emissions covered.”

Implement a comparison eligibility check with reasons. Offer common-category comparisons only where the underlying disaggregation and methods support them; show exactly what is excluded. Never prorate missing categories or infer absent source totals from percentages without sufficient evidence. Warn when a common subset omits a material driver.

Separate as-reported comparisons from any explicit recalculation using a common method. Never silently change published figures. Do not rank incompatible data or present “greenest university” scores. If no compatible peers exist, show a useful empty state and explain what would enable comparison. Historical references can still be browsed with a clear “not directly comparable” status.

## 11. Mitigation scenarios, action tracking and feedback

Build an evidence-linked recommendation system driven by the institution's own hotspots and data gaps. Start with deterministic rules; optional AI can explain recommendations in plain language using approved references and aggregate data only.

Examples include improved refrigerant leak detection and compatible equipment replacement; energy audits and cooling/lighting efficiency; solar self-consumption; generator-use reduction where technically feasible; shared transport and mode shift; waste measures when waste data exist; and improving collection for unquantified categories.

Each recommendation includes why it appeared, affected sources, data needed, assumptions, evidence, responsible department, indicative effort, and a configurable scenario. Unknown costs/payback stay unknown unless the user supplies the inputs or a cited dated estimate.

Provide baseline, incremental and comprehensive scenario views inspired by the study, with user-editable assumptions. Compute changes from activity and factors rather than reusing the paper's percentage claims. Keep baseline observations unchanged.

Prevent interacting measures from claiming the same savings twice. For example, apply electricity efficiency before solar self-consumption against remaining demand; account for added charging electricity when shifting to electric institutional buses, and show any movement between scopes. Annual solar generation is not automatically annual self-consumed generation. Store self-consumption assumptions and limit reductions to physically eligible activity. Do not recommend floating solar merely because water appears on a map.

For each action, support accept, reject, defer, request revision and comment, then owner, target date, status, planned reduction, evidence, cost if known, and follow-up measurements. Statuses: proposed, approved, in progress, completed, measured. Feedback must persist and update the action plan. A completed action does not become a measured reduction without evidence.

Compare planned with observed outcomes using matching periods/boundaries and disclose population, weather, activity or factor changes. Distinguish association from proven causal savings. Keep feedback from silently changing calculation formulas or factors.

## 12. Architecture, privacy and persistence

Choose a maintainable stack appropriate to the existing repository. A typed React/TypeScript application, server API, relational database, schema validation, chart library and open map library are suitable. Verify current package documentation, compatibility and licensing before installing; do not assume particular versions from this prompt.

Core domain entities: Institution, Campus, Membership, Inventory, BoundaryDecision, PopulationRecord, ActivityRecord, SurveyCampaign, SurveyResponse, JourneyLeg, ImportBatch, EvidenceFile, EmissionFactorVersion, GWPSet, CalculationRun, CalculationResult, Scenario, Action, ActionFeedback, BenchmarkRecord, PublicationConsent and AuditEvent.

Separate UI, import adapters, factor selection, pure calculation engine, reporting, comparison rules and persistence. Use the same calculations server-side and in preview; the server is authoritative for stored results. Associate every result with immutable input/factor/method versions and a calculation run ID.

Production accounts need authentication and server-enforced institution isolation, with admin/researcher/data-contributor/reviewer roles. Private evidence storage, access checks, secure secrets, upload validation and audit history are required. Survey respondents cannot access institutional records. Reviewers cannot approve changes through hidden client controls.

Offer a self-contained local demo with synthetic data if credentials are unavailable. Keep demo and production persistence/authentication adapters explicit; never advertise a fake login, browser-only state or mock database as a secure multi-university service. Do not store private survey records in client bundles, logs, public buckets or git. Define deletion/retention behavior, export permissions, and revoke access to public snapshots when sharing is withdrawn, while acknowledging downloaded copies cannot be recalled.

An optional AI service must be disabled by default when unconfigured, keep keys server-side, receive only approved aggregate data, cite sources and leave the calculator fully functional when unavailable. Do not send uploaded survey data to external AI or map services by default.

## 13. Implementation milestones

1. **Evidence and method:** audit sources; define schemas, reporting boundaries, factor records, legacy fixture and unresolved assumptions. Do not stop after writing the audit.
2. **Working vertical slice:** institution setup → both entry routes → validated Scope 1/2/commuting calculation → saved dashboard → traceable export. Use a clearly labelled synthetic fixture where factors are unresolved.
3. **Complete core workflows:** template generation, Google Forms script/specification, import mapping/errors, map boundary editing, comparison checks, factor browser, scenarios and persistent action feedback.
4. **Multi-institution readiness:** permissions, database migrations, private evidence access, publication opt-in, versioned inventories, security checks and deployment instructions. Any infrastructure not configured must be listed as a remaining deployment prerequisite.
5. **Verification and handover:** run meaningful calculation, integration and browser tests; fix defects; provide screenshots and setup/run instructions. Deliver the implemented application and state actual limits.

Extended Scope 3 modules without reviewed methods may remain visibly unquantified, but their status must not break the core experience. Prefer a complete working core over a large collection of placeholder buttons. Report deferred modules precisely.

## 14. Acceptance tests and completion criteria

Implement tests that exercise these failure modes:

- A synthetic 1,000 kWh input at 0.5 kgCO2e/kWh gives 0.5 tCO2e; 100 people gives 0.005 tCO2e/person. Label these factors synthetic, never official Bangladesh values.
- Equivalent kg and tonne inputs produce the same result; mismatched litre/kg dimensions are rejected without an explicit conversion.
- Composite CO2e factors are not multiplied by GWP again; excluded gases are not silently mixed into the core total.
- A 10 km one-way commute over 200 attendance days gives 4,000 km; a 20 km round trip gives the same result. Passenger-km and vehicle-km factors allocate occupancy correctly.
- Multimodal legs sum correctly; annualization occurs once; institutional fleet journeys do not duplicate Scope 1 emissions; empty survey strata are not zero-filled.
- Re-importing a file does not double emissions. Missing input is distinguishable from true zero. Invalid enum values, out-of-period rows and duplicate meter totals produce actionable errors.
- Source/factor/GWP version changes create a new result, while the approved historical snapshot remains unchanged.
- Dashboard, tables, exports and PDF totals reconcile under identical filters. Scope composition chart handles zero totals and missing categories safely.
- Incompatible peer inventories are flagged or blocked from ranking; private institutions do not appear publicly.
- Map failure still allows manual location/boundary input. Private respondent origins are not exposed by public endpoints.
- Scenario overlaps do not double-count savings; scenarios do not mutate baselines. Accept/reject/defer/comment actions survive refresh.
- Access-control tests prevent cross-institution data reads/writes, unauthorized factor approval and public access to private evidence.
- Full browser flow: create an institution, configure boundary, download a template, import completed synthetic records, enter another category manually, calculate, inspect a trace, draw an AOI, compare compatible examples, save an action and export a report.

Provide a legacy reproduction test/report with explained differences rather than a hard-coded pass against the paper's headline total. Independently inspect numerical expectations; do not simply write tests that repeat the implementation.

Finish with a concise handover: what works, how to run it, test results, methodological decisions, unresolved factor/data issues, configured versus optional integrations, and production deployment prerequisites. Do not claim the application is deployed, scientifically validated or externally assured unless those actions actually occurred.

Proceed with the source audit, then implement and verify the working application.
