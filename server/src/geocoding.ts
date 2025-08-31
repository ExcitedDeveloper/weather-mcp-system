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

// Search for locations by name
export async function searchLocations(
  query: string
): Promise<GeocodingResult[]> {
  if (!query || query.trim().length === 0) {
    throw new Error('Search query cannot be empty')
  }

  const url = `${GEOCODING_API_BASE}/search?name=${encodeURIComponent(
    query.trim()
  )}&count=10&language=en&format=json`

  const data: GeocodingResponse = await makeGeocodingRequest(url)

  if (!data.results || data.results.length === 0) {
    throw new Error(
      `No locations found for "${query}". Please try a different search term or be more specific.`
    )
  }

  return data.results
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
