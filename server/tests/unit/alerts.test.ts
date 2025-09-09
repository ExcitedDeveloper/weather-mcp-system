import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getWeatherAlerts } from '../../src/alerts.js'
import { 
  mockNWSAlertsWithWarnings, 
  mockNWSAlertsEmpty, 
  mockNWSAlertsExtreme 
} from '../__mocks__/api-responses.js'

// Mock the apiClient module
vi.mock('../../src/api-client.js', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

// Mock the geocoding module
vi.mock('../../src/geocoding.js', () => ({
  parseLocationInput: vi.fn(),
}))

import { apiClient } from '../../src/api-client.js'
import { parseLocationInput } from '../../src/geocoding.js'

const mockApiClient = vi.mocked(apiClient)
const mockParseLocationInput = vi.mocked(parseLocationInput)

describe('alerts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockParseLocationInput.mockResolvedValue({
      latitude: 25.7617,
      longitude: -80.1918,
      locationName: 'Miami, FL'
    })
  })

  describe('getWeatherAlerts', () => {
    it('should format severe and minor alerts correctly', async () => {
      mockApiClient.get.mockResolvedValue(mockNWSAlertsWithWarnings)

      const result = await getWeatherAlerts('Miami, FL')

      expect(result).toContain('🚨 **ACTIVE WEATHER ALERTS**')
      expect(result).toContain('📍 Location: Miami, FL')
      expect(result).toContain('📊 Active Alerts: 2')
      expect(result).toContain('⚠️ **SEVERE THUNDERSTORM WARNING**')
      expect(result).toContain('ℹ️ **RIP CURRENT STATEMENT**')
      expect(result).toContain('Miami-Dade County, FL')
      expect(result).toContain('Severity: Severe | Urgency: Expected')
      expect(result).toContain('Severity: Minor | Urgency: Future')
      expect(result).toContain('🛡️ **Safety Instructions:**')
    })

    it('should show no alerts message when no alerts are active', async () => {
      mockApiClient.get.mockResolvedValue(mockNWSAlertsEmpty)

      const result = await getWeatherAlerts('New York, NY')

      expect(result).toContain('✅ **No Active Weather Alerts**')
      expect(result).toContain('📍 Location: Miami, FL')
      expect(result).toContain('No weather alerts, warnings, or advisories are currently in effect')
    })

    it('should prioritize extreme alerts first', async () => {
      mockApiClient.get.mockResolvedValue(mockNWSAlertsExtreme)

      const result = await getWeatherAlerts('Austin, TX')

      expect(result).toContain('🚨 **TORNADO WARNING** 🔴')
      expect(result).toContain('Severity: Extreme | Urgency: Immediate')
      expect(result).toContain('TAKE COVER NOW!')
      expect(result).toContain('Travis County, TX')
    })

    it('should handle international locations gracefully', async () => {
      const error = new Error('Location not found')
      mockParseLocationInput.mockRejectedValue(error)

      const result = await getWeatherAlerts('London, UK')

      expect(result).toContain('🌍 **Weather Alerts Not Available**')
      expect(result).toContain('Weather alerts are only available for locations within the United States')
    })

    it('should handle coordinates outside US bounds', async () => {
      const result = await getWeatherAlerts('51.5074,-0.1278') // London coordinates

      expect(result).toContain('🌍 **Weather Alerts Not Available**')
      expect(result).toContain('Weather alerts are only available for locations within the United States and its territories')
    })

    it('should handle network errors gracefully', async () => {
      const networkError = new Error('Network fetch failed')
      mockApiClient.get.mockRejectedValue(networkError)

      const result = await getWeatherAlerts('Miami, FL')

      expect(result).toContain('❌ **Weather Alerts Service Temporarily Unavailable**')
      expect(result).toContain('Unable to retrieve weather alerts at this time due to a network issue')
    })

    it('should use correct NWS API endpoint and headers', async () => {
      mockApiClient.get.mockResolvedValue(mockNWSAlertsEmpty)

      await getWeatherAlerts('Miami, FL')

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'https://api.weather.gov/alerts/active?point=25.7617%2C-80.1918',
        expect.objectContaining({
          headers: expect.objectContaining({
            'User-Agent': 'weather-mcp-server/1.0 (https://github.com/your-org/weather-mcp-system)',
            'Accept': 'application/ld+json'
          })
        })
      )
    })

    it('should handle coordinate format input', async () => {
      mockParseLocationInput.mockResolvedValue({
        latitude: 40.7128,
        longitude: -74.0060
      })
      mockApiClient.get.mockResolvedValue(mockNWSAlertsEmpty)

      const result = await getWeatherAlerts('40.7128,-74.0060')

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'https://api.weather.gov/alerts/active?point=40.7128%2C-74.006',
        expect.any(Object)
      )
      expect(result).toContain('40.7128°, -74.006°')
    })
  })
})