import { VALIDATION_CONFIG } from './config.js'
import { type Coordinates, type TemperatureUnit, type ValidationError } from './types.js'

export class CoordinateValidationError extends Error implements ValidationError {
  field?: string
  value?: unknown

  constructor(message: string, field?: string, value?: unknown) {
    super(message)
    this.name = 'CoordinateValidationError'
    this.field = field
    this.value = value
  }
}

export class LocationValidationError extends Error implements ValidationError {
  field?: string
  value?: unknown

  constructor(message: string, field?: string, value?: unknown) {
    super(message)
    this.name = 'LocationValidationError'
    this.field = field
    this.value = value
  }
}

export function validateCoordinates(lat: unknown, lng: unknown): Coordinates {
  const latitude = parseCoordinate(lat, 'latitude')
  const longitude = parseCoordinate(lng, 'longitude')

  if (latitude < VALIDATION_CONFIG.COORDINATES.LATITUDE.MIN || 
      latitude > VALIDATION_CONFIG.COORDINATES.LATITUDE.MAX) {
    throw new CoordinateValidationError(
      `Latitude must be between ${VALIDATION_CONFIG.COORDINATES.LATITUDE.MIN} and ${VALIDATION_CONFIG.COORDINATES.LATITUDE.MAX}, got: ${latitude}`,
      'latitude',
      latitude
    )
  }

  if (longitude < VALIDATION_CONFIG.COORDINATES.LONGITUDE.MIN || 
      longitude > VALIDATION_CONFIG.COORDINATES.LONGITUDE.MAX) {
    throw new CoordinateValidationError(
      `Longitude must be between ${VALIDATION_CONFIG.COORDINATES.LONGITUDE.MIN} and ${VALIDATION_CONFIG.COORDINATES.LONGITUDE.MAX}, got: ${longitude}`,
      'longitude',
      longitude
    )
  }

  return { latitude, longitude }
}

export function parseCoordinate(value: unknown, fieldName: string): number {
  let numericValue: number

  if (typeof value === 'string') {
    numericValue = parseFloat(value)
  } else if (typeof value === 'number') {
    numericValue = value
  } else {
    throw new CoordinateValidationError(
      `${fieldName} must be a number or numeric string, got: ${typeof value}`,
      fieldName,
      value
    )
  }

  if (isNaN(numericValue)) {
    throw new CoordinateValidationError(
      `Invalid ${fieldName}: ${value}`,
      fieldName,
      value
    )
  }

  return numericValue
}

export function validateLocation(location: unknown): string {
  if (typeof location !== 'string') {
    throw new LocationValidationError(
      `Location must be a string, got: ${typeof location}`,
      'location',
      location
    )
  }

  const trimmed = location.trim()

  if (trimmed.length < VALIDATION_CONFIG.LOCATION.MIN_LENGTH) {
    throw new LocationValidationError(
      'Location must be a non-empty string',
      'location',
      location
    )
  }

  if (trimmed.length > VALIDATION_CONFIG.LOCATION.MAX_LENGTH) {
    throw new LocationValidationError(
      `Location must be ${VALIDATION_CONFIG.LOCATION.MAX_LENGTH} characters or less`,
      'location',
      location
    )
  }

  return trimmed
}

export function validateTemperatureUnit(unit: unknown): TemperatureUnit {
  if (!unit) {
    return 'fahrenheit'
  }

  if (typeof unit !== 'string') {
    throw new LocationValidationError(
      `Temperature unit must be a string, got: ${typeof unit}`,
      'temperature_unit',
      unit
    )
  }

  if (unit !== 'fahrenheit' && unit !== 'celsius') {
    throw new LocationValidationError(
      `Temperature unit must be 'fahrenheit' or 'celsius', got: ${unit}`,
      'temperature_unit',
      unit
    )
  }

  return unit
}

export function isCoordinateString(input: string): boolean {
  return /^-?\d+(?:\.\d+)?,\s*-?\d+(?:\.\d+)?$/.test(input.trim())
}

export function parseCoordinateString(input: string): Coordinates {
  const match = input.trim().match(/^(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)$/)
  
  if (!match) {
    throw new CoordinateValidationError(
      `Invalid coordinate format: ${input}. Expected format: "latitude,longitude"`,
      'coordinates',
      input
    )
  }

  const latitude = parseFloat(match[1])
  const longitude = parseFloat(match[2])

  return validateCoordinates(latitude, longitude)
}