// Temperature conversion utilities
export type TemperatureUnit = 'fahrenheit' | 'celsius'

export function convertTemperature(
  celsius: number,
  unit: TemperatureUnit
): number {
  if (unit === 'fahrenheit') {
    return Math.round((celsius * 9) / 5 + 32)
  }
  return Math.round(celsius * 10) / 10 // Round celsius to 1 decimal
}

export function getTemperatureUnit(unit: TemperatureUnit): string {
  return unit === 'fahrenheit' ? '°F' : '°C'
}

export function getTemperatureLabel(unit: TemperatureUnit): string {
  return unit === 'fahrenheit' ? 'Fahrenheit' : 'Celsius'
}

// US State abbreviation to full name mapping
export const US_STATES: Record<string, string> = {
  AL: 'Alabama',
  AK: 'Alaska', 
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
  DC: 'District of Columbia'
}

// Helper function to normalize state names for matching
export function normalizeStateName(state: string): string {
  const upperState = state.toUpperCase().trim()
  
  // If it's an abbreviation, convert to full name
  if (US_STATES[upperState]) {
    return US_STATES[upperState]
  }
  
  // If it's already a full name, return normalized version
  const fullStateName = Object.values(US_STATES).find(
    fullName => fullName.toLowerCase() === state.toLowerCase().trim()
  )
  
  return fullStateName || state
}

// Check if a string is a valid US state (abbreviation or full name)
export function isValidUSState(state: string): boolean {
  const upperState = state.toUpperCase().trim()
  return US_STATES[upperState] !== undefined || 
         Object.values(US_STATES).some(
           fullName => fullName.toLowerCase() === state.toLowerCase().trim()
         )
}
