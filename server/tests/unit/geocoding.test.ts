import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  searchLocations,
  geocodeLocation,
  parseLocationInput,
} from '../../src/geocoding.js'
import {
  mockGeocodingResponse,
  mockMiamiGeocodingResponse,
  mockEmptyGeocodingResponse,
} from '../__mocks__/api-responses.js'

// Mock the apiClient module
vi.mock('../../src/api-client.js', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

// Mock validation module
vi.mock('../../src/validation.js', () => ({
  validateLocation: vi.fn((input) => typeof input === 'string' ? input.trim() : input),
  isCoordinateString: vi.fn(),
  parseCoordinateString: vi.fn(),
}))

import { apiClient } from '../../src/api-client.js'
import { isCoordinateString, parseCoordinateString } from '../../src/validation.js'

const mockApiClient = vi.mocked(apiClient)
const mockIsCoordinateString = vi.mocked(isCoordinateString)
const mockParseCoordinateString = vi.mocked(parseCoordinateString)

describe('geocoding', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('searchLocations', () => {
    it('searches for locations successfully', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockGeocodingResponse)

      const result = await searchLocations('New York')

      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringMatching(/geocoding-api\.open-meteo\.com\/v1\/search/)
      )
      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringMatching(/name=New\+York/)
      )
      expect(result).toEqual(mockGeocodingResponse.results)
    })

    it('handles US city/state queries with filtering', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockMiamiGeocodingResponse)

      const result = await searchLocations('Miami, FL')

      // Should search for just 'Miami' (the city part)
      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringMatching(/name=Miami/)
      )
      expect(result).toHaveLength(1)
      expect(result[0].admin1).toBe('Florida')
    })

    it('filters US results by state correctly', async () => {
      const multiStateResponse = {
        results: [
          {
            name: 'Springfield',
            latitude: 39.7817,
            longitude: -89.6501,
            country: 'United States',
            country_code: 'US',
            admin1: 'Illinois',
          },
          {
            name: 'Springfield',
            latitude: 42.1015,
            longitude: -72.5898,
            country: 'United States',
            country_code: 'US',
            admin1: 'Massachusetts',
          },
        ],
        generationtime_ms: 2.0,
      }
      
      mockApiClient.get.mockResolvedValueOnce(multiStateResponse)

      const result = await searchLocations('Springfield, MA')

      expect(result).toHaveLength(1)
      expect(result[0].admin1).toBe('Massachusetts')
    })

    it('throws error when no locations found', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockEmptyGeocodingResponse)

      await expect(searchLocations('Nonexistent Location'))
        .rejects.toThrow('No locations found for "Nonexistent Location"')
    })

    it('throws error when state filtering yields no results', async () => {
      const wrongStateResponse = {
        results: [
          {
            name: 'Miami',
            latitude: 25.7617,
            longitude: -80.1918,
            country: 'United States',
            country_code: 'US',
            admin1: 'Florida',
          },
        ],
        generationtime_ms: 1.5,
      }
      
      mockApiClient.get.mockResolvedValueOnce(wrongStateResponse)

      await expect(searchLocations('Miami, CA'))
        .rejects.toThrow('No locations found for "Miami" in California')
    })

    it('handles international queries without state filtering', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockGeocodingResponse)

      const result = await searchLocations('London, UK')

      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringMatching(/name=London%2C\+UK/)
      )
      expect(result).toEqual(mockGeocodingResponse.results)
    })

    it('builds correct API URLs', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockGeocodingResponse)

      await searchLocations('Test Location')

      const calledUrl = mockApiClient.get.mock.calls[0][0]
      expect(calledUrl).toContain('name=Test+Location')
      expect(calledUrl).toContain('count=10')
      expect(calledUrl).toContain('language=en')
      expect(calledUrl).toContain('format=json')
    })
  })

  describe('geocodeLocation', () => {
    it('returns the first search result', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockGeocodingResponse)

      const result = await geocodeLocation('New York')

      expect(result).toEqual(mockGeocodingResponse.results![0])
    })

    it('passes through search errors', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('API Error'))

      await expect(geocodeLocation('Invalid'))
        .rejects.toThrow('API Error')
    })
  })

  describe('parseLocationInput', () => {
    it('parses coordinate strings', async () => {
      mockIsCoordinateString.mockReturnValueOnce(true)
      mockParseCoordinateString.mockReturnValueOnce({
        latitude: 40.7128,
        longitude: -74.006,
      })

      const result = await parseLocationInput('40.7128,-74.006')

      expect(mockIsCoordinateString).toHaveBeenCalledWith('40.7128,-74.006')
      expect(mockParseCoordinateString).toHaveBeenCalledWith('40.7128,-74.006')
      expect(result).toEqual({
        latitude: 40.7128,
        longitude: -74.006,
      })
    })

    it('geocodes location names', async () => {
      mockIsCoordinateString.mockReturnValueOnce(false)
      mockApiClient.get.mockResolvedValueOnce(mockGeocodingResponse)

      const result = await parseLocationInput('New York')

      expect(result).toEqual({
        latitude: 40.7128,
        longitude: -74.006,
        locationName: 'New York, United States',
      })
    })

    it('handles geocoding failures', async () => {
      mockIsCoordinateString.mockReturnValueOnce(false)
      mockApiClient.get.mockResolvedValueOnce(mockEmptyGeocodingResponse)

      await expect(parseLocationInput('Nonexistent'))
        .rejects.toThrow('No locations found')
    })
  })

  describe('city/state parsing', () => {
    it('recognizes valid US state abbreviations', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockMiamiGeocodingResponse)

      await searchLocations('Miami, FL')

      // Should search for just 'Miami' and then filter by Florida
      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringMatching(/name=Miami/)
      )
    })

    it('recognizes full US state names', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockMiamiGeocodingResponse)

      await searchLocations('Miami, Florida')

      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringMatching(/name=Miami/)
      )
    })

    it('treats non-US formats as regular queries', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockGeocodingResponse)

      await searchLocations('Paris, France')

      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringMatching(/name=Paris%2C\+France/)
      )
    })
  })
})