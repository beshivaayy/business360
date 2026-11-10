#!/usr/bin/env node
/**
 * Business360 MCP server.
 * All domain logic lives in ./core.js and is independent of model providers.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { workflows } from "./core.js";

const server = new McpServer({
  name: "business360",
  version: "0.1.0"
});

for (const [name, workflow] of Object.entries(workflows)) {
  server.tool(name, workflow.description, workflow.inputSchema, async (args) => {
    try {
      const result = workflow.run(args);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        structuredContent: result
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: "text", text: error instanceof Error ? error.message : "Workflow failed." }]
      };
    }
  });
}

const transport = new StdioServerTransport();
await server.connect(transport);
