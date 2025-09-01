import { describe, test, expect, beforeAll, afterAll } from 'vitest'
import { MCPTestClient, extractCoordinates, validateLocationText } from '../helpers/mcp-test-client.js'
import { 
  US_CITY_STATE_TESTS, 
  AMBIGUOUS_CITY_TESTS, 
  SMALL_CITY_TESTS, 
  INTERNATIONAL_TESTS,
  COORDINATE_TESTS,
  ERROR_TEST_CASES,
  type TestLocation 
} from '../fixtures/test-locations.js'

describe('Location Parsing Integration Tests', () => {
  let client: MCPTestClient

  beforeAll(async () => {
    client = new MCPTestClient()
    await client.connect()
  })

  afterAll(async () => {
    await client.cleanup()
  })

  describe('US City/State Format Testing (Critical for Issue #3)', () => {
    test.each(US_CITY_STATE_TESTS)(
      'should correctly resolve $input to $expectedState',
      async ({ input, expectedCity, expectedState, expectedCountry, approximateLatitude, approximateLongitude }: TestLocation) => {
        const result = await client.callTool('search_locations', {
          query: input
        })

        expect(result.isError).toBe(false)
        expect(result.content).toHaveLength(1)
        
        const responseText = result.content[0].text
        
        // Validate location information is present
        expect(validateLocationText(responseText, expectedCity, expectedState, expectedCountry)).toBe(true)
        
        // Extract and validate coordinates are approximately correct
        const coordinates = extractCoordinates(responseText)
        expect(coordinates.latitude).toBeCloseTo(approximateLatitude, 1)
        expect(coordinates.longitude).toBeCloseTo(approximateLongitude, 1)
      }
    )
  })

  describe('Ambiguous City Name Disambiguation', () => {
    describe('Springfield Tests', () => {
      test.each(AMBIGUOUS_CITY_TESTS.filter(t => t.category === 'ambiguous-springfield'))(
        'should distinguish $input from other Springfield cities',
        async ({ input, expectedCity, expectedState, expectedCountry }: TestLocation) => {
          const result = await client.callTool('search_locations', {
            query: input
          })

          expect(result.isError).toBe(false)
          const responseText = result.content[0].text
          
          // Should contain the correct state, not other Springfield states
          expect(responseText.toLowerCase()).toContain(expectedState!.toLowerCase())
          expect(validateLocationText(responseText, expectedCity, expectedState, expectedCountry)).toBe(true)
        }
      )
    })

    describe('Portland Tests', () => {
      test.each(AMBIGUOUS_CITY_TESTS.filter(t => t.category === 'ambiguous-portland'))(
        'should distinguish $input correctly',
        async ({ input, expectedCity, expectedState, expectedCountry }: TestLocation) => {
          const result = await client.callTool('search_locations', {
            query: input
          })

          expect(result.isError).toBe(false)
          const responseText = result.content[0].text
          expect(validateLocationText(responseText, expectedCity, expectedState, expectedCountry)).toBe(true)
        }
      )
    })

    describe('Columbus Tests', () => {
      test.each(AMBIGUOUS_CITY_TESTS.filter(t => t.category === 'ambiguous-columbus'))(
        'should distinguish $input correctly',
        async ({ input, expectedCity, expectedState, expectedCountry }: TestLocation) => {
          const result = await client.callTool('search_locations', {
            query: input
          })

          expect(result.isError).toBe(false)
          const responseText = result.content[0].text
          expect(validateLocationText(responseText, expectedCity, expectedState, expectedCountry)).toBe(true)
        }
      )
    })
  })

  describe('Small City Recognition', () => {
    test.each(SMALL_CITY_TESTS)(
      'should correctly locate small city $input',
      async ({ input, expectedCity, expectedState, expectedCountry, approximateLatitude, approximateLongitude }: TestLocation) => {
        const result = await client.callTool('search_locations', {
          query: input
        })

        expect(result.isError).toBe(false)
        const responseText = result.content[0].text
        
        expect(validateLocationText(responseText, expectedCity, expectedState, expectedCountry)).toBe(true)
        
        // Validate coordinates
        const coordinates = extractCoordinates(responseText)
        expect(coordinates.latitude).toBeCloseTo(approximateLatitude, 1)
        expect(coordinates.longitude).toBeCloseTo(approximateLongitude, 1)
      }
    )
  })

  describe('International Location Handling', () => {
    test.each(INTERNATIONAL_TESTS)(
      'should correctly locate international city $input',
      async ({ input, expectedCity, expectedCountry, approximateLatitude, approximateLongitude }: TestLocation) => {
        const result = await client.callTool('search_locations', {
          query: input
        })

        expect(result.isError).toBe(false)
        const responseText = result.content[0].text
        
        expect(validateLocationText(responseText, expectedCity, undefined, expectedCountry)).toBe(true)
        
        // Validate coordinates
        const coordinates = extractCoordinates(responseText)
        expect(coordinates.latitude).toBeCloseTo(approximateLatitude, 1)
        expect(coordinates.longitude).toBeCloseTo(approximateLongitude, 1)
      }
    )
  })

  describe('Coordinate Input Handling', () => {
    test.each(COORDINATE_TESTS)(
      'should handle coordinate input $input ($expectedDescription)',
      async ({ input, approximateLatitude, approximateLongitude }) => {
        const result = await client.callTool('get_current_weather_by_location', {
          location: input,
          temperature_unit: 'fahrenheit'
        })

        expect(result.isError).toBe(false)
        const responseText = result.content[0].text
        
        // Should contain weather data (temperature, humidity, etc.)
        expect(responseText).toMatch(/Temperature: -?\d+(\.\d+)?°F/)
        expect(responseText).toMatch(/Humidity: \d+%/)
        expect(responseText).toMatch(/Wind: [\d.]+/)
      }
    )
  })

  describe('State Filtering Precision', () => {
    test('should filter by exact state match for common city names', async () => {
      // Test that "Springfield, IL" only returns Illinois results, not other Springfields
      const result = await client.callTool('search_locations', {
        query: 'Springfield, IL'
      })

      expect(result.isError).toBe(false)
      const responseText = result.content[0].text
      
      // Should contain Illinois but NOT Massachusetts, Missouri, or Ohio
      expect(responseText.toLowerCase()).toContain('illinois')
      expect(responseText.toLowerCase()).not.toContain('massachusetts')
      expect(responseText.toLowerCase()).not.toContain('missouri') 
      expect(responseText.toLowerCase()).not.toContain('ohio')
    })

    test('should handle state abbreviation vs full name correctly', async () => {
      // Test both "CA" and "California" work
      const abbreviationResult = await client.callTool('search_locations', {
        query: 'San Francisco, CA'
      })
      
      const fullNameResult = await client.callTool('search_locations', {
        query: 'San Francisco, California'  
      })

      expect(abbreviationResult.isError).toBe(false)
      expect(fullNameResult.isError).toBe(false)
      
      // Both should contain California
      expect(abbreviationResult.content[0].text.toLowerCase()).toContain('california')
      expect(fullNameResult.content[0].text.toLowerCase()).toContain('california')
    })
  })

  describe('Error Handling', () => {
    test.each(ERROR_TEST_CASES)(
      'should handle invalid input: $input',
      async ({ input, expectedError }) => {
        const result = await client.callTool('search_locations', {
          query: input
        })

        if (expectedError === 'empty') {
          expect(result.isError).toBe(true)
          expect(result.content[0].text.toLowerCase()).toContain('empty')
        } else if (expectedError === 'No locations found') {
          expect(result.isError).toBe(true)
          expect(result.content[0].text).toContain('No locations found')
        }
      }
    )

    test('should validate coordinate ranges', async () => {
      const invalidCoordinates = [
        { coords: '999,0', desc: 'latitude too high' },
        { coords: '0,999', desc: 'longitude too high' },
        { coords: '-999,0', desc: 'latitude too low' },
        { coords: '0,-999', desc: 'longitude too low' }
      ]

      for (const { coords, desc } of invalidCoordinates) {
        const result = await client.callTool('get_current_weather_by_location', {
          location: coords
        })

        expect(result.isError).toBe(true)
        expect(result.content[0].text.toLowerCase()).toMatch(/(latitude|longitude|coordinate)/)
      }
    })
  })

  describe('MCP Tool Integration with Location Parsing', () => {
    test('weather tools should work with parsed city/state format', async () => {
      const testLocation = 'Miami, FL'
      
      // Test current weather by location
      const currentWeatherResult = await client.callTool('get_current_weather_by_location', {
        location: testLocation,
        temperature_unit: 'fahrenheit'
      })

      expect(currentWeatherResult.isError).toBe(false)
      expect(currentWeatherResult.content[0].text).toContain('Miami')
      expect(currentWeatherResult.content[0].text).toMatch(/Temperature: -?\d+(\.\d+)?°F/)

      // Test forecast by location
      const forecastResult = await client.callTool('get_weather_forecast_by_location', {
        location: testLocation,
        temperature_unit: 'fahrenheit'
      })

      expect(forecastResult.isError).toBe(false)
      expect(forecastResult.content[0].text).toContain('Miami')
      expect(forecastResult.content[0].text).toContain('3-Day Weather Forecast')
    })
  })
})