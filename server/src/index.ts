#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js'
import {
  getCurrentWeather,
  getWeatherForecast,
  getCurrentWeatherByLocation,
  getWeatherForecastByLocation,
} from './weather.js'
import { searchLocations, formatSearchResults } from './geocoding.js'
import { type TemperatureUnit } from './utils.js'

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
        description: 'Get current weather conditions using coordinates',
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
            temperature_unit: {
              type: 'string',
              enum: ['fahrenheit', 'celsius'],
              description: 'Temperature unit preference (default: fahrenheit)',
              default: 'fahrenheit',
            },
          },
          required: ['latitude', 'longitude'],
        },
      },
      {
        name: 'get_weather_forecast',
        description: 'Get a 3-day weather forecast using coordinates',
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
            temperature_unit: {
              type: 'string',
              enum: ['fahrenheit', 'celsius'],
              description: 'Temperature unit preference (default: fahrenheit)',
              default: 'fahrenheit',
            },
          },
          required: ['latitude', 'longitude'],
        },
      },
      {
        name: 'get_current_weather_by_location',
        description:
          'Get current weather conditions using location name or coordinates',
        inputSchema: {
          type: 'object',
          properties: {
            location: {
              type: 'string',
              description:
                'Location name (e.g., "New York", "London, UK") or coordinates as "latitude,longitude"',
            },
            temperature_unit: {
              type: 'string',
              enum: ['fahrenheit', 'celsius'],
              description: 'Temperature unit preference (default: fahrenheit)',
              default: 'fahrenheit',
            },
          },
          required: ['location'],
        },
      },
      {
        name: 'get_weather_forecast_by_location',
        description:
          'Get a 3-day weather forecast using location name or coordinates',
        inputSchema: {
          type: 'object',
          properties: {
            location: {
              type: 'string',
              description:
                'Location name (e.g., "New York", "London, UK") or coordinates as "latitude,longitude"',
            },
            temperature_unit: {
              type: 'string',
              enum: ['fahrenheit', 'celsius'],
              description: 'Temperature unit preference (default: fahrenheit)',
              default: 'fahrenheit',
            },
          },
          required: ['location'],
        },
      },
      {
        name: 'search_locations',
        description:
          'Search for locations by name to get coordinates and location details',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Location search query (city, region, country)',
            },
          },
          required: ['query'],
        },
      },
    ],
  }
})

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  try {
    if (!args) {
      throw new Error('No arguments provided')
    }

    switch (name) {
      case 'get_current_weather': {
        const rawLat = args.latitude
        const rawLng = args.longitude
        const temperatureUnit = (args.temperature_unit ||
          'fahrenheit') as TemperatureUnit

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

        const weather = await getCurrentWeather(
          latitude,
          longitude,
          temperatureUnit
        )
        return {
          content: [{ type: 'text', text: weather }],
        }
      }

      case 'get_weather_forecast': {
        const rawLat = args.latitude
        const rawLng = args.longitude
        const temperatureUnit = (args.temperature_unit ||
          'fahrenheit') as TemperatureUnit

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

        const forecast = await getWeatherForecast(
          latitude,
          longitude,
          temperatureUnit
        )
        return {
          content: [{ type: 'text', text: forecast }],
        }
      }

      case 'get_current_weather_by_location': {
        const location = args.location
        const temperatureUnit = (args.temperature_unit ||
          'fahrenheit') as TemperatureUnit

        if (typeof location !== 'string' || location.trim().length === 0) {
          throw new Error('Location must be a non-empty string')
        }

        const weather = await getCurrentWeatherByLocation(
          location.trim(),
          temperatureUnit
        )
        return {
          content: [{ type: 'text', text: weather }],
        }
      }

      case 'get_weather_forecast_by_location': {
        const location = args.location
        const temperatureUnit = (args.temperature_unit ||
          'fahrenheit') as TemperatureUnit

        if (typeof location !== 'string' || location.trim().length === 0) {
          throw new Error('Location must be a non-empty string')
        }

        const forecast = await getWeatherForecastByLocation(
          location.trim(),
          temperatureUnit
        )
        return {
          content: [{ type: 'text', text: forecast }],
        }
      }

      case 'search_locations': {
        const query = args.query

        if (typeof query !== 'string' || query.trim().length === 0) {
          throw new Error('Search query must be a non-empty string')
        }

        const results = await searchLocations(query.trim())
        const formattedResults = formatSearchResults(results)
        return {
          content: [{ type: 'text', text: formattedResults }],
        }
      }

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`)
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'
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
