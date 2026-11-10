# Business360 Quickstart

Business360 is a model-independent toolkit. Its workflow engine does not depend on OpenAI, Anthropic, Google, or any other model provider.

## Requirements

- Node.js 20 or newer
- An MCP-compatible client for the MCP integration
- npm

## Run the tests

```bash
npm install
npm test
```

## Run the MCP server

```bash
npm start
```

The server uses MCP stdio transport. Configure your MCP client to launch:

- Command: `node`
- Arguments: `/absolute/path/to/business360/src/server.js`

For a client that supports npm execution, use `npx` only after publishing or installing the package from a trusted source. This repository is not yet published to npm.

## Available tools

| Tool | Purpose |
|---|---|
| `create_project_plan` | Project phases, governance, next actions, and KPIs |
| `build_business_strategy` | Business strategy hypotheses, workstreams, validation, and decision gates |
| `create_sop` | Repeatable process steps, controls, records, and exceptions |
| `build_kpi_tracker` | KPI definitions and measurement governance |
| `assess_ai_use_case` | AI feasibility dimensions, pilot design, and guardrails |

## Example MCP client configuration

The exact configuration shape varies by host. A typical local stdio configuration is:

```json
{
  "mcpServers": {
    "business360": {
      "command": "node",
      "args": ["/absolute/path/to/business360/src/server.js"]
    }
  }
}
```

Use the host's current official documentation to place this configuration. Do not paste secrets into the configuration.

## Use without MCP

Import the same provider-neutral functions directly:

```js
import { createProjectPlan } from "./src/core.js";

const plan = createProjectPlan({
  project: "Launch a community website",
  goal: "Publish a working site for the first 100 members",
  timeline: "8 weeks"
});

console.log(plan);
```

A host that supports native function calling can map the JSON-compatible tool definitions in `src/core.js` to its own tool schema. The host adapter should call these same core functions rather than reimplementing business rules.

## Current limitations

- Local stdio MCP server only; remote hosted MCP endpoint is not implemented.
- No database, user accounts, long-term memory, or external integrations.
- No model-provider API calls.
- No authentication or multi-tenant deployment layer.
- Output is a structured first draft; users must validate assumptions, figures, legal requirements, and decisions.

Do not expose a local server directly to the public internet. A production remote deployment needs authentication, authorization, rate limits, transport security, privacy controls, and operational monitoring.
