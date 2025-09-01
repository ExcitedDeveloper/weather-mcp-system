import { describe, it, expect } from 'vitest'
import {
  convertTemperature,
  getTemperatureUnit,
  getTemperatureLabel,
  formatTemperature,
  normalizeStateName,
  isValidUSState,
  US_STATES,
} from '../../src/utils.js'

describe('utils', () => {
  describe('temperature functions', () => {
    describe('convertTemperature', () => {
      it('converts celsius to fahrenheit correctly', () => {
        expect(convertTemperature(0, 'fahrenheit')).toBe(32)
        expect(convertTemperature(20, 'fahrenheit')).toBe(68)
        expect(convertTemperature(100, 'fahrenheit')).toBe(212)
        expect(convertTemperature(-40, 'fahrenheit')).toBe(-40)
      })

      it('rounds celsius values correctly', () => {
        expect(convertTemperature(20.123, 'celsius')).toBe(20.1)
        expect(convertTemperature(20.156, 'celsius')).toBe(20.2)
        expect(convertTemperature(20.951, 'celsius')).toBe(21.0)
      })

      it('handles negative temperatures', () => {
        expect(convertTemperature(-10, 'fahrenheit')).toBe(14)
        expect(convertTemperature(-273.15, 'fahrenheit')).toBe(-460)
      })
    })

    describe('getTemperatureUnit', () => {
      it('returns correct units', () => {
        expect(getTemperatureUnit('fahrenheit')).toBe('°F')
        expect(getTemperatureUnit('celsius')).toBe('°C')
      })
    })

    describe('getTemperatureLabel', () => {
      it('returns correct labels', () => {
        expect(getTemperatureLabel('fahrenheit')).toBe('Fahrenheit')
        expect(getTemperatureLabel('celsius')).toBe('Celsius')
      })
    })

    describe('formatTemperature', () => {
      it('formats temperature with correct unit', () => {
        expect(formatTemperature(20, 'celsius')).toBe('20°C')
        expect(formatTemperature(20, 'fahrenheit')).toBe('68°F')
      })
    })
  })

  describe('US state functions', () => {
    describe('normalizeStateName', () => {
      it('converts abbreviations to full names', () => {
        expect(normalizeStateName('CA')).toBe('California')
        expect(normalizeStateName('ny')).toBe('New York')
        expect(normalizeStateName('FL')).toBe('Florida')
      })

      it('normalizes full names', () => {
        expect(normalizeStateName('california')).toBe('California')
        expect(normalizeStateName('NEW YORK')).toBe('New York')
        expect(normalizeStateName('  Florida  ')).toBe('Florida')
      })

      it('returns original string for invalid states', () => {
        expect(normalizeStateName('Invalid')).toBe('Invalid')
        expect(normalizeStateName('XX')).toBe('XX')
      })
    })

    describe('isValidUSState', () => {
      it('validates state abbreviations', () => {
        expect(isValidUSState('CA')).toBe(true)
        expect(isValidUSState('ny')).toBe(true)
        expect(isValidUSState('FL')).toBe(true)
        expect(isValidUSState('XX')).toBe(false)
      })

      it('validates full state names', () => {
        expect(isValidUSState('California')).toBe(true)
        expect(isValidUSState('new york')).toBe(true)
        expect(isValidUSState('Invalid State')).toBe(false)
      })

      it('handles edge cases', () => {
        expect(isValidUSState('  CA  ')).toBe(true)
        expect(isValidUSState('')).toBe(false)
        expect(isValidUSState('District of Columbia')).toBe(true)
        expect(isValidUSState('DC')).toBe(true)
      })
    })

    describe('US_STATES constant', () => {
      it('contains all 50 states plus DC', () => {
        expect(Object.keys(US_STATES)).toHaveLength(51)
      })

      it('includes District of Columbia', () => {
        expect(US_STATES.DC).toBe('District of Columbia')
      })

      it('has consistent formatting', () => {
        Object.values(US_STATES).forEach(stateName => {
          expect(typeof stateName).toBe('string')
          expect(stateName.length).toBeGreaterThan(0)
          expect(stateName[0]).toBe(stateName[0].toUpperCase())
        })
      })
    })
  })
})