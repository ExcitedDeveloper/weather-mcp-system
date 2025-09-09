import { normalizeStateName, isValidUSState } from './utils.js'
import { apiClient } from './api-client.js'
import { formatLocationName, formatSearchResults } from './formatters.js'
import { validateLocation, isCoordinateString, parseCoordinateString } from './validation.js'
import { API_CONFIG } from './config.js'
import { type GeocodingResult, type GeocodingApiResponse, type LocationResult } from './types.js'

interface ParsedLocation {
  city: string
  state?: string
  country?: string
  isUSQuery: boolean
}

function parseCityState(query: string): ParsedLocation {
  const parts = query.split(',').map(part => part.trim())
  
  if (parts.length >= 2) {
    const city = parts[0]
    
    // Handle 2-part queries: "City, State" or "City, Country"
    if (parts.length === 2) {
      const [, potentialState] = parts
      
      if (isValidUSState(potentialState)) {
        return {
          city,
          state: normalizeStateName(potentialState),
          country: undefined,
          isUSQuery: true
        }
      }
      
      // For international locations: "City, Country"
      return {
        city,
        state: undefined,
        country: potentialState,
        isUSQuery: false
      }
    }
    
    // Handle 3+ part queries: "City, State, Country" or "City, Region, Country"
    if (parts.length >= 3) {
      const potentialState = parts[1]
      const country = parts[parts.length - 1] // Last part is usually country
      
      if (isValidUSState(potentialState) && (country.toLowerCase() === 'usa' || country.toLowerCase() === 'united states' || country.toLowerCase() === 'us')) {
        return {
          city,
          state: normalizeStateName(potentialState),
          country,
          isUSQuery: true
        }
      }
      
      // For international locations: "City, Region, Country"
      return {
        city,
        state: potentialState, // Region/state for international
        country,
        isUSQuery: false
      }
    }
  }
  
  return {
    city: query,
    state: undefined,
    country: undefined,
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

function detectAmbiguousResults(results: GeocodingResult[], originalQuery: string, parsedLocation: ParsedLocation): boolean {
  if (results.length < 2) {
    return false
  }

  // If user provided country context, check if we have matches within that country
  if (parsedLocation.country) {
    const countryMatches = results.filter(result => 
      matchesCountry(result, parsedLocation.country!)
    )
    
    // If we found matches in the user's specified country, not ambiguous
    if (countryMatches.length > 0) {
      // Still check for ambiguity within the specified country
      if (countryMatches.length === 1) {
        return false // Single match in specified country - not ambiguous
      }
      
      // Multiple matches in same country - check if they're in different regions
      const uniqueRegions = new Set<string>()
      for (const result of countryMatches.slice(0, 5)) {
        const region = result.admin1 || 'none'
        uniqueRegions.add(region)
      }
      
      return uniqueRegions.size >= 2 // Ambiguous if multiple regions within country
    }
  }

  // If no country context or no country matches, use original logic
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

function matchesCountry(result: GeocodingResult, userCountry: string): boolean {
  const country = userCountry.toLowerCase()
  const resultCountry = result.country.toLowerCase()
  const resultCountryCode = result.country_code.toLowerCase()
  
  // Direct matches
  if (resultCountry === country || resultCountryCode === country) {
    return true
  }
  
  // Handle common country name variations
  const countryVariations: Record<string, string[]> = {
    'uk': ['united kingdom', 'gb', 'great britain', 'britain', 'england', 'scotland', 'wales'],
    'united kingdom': ['uk', 'gb', 'great britain', 'britain', 'england', 'scotland', 'wales'],
    'usa': ['united states', 'us', 'america', 'united states of america'],
    'united states': ['usa', 'us', 'america', 'united states of america']
  }
  
  for (const [canonical, variations] of Object.entries(countryVariations)) {
    if ((canonical === country || variations.includes(country)) &&
        (canonical === resultCountry || canonical === resultCountryCode || 
         variations.includes(resultCountry) || variations.includes(resultCountryCode))) {
      return true
    }
  }
  
  return false
}

function formatAmbiguousLocationError(results: GeocodingResult[], originalQuery: string): string {
  // Add null safety check
  if (!results || !Array.isArray(results) || results.length === 0) {
    return `No locations found for "${originalQuery}". Please try a different search term or be more specific.`
  }
  
  const alternatives = results
    .slice(0, 5) // Show top 5 alternatives
    .map(result => formatLocationName(result))
    .join('; ')
    
  return `Multiple locations found for "${originalQuery}". Please be more specific by including state/country: ${alternatives}. Use the search_locations tool to see all ${results.length} options.`
}

export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  const validatedQuery = validateLocation(query)
  const { city, state, country, isUSQuery } = parseCityState(validatedQuery)
  
  const searchTerm = city
  const url = buildGeocodingUrl(searchTerm)
  
  const data = await apiClient.get<GeocodingApiResponse>(url)

  if (!data.results || data.results.length === 0) {
    throw new Error(
      `No locations found for "${query}". Please try a different search term or be more specific.`
    )
  }

  let results = data.results

  // Filter by US state if specified
  if (isUSQuery && state) {
    const filteredResults = filterByUSState(results, state)
    
    if (filteredResults.length === 0) {
      throw new Error(
        `No locations found for "${city}" in ${state}. Please check the spelling or try a different location.`
      )
    }
    
    results = filteredResults
  }
  
  // Filter by country if specified (for international queries)
  else if (country && !isUSQuery) {
    const filteredResults = filterByCountry(results, country)
    
    if (filteredResults.length > 0) {
      results = filteredResults
    }
    // If no exact country matches, keep original results for fallback
  }

  return results
}

function filterByCountry(results: GeocodingResult[], targetCountry: string): GeocodingResult[] {
  return results.filter(result => matchesCountry(result, targetCountry))
}

export async function geocodeLocation(location: string): Promise<GeocodingResult> {
  const results = await searchLocations(location)
  const parsedLocation = parseCityState(location)
  
  // Check if results are ambiguous (multiple different geographic locations)
  if (detectAmbiguousResults(results, location, parsedLocation)) {
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