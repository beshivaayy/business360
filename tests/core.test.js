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
    "assess_ai_use_case",
    "build_business_strategy",
    "build_kpi_tracker",
    "create_project_plan",
    "create_sop"
  ]);
});

test("project plan creates phases and avoids inventing budget", () => {
  const result = createProjectPlan({ project: "Website launch", goal: "Launch a public website" });
  assert.equal(result.phases.length, 5);
  assert.ok(result.assumptions.some(x => x.includes("No budget")));
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
