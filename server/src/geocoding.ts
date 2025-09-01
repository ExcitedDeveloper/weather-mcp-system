import { normalizeStateName, isValidUSState } from './utils.js'

// Type definitions for geocoding responses
export interface GeocodingResult {
  name: string
  latitude: number
  longitude: number
  country: string
  country_code: string
  admin1?: string // State/Province
  admin2?: string // County/District
  admin3?: string // City district
  admin4?: string // Neighborhood
  timezone?: string
  population?: number
  elevation?: number
  feature_code?: string // Type of location (PPLC = capital, PPL = city, etc.)
}

export interface GeocodingResponse {
  results?: GeocodingResult[]
  generationtime_ms: number
}

// Geocoding API configuration
const GEOCODING_API_BASE = 'https://geocoding-api.open-meteo.com/v1'
const USER_AGENT = 'weather-mcp-server/1.0'

// HTTP request helper for geocoding
async function makeGeocodingRequest(url: string): Promise<any> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `HTTP ${response.status}: ${response.statusText} - ${errorText}`
      )
    }

    return await response.json()
  } catch (error) {
    throw new Error(
      `Geocoding request failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    )
  }
}

// Parse city/state format like "Miami, FL" or "Springfield, Illinois"
function parseCityState(query: string): { city: string; state?: string; isUSQuery: boolean } {
  const parts = query.split(',').map(part => part.trim())
  
  if (parts.length === 2) {
    const [city, potentialState] = parts
    
    // Check if the second part is a valid US state
    if (isValidUSState(potentialState)) {
      return {
        city,
        state: normalizeStateName(potentialState),
        isUSQuery: true
      }
    }
  }
  
  // Not a US city/state format, return as-is
  return {
    city: query,
    state: undefined,
    isUSQuery: false
  }
}

// Filter results by US state when specified
function filterByUSState(results: GeocodingResult[], targetState: string): GeocodingResult[] {
  return results.filter(result => {
    // For US locations, admin1 should contain the state name
    if (result.country_code === 'US' && result.admin1) {
      const resultState = normalizeStateName(result.admin1)
      return resultState === targetState
    }
    return false
  })
}

// Search for locations by name
export async function searchLocations(
  query: string
): Promise<GeocodingResult[]> {
  if (!query || query.trim().length === 0) {
    throw new Error('Search query cannot be empty')
  }

  // Parse the query to check for US city/state format
  const { city, state, isUSQuery } = parseCityState(query.trim())
  
  // For US city/state queries, search for just the city name to get all matches
  const searchTerm = isUSQuery ? city : query.trim()
  
  const url = `${GEOCODING_API_BASE}/search?name=${encodeURIComponent(
    searchTerm
  )}&count=10&language=en&format=json`

  const data: GeocodingResponse = await makeGeocodingRequest(url)

  if (!data.results || data.results.length === 0) {
    throw new Error(
      `No locations found for "${query}". Please try a different search term or be more specific.`
    )
  }

  let results = data.results

  // If this is a US city/state query, filter results by state
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

// Get the best matching location for a query
export async function geocodeLocation(
  location: string
): Promise<GeocodingResult> {
  const results = await searchLocations(location)

  // Return the first (most relevant) result
  return results[0]
}

// Parse location input - handles coordinates or location names
export async function parseLocationInput(
  input: string
): Promise<{ latitude: number; longitude: number; locationName?: string }> {
  // Check if input looks like coordinates (lat,lng format)
  const coordMatch = input.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/)

  if (coordMatch) {
    // Input is coordinates
    const latitude = parseFloat(coordMatch[1])
    const longitude = parseFloat(coordMatch[2])

    // Validate coordinate ranges
    if (latitude < -90 || latitude > 90) {
      throw new Error(`Latitude must be between -90 and 90, got: ${latitude}`)
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error(
        `Longitude must be between -180 and 180, got: ${longitude}`
      )
    }

    return { latitude, longitude }
  } else {
    // Input is location name - geocode it
    const result = await geocodeLocation(input)
    const locationName = formatLocationName(result)

    return {
      latitude: result.latitude,
      longitude: result.longitude,
      locationName,
    }
  }
}

// Format location name for display
export function formatLocationName(location: GeocodingResult): string {
  let name = location.name

  if (location.admin1 && location.admin1 !== location.name) {
    name += `, ${location.admin1}`
  }

  if (location.country && location.country !== location.admin1) {
    name += `, ${location.country}`
  }

  return name
}

// Format search results for display
export function formatSearchResults(results: GeocodingResult[]): string {
  let output = `🔍 Location Search Results
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Found ${results.length} location(s):

`

  results.slice(0, 10).forEach((result, index) => {
    const locationName = formatLocationName(result)
    const population = result.population
      ? ` (Pop: ${result.population.toLocaleString()})`
      : ''
    const elevation = result.elevation
      ? ` • ${result.elevation}m elevation`
      : ''
    const timezone = result.timezone ? ` • ${result.timezone}` : ''

    output += `${index + 1}. 📍 ${locationName}${population}
   📐 Coordinates: ${result.latitude}, ${
      result.longitude
    }${elevation}${timezone}

`
  })

  output += `💡 Use coordinates or specific location names for weather queries.`

  return output
}
