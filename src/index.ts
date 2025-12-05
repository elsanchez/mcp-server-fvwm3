#!/usr/bin/env node

/**
 * MCP Server for FVWM3 Window Manager
 *
 * Provides access to FVWM3 configuration, state, and control through the
 * Model Context Protocol. Enables LLMs to interact with FVWM3 for configuration
 * generation, debugging, and window management.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { getResources, readResource } from "./resources.js";
import { getTools, executeTool } from "./tools.js";
import { getPrompts, getPrompt } from "./prompts.js";

/**
 * Create and configure the MCP server
 */
const server = new Server(
  {
    name: "mcp-server-fvwm3",
    version: "1.0.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {},
    },
  }
);

/**
 * Handler for listing available resources
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: await getResources(),
  };
});

/**
 * Handler for reading a specific resource
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  return await readResource(request.params.uri);
});

/**
 * Handler for listing available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: getTools(),
  };
});

/**
 * Handler for executing a tool
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  return await executeTool(request.params.name, request.params.arguments || {});
});

/**
 * Handler for listing available prompts
 */
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: getPrompts(),
  };
});

/**
 * Handler for getting a specific prompt
 */
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  return await getPrompt(request.params.name, request.params.arguments);
});

/**
 * Start the server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log to stderr (stdout is used for MCP protocol)
  console.error("MCP Server for FVWM3 started successfully");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
