# AI-001 — AI-Assisted Quality Review Pilot Assessment

> **Status:** Portfolio case study — synthetic feasibility and governance assessment  
> **Pillar:** AI & Business Strategy  
> **Data:** Illustrative workflow; no model has been deployed and no performance result is claimed.

## 1. Executive brief

A fictional operations team is considering AI assistance for quality review in a repetitive, rules-guided workflow. Leadership wants to know whether AI can reduce review effort without increasing defects, privacy exposure, or operational risk.

**Recommendation:** Do not approve full automation. Run a bounded, human-in-the-loop pilot that evaluates one clearly defined task, compares AI suggestions with expert-reviewed ground truth, and measures quality, time, cost, and failure modes.

The business question is not “Can AI do this?” It is “Does this use case create net business value at an acceptable risk level?”

## 2. Use-case definition

### Candidate workflow
A reviewer checks completed annotation tasks against a defined guideline and records defects.

### Potential AI assistance
- Flag missing fields or metadata.
- Identify candidate inconsistencies for human review.
- Prioritise samples using transparent risk signals.
- Summarise defect trends from approved, non-sensitive review records.

### Explicit non-goals
- Automatically accept or reject production work.
- Replace expert reviewers.
- Train on client data without permission.
- Treat model confidence as proof of correctness.

## 3. Current-state problem hypothesis

Manual review may consume significant time, especially where tasks are repetitive or require checking many fields. However, review effort alone does not prove that AI is appropriate. The pilot must establish:
- Which review steps are repetitive and well-defined?
- Which defects are costly or safety-critical?
- How often do reviewers disagree?
- What is the current review time and defect escape rate?
- Are data and permissions suitable for the proposed system?

## 4. Alternatives assessment

| Option | Benefits | Limitations | When suitable |
|---|---|---|---|
| Improve SOP and reviewer calibration | Low technology risk; improves consistency | Does not automate repetitive checks | When process variation is the main cause |
| Rule-based validation | Deterministic for explicit rules | Limited to structured conditions | Missing fields, schema, range, and format checks |
| AI-assisted flagging | Can surface ambiguous patterns for human review | False positives/negatives; model drift | Only where evaluation data and human oversight exist |
| Full automation | Potentially lower manual effort | Highest quality, accountability, and governance risk | Not recommended without extensive evidence and controls |

Start with process and rule-based improvements. AI should solve a demonstrated residual problem, not decorate a business case.

## 5. Pilot design

### Phase 1 — Define
- Select one task type and one defect family.
- Define intended user, decision boundary, and prohibited actions.
- Document data owner, legal basis/permission, retention, and access.
- Define criticality and acceptable error costs.

### Phase 2 — Establish ground truth
- Create a representative evaluation sample from authorised data.
- Have qualified reviewers label outcomes independently.
- Adjudicate disagreements and document ambiguity.
- Separate development/tuning data from the final evaluation set.

### Phase 3 — Evaluate in shadow mode
The AI produces suggestions, but reviewers continue the existing process and do not rely on the model for final decisions. Compare model outputs with adjudicated ground truth.

### Phase 4 — Controlled assisted mode
Only if shadow-mode gates pass, show suggestions to reviewers. Keep human approval, audit logs, and a rapid rollback path.

### Phase 5 — Decide
Scale, revise, or stop based on pre-agreed criteria and a documented risk review.

## 6. Measurement framework

| Dimension | Metric | Interpretation |
|---|---|---|
| Detection quality | Precision = true positive flags ÷ all positive flags | How many flags are correct? |
| Detection quality | Recall = true positive flags ÷ all actual defects | How many defects are found? |
| Review efficiency | Median reviewer time per task | Does assistance reduce effort? |
| Quality | Defect escape rate | Are defects reaching downstream stages? |
| Adoption | Suggestion acceptance/override rate | Do users find suggestions useful? |
| Reliability | Performance by class, complexity, and data condition | Where does the system fail? |
| Economics | Total cost per accepted task | Is there net value after all costs? |
| Governance | Audit completeness and policy exceptions | Can decisions be explained and controlled? |

Set thresholds with the quality owner based on defect severity. A high average score can conceal poor performance on rare but critical classes.

## 7. Illustrative decision gates

These are examples of gate categories, not pre-approved numerical thresholds:
- No unresolved critical privacy, security, or legal issue.
- Evaluation sample is representative and independently adjudicated.
- Critical-defect recall meets the agreed minimum.
- False-positive burden does not overwhelm reviewers.
- Reviewer time or total cost improves without quality deterioration.
- Performance is acceptable across relevant classes and complexity bands.
- Users can understand, challenge, and override suggestions.
- Monitoring, incident handling, and rollback owners are assigned.

Do not choose thresholds after seeing results merely to make the pilot pass.

## 8. Business case model

Calculate the complete cost, not just model inference cost.

**Net benefit** = verified labour capacity released + documented quality/delay benefit − implementation, integration, review, monitoring, governance, and recurring costs.

**Cost per accepted task** = total attributable operating cost ÷ number of accepted tasks.

Account for:
- Human review that remains necessary.
- False positives and false negatives.
- Model/API or infrastructure costs.
- Integration and workflow changes.
- Security, legal, and vendor assessment.
- Training, change management, monitoring, and incident response.

Released capacity is not automatically cash savings. State whether it reduces paid hours, avoids future hiring, or is redeployed to higher-value work.

## 9. Human oversight and accountability

| Control | Requirement |
|---|---|
| Decision authority | Named human role retains final acceptance/rejection authority |
| Transparency | Reviewer can see the suggestion and relevant reason/evidence |
| Override | Reviewer can reject the AI suggestion and record why |
| Auditability | Store model/version, input reference, output, reviewer action, timestamp |
| Monitoring | Track drift, class-level performance, overrides, and incidents |
| Escalation | Critical or uncertain cases go to qualified reviewer |
| Rollback | Disable assistance without disrupting the manual workflow |

## 10. Risk register

| Risk | Potential consequence | Control |
|---|---|---|
| False negatives | Defects escape QA | Critical-class recall gate and human review |
| False positives | Review burden increases | Measure precision and reviewer time |
| Automation bias | Reviewer accepts incorrect suggestions | Training, explanation, override, audits |
| Data leakage | Confidential data exposed | Data minimisation, approved environment, access controls |
| Model drift | Performance degrades | Ongoing monitoring and revalidation |
| Dataset bias | Uneven quality across classes | Stratified evaluation and subgroup reporting |
| Vendor dependency | Cost or service disruption | Exit plan, portability, fallback process |
| Unclear accountability | Disputes after bad decisions | Named process and decision owners |

## 11. 30-day pilot roadmap

| Period | Activity | Output | Gate |
|---|---|---|---|
| Days 1–5 | Select task, map workflow, complete risk and permission review | Use-case charter | Authorised data and accountable owner |
| Days 6–12 | Build sample and adjudicated ground truth | Evaluation set and label guide | Reviewer agreement understood |
| Days 13–20 | Run shadow evaluation and error analysis | Evaluation report | Quality thresholds assessed |
| Days 21–25 | If eligible, run small assisted-mode test | User feedback and workflow metrics | Human oversight works in practice |
| Days 26–30 | Calculate total cost and review risks | Scale/adjust/stop memo | Formal decision recorded |

If data permission, ground truth, or critical controls are missing, the pilot pauses. The calendar does not override readiness.

## 12. Decision memo

**Use case:** One defined review task.

**Business owner:** Named operations leader.

**Technical owner:** Named AI/system owner.

**Quality owner:** Named accountable reviewer.

**Data owner:** Authorised data steward.

**Decision:** Scale / extend evaluation / redesign / stop.

**Evidence:** Evaluation sample, metrics, error analysis, workflow impact, cost model.

**Known limitations:** Data coverage, class-level weakness, reviewer dependency, and generalisation limits.

**Next review:** Date and monitoring cadence.

## 13. Limitations and evidence register

- This is a proposed assessment; no AI system has been tested or deployed.
- No precision, recall, time-saving, cost-saving, or ROI result is claimed.
- Metrics and gates must be tailored to task criticality.
- Model selection requires current technical, privacy, security, legal, and procurement review.
- Human oversight remains mandatory in the proposed design.

## 14. Portfolio capabilities demonstrated

AI use-case framing, build/buy/process alternatives, pilot design, measurement strategy, cost-benefit analysis, human-in-the-loop governance, risk management, and executive decision-making.

**Portfolio integrity statement:** Synthetic AI adoption assessment. No model performance or business outcome is represented as achieved.
