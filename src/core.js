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
    { risk: "Product compliance documentation, licensing or label/claim review is incomplete", likelihood: "Unknown", impact: "High", mitigation: "Obtain qualified compliance review and documentary evidence before offering products for sale.", owner: "Product and compliance lead" },
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
  const evidence = clean(input.evidence, "No customer or market evidence supplied");
  const competitors = list(input.competitors);
  const priceRange = clean(input.priceRange, "Not supplied");
  const productStage = clean(input.productStage, "Not supplied");
  const rawBudget = Number(budget.replace(/[^0-9.]/g, ""));
  const budgetAmount = Number.isFinite(rawBudget) && rawBudget > 0 ? rawBudget : null;
  const isSkincare = /(skincare|skin care|cosmetic|face wash|cleanser|serum|beauty)/i.test([business, offer].join(" "));
  const isIndia = /(india|madhya pradesh|indore|mumbai|delhi|bengaluru|hyderabad|pune|chennai)/i.test(geography);
  const segments = isSkincare ? [
    { segment: "Routine-building beginners", need: "A simple, understandable daily routine with clear usage guidance", buying_signals: ["Confusion about product order or frequency", "Preference for a small starter routine"], validation: "Interview beginners and observe whether they can explain the problem without being prompted." },
    { segment: "Ingredient-aware value seekers", need: "Understandable ingredient information and credible value at an affordable price", buying_signals: ["Compare ingredient lists and price per ml", "Read reviews before trying a new brand"], validation: "Test whether ingredient transparency or price/value is the stronger purchase driver." },
    { segment: "Local trust-led shoppers", need: "Confidence in seller authenticity, delivery, support and product suitability", buying_signals: ["Ask friends or local communities for recommendations", "Prefer responsive support before first purchase"], validation: "Run small Indore interviews and a controlled sampling or referral test." }
  ] : [
    { segment: "Problem-aware early adopters", need: "A credible solution to a clearly experienced problem", buying_signals: ["Already spend time or money on alternatives", "Can describe a recent attempt to solve the problem"], validation: "Interview recent buyers and users of alternatives." },
    { segment: "Value-conscious practical buyers", need: "A clear outcome with transparent total cost and low adoption friction", buying_signals: ["Compare price, time and service effort", "Need proof before switching"], validation: "Test willingness to pay against the current alternative." },
    { segment: "Trust-led buyers", need: "Evidence, support and predictable fulfilment", buying_signals: ["Seek referrals, reviews or demonstrations", "Ask about guarantees and service"], validation: "Test proof requirements and objections in buyer conversations." }
  ];
  const competitorFramework = {
    status: competitors.length ? "User-supplied competitor candidates; verify before relying on them." : "No competitors supplied; do not invent a competitor set.",
    candidates: competitors,
    compare_on: isSkincare ? ["Product format and size", "Ingredient and claim substantiation", "MRP and realised selling price", "Price per ml", "Reviews and recurring complaints", "Packaging and delivery experience", "Return/refund terms", "Channel and promotion mix"] : ["Target segment", "Core promise", "Offer scope", "Price and total cost", "Proof and reviews", "Distribution and service model", "Switching barriers"],
    research_method: ["Identify 5–8 direct and indirect alternatives from customer interviews and current local/online search", "Capture dated screenshots or source links for price and claims", "Separate verified facts from interpretation", "Interview buyers about what they actually considered"]
  };
  const positioning = isSkincare ? {
    category: "Affordable, focused daily skincare",
    draft_value_proposition: "A simple two-product daily skincare offer with clear ingredient information, honest claims and responsive customer support.",
    differentiation_hypotheses: ["Simpler routine and usage education", "Transparent product and ingredient information", "Reliable local-first customer support and fulfilment"],
    proof_required: ["Formula and ingredient documentation", "Evidence supporting every product claim", "Real product feedback collected with consent", "Reliable dispatch and complaint handling"],
    caution: "Do not claim brightening, treatment, clinical efficacy, dermatological approval or a specific result unless the exact claim is lawful and adequately substantiated."
  } : {
    category: "To be validated",
    draft_value_proposition: "Describe the specific customer, problem, outcome and reason to believe; validate each element before publishing.",
    differentiation_hypotheses: ["A narrower customer focus", "Lower friction or faster delivery", "Better evidence, service or total value"],
    proof_required: ["Customer evidence", "Demonstrable product/service capability", "Comparable alternative analysis"],
    caution: "Do not present an untested hypothesis as a proven competitive advantage."
  };
  const budgetPlan = budgetAmount ? {
    currency_context: budget.match(/₹|INR/i) ? "INR" : "User-entered currency; confirm before allocation",
    total_budget_as_entered: budget,
    allocation_envelopes: [
      { category: "Product, inventory and quality/compliance", share_percent: 35, indicative_amount: Math.round(budgetAmount * 0.35), control: "Release only against verified supplier quotes, stock and documentation." },
      { category: "Packaging, content and storefront", share_percent: 15, indicative_amount: Math.round(budgetAmount * 0.15), control: "Prioritise essential product information and a working checkout over cosmetic extras." },
      { category: "Customer discovery and sampling", share_percent: 10, indicative_amount: Math.round(budgetAmount * 0.10), control: "Use small tests; obtain consent and record feedback." },
      { category: "Acquisition experiments", share_percent: 20, indicative_amount: Math.round(budgetAmount * 0.20), control: "Release in capped tranches only after contribution economics and fulfilment readiness." },
      { category: "Fulfilment, support and operating buffer", share_percent: 10, indicative_amount: Math.round(budgetAmount * 0.10), control: "Cover shipping, returns, payment fees and customer support." },
      { category: "Contingency reserve", share_percent: 10, indicative_amount: Math.round(budgetAmount * 0.10), control: "Founder approval required; do not pre-commit." }
    ],
    total_allocation_percent: 100,
    status: "Illustrative planning envelope only, not a market quote or recommendation to spend. Replace percentages with supplier quotes, compliance needs and actual cash commitments before approval."
  } : {
    status: "Budget not supplied; allocation withheld.",
    required_inputs: ["Available cash", "Committed inventory and manufacturing costs", "Compliance/testing costs", "Packaging and fulfilment costs", "Minimum cash reserve"]
  };
  const funnel = {
    stages: [
      { stage: "Qualified reach", definition: "People in the intended segment who see a relevant offer" },
      { stage: "Product-page or enquiry visit", definition: "Qualified people who take a measurable next step" },
      { stage: "Add-to-cart or qualified lead", definition: "People showing explicit buying intent" },
      { stage: "Paid, non-cancelled order", definition: "Unique customer with successful payment and no cancellation" },
      { stage: "Repeat purchase", definition: "Customer placing a subsequent paid order within the chosen cohort window" }
    ],
    formulas: ["Visit-to-order conversion = paid non-cancelled first orders / eligible unique visits", "CAC = attributable acquisition spend / new paying customers", "Contribution per order = net realised revenue − product − packaging − fulfilment − payment − discounts − expected returns", "Repeat rate = customers with a repeat paid order / eligible first-order customer cohort"],
    reverse_plan: "Required qualified visits = customer target / observed visit-to-paid-order conversion. Do not calculate a traffic target until a measured conversion baseline exists.",
    first_test_target: "Set a small, operationally supportable learning target after stock, sample size, budget and conversion tracking are confirmed; do not treat 100 customers as a forecast."
  };
  const channelOptions = isSkincare ? [
    { channel: "Customer interviews and product sampling", role: "Learn objections, usage expectations and willingness to pay before broad promotion", test: "Small consent-based Indore cohort; record feedback and paid intent", risk: "Sampling interest may not convert to paid demand." },
    { channel: "Instagram/Reels and creator content", role: "Demonstrate routine, texture, packaging and education", test: "Test a small number of content angles with tracked product-page visits", risk: "Views and likes are not purchase evidence; disclose paid collaborations." },
    { channel: "Local referrals and community partnerships", role: "Test trust-led discovery in the launch geography", test: "Track unique referral codes or source attribution", risk: "Small reach and attribution leakage." },
    { channel: "Paid search/social", role: "Test scalable demand only after product pages and fulfilment work", test: "Capped spend with CAC and contribution guardrails", risk: "CAC may exceed contribution; pause on weak economics." }
  ] : [
    { channel: "Direct customer conversations", role: "Validate pain, alternatives and willingness to pay", test: "Structured interviews with recent buyers", risk: "Stated intent may not translate into purchase." },
    { channel: "Referral and partner channel", role: "Borrow trust and reach a defined segment", test: "Track qualified introductions and conversion", risk: "Partner dependency and low control." },
    { channel: "Content and organic discovery", role: "Build proof and capture high-intent demand", test: "Measure qualified visits and enquiries", risk: "Slow feedback and uncertain reach." },
    { channel: "Paid acquisition", role: "Buy controlled learning once offer and funnel are ready", test: "Capped campaign with attribution and stop rules", risk: "Spend can mask weak positioning or economics." }
  ];
  return {
    artifact: "Business360 Business Strategy Brief",
    business, offer, target_customer: customer, geography, budget,
    business_type: isSkincare ? "d2c_skincare" : "general",
    strategic_thesis: isSkincare ? "Win a narrow first customer cohort with a credible, easy-to-understand two-product offer; prove trust, repeatable acquisition and positive contribution before expanding the catalogue or media spend." : "Win a clearly defined first customer cohort by proving a specific problem, differentiated outcome and repeatable route to purchase before scaling fixed costs.",
    customer_segments: segments,
    recommended_initial_focus: { segment_to_test_first: segments[0].segment, rationale: "Use this as the first research cohort because it is a testable starting hypothesis, not a validated market-size claim.", interview_questions: ["What do you currently use to solve this need?", "What frustrates you about the current option?", "What did you last pay, and what made you choose it?", "What proof would make you trust a new brand?", "What would stop you from buying?"] },
    competitor_analysis: competitorFramework,
    positioning,
    offer_strategy: isSkincare ? {
      lead_offer_hypothesis: "Test the face wash as an accessible entry product and the serum as a considered add-on; compare single-product and bundle purchase intent.",
      offer_tests: ["Face wash alone", "Serum alone", "Two-product routine bundle"],
      product_page_requirements: ["Net quantity and complete applicable label information", "Ingredient list and accurate usage directions", "Verified claims and relevant warnings", "Price, shipping, returns and customer support information"],
      pricing_method: ["Collect comparable competitor prices and price per ml", "Calculate landed product cost and all variable selling costs", "Set a minimum contribution floor before discounting", "Test willingness to pay with real purchase behaviour"],
      price_range_input: priceRange
    } : {
      offer_tests: ["Core offer", "Starter or entry offer", "Bundle or higher-value offer where relevant"],
      pricing_method: ["Map current alternatives and buyer spend", "Calculate delivery and support costs", "Test willingness to pay with actual buyer behaviour"],
      price_range_input: priceRange
    },
    budget_plan: budgetPlan,
    go_to_market: {
      recommended_sequence: ["Customer discovery and competitor evidence", "Small product/offer validation", "One primary channel experiment with attribution", "Controlled launch after operational and compliance gates", "Scale only after repeatable conversion and contribution evidence"],
      channel_options: channelOptions,
      geography_notes: isIndia ? ["Treat the named geography as the initial research and fulfilment area, not proof of demand.", "Verify shipping coverage, delivery promise, local customer feedback and applicable India-specific obligations before committing."] : ["Validate local demand, distribution and regulatory obligations for the specified geography before committing."],
      funnel
    },
    unit_economics: {
      required_inputs: ["Realised selling price after discounts", "Product/manufacturing cost", "Packaging cost", "Pick-pack and shipping cost", "Payment gateway fees", "Returns/refunds and damaged-order allowance", "Attributable acquisition spend"],
      formulas: ["Gross margin = (net sales − cost of goods sold) / net sales", "Contribution per order = net realised sales − all variable order costs", "Break-even orders = fixed launch costs / contribution per order (only if contribution is positive)"],
      guardrails: ["Do not scale paid acquisition when CAC exceeds the approved contribution threshold.", "Separate gross margin from contribution margin.", "Use actual paid orders and refund-adjusted revenue, not likes or unqualified leads."]
    },
    strategic_roadmap: [
      { period: "Days 1–30", objective: "Validate segment, offer, costs and operational readiness.", outputs: ["Customer interview notes", "Competitor comparison with sources", "Supplier and compliance evidence", "Unit-economics worksheet", "Small channel test design"] },
      { period: "Days 31–60", objective: "Run a controlled launch or paid pilot and learn from real buyers.", outputs: ["Tracked funnel", "Paid-order and refund data", "Customer feedback themes", "CAC and contribution review"] },
      { period: "Days 61–90", objective: "Repeat what works or revise the offer before scaling.", outputs: ["Repeatable channel evidence", "Cohort/repeat-purchase review where data permits", "Scale, revise or stop decision"] }
    ],
    validation_metrics: [
      { name: "Qualified customer conversations", definition: "Completed interviews with people matching the target segment", baseline: "Not supplied", target: "Set after defining sample and capacity", cadence: "Weekly" },
      { name: "Paid conversion rate", definition: "New paid non-cancelled customers / eligible unique visits or qualified leads; keep denominator consistent", baseline: "Not supplied", target: "Set after pilot baseline", cadence: "Weekly" },
      { name: "Customer acquisition cost", definition: "Attributable acquisition spend / new paying customers", baseline: "Not supplied", target: "Must be below approved contribution threshold", cadence: "Weekly" },
      { name: "Contribution per order", definition: "Net realised sales less all variable order costs", baseline: "Not supplied", target: "Positive or explicitly approved learning investment", cadence: "Weekly" },
      { name: "Repeat purchase rate", definition: "Eligible first-order cohort customers with a subsequent paid order / eligible cohort", baseline: "Not supplied", target: "Set after sufficient cohort age", cadence: "Monthly" }
    ],
    decision_gates: [
      { gate: "Customer problem", proceed_when: "Interviews show a repeated, specific problem and current alternatives; retain notes and disconfirming evidence.", stop_or_revise_if: "Interest is vague, prompted or unrelated to a purchase decision." },
      { gate: "Product and trust", proceed_when: "Product quality, documentation, claims, labelling and applicable compliance checks are verified by qualified responsible parties.", stop_or_revise_if: "Required evidence or approvals are missing." },
      { gate: "Commercial viability", proceed_when: "Actual variable costs, realised price and contribution per order are known; test spend is capped.", stop_or_revise_if: "Contribution is structurally negative or CAC has no credible path to an acceptable level." },
      { gate: "Repeatability", proceed_when: "At least one channel produces attributable paid customers with acceptable quality and economics across more than one test.", stop_or_revise_if: "Results depend on one-off discounts, untracked referrals or vanity metrics." }
    ],
    unknowns_to_validate: ["Actual competitor set and dated comparable prices", "Customer willingness to pay", "Purchase objections and reasons for non-purchase", "Demand and reachable audience size in the selected geography", "Product readiness, manufacturer documentation and applicable legal/regulatory requirements", "Supplier quotes, MOQ, lead times and actual variable costs", "Observed channel conversion, CAC and repeat-purchase behaviour", "Available team capacity and cash reserve"],
    inputs_used: { evidence, competitors, product_stage: productStage, price_range: priceRange },
    note: "This is a structured strategic hypothesis and validation plan, not completed market research, legal advice, a demand forecast or a guaranteed financial outcome. No external competitor, price or market facts were inferred."
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
  build_business_strategy: { description: "Create a hypothesis-led business strategy brief.", inputSchema: { type: "object", properties: { business: { type: "string" }, offer: { type: "string" }, customer: { type: "string" }, geography: { type: "string" }, budget: { type: "string" }, competitors: { type: "array", items: { type: "string" } }, evidence: { type: "string" }, productStage: { type: "string" }, priceRange: { type: "string" } }, required: ["business", "offer"] }, run: buildBusinessStrategy },
  create_sop: { description: "Draft a repeatable standard operating procedure.", inputSchema: { type: "object", properties: { process: { type: "string" }, owner: { type: "string" }, purpose: { type: "string" }, trigger: { type: "string" }, inputs: { type: "array", items: { type: "string" } }, qualityStandard: { type: "string" } }, required: ["process"] }, run: createSop },
  build_kpi_tracker: { description: "Design a KPI tracker with definitions and governance.", inputSchema: { type: "object", properties: { objective: { type: "string" }, domain: { type: "string" }, metrics: { type: "array", items: { type: "string" } } }, required: ["objective"] }, run: buildKpiTracker },
  assess_ai_use_case: { description: "Assess an AI use case and design a controlled pilot.", inputSchema: { type: "object", properties: { useCase: { type: "string" }, problem: { type: "string" }, volume: { type: "string" }, data: { type: "string" }, risk: { type: "string" } }, required: ["useCase", "problem"] }, run: assessAiUseCase }
};
