import { normalizeStateName, isValidUSState } from './utils.js'
import { apiClient } from './api-client.js'
import { formatLocationName, formatSearchResults } from './formatters.js'
import { validateLocation, isCoordinateString, parseCoordinateString } from './validation.js'
import { API_CONFIG } from './config.js'
import { type GeocodingResult, type GeocodingApiResponse, type LocationResult } from './types.js'

interface ParsedLocation {
  city: string
  state?: string
  isUSQuery: boolean
}

function parseCityState(query: string): ParsedLocation {
  const parts = query.split(',').map(part => part.trim())
  
  if (parts.length === 2) {
    const [city, potentialState] = parts
    
    if (isValidUSState(potentialState)) {
      return {
        city,
        state: normalizeStateName(potentialState),
        isUSQuery: true
      }
    }
    
    
    // For international locations, still extract the city part
    return {
      city,
      state: undefined,
      isUSQuery: false
    }
  }
  
  return {
    city: query,
    state: undefined,
    isUSQuery: false
  }
}

function filterByUSState(results: GeocodingResult[], targetState: string): GeocodingResult[] {
  return results.filter(result => {
    if (result.country_code === 'US' && result.admin1) {
      const resultState = normalizeStateName(result.admin1)
      return resultState === targetState
    }
    return false
  })
}

function buildGeocodingUrl(query: string): string {
  const baseUrl = `${API_CONFIG.GEOCODING.BASE_URL}${API_CONFIG.GEOCODING.ENDPOINTS.SEARCH}`
  const params = new URLSearchParams({
    name: query,
    count: '10',
    language: 'en',
    format: 'json',
  })
  
  return `${baseUrl}?${params.toString()}`
}

function detectAmbiguousResults(results: GeocodingResult[], originalQuery: string): boolean {
  if (results.length < 2) {
    return false
  }

  // If we have multiple results with different states/countries, it's likely ambiguous
  const uniqueLocationKeys = new Set<string>()
  
  for (const result of results.slice(0, 5)) { // Check first 5 results
    // Create a unique key for each location context
    const locationKey = `${result.country_code}:${result.admin1 || 'none'}`
    uniqueLocationKeys.add(locationKey)
  }

  // If we have 2+ different geographic contexts, it's ambiguous
  return uniqueLocationKeys.size >= 2
}

function formatAmbiguousLocationError(results: GeocodingResult[], originalQuery: string): string {
  const alternatives = results
    .slice(0, 5) // Show top 5 alternatives
    .map(result => formatLocationName(result))
    .join('; ')
    
  return `Multiple locations found for "${originalQuery}". Please be more specific by including state/country: ${alternatives}. Use the search_locations tool to see all ${results.length} options.`
}

export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  const validatedQuery = validateLocation(query)
  const { city, state, isUSQuery } = parseCityState(validatedQuery)
  
  const searchTerm = city
  const url = buildGeocodingUrl(searchTerm)
  
  const data = await apiClient.get<GeocodingApiResponse>(url)

  if (!data.results || data.results.length === 0) {
    throw new Error(
      `No locations found for "${query}". Please try a different search term or be more specific.`
    )
  }

  let results = data.results

  if (isUSQuery && state) {
    const filteredResults = filterByUSState(results, state)
    
    if (filteredResults.length === 0) {
      throw new Error(
        `No locations found for "${city}" in ${state}. Please check the spelling or try a different location.`
      )
    }
    
    results = filteredResults
  }

  return results
}

export async function geocodeLocation(location: string): Promise<GeocodingResult> {
  const results = await searchLocations(location)
  
  // Check if results are ambiguous (multiple different geographic locations)
  if (detectAmbiguousResults(results, location)) {
    throw new Error(formatAmbiguousLocationError(results, location))
  }
  
  return results[0]
}

export async function parseLocationInput(input: string): Promise<LocationResult> {
  const validatedInput = validateLocation(input)
  
  if (isCoordinateString(validatedInput)) {
    const { latitude, longitude } = parseCoordinateString(validatedInput)
    return { latitude, longitude }
  } else {
    const result = await geocodeLocation(validatedInput)
    const locationName = formatLocationName(result)

    return {
      latitude: result.latitude,
      longitude: result.longitude,
      locationName,
    }
  }
}

export { formatLocationName, formatSearchResults }