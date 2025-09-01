import { describe, test, expect, beforeAll, afterAll } from 'vitest'
import { MCPTestClient } from '../helpers/mcp-test-client.js'

describe('Error Handling Integration Tests', () => {
  let client: MCPTestClient

  beforeAll(async () => {
    client = new MCPTestClient()
    await client.connect()
  })

  afterAll(async () => {
    await client.cleanup()
  })

  describe('Invalid Location Handling', () => {
    test('should return helpful error for nonexistent cities', async () => {
      const result = await client.callTool('search_locations', {
        query: 'NonexistentCity12345'
      })

      expect(result.isError).toBe(true)
      expect(result.content[0].text).toContain('No locations found')
      expect(result.content[0].text).toContain('try a different search term')
    })

    test('should return helpful error for invalid state abbreviations', async () => {
      const result = await client.callTool('search_locations', {
        query: 'Springfield, XX'
      })

      expect(result.isError).toBe(true)
      expect(result.content[0].text).toContain('No locations found')
    })

    test('should handle empty location queries', async () => {
      const result = await client.callTool('search_locations', {
        query: ''
      })

      expect(result.isError).toBe(true)
      expect(result.content[0].text.toLowerCase()).toContain('empty')
    })

    test('should handle whitespace-only location queries', async () => {
      const result = await client.callTool('search_locations', {
        query: '   '
      })

      expect(result.isError).toBe(true)
      expect(result.content[0].text.toLowerCase()).toContain('empty')
    })
  })

  describe('Invalid Coordinate Handling', () => {
    const invalidCoordinateTests = [
      { coords: { lat: 999, lng: 0 }, desc: 'latitude too high' },
      { coords: { lat: -999, lng: 0 }, desc: 'latitude too low' },
      { coords: { lat: 0, lng: 999 }, desc: 'longitude too high' },
      { coords: { lat: 0, lng: -999 }, desc: 'longitude too low' },
      { coords: { lat: 91, lng: 0 }, desc: 'latitude at boundary' },
      { coords: { lat: -91, lng: 0 }, desc: 'latitude at boundary' },
      { coords: { lat: 0, lng: 181 }, desc: 'longitude at boundary' },
      { coords: { lat: 0, lng: -181 }, desc: 'longitude at boundary' }
    ]

    test.each(invalidCoordinateTests)(
      'should reject invalid coordinates: $desc',
      async ({ coords }) => {
        const result = await client.callTool('get_current_weather', {
          latitude: coords.lat,
          longitude: coords.lng,
          temperature_unit: 'fahrenheit'
        })

        expect(result.isError).toBe(true)
        expect(result.content[0].text.toLowerCase()).toMatch(/(latitude|longitude|coordinate)/)
      }
    )

    test('should handle malformed coordinate strings in location field', async () => {
      const malformedCoords = [
        'abc,def',
        '12.34,',
        ',56.78',
        '12.34,56.78,90.12', // too many values
        'not-coordinates'
      ]

      for (const coords of malformedCoords) {
        const result = await client.callTool('get_current_weather_by_location', {
          location: coords,
          temperature_unit: 'fahrenheit'
        })

        expect(result.isError).toBe(true)
      }
    })
  })

  describe('Invalid Temperature Unit Handling', () => {
    test('should handle invalid temperature unit gracefully', async () => {
      const result = await client.callTool('get_current_weather', {
        latitude: 40.7128,
        longitude: -74.0060,
        temperature_unit: 'invalid_unit' as any
      })

      // Should either default to fahrenheit or return error
      if (result.isError) {
        expect(result.content[0].text.toLowerCase()).toMatch(/(temperature|unit)/)
      } else {
        // If defaulting, should show temperature
        expect(result.content[0].text).toMatch(/Temperature: -?\d+/)
      }
    })
  })

  describe('MCP Tool Parameter Validation', () => {
    test('should handle missing required parameters', async () => {
      // Test missing latitude
      const result1 = await client.callTool('get_current_weather', {
        longitude: -74.0060,
        temperature_unit: 'fahrenheit'
      } as any)

      expect(result1.isError).toBe(true)

      // Test missing longitude  
      const result2 = await client.callTool('get_current_weather', {
        latitude: 40.7128,
        temperature_unit: 'fahrenheit'
      } as any)

      expect(result2.isError).toBe(true)

      // Test missing location
      const result3 = await client.callTool('get_current_weather_by_location', {
        temperature_unit: 'fahrenheit'
      } as any)

      expect(result3.isError).toBe(true)
    })

    test('should handle null/undefined parameters', async () => {
      const result = await client.callTool('get_current_weather_by_location', {
        location: null,
        temperature_unit: 'fahrenheit'
      } as any)

      expect(result.isError).toBe(true)
      expect(result.content[0].text.toLowerCase()).toMatch(/(location|string)/)
    })

    test('should handle incorrect parameter types', async () => {
      // Pass string where number expected
      const result1 = await client.callTool('get_current_weather', {
        latitude: 'not-a-number',
        longitude: -74.0060,
        temperature_unit: 'fahrenheit'
      } as any)

      expect(result1.isError).toBe(true)

      // Pass number where string expected
      const result2 = await client.callTool('get_current_weather_by_location', {
        location: 12345,
        temperature_unit: 'fahrenheit'
      } as any)

      expect(result2.isError).toBe(true)
    })
  })

  describe('API Failure Simulation', () => {
    test('should handle extreme coordinates that might cause API issues', async () => {
      // Test coordinates in remote areas
      const extremeCoords = [
        { lat: 89.9, lng: 179.9, desc: 'near North Pole' },
        { lat: -89.9, lng: -179.9, desc: 'near South Pole' },
        { lat: 0, lng: 0, desc: 'middle of Atlantic Ocean' }
      ]

      for (const { lat, lng, desc } of extremeCoords) {
        const result = await client.callTool('get_current_weather', {
          latitude: lat,
          longitude: lng,
          temperature_unit: 'fahrenheit'
        })

        // Should either succeed or provide meaningful error
        if (result.isError) {
          expect(result.content[0].text).toBeDefined()
          expect(result.content[0].text.length).toBeGreaterThan(0)
        } else {
          // If successful, should contain basic weather data
          expect(result.content[0].text).toMatch(/(Temperature|Weather)/)
        }
      }
    })
  })

  describe('Geocoding Error Handling', () => {
    test('should handle ambiguous international locations gracefully', async () => {
      // Cities that exist in multiple countries without country specified
      const ambiguousLocations = [
        'Paris', // France vs Texas, Ontario, etc.
        'London', // UK vs Ontario, Kentucky, etc.
        'Rome' // Italy vs Georgia, New York, etc.
      ]

      for (const location of ambiguousLocations) {
        const result = await client.callTool('search_locations', {
          query: location
        })

        expect(result.isError).toBe(false)
        expect(result.content[0].text).toBeDefined()
        
        // Should return multiple results or most prominent result
        expect(result.content[0].text).toMatch(/Found \d+ location/)
      }
    })

    test('should handle special characters and unicode in location names', async () => {
      const specialCityNames = [
        'São Paulo', // Portuguese with tilde
        'México', // Spanish with accent
        'Москва', // Moscow in Cyrillic
        '東京' // Tokyo in Japanese
      ]

      for (const cityName of specialCityNames) {
        const result = await client.callTool('search_locations', {
          query: cityName
        })

        // Should either succeed or provide appropriate error
        expect(result.content[0].text).toBeDefined()
        expect(result.content[0].text.length).toBeGreaterThan(0)
      }
    })
  })

  describe('Response Format Validation', () => {
    test('should always return proper MCP response structure for errors', async () => {
      const result = await client.callTool('get_current_weather', {
        latitude: 999,
        longitude: 999
      } as any)

      expect(result.isError).toBe(true)
      expect(result).toHaveProperty('content')
      expect(Array.isArray(result.content)).toBe(true)
      expect(result.content[0]).toHaveProperty('type', 'text')
      expect(result.content[0]).toHaveProperty('text')
      expect(typeof result.content[0].text).toBe('string')
      expect(result.content[0].text.length).toBeGreaterThan(0)
    })

    test('should provide actionable error messages', async () => {
      const result = await client.callTool('search_locations', {
        query: 'InvalidCity9999'
      })

      expect(result.isError).toBe(true)
      const errorText = result.content[0].text

      // Error should be actionable - suggest what to do
      expect(errorText.toLowerCase()).toMatch(/(try|check|different|specific)/)
    })
  })

  describe('Timeout and Network Error Handling', () => {
    test('should handle slow API responses within timeout', async () => {
      // This test validates our timeout settings work
      const startTime = Date.now()
      
      const result = await client.callTool('get_current_weather_by_location', {
        location: 'Timbuktu, Mali', // Remote location that might be slow
        temperature_unit: 'fahrenheit'
      })

      const endTime = Date.now()
      const duration = endTime - startTime

      // Should complete within our 15 second timeout
      expect(duration).toBeLessThan(15000)
      
      // Should either succeed or provide error within reasonable time
      expect(result.content[0].text).toBeDefined()
    }, 20000) // Set test timeout higher than our expected timeout
  })

  describe('Tool Name Validation', () => {
    test('should handle invalid tool names gracefully', async () => {
      try {
        await client.callTool('nonexistent_tool', {
          some_param: 'value'
        })
        expect.fail('Should have thrown an error for invalid tool name')
      } catch (error) {
        expect(error).toBeDefined()
        expect(error instanceof Error).toBe(true)
      }
    })
  })
})