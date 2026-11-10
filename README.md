# Business360
### Business Growth · Operational Excellence · AI-driven Decision Making

**A management portfolio focused on turning business problems into clear decisions, reliable execution, and measurable outcomes.**

Business360 brings together four connected disciplines: business strategy, marketing and growth, operations and project management, and responsible AI adoption.

> **Portfolio integrity:** Case studies marked *Synthetic* are structured business exercises, not real client engagements or employer results. Professional experience is described separately from simulated project work.

## Portfolio at a glance

| Pillar | What it demonstrates | Featured case study |
|---|---|---|
| [Management & Business Strategy](business-strategy/README.md) | Strategic diagnosis, market choices, commercial judgement, business cases | [STR-001 — B2B Market-Entry Decision](case-studies/STR-001-market-entry-decision-for-b2b-services-company.md) |
| [Marketing & Business Growth](marketing-growth/README.md) | Customer understanding, positioning, acquisition, retention, GTM planning | [MKT-001 — B2B Go-to-Market Plan](case-studies/MKT-001-b2b-workflow-service-go-to-market-plan.md) |
| [Operations & Project Management](operations/README.md) | Team and workflow coordination, process design, quality, capacity, delivery | [OPS-001 — Annotation Delivery Workflow Improvement](case-studies/OPS-001-ai-data-annotation-delivery-workflow-improvement.md) |
| [AI & Business Strategy](ai-business-strategy/README.md) | AI opportunity assessment, feasibility, ROI, human oversight, governance | [AI-001 — AI-Assisted Quality Review](case-studies/AI-001-ai-assisted-quality-review-pilot-assessment.md) |

## Featured work

### OPS-001 — AI Data Annotation Delivery Workflow Improvement
A synthetic end-to-end operations case study covering intake, workload allocation, annotation, quality assurance, rework, and delivery. Includes a proposed SOP, RACI, KPI dictionary, four-week pilot, and an operational tracker.

### MKT-001 — B2B Workflow Service Go-to-Market Plan
A synthetic commercial strategy covering customer discovery, ideal customer profile, positioning, offer architecture, channels, funnel qualification, and a 90-day execution plan.

### STR-001 — Market-Entry Decision for a B2B Services Company
A synthetic executive decision framework for segment selection, strategic alternatives, capability fit, market validation, unit economics, and stage-gate governance.

### AI-001 — AI-Assisted Quality Review Pilot Assessment
A synthetic AI adoption assessment covering use-case definition, alternatives, human-in-the-loop evaluation, measurement, total cost, risk controls, and scale/stop criteria.

[Browse all case studies](case-studies/README.md).

## Professional focus

The portfolio is grounded in a management and business-operations orientation, with experience areas including:
- Enterprise client strategy, relationship management, and retention
- Business development and growth-oriented problem solving
- Cross-functional operations and project delivery
- Computer-vision data annotation operations and quality workflows
- Team coordination, execution discipline, and performance visibility

This summary is intentionally high-level. Specific employers, titles, dates, team structures, and quantified outcomes will be added only when verified and approved for disclosure.

## How I approach business problems

1. **Clarify the decision:** define the business question, stakeholder, constraints, and desired outcome.
2. **Establish evidence:** separate observed facts from assumptions, estimates, and hypotheses.
3. **Diagnose the system:** understand customers, process, people, economics, and risk.
4. **Compare options:** make trade-offs explicit rather than jumping to a favourite solution.
5. **Execute in stages:** assign owners, milestones, dependencies, and decision gates.
6. **Measure responsibly:** define formulas, data sources, quality guardrails, and review cadence.
7. **Learn and adapt:** document what changed, what did not, and what evidence is still missing.

## Practical resources

- [Case-study index](case-studies/README.md)
- [Interview discussion guide](INTERVIEW_GUIDE.md) — how to explain each synthetic case study accurately
- [Publication readiness checklist](PORTFOLIO_READINESS.md) — remaining owner-dependent actions
- [Case-study template](templates/case-study-template.md)
- [Template library](templates/README.md) — KPI, GTM funnel, strategy options, and AI use-case worksheets
- [Portfolio charter](PORTFOLIO_CHARTER.md)
- [Data and ethics policy](governance/data-and-ethics.md)
- [Roadmap](roadmap/ROADMAP.md)

## Quality checks

A GitHub Actions workflow checks local Markdown and HTML links on pushes and pull requests. It deliberately does not fetch external websites, so temporary third-party outages do not create noisy failures. See [the link-check script](scripts/check_internal_links.py) and [workflow](.github/workflows/portfolio-checks.yml).

## Repository structure

```text
business360/
├── .github/workflows/       # Automated portfolio checks
├── business-strategy/
├── marketing-growth/
├── operations/
├── ai-business-strategy/
├── case-studies/
├── templates/
├── governance/
├── docs/                    # GitHub Pages website source
├── scripts/                 # Quality-check utilities
├── roadmap/
├── INTERVIEW_GUIDE.md
├── PORTFOLIO_READINESS.md
└── PORTFOLIO_CHARTER.md
```

## Use Business360 as a reusable toolkit

Business360 is also being developed as a **model-independent workflow engine**. Its business logic is separate from AI providers, so the same capabilities can be called from MCP-compatible clients, native function-calling adapters, scripts, or directly by people using the templates.

### Working developer preview

The repository now includes a provider-neutral Node.js core and a local MCP stdio server with five tools:

- `create_project_plan`
- `build_business_strategy`
- `create_sop`
- `build_kpi_tracker`
- `assess_ai_use_case`

Start with the [Quickstart](docs/QUICKSTART.md), review the [tool contracts](docs/TOOL_CONTRACTS.md), and see the [cross-model architecture](docs/CROSS_MODEL_ARCHITECTURE.md) and [host compatibility matrix](docs/COMPATIBILITY.md).

Run locally with Node.js 20 or newer:

```bash
npm install
npm test
npm start
```

**Current scope:** the local MCP server and provider-neutral core are implemented. A publicly hosted remote MCP service, authentication, persistent user workspaces, and host-by-host end-to-end verification are not yet complete. Do not treat planned integrations as already available.

## Contact and professional profile

**Ratnesh Patidar**  
For professional discussions, collaboration, or portfolio feedback, connect through the GitHub profile: [@beshivaayy](https://github.com/beshivaayy).

---

*Business360 is a continuously developed professional portfolio. Documents are versioned as they are researched, reviewed, and improved.*
