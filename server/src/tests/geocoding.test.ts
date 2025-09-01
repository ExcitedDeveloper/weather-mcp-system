import { describe, it, expect, vi, beforeEach } from 'vitest'
import { geocodeLocation, searchLocations } from '../geocoding.js'
import { type GeocodingResult } from '../types.js'
import * as apiClient from '../api-client.js'

// Mock the API client
vi.mock('../api-client.js', () => ({
  apiClient: {
    get: vi.fn()
  }
}))

const mockApiClient = apiClient.apiClient as any

describe('geocoding disambiguation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ambiguous location detection', () => {
    it('should throw error for ambiguous "Spring Hill" query', async () => {
      // Mock API response with multiple Spring Hills
      const mockResponse = {
        results: [
          {
            name: 'Spring Hill',
            latitude: 28.4869,
            longitude: -82.5311,
            country: 'United States',
            country_code: 'US',
            admin1: 'Florida',
            population: 98621
          },
          {
            name: 'Spring Hill',
            latitude: 35.7512,
            longitude: -86.9309,
            country: 'United States', 
            country_code: 'US',
            admin1: 'Tennessee',
            population: 40045
          },
          {
            name: 'Spring Hill',
            latitude: 38.7506,
            longitude: -94.8275,
            country: 'United States',
            country_code: 'US', 
            admin1: 'Kansas',
            population: 5437
          }
        ],
        generationtime_ms: 1.5
      }

      mockApiClient.get.mockResolvedValue(mockResponse)

      await expect(geocodeLocation('Spring Hill')).rejects.toThrow(
        /Multiple locations found for "Spring Hill"/
      )
      
      await expect(geocodeLocation('Spring Hill')).rejects.toThrow(
        /Spring Hill, Florida, United States; Spring Hill, Tennessee, United States; Spring Hill, Kansas, United States/
      )
    })

    it('should throw error for ambiguous "Springfield" query', async () => {
      const mockResponse = {
        results: [
          {
            name: 'Springfield',
            latitude: 39.7817,
            longitude: -89.6501,
            country: 'United States',
            country_code: 'US',
            admin1: 'Illinois',
            population: 116250
          },
          {
            name: 'Springfield',
            latitude: 37.2085,
            longitude: -93.2923,
            country: 'United States',
            country_code: 'US', 
            admin1: 'Missouri',
            population: 169176
          },
          {
            name: 'Springfield',
            latitude: 42.1015,
            longitude: -72.5898,
            country: 'United States',
            country_code: 'US',
            admin1: 'Massachusetts', 
            population: 155929
          }
        ],
        generationtime_ms: 2.1
      }

      mockApiClient.get.mockResolvedValue(mockResponse)

      await expect(geocodeLocation('Springfield')).rejects.toThrow(
        /Multiple locations found for "Springfield"/
      )
    })

    it('should throw error for international ambiguous locations', async () => {
      const mockResponse = {
        results: [
          {
            name: 'Cambridge',
            latitude: 52.2053,
            longitude: 0.1218,
            country: 'United Kingdom',
            country_code: 'GB',
            admin1: 'England',
            population: 145674
          },
          {
            name: 'Cambridge',
            latitude: 42.3736,
            longitude: -71.1097,
            country: 'United States',
            country_code: 'US',
            admin1: 'Massachusetts',
            population: 118403
          }
        ],
        generationtime_ms: 1.8
      }

      mockApiClient.get.mockResolvedValue(mockResponse)

      await expect(geocodeLocation('Cambridge')).rejects.toThrow(
        /Multiple locations found for "Cambridge"/
      )
      
      await expect(geocodeLocation('Cambridge')).rejects.toThrow(
        /Cambridge, England, United Kingdom; Cambridge, Massachusetts, United States/
      )
    })
  })

  describe('non-ambiguous location handling', () => {
    it('should return single result for specific "Miami, FL" query', async () => {
      const mockResponse = {
        results: [
          {
            name: 'Miami',
            latitude: 25.7617,
            longitude: -80.1918,
            country: 'United States',
            country_code: 'US',
            admin1: 'Florida',
            population: 442241
          }
        ],
        generationtime_ms: 1.2
      }

      mockApiClient.get.mockResolvedValue(mockResponse)

      const result = await geocodeLocation('Miami, FL')
      expect(result).toEqual(mockResponse.results[0])
      expect(result.name).toBe('Miami')
      expect(result.admin1).toBe('Florida')
    })

    it('should return result for unique location name', async () => {
      const mockResponse = {
        results: [
          {
            name: 'Timbuktu',
            latitude: 16.7666,
            longitude: -3.0026,
            country: 'Mali',
            country_code: 'ML',
            admin1: 'Tombouctou Region',
            population: 54453
          }
        ],
        generationtime_ms: 1.1
      }

      mockApiClient.get.mockResolvedValue(mockResponse)

      const result = await geocodeLocation('Timbuktu')
      expect(result).toEqual(mockResponse.results[0])
      expect(result.name).toBe('Timbuktu')
      expect(result.country).toBe('Mali')
    })

    it('should return result when multiple results are in same geographic area', async () => {
      // Same city with multiple administrative divisions but same general location
      const mockResponse = {
        results: [
          {
            name: 'New York',
            latitude: 40.7128,
            longitude: -74.0060,
            country: 'United States',
            country_code: 'US',
            admin1: 'New York',
            admin2: 'New York County',
            population: 8175133
          },
          {
            name: 'New York City',
            latitude: 40.7128,
            longitude: -74.0060,
            country: 'United States',
            country_code: 'US',
            admin1: 'New York',
            admin2: 'New York County', 
            population: 8175133
          }
        ],
        generationtime_ms: 1.3
      }

      mockApiClient.get.mockResolvedValue(mockResponse)

      const result = await geocodeLocation('New York')
      expect(result).toEqual(mockResponse.results[0])
      expect(result.name).toBe('New York')
    })
  })

  describe('edge cases', () => {
    it('should handle empty results', async () => {
      const mockResponse = {
        results: [],
        generationtime_ms: 0.5
      }

      mockApiClient.get.mockResolvedValue(mockResponse)

      await expect(geocodeLocation('NonexistentPlace')).rejects.toThrow(
        /No locations found for "NonexistentPlace"/
      )
    })

    it('should handle single result', async () => {
      const mockResponse = {
        results: [
          {
            name: 'Unique Location',
            latitude: 0,
            longitude: 0,
            country: 'Test Country',
            country_code: 'TC',
            population: 1000
          }
        ],
        generationtime_ms: 1.0
      }

      mockApiClient.get.mockResolvedValue(mockResponse)

      const result = await geocodeLocation('Unique Location')
      expect(result).toEqual(mockResponse.results[0])
    })

    it('should handle API errors', async () => {
      mockApiClient.get.mockRejectedValue(new Error('API Error'))

      await expect(geocodeLocation('Test Location')).rejects.toThrow('API Error')
    })
  })

  describe('error message formatting', () => {
    it('should include search_locations tool suggestion', async () => {
      const mockResponse = {
        results: [
          { name: 'Test1', latitude: 0, longitude: 0, country: 'Country1', country_code: 'C1', admin1: 'State1' },
          { name: 'Test2', latitude: 1, longitude: 1, country: 'Country2', country_code: 'C2', admin1: 'State2' },
          { name: 'Test3', latitude: 2, longitude: 2, country: 'Country3', country_code: 'C3', admin1: 'State3' },
          { name: 'Test4', latitude: 3, longitude: 3, country: 'Country4', country_code: 'C4', admin1: 'State4' },
          { name: 'Test5', latitude: 4, longitude: 4, country: 'Country5', country_code: 'C5', admin1: 'State5' },
          { name: 'Test6', latitude: 5, longitude: 5, country: 'Country6', country_code: 'C6', admin1: 'State6' }
        ],
        generationtime_ms: 1.5
      }

      mockApiClient.get.mockResolvedValue(mockResponse)

      await expect(geocodeLocation('Test')).rejects.toThrow(
        /Use the search_locations tool to see all 6 options/
      )
    })

    it('should limit alternatives to 5 in error message', async () => {
      const mockResponse = {
        results: Array.from({ length: 10 }, (_, i) => ({
          name: `Test${i}`,
          latitude: i,
          longitude: i,
          country: `Country${i}`,
          country_code: `C${i}`,
          admin1: `State${i}`
        })),
        generationtime_ms: 2.0
      }

      mockApiClient.get.mockResolvedValue(mockResponse)

      const errorMessage = await geocodeLocation('Test').catch(e => e.message)
      
      // Should only show first 5 alternatives
      expect(errorMessage).toMatch(/Test0.*Test1.*Test2.*Test3.*Test4/)
      expect(errorMessage).not.toMatch(/Test5/)
    })
  })
})

describe('searchLocations function', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return all results without disambiguation filtering', async () => {
    const mockResponse = {
      results: [
        { name: 'Spring Hill', country: 'United States', country_code: 'US', admin1: 'Florida', latitude: 28.4869, longitude: -82.5311 },
        { name: 'Spring Hill', country: 'United States', country_code: 'US', admin1: 'Tennessee', latitude: 35.7512, longitude: -86.9309 },
        { name: 'Spring Hill', country: 'United States', country_code: 'US', admin1: 'Kansas', latitude: 38.7506, longitude: -94.8275 }
      ],
      generationtime_ms: 1.5
    }

    mockApiClient.get.mockResolvedValue(mockResponse)

    const results = await searchLocations('Spring Hill')
    expect(results).toHaveLength(3)
    expect(results[0].admin1).toBe('Florida')
    expect(results[1].admin1).toBe('Tennessee') 
    expect(results[2].admin1).toBe('Kansas')
  })
})