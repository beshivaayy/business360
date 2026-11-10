import { workflows } from "./core.js";

const definitions = {
  create_project_plan: {
    title: "Project plan", description: "Turn a goal into phases, owners, governance and practical next steps.",
    fields: [
      ["project","Project name","text",true,"e.g. Customer onboarding improvement"],
      ["goal","What do you want to achieve?","textarea",true,"Describe the desired outcome in plain language."],
      ["context","Background and current situation","textarea",false,"What is happening today? Add useful context."],
      ["timeline","Expected timeline","text",false,"e.g. 8 weeks, Q1, or To be confirmed"],
      ["teamSize","Team size","number",false,"Optional; enter a positive number."],
      ["constraints","Constraints (one per line)","textarea",false,"Budget, tools, deadlines, regulations, capacity…","list"]
    ]
  },
  build_business_strategy: {
    title: "Business strategy", description: "Create a hypothesis-led strategy brief with customer discovery and decision gates.",
    fields: [
      ["business","Business or organisation","text",true,"e.g. Local accounting services firm"],
      ["offer","Product or service offered","textarea",true,"What do you sell or plan to offer?"],
      ["customer","Target customer","textarea",false,"Who has the problem you solve?"],
      ["geography","Target geography","text",false,"e.g. Indore, India"],
      ["budget","Available budget","text",false,"e.g. ₹2,00,000 or Not supplied."],
      ["competitors","Known competitors or alternatives (one per line)","textarea",false,"Optional; leave blank if unknown.","list"],
      ["productStage","Product / delivery readiness","text",false,"e.g. Finished stock available, prototype, or not started."],
      ["priceRange","Expected selling price or range","text",false,"Optional; enter a hypothesis, not a confirmed market price."],
      ["evidence","Customer or market evidence","textarea",false,"Optional; interviews, orders, research links or observed objections."]
    ]
  },
  create_sop: {
    title: "Standard operating procedure", description: "Build a repeatable process with quality controls and exception handling.",
    fields: [
      ["process","Process name","text",true,"e.g. Incoming customer complaint handling"],
      ["owner","Process owner","text",false,"Role or team responsible."],
      ["purpose","Purpose","textarea",false,"Why does this process exist?"],
      ["trigger","What starts this process?","text",false,"e.g. A new request is received."],
      ["inputs","Required inputs (one per line)","textarea",false,"List documents, data or materials needed.","list"],
      ["qualityStandard","Quality / acceptance standard","textarea",false,"How will a good result be judged?"]
    ]
  },
  build_kpi_tracker: {
    title: "KPI tracker", description: "Define useful measures, formulas, owners and review governance without inventing targets.",
    fields: [
      ["objective","Business objective","textarea",true,"What outcome should the KPIs help manage?"],
      ["domain","Department or function","text",false,"e.g. Operations, Sales, Customer Support"],
      ["metrics","Specific KPIs (one per line)","textarea",false,"Leave blank to receive a suggested starter set.","list"]
    ]
  },
  assess_ai_use_case: {
    title: "AI use-case assessment", description: "Evaluate an AI opportunity and design a limited, human-reviewed pilot.",
    fields: [
      ["useCase","AI use case","text",true,"e.g. AI-assisted invoice classification"],
      ["problem","Business problem to solve","textarea",true,"What is slow, costly, inconsistent or difficult today?"],
      ["volume","Work volume","text",false,"e.g. 2,000 items per month, or Unknown"],
      ["data","Data available","textarea",false,"Describe data type, quality and access constraints."],
      ["risk","Known risks","textarea",false,"Privacy, security, accuracy, regulatory or operational risks."]
    ]
  }
};

const list = document.querySelector("#tool-list");
const fields = document.querySelector("#fields");
const form = document.querySelector("#workflow-form");
const title = document.querySelector("#form-title");
const description = document.querySelector("#form-description");
const result = document.querySelector("#result");
const resultWrap = document.querySelector("#result-wrap");
const empty = document.querySelector("#empty");
const status = document.querySelector("#status");
const continueStrategy = document.querySelector("#continue-strategy");
let activeTool = "create_project_plan";
let latestOutput = null;

for (const [key, def] of Object.entries(definitions)) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "tool";
  button.dataset.tool = key;
  button.setAttribute("aria-pressed", String(key === activeTool));
  const strong = document.createElement("strong"); strong.textContent = def.title;
  const small = document.createElement("small"); small.textContent = workflows[key].description;
  button.append(strong, small);
  button.addEventListener("click", () => selectTool(key));
  list.append(button);
}

function selectTool(key) {
  activeTool = key;
  continueStrategy.hidden = true;
  const def = definitions[key];
  title.textContent = def.title;
  description.textContent = def.description;
  list.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.tool === key)));
  fields.replaceChildren();
  for (const [name, label, type, required, placeholder, kind] of def.fields) {
    const wrapper = document.createElement("div"); wrapper.className = "field";
    const inputLabel = document.createElement("label"); inputLabel.htmlFor = "field-" + name; inputLabel.textContent = label + (required ? " *" : "");
    const input = document.createElement(type === "textarea" || kind === "list" ? "textarea" : "input");
    input.id = "field-" + name; input.name = name; input.required = required; input.placeholder = placeholder;
    if (type === "number") { input.type = "number"; input.min = "1"; input.step = "1"; }
    if (kind === "list") input.dataset.list = "true";
    wrapper.append(inputLabel, input);
    const hint = document.createElement("div"); hint.className = "hint"; hint.textContent = required ? "Required field" : "Optional — leave blank if unknown.";
    wrapper.append(hint); fields.append(wrapper);
  }
  status.textContent = "";
}
selectTool(activeTool);

form.addEventListener("submit", event => {
  event.preventDefault();
  const input = {};
  for (const field of form.querySelectorAll("#fields input, #fields textarea")) {
    let value = field.value.trim();
    if (field.dataset.list === "true") value = value.split("\\n").map(x => x.trim()).filter(Boolean);
    else if (field.name === "teamSize" && value) value = Number(value);
    if (value !== "" && (!Array.isArray(value) || value.length)) input[field.name] = value;
  }
  try {
    latestOutput = workflows[activeTool].run(input);
    result.textContent = JSON.stringify(latestOutput, null, 2);
    resultWrap.hidden = false; empty.hidden = true;
    continueStrategy.hidden = !(activeTool === "build_business_strategy" && latestOutput?.artifact === "Business360 Business Strategy Brief");
    status.textContent = "Result generated in your browser.";
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : "Could not generate the result.";
    status.style.color = "var(--red)";
  }
});
form.addEventListener("reset", () => { status.textContent = ""; });
continueStrategy.addEventListener("click", () => {
  if (!latestOutput || latestOutput.artifact !== "Business360 Business Strategy Brief") return;
  const strategy = latestOutput;
  selectTool("create_project_plan");
  const context = [
    strategy.strategic_thesis,
    `Offer: ${strategy.offer}`,
    `Target customer: ${strategy.target_customer}`,
    `Geography: ${strategy.geography}`,
    `Initial customer segment to test: ${strategy.recommended_initial_focus?.segment_to_test_first || "To validate"}`,
    ...(strategy.strategic_roadmap || []).map(item => `${item.period}: ${item.objective}`),
    `Budget input: ${strategy.budget || "Not supplied"} (confirm actual available cash and commitments before spending)`
  ].filter(Boolean).join("\\n");
  const constraints = [
    ...(strategy.decision_gates || []).map(gate => `${gate.gate}: ${gate.proceed_when} Stop/revise if: ${gate.stop_or_revise_if}`),
    ...(strategy.unknowns_to_validate || []).map(item => `Validate before commitment: ${item}`)
  ];
  const values = {
    project: `${strategy.business} — strategy execution`,
    goal: strategy.strategic_thesis || `Execute the business strategy for ${strategy.business}`,
    context,
    timeline: "90 days",
    constraints: constraints.join("\\n")
  };
  for (const [name, value] of Object.entries(values)) {
    const field = fields.querySelector(`[name="${name}"]`);
    if (field) field.value = value;
  }
  status.textContent = "Strategy transferred into the Project Plan. Review the 90-day planning horizon, add team size if known, then generate.";
  form.scrollIntoView({ behavior: "smooth", block: "start" });
});
document.querySelector("#copy").addEventListener("click", async () => {
  if (!latestOutput) return;
  try { await navigator.clipboard.writeText(JSON.stringify(latestOutput, null, 2)); status.textContent = "Copied to clipboard."; }
  catch { status.textContent = "Clipboard access unavailable. Select and copy the result manually."; status.style.color = "var(--red)"; }
});
document.querySelector("#download").addEventListener("click", () => {
  if (!latestOutput) return;
  const blob = new Blob([JSON.stringify(latestOutput, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob); const a = document.createElement("a");
  a.href = url; a.download = "business360-result.json"; a.click(); URL.revokeObjectURL(url);
});
