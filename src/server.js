#!/usr/bin/env node
/**
 * Business360 MCP server.
 * All domain logic lives in ./core.js and is independent of model providers.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { workflows } from "./core.js";

const server = new McpServer({ name: "business360", version: "0.1.0" });

function toZodShape(schema) {
  const required = new Set(schema.required ?? []);
  const shape = {};
  for (const [key, definition] of Object.entries(schema.properties ?? {})) {
    let field;
    if (definition.type === "string") field = z.string();
    else if (definition.type === "number") field = z.number();
    else if (definition.type === "array" && definition.items?.type === "string") field = z.array(z.string());
    else throw new Error(`Unsupported schema type for ${key}`);
    shape[key] = required.has(key) ? field : field.optional();
  }
  return shape;
}

for (const [name, workflow] of Object.entries(workflows)) {
  server.tool(name, workflow.description, toZodShape(workflow.inputSchema), async (args) => {
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

await server.connect(new StdioServerTransport());
