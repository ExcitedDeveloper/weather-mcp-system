import { describe, it, expect } from 'vitest'
import {
  validateCoordinates,
  parseCoordinate,
  validateLocation,
  validateTemperatureUnit,
  isCoordinateString,
  parseCoordinateString,
  CoordinateValidationError,
  LocationValidationError,
} from '../../src/validation.js'

describe('validation', () => {
  describe('coordinate validation', () => {
    describe('parseCoordinate', () => {
      it('parses valid numeric coordinates', () => {
        expect(parseCoordinate(40.7128, 'latitude')).toBe(40.7128)
        expect(parseCoordinate(-74.006, 'longitude')).toBe(-74.006)
        expect(parseCoordinate(0, 'latitude')).toBe(0)
      })

      it('parses valid string coordinates', () => {
        expect(parseCoordinate('40.7128', 'latitude')).toBe(40.7128)
        expect(parseCoordinate('-74.006', 'longitude')).toBe(-74.006)
        expect(parseCoordinate('0.0', 'latitude')).toBe(0)
      })

      it('throws error for invalid types', () => {
        expect(() => parseCoordinate(null, 'latitude')).toThrowError(CoordinateValidationError)
        expect(() => parseCoordinate(undefined, 'longitude')).toThrowError(CoordinateValidationError)
        expect(() => parseCoordinate({}, 'latitude')).toThrowError(CoordinateValidationError)
      })

      it('throws error for invalid strings', () => {
        expect(() => parseCoordinate('not-a-number', 'latitude')).toThrowError(CoordinateValidationError)
        expect(() => parseCoordinate('', 'longitude')).toThrowError(CoordinateValidationError)
      })
    })

    describe('validateCoordinates', () => {
      it('validates valid coordinate pairs', () => {
        expect(validateCoordinates(40.7128, -74.006)).toEqual({
          latitude: 40.7128,
          longitude: -74.006,
        })
        expect(validateCoordinates(0, 0)).toEqual({
          latitude: 0,
          longitude: 0,
        })
      })

      it('validates coordinate bounds', () => {
        expect(validateCoordinates(90, 180)).toEqual({ latitude: 90, longitude: 180 })
        expect(validateCoordinates(-90, -180)).toEqual({ latitude: -90, longitude: -180 })
      })

      it('throws error for out-of-bounds latitude', () => {
        expect(() => validateCoordinates(91, 0)).toThrowError('Latitude must be between -90 and 90')
        expect(() => validateCoordinates(-91, 0)).toThrowError('Latitude must be between -90 and 90')
      })

      it('throws error for out-of-bounds longitude', () => {
        expect(() => validateCoordinates(0, 181)).toThrowError('Longitude must be between -180 and 180')
        expect(() => validateCoordinates(0, -181)).toThrowError('Longitude must be between -180 and 180')
      })
    })

    describe('isCoordinateString', () => {
      it('identifies valid coordinate strings', () => {
        expect(isCoordinateString('40.7128,-74.006')).toBe(true)
        expect(isCoordinateString('0,0')).toBe(true)
        expect(isCoordinateString('-90, -180')).toBe(true)
        expect(isCoordinateString('  40.7128,  -74.006  ')).toBe(true)
      })

      it('rejects invalid coordinate strings', () => {
        expect(isCoordinateString('not-coordinates')).toBe(false)
        expect(isCoordinateString('40.7128')).toBe(false)
        expect(isCoordinateString('40.7128,invalid')).toBe(false)
        expect(isCoordinateString('')).toBe(false)
      })
    })

    describe('parseCoordinateString', () => {
      it('parses valid coordinate strings', () => {
        expect(parseCoordinateString('40.7128,-74.006')).toEqual({
          latitude: 40.7128,
          longitude: -74.006,
        })
        expect(parseCoordinateString('  0,  0  ')).toEqual({
          latitude: 0,
          longitude: 0,
        })
      })

      it('throws error for invalid coordinate strings', () => {
        expect(() => parseCoordinateString('invalid')).toThrowError(CoordinateValidationError)
        expect(() => parseCoordinateString('40.7128')).toThrowError(CoordinateValidationError)
      })

      it('validates parsed coordinates', () => {
        expect(() => parseCoordinateString('91,0')).toThrowError('Latitude must be between -90 and 90')
        expect(() => parseCoordinateString('0,181')).toThrowError('Longitude must be between -180 and 180')
      })
    })
  })

  describe('location validation', () => {
    describe('validateLocation', () => {
      it('validates valid location strings', () => {
        expect(validateLocation('New York')).toBe('New York')
        expect(validateLocation('  Miami, FL  ')).toBe('Miami, FL')
        expect(validateLocation('London, UK')).toBe('London, UK')
      })

      it('throws error for non-string types', () => {
        expect(() => validateLocation(null)).toThrowError(LocationValidationError)
        expect(() => validateLocation(undefined)).toThrowError(LocationValidationError)
        expect(() => validateLocation(123)).toThrowError(LocationValidationError)
      })

      it('throws error for empty strings', () => {
        expect(() => validateLocation('')).toThrowError('Location must be a non-empty string')
        expect(() => validateLocation('   ')).toThrowError('Location must be a non-empty string')
      })

      it('throws error for overly long strings', () => {
        const longString = 'a'.repeat(201)
        expect(() => validateLocation(longString)).toThrowError('Location must be 200 characters or less')
      })
    })
  })

  describe('temperature unit validation', () => {
    describe('validateTemperatureUnit', () => {
      it('returns fahrenheit for falsy values', () => {
        expect(validateTemperatureUnit(undefined)).toBe('fahrenheit')
        expect(validateTemperatureUnit(null)).toBe('fahrenheit')
        expect(validateTemperatureUnit('')).toBe('fahrenheit')
      })

      it('validates valid temperature units', () => {
        expect(validateTemperatureUnit('fahrenheit')).toBe('fahrenheit')
        expect(validateTemperatureUnit('celsius')).toBe('celsius')
      })

      it('throws error for non-string types', () => {
        expect(() => validateTemperatureUnit(123)).toThrowError(LocationValidationError)
        expect(() => validateTemperatureUnit({})).toThrowError(LocationValidationError)
      })

      it('throws error for invalid temperature units', () => {
        expect(() => validateTemperatureUnit('kelvin')).toThrowError(LocationValidationError)
        expect(() => validateTemperatureUnit('invalid')).toThrowError(LocationValidationError)
      })
    })
  })

  describe('error types', () => {
    it('creates proper CoordinateValidationError instances', () => {
      const error = new CoordinateValidationError('Test message', 'latitude', 91)
      expect(error.name).toBe('CoordinateValidationError')
      expect(error.message).toBe('Test message')
      expect(error.field).toBe('latitude')
      expect(error.value).toBe(91)
      expect(error).toBeInstanceOf(Error)
    })

    it('creates proper LocationValidationError instances', () => {
      const error = new LocationValidationError('Test message', 'location', null)
      expect(error.name).toBe('LocationValidationError')
      expect(error.message).toBe('Test message')
      expect(error.field).toBe('location')
      expect(error.value).toBe(null)
      expect(error).toBeInstanceOf(Error)
    })
  })
})