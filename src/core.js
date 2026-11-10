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

function parseDuration(value) {
  const match = clean(value).match(/(\d+(?:\.\d+)?)\s*(days?|d|weeks?|wks?|months?|mos?)/i);
  if (!match) return null;
  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const days = unit.startsWith("w") ? amount * 7 : unit.startsWith("m") ? amount * 30 : amount;
  return Number.isFinite(days) && days > 0 ? Math.max(1, Math.round(days)) : null;
}

function dayWindow(start, end) {
  return start === end ? `Day ${start}` : `Days ${start}–${end}`;
}

function makePhases(duration, templates) {
  let previousEnd = 0;
  return templates.map((template, index) => {
    const start = index === 0 ? 1 : previousEnd + 1;
    const end = index === templates.length - 1
      ? duration
      : Math.max(start, Math.round(duration * template.end));
    previousEnd = end;
    return {
      phase: `${index + 1}. ${template.name}`,
      weeks: dayWindow(start, end),
      window: dayWindow(start, end),
      objective: template.objective,
      tasks: template.tasks,
      deliverables: template.deliverables,
      accountable_owner: template.owner,
      dependencies: template.dependencies ?? []
    };
  });
}

function detectProjectType(project, goal, context, constraints) {
  const text = [project, goal, context, ...constraints].join(" ").toLowerCase();
  if (/(skincare|skin care|cosmetic|face wash|serum|beauty brand|d2c|direct.to.consumer)/.test(text)) return "d2c_skincare";
  if (/(e.?commerce|online store|online retail|shopify|marketplace)/.test(text)) return "ecommerce";
  if (/(website|web app|mobile app|software|saas|platform)/.test(text)) return "software";
  return "general";
}

function buildSkincarePlan(duration, teamSize) {
  const owners = teamSize === 1
    ? ["Founder / project lead (combined ownership)", "Founder / project lead (combined ownership)", "Founder / project lead (combined ownership)", "Founder / project lead (combined ownership)"]
    : [
        "Person 1 — Project lead and commercial decisions",
        "Person 2 — Product, manufacturer and compliance coordination",
        "Person 3 — Website, fulfilment and customer operations",
        "Person 4 — Marketing, customer acquisition and support"
      ];
  const templates = [
    {
      name: "Validate and lock the launch scope", end: 0.15,
      objective: "Confirm that the proposed products, customer and launch promise are commercially and operationally coherent.",
      tasks: [
        "Define the initial customer segment, core problem and product positioning for the face wash and vitamin C serum",
        "Confirm product readiness: existing finished stock versus formulation, manufacturing or packaging still required",
        "Build a cost sheet using supplier quotations: product cost, packaging, shipping, payment fees, returns and marketing",
        "Set the launch definition, exclusions, decision owner and evidence required to proceed"
      ],
      deliverables: ["One-page launch brief", "Validated product and supplier status", "Initial unit-economics worksheet with unknowns clearly marked"],
      owner: owners[0]
    },
    {
      name: "Product, supplier and compliance readiness", end: 0.4,
      objective: "Establish that products can be lawfully and safely offered, supplied and described.",
      tasks: [
        "Verify manufacturer credentials, applicable licences, product documentation, batch traceability and quality records with qualified compliance support",
        "Review product claims, ingredient disclosures, warnings, net quantity, batch details, manufacturer/importer details and other applicable label requirements",
        "Confirm formulation/finished-goods quality evidence, stability and microbiological testing status as applicable to the product and manufacturer",
        "Approve packaging samples, final landed cost, minimum order quantity, lead time and replenishment plan"
      ],
      deliverables: ["Supplier due-diligence checklist", "Product and label approval record", "Quality and batch-documentation checklist", "Confirmed stock and replenishment plan"],
      owner: owners[1],
      dependencies: ["Launch brief and product readiness status"]
    },
    {
      name: "Storefront and fulfilment setup", end: 0.65,
      objective: "Make the buying and delivery journey operational before paid traffic is introduced.",
      tasks: [
        "Build product pages with verified descriptions, ingredient information, usage directions, price and approved claims",
        "Configure domain, checkout, payment gateway, tax and invoicing workflow with relevant professional review",
        "Set shipping zones, courier process, dispatch SLA, tracking messages, return/refund policy and customer support channels",
        "Create order, inventory, complaint and refund logs; assign an owner for each daily operating task"
      ],
      deliverables: ["Working storefront", "Tested checkout and payment flow", "Fulfilment and customer-support SOPs", "Published customer policies"],
      owner: owners[2],
      dependencies: ["Approved product information and packaging", "Supplier, stock and fulfilment terms"]
    },
    {
      name: "Quality assurance and controlled launch", end: 0.85,
      objective: "Prove the end-to-end customer journey with low operational risk before scaling acquisition.",
      tasks: [
        "Run test orders from checkout through payment, pick-pack, dispatch, delivery tracking, cancellation and refund",
        "Check mobile usability, page speed, product-page accuracy, broken links, analytics events and consent/privacy notices",
        "Complete a small, controlled pre-launch with a clearly defined audience; collect questions and objections",
        "Resolve critical defects and obtain explicit product, compliance, payment and fulfilment go/no-go approvals"
      ],
      deliverables: ["Signed launch-readiness checklist", "Test-order evidence", "Defect and resolution log", "Go/no-go decision"],
      owner: owners[2],
      dependencies: ["Working storefront and operational policies", "Product and compliance readiness"]
    },
    {
      name: "Launch, acquire and learn", end: 1,
      objective: "Launch within the approved scope, measure actual customer acquisition and improve from evidence.",
      tasks: [
        "Launch the approved product range and publish a clear customer-support and escalation route",
        "Run a capped acquisition test using one or two selected channels; record spend, qualified traffic, orders and refunds",
        "Track progress towards the first 100 paying customers without treating the target as a forecast or guaranteed outcome",
        "Review customer feedback, conversion, contribution margin, fulfilment quality and cash requirements; decide whether to continue, revise or pause"
      ],
      deliverables: ["Live launch", "Daily launch dashboard", "Customer feedback and issue log", "30/90-day learnings and next-stage decision"],
      owner: owners[3],
      dependencies: ["Formal go/no-go approval", "Stock available for sale", "Checkout and fulfilment test passed"]
    }
  ];
  return makePhases(duration, templates);
}

function buildGenericPlan(duration, teamSize, projectType) {
  const ownerCount = teamSize ?? 0;
  const owner = ownerCount === 1 ? "Single project owner — validate capacity and external support" : "Named accountable project owner";
  const templates = [
    { name: "Define", end: 0.15, objective: "Agree the outcome, scope and decision criteria.", tasks: ["Confirm the problem, target user and desired outcome", "Define scope, exclusions, assumptions and measurable success criteria", "Identify decision owner, stakeholders and constraints"], deliverables: ["Project brief", "Scope and success criteria", "Stakeholder and decision-owner list"], owner },
    { name: "Plan and de-risk", end: 0.35, objective: "Turn the outcome into sequenced, owned work.", tasks: ["Break the outcome into deliverables and workstreams", "Estimate effort, dependencies, budget and capacity using evidence", "Assign one accountable owner to each deliverable and record key risks"], deliverables: ["Work breakdown and milestone plan", "Owner and dependency map", "Initial risk register"], owner },
    { name: "Execute", end: 0.75, objective: "Deliver the highest-priority work while managing change.", tasks: ["Run short execution cycles with visible task status", "Review blockers, quality, risks and scope changes", "Communicate progress and escalate decisions promptly"], deliverables: ["Working deliverables", "Updated status and decision log", "Risk and issue updates"], owner },
    { name: "Validate", end: 0.9, objective: "Prove the deliverables meet agreed acceptance criteria.", tasks: ["Test deliverables against acceptance criteria", "Resolve critical defects and obtain stakeholder sign-off", "Compare actual results with baseline and target"], deliverables: ["Test evidence", "Defect resolution record", "Acceptance sign-off"], owner },
    { name: "Close and transition", end: 1, objective: "Transfer ownership and make the result sustainable.", tasks: ["Document outcomes, decisions and open items", "Transfer ownership and operating documentation", "Capture lessons and define the next improvement cycle"], deliverables: ["Handover pack", "Open-items register", "Post-project review"], owner }
  ];
  return makePhases(duration, templates);
}

export function createProjectPlan(input) {
  const project = requireText(input.project, "project");
  const goal = requireText(input.goal, "goal");
  const context = clean(input.context, "No additional context supplied.");
  const timeline = clean(input.timeline, "To be confirmed");
  const durationDays = parseDuration(timeline);
  const teamSize = Number.isFinite(Number(input.teamSize)) && Number(input.teamSize) > 0 ? Number(input.teamSize) : null;
  const constraints = list(input.constraints);
  const projectType = detectProjectType(project, goal, context, constraints);
  const durationMode = durationDays === null ? "duration_unconfirmed" : durationDays <= 45 ? "accelerated" : durationDays <= 120 ? "standard" : "extended";

  const phases = durationDays
    ? projectType === "d2c_skincare"
      ? buildSkincarePlan(durationDays, teamSize)
      : buildGenericPlan(durationDays, teamSize, projectType)
    : buildGenericPlan(90, teamSize, projectType).map(phase => ({ ...phase, weeks: "To be scheduled", window: "To be scheduled" }));

  const assumptions = [
    "Timeline and effort are provisional until scope, dependencies and capacity are validated.",
    "No budget, market, supplier, legal or performance figures were inferred."
  ];
  if (durationDays && durationDays <= 45 && projectType === "d2c_skincare") {
    assumptions.push("An accelerated 30-day skincare launch is feasible only if compliant, quality-approved finished stock and required documentation are already available; new formulation, manufacturing or unresolved approvals may extend the launch.");
  }
  if (teamSize && teamSize < 4 && projectType === "d2c_skincare") {
    assumptions.push("The specialist responsibilities are workstreams, not four guaranteed full-time roles; combine roles only after checking capacity and competence.");
  }

  const owner = teamSize ? "Project owner (assign by name)" : "To assign";
  const risks = projectType === "d2c_skincare" ? [
    { risk: "Product documentation, licensing or label/claim review is incomplete", likelihood: "Unknown", impact: "High", mitigation: "Obtain qualified compliance review and documentary evidence before offering products for sale.", owner: "Product and compliance lead" },
    { risk: "Finished stock, packaging or supplier lead time misses the launch window", likelihood: "Unknown", impact: "High", mitigation: "Confirm stock, MOQ, lead time and replenishment in writing; define a no-stock/no-launch gate.", owner: "Product and supplier lead" },
    { risk: "Customer acquisition costs exceed contribution margin", likelihood: "Unknown", impact: "High", mitigation: "Calculate contribution per order from actual costs and cap initial channel tests.", owner: "Project lead and growth lead" },
    { risk: "Checkout, dispatch, returns or support fail under real orders", likelihood: "Unknown", impact: "Medium", mitigation: "Run end-to-end test orders and rehearse exception handling before scaling traffic.", owner: "Commerce and operations lead" }
  ] : [
    { risk: "Scope or requirements change after execution starts", likelihood: "Unknown", impact: "Medium", mitigation: "Use a documented change decision and assess time, cost and quality impact.", owner },
    { risk: "Dependencies or capacity are not available when needed", likelihood: "Unknown", impact: "High", mitigation: "Validate dependencies and named-owner capacity before committing milestones.", owner },
    { risk: "Acceptance criteria are unclear or cannot be measured", likelihood: "Unknown", impact: "Medium", mitigation: "Agree testable acceptance criteria and evidence before execution.", owner }
  ];

  const targetMatch = [goal, context].join(" ").match(/first\s+(\d+)\s+(?:paying\s+)?customers?/i);
  const customerTarget = targetMatch ? Number(targetMatch[1]) : null;

  return {
    artifact: "Business360 Project Plan",
    project,
    goal,
    context,
    timeline,
    duration_days: durationDays,
    planning_mode: durationMode,
    project_type: projectType,
    teamSize,
    constraints,
    assumptions,
    feasibility_flags: durationDays && durationDays <= 45
      ? ["Compressed timeline: parallel workstreams and fast decisions are required.", ...(projectType === "d2c_skincare" ? ["Do not bypass product safety, licensing, labelling or other applicable compliance gates to meet the date."] : [])]
      : [],
    phases,
    workstreams: projectType === "d2c_skincare" ? [
      { name: "Product and compliance", owner: "Person 2 — Product, manufacturer and compliance coordination", focus: "Product readiness, supplier evidence, quality and compliant product information" },
      { name: "Commerce and operations", owner: "Person 3 — Website, fulfilment and customer operations", focus: "Storefront, payments, inventory, dispatch, returns and support" },
      { name: "Growth and customer", owner: "Person 4 — Marketing, customer acquisition and support", focus: "Positioning, acquisition tests, conversion, feedback and retention" },
      { name: "Programme and economics", owner: "Person 1 — Project lead and commercial decisions", focus: "Scope, budget control, unit economics, milestones and go/no-go decisions" }
    ] : [],
    dependencies: projectType === "d2c_skincare" ? [
      { from: "Product and compliance approval", to: "Publish final product claims and product pages", critical: true },
      { from: "Confirmed finished stock and supplier terms", to: "Open products for sale", critical: true },
      { from: "Checkout and fulfilment test passed", to: "Scale paid acquisition", critical: true }
    ] : [],
    risk_register: risks,
    launch_gates: projectType === "d2c_skincare" ? [
      { gate: "Product gate", pass_criteria: "Product documentation, quality evidence and applicable compliance/label/claim review are checked and approved by responsible qualified parties.", stop_if_failed: true },
      { gate: "Commerce gate", pass_criteria: "A test order completes successfully through payment, dispatch, tracking, customer communication and refund/cancellation handling.", stop_if_failed: true },
      { gate: "Economics gate", pass_criteria: "Actual product, packaging, shipping, payment, returns and acquisition costs are visible; initial test spend is capped.", stop_if_failed: false }
    ] : [],
    target_pacing: customerTarget && durationDays ? {
      target: customerTarget,
      unit: "paying customers",
      simple_average_per_day: Number((customerTarget / durationDays).toFixed(2)),
      interpretation: "Arithmetic pacing only, not a demand forecast or guarantee. Validate conversion, traffic, channel capacity and available stock."
    } : null,
    governance: {
      cadence: durationDays && durationDays <= 45 ? "15-minute daily blocker check; twice-weekly milestone review; weekly decision and risk review." : "Weekly progress and risk review; more frequent check-ins for time-critical delivery.",
      status_fields: ["Not started", "In progress", "Blocked", "In review", "Done"],
      escalation: "Escalate any blocker that threatens a milestone, quality threshold, budget, compliance requirement or agreed scope."
    },
    suggested_kpis: projectType === "d2c_skincare" ? [
      { name: "Paying customers", definition: "Count of unique customers with a successfully paid, non-cancelled order", baseline: "Not supplied", target: customerTarget ?? "Set by owner", cadence: "Daily" },
      { name: "Website conversion rate", definition: "Orders / eligible website sessions, with the analytics definition documented", baseline: "Not supplied", target: "Set after baseline", cadence: "Weekly" },
      { name: "Customer acquisition cost", definition: "Acquisition spend / new paying customers attributed to that spend", baseline: "Not supplied", target: "Set after unit economics review", cadence: "Weekly" },
      { name: "Contribution per order", definition: "Net sales less product, packaging, fulfilment, payment, discount and return costs; define treatment consistently", baseline: "Not supplied", target: "Positive threshold set by owner", cadence: "Weekly" },
      { name: "On-time dispatch rate", definition: "Orders dispatched within the promised handling window / orders due for dispatch", baseline: "Not supplied", target: "Set after operating baseline", cadence: "Daily" },
      { name: "Complaint resolution time", definition: "Elapsed working time from complaint receipt to recorded resolution", baseline: "Not supplied", target: "Set by service policy", cadence: "Weekly" }
    ] : ["Milestone completion rate", "On-time delivery rate", "Open blockers and blocker age", "Rework or defect rate", "Budget or effort variance"],
    next_actions: projectType === "d2c_skincare" ? [
      "Confirm whether compliant finished stock and complete product documentation already exist.",
      "Obtain written supplier quotations, MOQ, stock availability and lead times.",
      "Assign the four workstream owners and confirm actual weekly capacity.",
      "Build unit economics from real costs before setting an acquisition-spend cap.",
      "Do not launch for sale until product and applicable compliance gates pass."
    ] : ["Validate the scope and success criteria", "Name accountable owners", "Confirm timeline, dependencies, budget and review cadence"]
  };
}

export function buildBusinessStrategy(input) {
  const business = requireText(input.business, "business");
  const offer = requireText(input.offer, "offer");
  const customer = clean(input.customer, "Customer segment needs validation");
  const geography = clean(input.geography, "To be determined");
  const budget = clean(input.budget, "Not supplied");
  return {
    artifact: "Business360 Business Strategy Brief", business, offer, target_customer: customer, geography, budget,
    strategic_hypotheses: ["A clearly defined customer segment will make positioning and channel selection more efficient.", "A narrow initial offer will be easier to validate than a broad catalogue.", "Early customer interviews and paid-pilot evidence should precede significant fixed-cost commitments."],
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
    artifact: "Business360 Standard Operating Procedure", process, owner,
    purpose: clean(input.purpose, "Ensure the process is repeatable, traceable, and quality-controlled."),
    trigger, inputs: list(input.inputs),
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
    artifact: "Business360 KPI Tracker Specification", objective, domain,
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
    artifact: "Business360 AI Use-Case Assessment", use_case: useCase, business_problem: problem, volume, data, risk,
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
  create_project_plan: { description: "Create a time-aware, industry-aware project plan with milestones, owners, dependencies, risks and decision gates.", inputSchema: { type: "object", properties: { project: { type: "string" }, goal: { type: "string" }, context: { type: "string" }, timeline: { type: "string" }, teamSize: { type: "number" }, constraints: { type: "array", items: { type: "string" } } }, required: ["project", "goal"] }, run: createProjectPlan },
  build_business_strategy: { description: "Create a hypothesis-led business strategy brief.", inputSchema: { type: "object", properties: { business: { type: "string" }, offer: { type: "string" }, customer: { type: "string" }, geography: { type: "string" }, budget: { type: "string" } }, required: ["business", "offer"] }, run: buildBusinessStrategy },
  create_sop: { description: "Draft a repeatable standard operating procedure.", inputSchema: { type: "object", properties: { process: { type: "string" }, owner: { type: "string" }, purpose: { type: "string" }, trigger: { type: "string" }, inputs: { type: "array", items: { type: "string" } }, qualityStandard: { type: "string" } }, required: ["process"] }, run: createSop },
  build_kpi_tracker: { description: "Design a KPI tracker with definitions and governance.", inputSchema: { type: "object", properties: { objective: { type: "string" }, domain: { type: "string" }, metrics: { type: "array", items: { type: "string" } } }, required: ["objective"] }, run: buildKpiTracker },
  assess_ai_use_case: { description: "Assess an AI use case and design a controlled pilot.", inputSchema: { type: "object", properties: { useCase: { type: "string" }, problem: { type: "string" }, volume: { type: "string" }, data: { type: "string" }, risk: { type: "string" } }, required: ["useCase", "problem"] }, run: assessAiUseCase }
};
