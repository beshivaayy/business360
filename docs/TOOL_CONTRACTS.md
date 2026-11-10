# Business360 Tool Contracts

These provider-neutral contracts describe the shared capabilities. The executable JSON Schema definitions are registered in \`src/core.js\`.

## create_project_plan

Required: \`project\`, \`goal\`

Optional: \`context\`, \`timeline\`, \`teamSize\`, \`constraints\`

Returns: time-aware phases and date windows when a duration is supplied; project-type classification; assumptions and feasibility flags; workstreams; deliverables; accountable owners; dependencies; risk register; launch/acceptance gates; governance; suggested KPIs; target pacing when a numeric customer goal and duration are supplied; and next actions.

The planner currently recognizes common duration expressions such as \`30 days\`, \`8 weeks\`, and \`3 months\`. It includes a specialized D2C skincare launch workflow. Other project types use a structured general-purpose plan until a dedicated industry workflow is added.

The engine does not infer market demand, legal conclusions, supplier readiness, costs, or performance forecasts. Compliance gates are prompts for review by appropriately qualified people, not legal advice.

## build_business_strategy

Required: \`business\`, \`offer\`

Optional: \`customer\`, \`geography\`, \`budget\`

Returns: strategic hypotheses, workstreams, validation metrics, decision gates, and unknowns.

## create_sop

Required: \`process\`

Optional: \`owner\`, \`purpose\`, \`trigger\`, \`inputs\`, \`qualityStandard\`

Returns: process purpose, steps, controls, records, exception handling, and review cycle.

## build_kpi_tracker

Required: \`objective\`

Optional: \`domain\`, \`metrics\`

Returns: metric definitions, owners, baseline/target placeholders, and governance rules.

## assess_ai_use_case

Required: \`useCase\`, \`problem\`

Optional: \`volume\`, \`data\`, \`risk\`

Returns: assessment dimensions, pilot design, evaluation metrics, recommendation, and guardrails.

## Contract rules

- Required text inputs must be non-empty.
- Missing facts remain explicitly unknown; the engine must not fabricate evidence.
- Targets and baselines are not invented.
- Output fields are stable enough for clients to render, export, or transform.
- Provider adapters must preserve tool names and semantics.
