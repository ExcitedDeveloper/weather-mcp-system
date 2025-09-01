import type { Tool } from '@modelcontextprotocol/sdk/types.js'

const coordinateProperties = {
  latitude: {
    type: 'number' as const,
    description: 'Latitude coordinate (-90 to 90)',
  },
  longitude: {
    type: 'number' as const,
    description: 'Longitude coordinate (-180 to 180)',
  },
}

const temperatureUnitProperty = {
  temperature_unit: {
    type: 'string' as const,
    enum: ['fahrenheit', 'celsius'],
    description: 'Temperature unit preference (default: fahrenheit)',
    default: 'fahrenheit',
  },
}

const locationProperty = {
  location: {
    type: 'string' as const,
    description:
      'Location name (e.g., "New York", "London, UK") or coordinates as "latitude,longitude"',
  },
}

export const TOOL_SCHEMAS: Tool[] = [
  {
    name: 'get_current_weather',
    description: 'Get current weather conditions using coordinates',
    inputSchema: {
      type: 'object',
      properties: {
        ...coordinateProperties,
        ...temperatureUnitProperty,
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
        ...coordinateProperties,
        ...temperatureUnitProperty,
      },
      required: ['latitude', 'longitude'],
    },
  },
  {
    name: 'get_current_weather_by_location',
    description: 'Get current weather conditions using location name or coordinates',
    inputSchema: {
      type: 'object',
      properties: {
        ...locationProperty,
        ...temperatureUnitProperty,
      },
      required: ['location'],
    },
  },
  {
    name: 'get_weather_forecast_by_location',
    description: 'Get a 3-day weather forecast using location name or coordinates',
    inputSchema: {
      type: 'object',
      properties: {
        ...locationProperty,
        ...temperatureUnitProperty,
      },
      required: ['location'],
    },
  },
  {
    name: 'search_locations',
    description: 'Search for locations by name to get coordinates and location details',
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
]