import { describe, test, expect, beforeAll, afterAll } from 'vitest'
import { MCPTestClient, extractTemperature } from '../helpers/mcp-test-client.js'
import { CLIMATE_ZONE_TESTS } from '../fixtures/test-locations.js'

describe('Weather API Integration Tests', () => {
  let client: MCPTestClient

  beforeAll(async () => {
    client = new MCPTestClient()
    await client.connect()
  })

  afterAll(async () => {
    await client.cleanup()
  })

  describe('Current Weather by Coordinates', () => {
    test('should return complete weather data for Miami coordinates', async () => {
      const result = await client.callTool('get_current_weather', {
        latitude: 25.7617,
        longitude: -80.1918,
        temperature_unit: 'fahrenheit'
      })

      expect(result.isError).toBe(false)
      const responseText = result.content[0].text

      // Validate required weather fields are present
      expect(responseText).toMatch(/🌤️ Current Weather/)
      expect(responseText).toMatch(/📍 Location: .+/)
      expect(responseText).toMatch(/🌡️ Temperature: -?\d+°F/)
      expect(responseText).toMatch(/💧 Humidity: \d+%/)
      expect(responseText).toMatch(/💨 Wind: [\d.]+km\/h/)
    })

    test('should return weather data in Celsius when requested', async () => {
      const result = await client.callTool('get_current_weather', {
        latitude: 25.7617,
        longitude: -80.1918,
        temperature_unit: 'celsius'
      })

      expect(result.isError).toBe(false)
      const responseText = result.content[0].text

      expect(responseText).toMatch(/Temperature: -?\d+(\.\d+)?°C/)
      expect(responseText).not.toContain('°F')
    })
  })

  describe('Weather Forecast by Coordinates', () => {
    test('should return 3-day forecast for New York coordinates', async () => {
      const result = await client.callTool('get_weather_forecast', {
        latitude: 40.7128,
        longitude: -74.0060,
        temperature_unit: 'fahrenheit'
      })

      expect(result.isError).toBe(false)
      const responseText = result.content[0].text

      // Validate forecast structure
      expect(responseText).toMatch(/🌤️ 3-Day Weather Forecast/)
      expect(responseText).toMatch(/📍 Location: .+/)
      
      // Should contain 3 days of forecast data
      const dayMatches = responseText.match(/📅 (Today|Tomorrow|[A-Za-z]+, [A-Za-z]+ \d+)/g)
      expect(dayMatches).toHaveLength(3)

      // Each day should have high/low temperatures
      expect(responseText).toMatch(/High: -?\d+°F/g)
      expect(responseText).toMatch(/Low: -?\d+°F/g)
    })
  })

  describe('Current Weather by Location Name', () => {
    test('should return weather for Chicago with location parsing', async () => {
      const result = await client.callTool('get_current_weather_by_location', {
        location: 'Chicago, IL',
        temperature_unit: 'fahrenheit'
      })

      expect(result.isError).toBe(false)
      const responseText = result.content[0].text

      expect(responseText).toContain('Chicago')
      expect(responseText).toMatch(/Temperature: -?\d+(\.\d+)?°F/)
      expect(responseText).toMatch(/Humidity: \d+%/)
    })

    // Note: International location test removed due to API inconsistencies
    // International location parsing is tested in location-parsing.test.ts
  })

  describe('Weather Forecast by Location Name', () => {
    test('should return forecast for Los Angeles', async () => {
      const result = await client.callTool('get_weather_forecast_by_location', {
        location: 'Los Angeles, CA',
        temperature_unit: 'fahrenheit'
      })

      expect(result.isError).toBe(false)
      const responseText = result.content[0].text

      expect(responseText).toContain('Los Angeles')
      expect(responseText).toMatch(/🌤️ 3-Day Weather Forecast/)
      
      // Should have 3 days of data
      const dayMatches = responseText.match(/📅 (Today|Tomorrow|[A-Za-z]+, [A-Za-z]+ \d+)/g)
      expect(dayMatches).toHaveLength(3)
    })
  })

  describe('Temperature Unit Conversion Accuracy', () => {
    test('should convert temperatures correctly between Fahrenheit and Celsius', async () => {
      const testLocation = '40.7128,-74.0060' // NYC coordinates
      
      // Get temperature in both units
      const fahrenheitResult = await client.callTool('get_current_weather', {
        latitude: 40.7128,
        longitude: -74.0060,
        temperature_unit: 'fahrenheit'
      })

      const celsiusResult = await client.callTool('get_current_weather', {
        latitude: 40.7128,
        longitude: -74.0060,
        temperature_unit: 'celsius'
      })

      expect(fahrenheitResult.isError).toBe(false)
      expect(celsiusResult.isError).toBe(false)

      // Extract temperatures
      const fahrenheitTemp = extractTemperature(fahrenheitResult.content[0].text, '°F')
      const celsiusTemp = extractTemperature(celsiusResult.content[0].text, '°C')

      // Validate conversion: (F-32) * 5/9 = C (allowing for API rounding)
      const expectedCelsius = (fahrenheitTemp - 32) * 5 / 9
      expect(celsiusTemp).toBeCloseTo(expectedCelsius, 0)

      // Validate reverse conversion: C * 9/5 + 32 = F
      const expectedFahrenheit = celsiusTemp * 9 / 5 + 32
      expect(fahrenheitTemp).toBeCloseTo(expectedFahrenheit, 0)
    })

    test('should maintain unit consistency in forecast data', async () => {
      const result = await client.callTool('get_weather_forecast_by_location', {
        location: 'Miami, FL',
        temperature_unit: 'celsius'
      })

      expect(result.isError).toBe(false)
      const responseText = result.content[0].text

      // All temperatures should be in Celsius
      const fahrenheitMatches = responseText.match(/\d+°F/g)
      const celsiusMatches = responseText.match(/\d+°C/g)
      
      expect(fahrenheitMatches).toBeNull()
      expect(celsiusMatches).not.toBeNull()
      expect(celsiusMatches!.length).toBeGreaterThan(5) // Multiple temp readings
    })
  })

  describe('Weather Data Validation Across Climate Zones', () => {
    test.each(CLIMATE_ZONE_TESTS)(
      'should return reasonable temperatures for $location in $temperatureUnit',
      async ({ location, expectedTempRange, temperatureUnit }) => {
        const result = await client.callTool('get_current_weather_by_location', {
          location,
          temperature_unit: temperatureUnit
        })

        expect(result.isError).toBe(false)
        const responseText = result.content[0].text

        const tempSymbol = temperatureUnit === 'fahrenheit' ? '°F' : '°C'
        const temperature = extractTemperature(responseText, tempSymbol)
        const [minTemp, maxTemp] = expectedTempRange

        // Temperature should be within reasonable range for the climate zone
        // Allow wider range for seasonal variation
        expect(temperature).toBeGreaterThan(minTemp - 20)
        expect(temperature).toBeLessThan(maxTemp + 20)
      },
      20000 // Longer timeout for climate zone tests
    )
  })

  describe('API Response Structure Validation', () => {
    test('should return well-formatted current weather response', async () => {
      const result = await client.callTool('get_current_weather_by_location', {
        location: 'Seattle, WA',
        temperature_unit: 'fahrenheit'
      })

      expect(result.isError).toBe(false)
      const responseText = result.content[0].text

      // Validate emojis and formatting are present
      expect(responseText).toMatch(/🌤️/)
      expect(responseText).toMatch(/📍/)
      expect(responseText).toMatch(/🌡️|Temperature:/)
      expect(responseText).toMatch(/💧|Humidity:/)
      expect(responseText).toMatch(/💨|Wind Speed:/)
      
      // Should have proper line breaks and structure
      expect(responseText.split('\n').length).toBeGreaterThan(5)
    })

    test('should return well-formatted forecast response', async () => {
      const result = await client.callTool('get_weather_forecast_by_location', {
        location: 'Denver, CO',
        temperature_unit: 'fahrenheit'
      })

      expect(result.isError).toBe(false)
      const responseText = result.content[0].text

      // Validate forecast structure
      expect(responseText).toMatch(/📅/)
      expect(responseText).toMatch(/High:/)
      expect(responseText).toMatch(/Low:/)
      expect(responseText).toMatch(/☁️/)
      
      // Should have multiple days of data (header + current + forecast section + 3 days)
      const sections = responseText.split('📅')
      expect(sections.length).toBe(5) // Header + current + forecast + 3 days
    })
  })

  describe('Weather API Error Handling', () => {
    test('should handle invalid coordinates gracefully', async () => {
      const result = await client.callTool('get_current_weather', {
        latitude: 999,
        longitude: 999,
        temperature_unit: 'fahrenheit'
      })

      expect(result.isError).toBe(true)
      expect(result.content[0].text).toMatch(/(latitude|longitude|coordinate)/i)
    })

    test('should handle API timeouts/failures gracefully', async () => {
      // Test with coordinates that might cause API issues
      const result = await client.callTool('get_current_weather', {
        latitude: 0,
        longitude: 0, // Ocean coordinates
        temperature_unit: 'fahrenheit'
      })

      // Should either succeed or provide a meaningful error message
      if (result.isError) {
        expect(result.content[0].text).toBeDefined()
        expect(result.content[0].text.length).toBeGreaterThan(0)
      } else {
        // If successful, should have basic weather structure
        expect(result.content[0].text).toMatch(/Temperature:|Weather/)
      }
    })
  })

  describe('MCP Tool Compliance', () => {
    test('should return MCP-compliant response format', async () => {
      const result = await client.callTool('get_current_weather_by_location', {
        location: 'Boston, MA',
        temperature_unit: 'fahrenheit'
      })

      // Validate MCP response structure
      expect(result).toHaveProperty('content')
      expect(Array.isArray(result.content)).toBe(true)
      expect(result.content[0]).toHaveProperty('type', 'text')
      expect(result.content[0]).toHaveProperty('text')
      expect(typeof result.content[0].text).toBe('string')
    })

    test('should handle all required MCP tool parameters', async () => {
      // Test that optional parameters work
      const resultWithDefaults = await client.callTool('get_current_weather_by_location', {
        location: 'Portland, OR'
        // temperature_unit omitted - should default to fahrenheit
      })

      expect(resultWithDefaults.isError).toBe(false)
      expect(resultWithDefaults.content[0].text).toMatch(/°F/) // Should default to Fahrenheit
    })
  })
})