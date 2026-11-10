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
      ["budget","Available budget","text",false,"Optional; write Not supplied if unknown."]
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
    status.textContent = "Result generated in your browser.";
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : "Could not generate the result.";
    status.style.color = "var(--red)";
  }
});
form.addEventListener("reset", () => { status.textContent = ""; });
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
