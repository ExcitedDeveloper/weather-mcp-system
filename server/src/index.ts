#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js'
import { getCurrentWeather, getWeatherForecast } from './weather.js'

// Create the MCP server
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

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_current_weather',
        description:
          'Get current weather conditions for any location worldwide using the Open-Meteo API',
        inputSchema: {
          type: 'object',
          properties: {
            latitude: {
              type: 'number',
              description: 'Latitude coordinate (-90 to 90)',
            },
            longitude: {
              type: 'number',
              description: 'Longitude coordinate (-180 to 180)',
            },
          },
          required: ['latitude', 'longitude'],
        },
      },
      {
        name: 'get_weather_forecast',
        description: 'Get a 3-day weather forecast for any location worldwide',
        inputSchema: {
          type: 'object',
          properties: {
            latitude: {
              type: 'number',
              description: 'Latitude coordinate (-90 to 90)',
            },
            longitude: {
              type: 'number',
              description: 'Longitude coordinate (-180 to 180)',
            },
          },
          required: ['latitude', 'longitude'],
        },
      },
    ],
  }
})

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  try {
    // Check if args exists
    if (!args) {
      throw new Error('No arguments provided')
    }

    switch (name) {
      case 'get_current_weather': {
        // More robust coordinate parsing
        const rawLat = args.latitude
        const rawLng = args.longitude

        // Convert to numbers if they're strings
        const latitude =
          typeof rawLat === 'string' ? parseFloat(rawLat) : Number(rawLat)
        const longitude =
          typeof rawLng === 'string' ? parseFloat(rawLng) : Number(rawLng)

        // Validate coordinates
        if (isNaN(latitude) || isNaN(longitude)) {
          throw new Error(
            `Invalid coordinates: latitude=${rawLat}, longitude=${rawLng}`
          )
        }
        if (latitude < -90 || latitude > 90) {
          throw new Error(
            `Latitude must be between -90 and 90, got: ${latitude}`
          )
        }
        if (longitude < -180 || longitude > 180) {
          throw new Error(
            `Longitude must be between -180 and 180, got: ${longitude}`
          )
        }

        const weather = await getCurrentWeather(latitude, longitude)
        return {
          content: [
            {
              type: 'text',
              text: weather,
            },
          ],
        }
      }

      case 'get_weather_forecast': {
        // Same robust parsing for forecast
        const rawLat = args.latitude
        const rawLng = args.longitude

        const latitude =
          typeof rawLat === 'string' ? parseFloat(rawLat) : Number(rawLat)
        const longitude =
          typeof rawLng === 'string' ? parseFloat(rawLng) : Number(rawLng)

        if (isNaN(latitude) || isNaN(longitude)) {
          throw new Error(
            `Invalid coordinates: latitude=${rawLat}, longitude=${rawLng}`
          )
        }
        if (latitude < -90 || latitude > 90) {
          throw new Error(
            `Latitude must be between -90 and 90, got: ${latitude}`
          )
        }
        if (longitude < -180 || longitude > 180) {
          throw new Error(
            `Longitude must be between -180 and 180, got: ${longitude}`
          )
        }

        const forecast = await getWeatherForecast(latitude, longitude)
        return {
          content: [
            {
              type: 'text',
              text: forecast,
            },
          ],
        }
      }

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`)
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'
    console.error(`🔍 DEBUG: Tool execution error:`, error)
    throw new McpError(
      ErrorCode.InternalError,
      `Tool execution failed: ${errorMessage}`
    )
  }
})

// Start the server
async function runServer() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('🌤️ Weather MCP Server running on stdio')
}

runServer().catch((error) => {
  console.error('Failed to run server:', error)
  process.exit(1)
})
