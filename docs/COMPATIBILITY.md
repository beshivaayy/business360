# Host Compatibility Matrix

Last reviewed: 2026-11-10

Business360 separates its workflow engine from AI providers. Compatibility below describes integration paths, not a guarantee that every host can connect to every deployment.

| Host or usage | Intended connection | Status |
|---|---|---|
| MCP Inspector / local MCP clients | MCP stdio | Implemented; needs end-to-end client verification |
| Claude Desktop / Claude Code | MCP stdio or supported remote MCP | Planned for end-to-end verification |
| ChatGPT | Supported MCP app connection | Planned; remote hosted endpoint not implemented |
| Gemini applications | MCP or native function calling where supported | Planned for end-to-end verification |
| Cursor | MCP | Planned for end-to-end verification |
| VS Code | MCP-capable extension/client | Planned for end-to-end verification |
| Other model providers | Native function/tool calling adapter | Contract available; adapters not implemented |
| Human-only use | Direct templates and imported core functions | Available |

## Status definitions

- **Implemented:** code exists in this repository.
- **Verified:** an end-to-end test was completed against the named host and version.
- **Planned:** not yet tested or implemented.

Do not label a host verified until a real connection and tool invocation have succeeded. Host support, authentication requirements, transports, and configuration formats can change over time.
