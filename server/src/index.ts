#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js'
import { TOOL_SCHEMAS } from './schemas.js'
import { TOOL_HANDLERS, type ToolName } from './tools/index.js'

const server = new Server(
  {
    name: 'weather-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
)

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: TOOL_SCHEMAS,
  }
})

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  try {
    if (!args) {
      throw new Error('No arguments provided')
    }

    if (!(name in TOOL_HANDLERS)) {
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`)
    }

    const handler = TOOL_HANDLERS[name as ToolName]
    return await handler(args)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${errorMessage}`)
  }
})

async function runServer() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('🌤️ Weather MCP Server running on stdio')
}

runServer().catch((error) => {
  console.error('Failed to run server:', error)
  process.exit(1)
})