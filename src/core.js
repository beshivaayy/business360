/**
 * Provider-neutral Business360 workflow engine.
 * No model-provider SDKs or network calls belong in this module.
 */

const clean = (value, fallback = "") => String(value ?? fallback).trim();
const list = (value) => Array.isArray(value) ? value.map(v => clean(v)).filter(Boolean) : [];

function requireText(value, field) {
  const result = clean(value);
  if (!result) throw new Error(`Missing required field: ${field}`);
  return result;
}

export function createProjectPlan(input) {
  const project = requireText(input.project, "project");
  const goal = requireText(input.goal, "goal");
  const context = clean(input.context, "No additional context supplied.");
  const timeline = clean(input.timeline, "To be confirmed");
  const teamSize = Number.isFinite(Number(input.teamSize)) && Number(input.teamSize) > 0 ? Number(input.teamSize) : null;
  const constraints = list(input.constraints);

  const phases = [
    { phase: "1. Define", weeks: "Start", tasks: ["Confirm the problem, target user, and desired outcome", "Define scope, exclusions, assumptions, and success measures", "Identify decision owner and stakeholders"] },
    { phase: "2. Plan", weeks: "Early", tasks: ["Break the outcome into deliverables and workstreams", "Estimate effort, dependencies, budget, and capacity", "Assign one accountable owner to each deliverable"] },
    { phase: "3. Execute", weeks: "Middle", tasks: ["Run short execution cycles with visible task status", "Review blockers, quality, risks, and scope changes", "Communicate progress to stakeholders"] },
    { phase: "4. Validate", weeks: "Late", tasks: ["Test deliverables against acceptance criteria", "Resolve critical defects and obtain stakeholder sign-off", "Compare actual results with baseline and target"] },
    { phase: "5. Close", weeks: "End", tasks: ["Document outcomes, decisions, and open items", "Transfer ownership and operating documentation", "Capture lessons and define the next improvement cycle"] }
  ];

  return {
    artifact: "Business360 Project Plan",
    project,
    goal,
    context,
    timeline,
    teamSize,
    constraints,
    assumptions: ["Timeline and effort are provisional until scope and capacity are validated.", "No budget, market, or performance figures were inferred."],
    phases,
    governance: {
      cadence: "Weekly progress review; more frequent check-ins for time-critical delivery.",
      status_fields: ["Not started", "In progress", "Blocked", "In review", "Done"],
      escalation: "Escalate any blocker that threatens a milestone, quality threshold, budget, or agreed scope."
    },
    suggested_kpis: ["Milestone completion rate", "On-time delivery rate", "Open blockers and blocker age", "Rework or defect rate", "Budget or effort variance"],
    next_actions: ["Validate the scope and success criteria", "Name accountable owners", "Confirm timeline, budget, and review cadence"]
  };
}

export function buildBusinessStrategy(input) {
  const business = requireText(input.business, "business");
  const offer = requireText(input.offer, "offer");
  const customer = clean(input.customer, "Customer segment needs validation");
  const geography = clean(input.geography, "To be determined");
  const budget = clean(input.budget, "Not supplied");
  return {
    artifact: "Business360 Business Strategy Brief",
    business,
    offer,
    target_customer: customer,
    geography,
    budget,
    strategic_hypotheses: [
      "A clearly defined customer segment will make positioning and channel selection more efficient.",
      "A narrow initial offer will be easier to validate than a broad catalogue.",
      "Early customer interviews and paid-pilot evidence should precede significant fixed-cost commitments."
    ],
    workstreams: [
      { name: "Customer discovery", actions: ["Interview prospective customers", "Map current alternatives and unmet needs", "Record willingness-to-pay evidence"] },
      { name: "Positioning and offer", actions: ["Define the customer problem and measurable value proposition", "Specify deliverables, exclusions, and service levels", "Test pricing with real buyer conversations"] },
      { name: "Go-to-market", actions: ["Choose one primary acquisition channel for the first test", "Create a simple lead-to-sale funnel", "Track conversion and acquisition effort"] },
      { name: "Operating model", actions: ["Map delivery steps and required capabilities", "Estimate unit economics using validated inputs", "Set quality and customer feedback loops"] }
    ],
    validation_metrics: ["Qualified customer conversations", "Pilot conversion rate", "Gross margin per sale", "Repeat purchase or retention", "Customer-reported outcome"],
    decision_gates: ["Proceed only when a real customer problem is evidenced", "Expand channels only after one repeatable acquisition motion appears", "Scale delivery only when quality and unit economics are acceptable"],
    unknowns_to_validate: ["Competitor set", "Customer willingness to pay", "Demand volume", "Legal and regulatory requirements", "Actual costs and margins"],
    note: "This is a hypothesis-led starting brief, not market research or a forecast."
  };
}

export function createSop(input) {
  const process = requireText(input.process, "process");
  const owner = clean(input.owner, "Process owner to be assigned");
  const trigger = clean(input.trigger, "A request or work item is received");
  const standard = clean(input.qualityStandard, "Acceptance criteria must be defined before execution");
  return {
    artifact: "Business360 Standard Operating Procedure",
    process,
    owner,
    purpose: clean(input.purpose, "Ensure the process is repeatable, traceable, and quality-controlled."),
    trigger,
    inputs: list(input.inputs),
    steps: [
      { step: 1, action: "Receive and log the request", control: "Record requester, scope, due date, priority, and required inputs." },
      { step: 2, action: "Check readiness", control: "Confirm completeness; return unclear or incomplete requests for clarification." },
      { step: 3, action: "Plan and assign", control: "Assign an accountable owner, capacity, deadline, and dependencies." },
      { step: 4, action: "Execute the work", control: "Follow the agreed method and record material decisions or deviations." },
      { step: 5, action: "Perform quality review", control: "Check output against the stated acceptance criteria; log defects and rework." },
      { step: 6, action: "Approve and deliver", control: "Obtain required approval, deliver through the agreed channel, and record completion." },
      { step: 7, action: "Review and improve", control: "Review exceptions, recurring defects, cycle time, and improvement actions." }
    ],
    quality_standard: standard,
    records: ["Request log", "Assignment and status record", "Quality checklist", "Exception and rework log", "Completion evidence"],
    exception_handling: "Pause work when safety, compliance, scope, or quality requirements are unclear; escalate to the process owner.",
    review_cycle: "Review after material process changes and at a cadence appropriate to process risk."
  };
}

export function buildKpiTracker(input) {
  const objective = requireText(input.objective, "objective");
  const domain = clean(input.domain, "General");
  const metrics = list(input.metrics);
  const defaults = [
    { name: "On-time completion rate", definition: "Completed items delivered by the agreed due date / all completed items", unit: "%", cadence: "Weekly" },
    { name: "Cycle time", definition: "Elapsed time from accepted start to completed delivery", unit: "Days or hours", cadence: "Weekly" },
    { name: "First-pass quality", definition: "Items accepted without rework / items reviewed", unit: "%", cadence: "Weekly" },
    { name: "Work in progress", definition: "Count of active items not yet completed", unit: "Count", cadence: "Weekly" },
    { name: "Customer or stakeholder satisfaction", definition: "Consistently collected satisfaction score with method documented", unit: "Defined scale", cadence: "Monthly" }
  ];
  const selected = metrics.length ? metrics.map(name => ({ name, definition: "Define numerator, denominator, data source, and exclusions before use.", unit: "To define", cadence: "To define" })) : defaults;
  return {
    artifact: "Business360 KPI Tracker Specification",
    objective,
    domain,
    metrics: selected.map(m => ({ ...m, owner: "To assign", baseline: "Not supplied", target: "Set after baseline", actual: "Enter actual", status: "Not assessed" })),
    governance: ["Use one documented definition per KPI.", "Do not compare periods with changed definitions without annotation.", "Record data source, owner, refresh date, and exclusions.", "Set targets only after establishing a credible baseline."],
    suggested_review: "Weekly operational review; monthly trend and target review."
  };
}

export function assessAiUseCase(input) {
  const useCase = requireText(input.useCase, "useCase");
  const problem = requireText(input.problem, "problem");
  const volume = clean(input.volume, "Unknown");
  const data = clean(input.data, "Not described");
  const risk = clean(input.risk, "Not assessed");
  return {
    artifact: "Business360 AI Use-Case Assessment",
    use_case: useCase,
    business_problem: problem,
    volume,
    data,
    risk,
    assessment_dimensions: [
      { dimension: "Business value", questions: ["What measurable cost, time, quality, or revenue problem is addressed?", "Who benefits and how often?"] },
      { dimension: "Feasibility", questions: ["Are representative data and examples available?", "Can the task be evaluated with clear acceptance criteria?", "What system integration is required?"] },
      { dimension: "Risk and governance", questions: ["Could errors cause financial, legal, safety, or reputational harm?", "Does the data contain personal, confidential, or regulated information?", "Who reviews and overrides the output?"] },
      { dimension: "Economics", questions: ["What are setup, inference, integration, review, and maintenance costs?", "What is the cost of failure and human escalation?"] }
    ],
    pilot_design: {
      approach: "Start with a limited, reversible, human-reviewed pilot and compare it with the current baseline.",
      stages: ["Document current workflow and baseline", "Define test set and acceptance thresholds", "Run offline evaluation", "Run supervised pilot", "Review quality, time, cost, and incidents", "Decide stop, revise, or expand"],
      metrics: ["Task success or acceptance rate", "Critical error rate", "Human review time", "End-to-end cycle time", "Cost per accepted output", "Escalation rate"]
    },
    recommendation: "Insufficient evidence for an automation go/no-go decision. Complete the assessment and a controlled pilot before production use.",
    guardrails: ["Keep a human accountable for consequential decisions.", "Do not send sensitive data to a model without authorization and appropriate safeguards.", "Log evaluation results and known failure modes.", "Provide a manual fallback and rollback path."]
  };
}

export const workflows = {
  create_project_plan: { description: "Create a practical, assumption-aware project plan.", inputSchema: { type: "object", properties: { project: { type: "string" }, goal: { type: "string" }, context: { type: "string" }, timeline: { type: "string" }, teamSize: { type: "number" }, constraints: { type: "array", items: { type: "string" } } }, required: ["project", "goal"] }, run: createProjectPlan },
  build_business_strategy: { description: "Create a hypothesis-led business strategy brief.", inputSchema: { type: "object", properties: { business: { type: "string" }, offer: { type: "string" }, customer: { type: "string" }, geography: { type: "string" }, budget: { type: "string" } }, required: ["business", "offer"] }, run: buildBusinessStrategy },
  create_sop: { description: "Draft a repeatable standard operating procedure.", inputSchema: { type: "object", properties: { process: { type: "string" }, owner: { type: "string" }, purpose: { type: "string" }, trigger: { type: "string" }, inputs: { type: "array", items: { type: "string" } }, qualityStandard: { type: "string" } }, required: ["process"] }, run: createSop },
  build_kpi_tracker: { description: "Design a KPI tracker with definitions and governance.", inputSchema: { type: "object", properties: { objective: { type: "string" }, domain: { type: "string" }, metrics: { type: "array", items: { type: "string" } } }, required: ["objective"] }, run: buildKpiTracker },
  assess_ai_use_case: { description: "Assess an AI use case and design a controlled pilot.", inputSchema: { type: "object", properties: { useCase: { type: "string" }, problem: { type: "string" }, volume: { type: "string" }, data: { type: "string" }, risk: { type: "string" } }, required: ["useCase", "problem"] }, run: assessAiUseCase }
};
