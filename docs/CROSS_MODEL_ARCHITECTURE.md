# Business360: Cross-Model Architecture

## Product direction

Business360 is an open, model-independent business and project execution toolkit. It is not an OpenAI-only plugin or a wrapper around one model provider.

The same core workflows should be usable from:
- ChatGPT and other MCP-capable AI clients
- Claude and Claude Code
- Gemini clients and applications
- Cursor, VS Code, and other MCP-compatible developer tools
- Custom applications using standard tool/function calling
- Human users through the repository's templates, guides, and web interface

Compatibility is capability-based, not a promise that every model or product supports every integration method. Each host must be tested against its current protocol and feature support.

## Architecture principles

1. **Provider-neutral core:** business rules, workflow logic, schemas, validation, and output generation must not import provider-specific SDKs.
2. **MCP as the primary interoperability interface:** expose reusable capabilities through a standards-based MCP server, using supported transports and protocol versions.
3. **Portable function schemas:** publish JSON Schemas for every tool so non-MCP clients can map them to native function/tool calling.
4. **Human-readable fallback:** every workflow must also have a documented prompt/instruction and a manual template.
5. **No model lock-in:** provider adapters may translate tool calls, but must not own business logic or user data.
6. **Explicit capability matrix:** document which hosts have been tested, which connection method they support, and known limitations.
7. **Privacy by default:** collect only the information required for a workflow; do not send user data to model providers except through the host/application the user chooses.

## Proposed layers

| Layer | Responsibility | Provider dependency |
|---|---|---|
| Core workflow engine | Strategy, project planning, SOP, KPI, AI assessment | None |
| Domain schemas | Validated inputs and structured outputs | JSON Schema |
| MCP server | Discoverable tools and resources | MCP protocol |
| Function-call adapters | Translate provider tool schemas and calls | Thin optional adapters |
| Knowledge pack | Frameworks, examples, instructions | Markdown and structured files |
| User interfaces | CLI, web UI, AI host integrations | Optional host-specific clients |

## Initial portable tools

- `create_project_plan`
- `build_business_strategy`
- `create_sop`
- `build_kpi_tracker`
- `assess_ai_use_case`

Each tool must define:
- Purpose and when to use it
- Input JSON Schema, including required and optional fields
- Output JSON Schema
- Validation and error behavior
- A realistic example
- Safety, privacy, and assumptions
- A provider-neutral implementation

## Integration strategy

### 1. MCP server

Implement one remote MCP server as the primary shared interface. Prefer the currently supported remote transport for target clients and test compatibility before publishing. Also consider a local stdio mode for desktop and developer clients.

### 2. Native tool/function calling

For hosts that do not connect to the same MCP transport, expose the same tool definitions as provider-neutral JSON Schemas and add thin adapters for their native function-calling format. Adapters must call the same core functions.

### 3. Skills and prompt packs

Provide portable Markdown instructions and workflow examples. Where a host has a proprietary skill or extension format, package a small host-specific wrapper around the same source instructions; do not fork the underlying workflow logic.

### 4. Direct human use

Keep templates, CSV trackers, case-study examples, and documentation usable without any AI model.

## Compatibility and release policy

A host is marked:
- **Tested:** a real end-to-end test was completed and recorded.
- **Compatible by protocol:** its documented interface supports the relevant standard, but Business360 has not yet completed an end-to-end test.
- **Planned:** integration work has not been implemented.
- **Unsupported:** a known technical or product limitation prevents the integration.

Never claim universal compatibility merely because a host supports MCP or function calling. Authentication, transport, tool approval, output limits, and product-specific restrictions still need testing.

## Security and governance

- Never hard-code API keys, tokens, or user credentials.
- Use environment variables or a dedicated secrets manager for deployment secrets.
- Validate all tool inputs and enforce size limits.
- Treat model-provided arguments and external content as untrusted input.
- Require explicit confirmation before irreversible external actions.
- Keep business data out of logs by default; redact sensitive values when diagnostics are enabled.
- Clearly label synthetic examples and illustrative calculations.
- Provide a privacy notice before collecting or retaining personal or business data.

## Delivery roadmap

1. Define provider-neutral tool contracts and JSON Schemas.
2. Implement and test the core workflow functions independently of any model.
3. Expose those functions through an MCP server.
4. Add native function-calling adapters only where needed.
5. Publish portable prompts, examples, and manual templates.
6. Test against each target host and maintain a dated compatibility matrix.
7. Deploy the service with authentication, rate limits, privacy controls, and monitoring.
8. Publish integration guides and contribution instructions.

## Non-goal

Business360 will not attempt to make one model behave exactly like another. It provides consistent tools, workflows, and output contracts; each host model remains responsible for its own reasoning and interaction style.
