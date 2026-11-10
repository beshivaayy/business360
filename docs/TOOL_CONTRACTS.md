# Business360 Tool Contracts

These provider-neutral contracts describe the shared capabilities. The executable JSON Schema definitions are registered in `src/core.js`.

## create_project_plan

Required: `project`, `goal`

Optional: `context`, `timeline`, `teamSize`, `constraints`

Returns: phases, assumptions, governance, suggested KPIs, and next actions.

## build_business_strategy

Required: `business`, `offer`

Optional: `customer`, `geography`, `budget`

Returns: strategic hypotheses, workstreams, validation metrics, decision gates, and unknowns.

## create_sop

Required: `process`

Optional: `owner`, `purpose`, `trigger`, `inputs`, `qualityStandard`

Returns: process purpose, steps, controls, records, exception handling, and review cycle.

## build_kpi_tracker

Required: `objective`

Optional: `domain`, `metrics`

Returns: metric definitions, owners, baseline/target placeholders, and governance rules.

## assess_ai_use_case

Required: `useCase`, `problem`

Optional: `volume`, `data`, `risk`

Returns: assessment dimensions, pilot design, evaluation metrics, recommendation, and guardrails.

## Contract rules

- Required text inputs must be non-empty.
- Missing facts remain explicitly unknown; the engine must not fabricate evidence.
- Targets and baselines are not invented.
- Output fields are stable enough for clients to render, export, or transform.
- Provider adapters must preserve tool names and semantics.
