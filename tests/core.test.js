import test from "node:test";
import assert from "node:assert/strict";
import {
  createProjectPlan,
  buildBusinessStrategy,
  createSop,
  buildKpiTracker,
  assessAiUseCase,
  workflows
} from "../src/core.js";

test("all five provider-neutral tools are registered", () => {
  assert.deepEqual(Object.keys(workflows).sort(), [
    "assess_ai_use_case", "build_business_strategy", "build_kpi_tracker", "create_project_plan", "create_sop"
  ]);
});

test("project plan creates phases and avoids inventing budget", () => {
  const result = createProjectPlan({ project: "Website launch", goal: "Launch a public website" });
  assert.equal(result.phases.length, 5);
  assert.ok(result.assumptions.some(x => x.includes("No budget")));
});

const skincareInput = {
  project: "Launch D2C Skincare Brand",
  goal: "Launch an online skincare brand in India within 90 days and acquire the first 100 paying customers.",
  context: "We are a new business with no existing customers. We plan to sell face wash and vitamin C serum through our own website.",
  teamSize: 4,
  constraints: ["Limited launch budget; no physical store; small team; products must meet applicable Indian cosmetic regulations."]
};

test("30-day D2C skincare plan adapts scope, phases, owners, dependencies and launch gates", () => {
  const result = createProjectPlan({ ...skincareInput, timeline: "30 days" });
  assert.equal(result.duration_days, 30);
  assert.equal(result.planning_mode, "accelerated");
  assert.equal(result.project_type, "d2c_skincare");
  assert.match(result.phases[0].window, /Days 1/);
  assert.match(result.phases[4].window, /30/);
  assert.ok(result.phases.some(p => p.tasks.some(t => /test orders/i.test(t))));
  assert.ok(result.risk_register.some(r => /compliance/i.test(r.risk)));
  assert.equal(result.launch_gates.length, 3);
  assert.equal(result.target_pacing.target, 100);
  assert.equal(result.target_pacing.simple_average_per_day, 3.33);
  assert.ok(result.feasibility_flags.length > 0);
});

test("90-day plan gets wider date windows and does not use accelerated mode", () => {
  const result = createProjectPlan({ ...skincareInput, timeline: "90 days" });
  assert.equal(result.duration_days, 90);
  assert.equal(result.planning_mode, "standard");
  assert.notEqual(result.phases[0].window, createProjectPlan({ ...skincareInput, timeline: "30 days" }).phases[0].window);
  assert.equal(result.target_pacing.simple_average_per_day, 1.11);
});

test("duration parser supports weeks and months", () => {
  assert.equal(createProjectPlan({ project: "A", goal: "B", timeline: "8 weeks" }).duration_days, 56);
  assert.equal(createProjectPlan({ project: "A", goal: "B", timeline: "3 months" }).duration_days, 90);
});

test("strategy brief flags unknowns rather than inventing research", () => {
  const result = buildBusinessStrategy({ business: "Local bakery", offer: "Fresh bread" });
  assert.ok(result.unknowns_to_validate.includes("Customer willingness to pay"));
});

test("SOP includes quality review and exception handling", () => {
  const result = createSop({ process: "Order fulfilment" });
  assert.ok(result.steps.some(x => x.action === "Perform quality review"));
  assert.ok(result.exception_handling);
});

test("KPI tracker does not fabricate baselines or targets", () => {
  const result = buildKpiTracker({ objective: "Improve delivery" });
  assert.equal(result.metrics[0].baseline, "Not supplied");
  assert.equal(result.metrics[0].target, "Set after baseline");
});

test("AI assessment defaults to controlled human-reviewed pilot", () => {
  const result = assessAiUseCase({ useCase: "Invoice extraction", problem: "Manual processing is slow" });
  assert.ok(result.pilot_design.stages.includes("Run supervised pilot"));
  assert.ok(result.guardrails.length >= 3);
});

test("required inputs are validated", () => {
  assert.throws(() => createProjectPlan({ goal: "Launch" }), /project/);
  assert.throws(() => createSop({}), /process/);
});
