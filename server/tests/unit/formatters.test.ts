import { describe, it, expect } from 'vitest'
import {
  getWindDirection,
  formatWeatherDescription,
  formatCurrentWeatherReport,
  formatWeatherForecast,
  formatLocationName,
  formatSearchResults,
} from '../../src/formatters.js'
import { mockWeatherResponse, mockGeocodingResponse } from '../__mocks__/api-responses.js'

describe('formatters', () => {
  describe('getWindDirection', () => {
    it('converts degrees to cardinal directions', () => {
      expect(getWindDirection(0)).toBe('N')
      expect(getWindDirection(45)).toBe('NE')
      expect(getWindDirection(90)).toBe('E')
      expect(getWindDirection(135)).toBe('SE')
      expect(getWindDirection(180)).toBe('S')
      expect(getWindDirection(225)).toBe('SW')
      expect(getWindDirection(270)).toBe('W')
      expect(getWindDirection(315)).toBe('NW')
    })

    it('handles edge cases and wrapping', () => {
      expect(getWindDirection(360)).toBe('N')
      expect(getWindDirection(361)).toBe('N') // 361 % 16 = 1, but Math.round(361 / 22.5) = 16, 16 % 16 = 0
      expect(getWindDirection(11.25)).toBe('NNE') // Actually rounds to NNE
      expect(getWindDirection(33.75)).toBe('NE') // Rounds to NE
    })
  })

  describe('formatWeatherDescription', () => {
    it('returns correct weather descriptions', () => {
      expect(formatWeatherDescription(0)).toBe('Clear sky')
      expect(formatWeatherDescription(1)).toBe('Mainly clear')
      expect(formatWeatherDescription(61)).toBe('Slight rain')
      expect(formatWeatherDescription(95)).toBe('Thunderstorm: Slight or moderate')
    })

    it('returns unknown for invalid codes', () => {
      expect(formatWeatherDescription(999)).toBe('Unknown conditions')
      expect(formatWeatherDescription(-1)).toBe('Unknown conditions')
    })
  })

  describe('formatCurrentWeatherReport', () => {
    it('formats weather report in fahrenheit', () => {
      const result = formatCurrentWeatherReport(mockWeatherResponse, 'fahrenheit')
      
      expect(result).toContain('Current Weather Report')
      expect(result).toContain('69°F') // 20.5°C converted
      expect(result).toContain('65°F') // 18.2°C converted  
      expect(result).toContain('Mainly clear')
      expect(result).toContain('SW (225°)')
      expect(result).toContain('America/New_York')
    })

    it('formats weather report in celsius', () => {
      const result = formatCurrentWeatherReport(mockWeatherResponse, 'celsius')
      
      expect(result).toContain('20.5°C')
      expect(result).toContain('18.2°C')
    })

    it('includes location name when provided', () => {
      const result = formatCurrentWeatherReport(
        mockWeatherResponse, 
        'fahrenheit', 
        'New York, NY'
      )
      
      expect(result).toContain('📍 Location: New York, NY')
      expect(result).toContain('📐 Coordinates: 40.7128°, -74.006°')
    })

    it('shows coordinates only when no location name', () => {
      const result = formatCurrentWeatherReport(mockWeatherResponse, 'fahrenheit')
      
      expect(result).toContain('📍 Location: 40.7128°, -74.006°')
      expect(result).not.toContain('📐 Coordinates:')
    })
  })

  describe('formatWeatherForecast', () => {
    it('formats forecast in fahrenheit', () => {
      const result = formatWeatherForecast(mockWeatherResponse, 'fahrenheit')
      
      expect(result).toContain('3-Day Weather Forecast')
      expect(result).toContain('📅 Today')
      expect(result).toContain('📅 Tomorrow')
      expect(result).toContain('High: 72°F | Low: 64°F') // 22°C/18°C
    })

    it('formats forecast in celsius', () => {
      const result = formatWeatherForecast(mockWeatherResponse, 'celsius')
      
      expect(result).toContain('High: 22°C | Low: 18°C')
    })

    it('throws error when daily data is missing', () => {
      const responseWithoutDaily = { ...mockWeatherResponse, daily: undefined }
      
      expect(() => formatWeatherForecast(responseWithoutDaily, 'fahrenheit'))
        .toThrow('Forecast data not available')
    })

    it('includes location name when provided', () => {
      const result = formatWeatherForecast(
        mockWeatherResponse, 
        'fahrenheit', 
        'New York, NY'
      )
      
      expect(result).toContain('📍 Location: New York, NY')
      expect(result).toContain('📐 Coordinates: 40.7128°, -74.006°')
    })
  })

  describe('formatLocationName', () => {
    it('formats location with admin1 and country', () => {
      const location = mockGeocodingResponse.results![0]
      const result = formatLocationName(location)
      
      // Both name and admin1 are "New York", so admin1 should be skipped
      expect(result).toBe('New York, United States')
    })

    it('skips duplicate admin1', () => {
      const location = {
        ...mockGeocodingResponse.results![0],
        name: 'New York',
        admin1: 'New York', // Same as name
      }
      const result = formatLocationName(location)
      
      expect(result).toBe('New York, United States')
    })

    it('skips duplicate country', () => {
      const location = {
        ...mockGeocodingResponse.results![0],
        admin1: 'United States',
        country: 'United States', // Same as admin1
      }
      const result = formatLocationName(location)
      
      expect(result).toBe('New York, United States')
    })

    it('handles minimal location data', () => {
      const location = {
        name: 'Test City',
        latitude: 0,
        longitude: 0,
        country: 'Test Country',
        country_code: 'TC',
      }
      const result = formatLocationName(location)
      
      expect(result).toBe('Test City, Test Country')
    })
  })

  describe('formatSearchResults', () => {
    it('formats multiple search results', () => {
      const result = formatSearchResults(mockGeocodingResponse.results!)
      
      expect(result).toContain('Location Search Results')
      expect(result).toContain('Found 2 location(s):')
      expect(result).toContain('1. 📍 New York, United States (Pop: 8,175,133)')
      expect(result).toContain('📐 Coordinates: 40.7128, -74.006')
      expect(result).toContain('2. 📍 New York Mills, New York, United States (Pop: 3,327)')
    })

    it('limits results to 10 items', () => {
      const manyResults = Array(15).fill(mockGeocodingResponse.results![0])
      const result = formatSearchResults(manyResults)
      
      expect(result).toContain('Found 15 location(s):')
      
      // Should only show 10 numbered items
      expect(result).toContain('10. 📍')
      expect(result).not.toContain('11. 📍')
    })

    it('handles results without optional fields', () => {
      const minimalResult = [{
        name: 'Test City',
        latitude: 0,
        longitude: 0,
        country: 'Test Country',
        country_code: 'TC',
      }]
      
      const result = formatSearchResults(minimalResult)
      
      expect(result).toContain('1. 📍 Test City, Test Country')
      expect(result).toContain('📐 Coordinates: 0, 0')
      expect(result).not.toContain('Pop:')
      expect(result).not.toContain('elevation')
      expect(result).not.toContain('•')
    })

    it('formats optional fields correctly', () => {
      const resultWithExtras = [{
        ...mockGeocodingResponse.results![0],
        elevation: 100,
        timezone: 'America/New_York',
      }]
      
      const result = formatSearchResults(resultWithExtras)
      
      expect(result).toContain('• 100m elevation')
      expect(result).toContain('• America/New_York')
    })
  })
})