// Test location data based on the comprehensive test plan from PRD.md

export interface TestLocation {
  input: string
  expectedCity: string
  expectedState?: string
  expectedCountry: string
  approximateLatitude: number
  approximateLongitude: number
  category: string
}

export const US_CITY_STATE_TESTS: TestLocation[] = [
  // Major City/State Combinations
  { 
    input: 'Chicago, IL', 
    expectedCity: 'Chicago', 
    expectedState: 'Illinois', 
    expectedCountry: 'United States',
    approximateLatitude: 41.8781,
    approximateLongitude: -87.6298,
    category: 'major-cities'
  },
  { 
    input: 'Houston, TX', 
    expectedCity: 'Houston', 
    expectedState: 'Texas', 
    expectedCountry: 'United States',
    approximateLatitude: 29.7604,
    approximateLongitude: -95.3698,
    category: 'major-cities'
  },
  { 
    input: 'Phoenix, AZ', 
    expectedCity: 'Phoenix', 
    expectedState: 'Arizona', 
    expectedCountry: 'United States',
    approximateLatitude: 33.4484,
    approximateLongitude: -112.0740,
    category: 'major-cities'
  },
  { 
    input: 'Philadelphia, PA', 
    expectedCity: 'Philadelphia', 
    expectedState: 'Pennsylvania', 
    expectedCountry: 'United States',
    approximateLatitude: 39.9526,
    approximateLongitude: -75.1652,
    category: 'major-cities'
  },
  { 
    input: 'San Antonio, TX', 
    expectedCity: 'San Antonio', 
    expectedState: 'Texas', 
    expectedCountry: 'United States',
    approximateLatitude: 29.4241,
    approximateLongitude: -98.4936,
    category: 'major-cities'
  },
  { 
    input: 'San Diego, CA', 
    expectedCity: 'San Diego', 
    expectedState: 'California', 
    expectedCountry: 'United States',
    approximateLatitude: 32.7157,
    approximateLongitude: -117.1611,
    category: 'major-cities'
  },
  { 
    input: 'Dallas, TX', 
    expectedCity: 'Dallas', 
    expectedState: 'Texas', 
    expectedCountry: 'United States',
    approximateLatitude: 32.7767,
    approximateLongitude: -96.7970,
    category: 'major-cities'
  },
  { 
    input: 'San Jose, CA', 
    expectedCity: 'San Jose', 
    expectedState: 'California', 
    expectedCountry: 'United States',
    approximateLatitude: 37.3382,
    approximateLongitude: -121.8863,
    category: 'major-cities'
  },
  { 
    input: 'Austin, TX', 
    expectedCity: 'Austin', 
    expectedState: 'Texas', 
    expectedCountry: 'United States',
    approximateLatitude: 30.2672,
    approximateLongitude: -97.7431,
    category: 'major-cities'
  },
  { 
    input: 'Jacksonville, FL', 
    expectedCity: 'Jacksonville', 
    expectedState: 'Florida', 
    expectedCountry: 'United States',
    approximateLatitude: 30.3322,
    approximateLongitude: -81.6557,
    category: 'major-cities'
  }
]

export const AMBIGUOUS_CITY_TESTS: TestLocation[] = [
  // Springfield disambiguation
  { 
    input: 'Springfield, IL', 
    expectedCity: 'Springfield', 
    expectedState: 'Illinois', 
    expectedCountry: 'United States',
    approximateLatitude: 39.7817,
    approximateLongitude: -89.6501,
    category: 'ambiguous-springfield'
  },
  { 
    input: 'Springfield, MA', 
    expectedCity: 'Springfield', 
    expectedState: 'Massachusetts', 
    expectedCountry: 'United States',
    approximateLatitude: 42.1015,
    approximateLongitude: -72.5898,
    category: 'ambiguous-springfield'
  },
  { 
    input: 'Springfield, MO', 
    expectedCity: 'Springfield', 
    expectedState: 'Missouri', 
    expectedCountry: 'United States',
    approximateLatitude: 37.2153,
    approximateLongitude: -93.2982,
    category: 'ambiguous-springfield'
  },
  { 
    input: 'Springfield, OH', 
    expectedCity: 'Springfield', 
    expectedState: 'Ohio', 
    expectedCountry: 'United States',
    approximateLatitude: 39.9242,
    approximateLongitude: -83.8088,
    category: 'ambiguous-springfield'
  },
  
  // Portland disambiguation
  { 
    input: 'Portland, OR', 
    expectedCity: 'Portland', 
    expectedState: 'Oregon', 
    expectedCountry: 'United States',
    approximateLatitude: 45.5152,
    approximateLongitude: -122.6784,
    category: 'ambiguous-portland'
  },
  { 
    input: 'Portland, ME', 
    expectedCity: 'Portland', 
    expectedState: 'Maine', 
    expectedCountry: 'United States',
    approximateLatitude: 43.6591,
    approximateLongitude: -70.2568,
    category: 'ambiguous-portland'
  },
  
  // Columbus disambiguation
  { 
    input: 'Columbus, OH', 
    expectedCity: 'Columbus', 
    expectedState: 'Ohio', 
    expectedCountry: 'United States',
    approximateLatitude: 39.9612,
    approximateLongitude: -82.9988,
    category: 'ambiguous-columbus'
  },
  { 
    input: 'Columbus, GA', 
    expectedCity: 'Columbus', 
    expectedState: 'Georgia', 
    expectedCountry: 'United States',
    approximateLatitude: 32.4609,
    approximateLongitude: -84.9877,
    category: 'ambiguous-columbus'
  },

  // Kansas City disambiguation (border city spanning states)
  { 
    input: 'Kansas City, MO', 
    expectedCity: 'Kansas City', 
    expectedState: 'Missouri', 
    expectedCountry: 'United States',
    approximateLatitude: 39.0997,
    approximateLongitude: -94.5786,
    category: 'ambiguous-kansas-city'
  },
  { 
    input: 'Kansas City, KS', 
    expectedCity: 'Kansas City', 
    expectedState: 'Kansas', 
    expectedCountry: 'United States',
    approximateLatitude: 39.1142,
    approximateLongitude: -94.6275,
    category: 'ambiguous-kansas-city'
  },

  // Richmond disambiguation
  { 
    input: 'Richmond, VA', 
    expectedCity: 'Richmond', 
    expectedState: 'Virginia', 
    expectedCountry: 'United States',
    approximateLatitude: 37.5407,
    approximateLongitude: -77.4360,
    category: 'ambiguous-richmond'
  },
  { 
    input: 'Richmond, CA', 
    expectedCity: 'Richmond', 
    expectedState: 'California', 
    expectedCountry: 'United States',
    approximateLatitude: 37.9358,
    approximateLongitude: -122.3477,
    category: 'ambiguous-richmond'
  },

  // Cambridge disambiguation
  { 
    input: 'Cambridge, MA', 
    expectedCity: 'Cambridge', 
    expectedState: 'Massachusetts', 
    expectedCountry: 'United States',
    approximateLatitude: 42.3736,
    approximateLongitude: -71.1097,
    category: 'ambiguous-cambridge'
  },
  { 
    input: 'Cambridge, MD', 
    expectedCity: 'Cambridge', 
    expectedState: 'Maryland', 
    expectedCountry: 'United States',
    approximateLatitude: 38.5631,
    approximateLongitude: -76.0783,
    category: 'ambiguous-cambridge'
  },

  // Franklin disambiguation
  { 
    input: 'Franklin, TN', 
    expectedCity: 'Franklin', 
    expectedState: 'Tennessee', 
    expectedCountry: 'United States',
    approximateLatitude: 35.9251,
    approximateLongitude: -86.8689,
    category: 'ambiguous-franklin'
  },
  { 
    input: 'Franklin, OH', 
    expectedCity: 'Franklin', 
    expectedState: 'Ohio', 
    expectedCountry: 'United States',
    approximateLatitude: 39.5589,
    approximateLongitude: -84.3041,
    category: 'ambiguous-franklin'
  },
  { 
    input: 'Franklin, MA', 
    expectedCity: 'Franklin', 
    expectedState: 'Massachusetts', 
    expectedCountry: 'United States',
    approximateLatitude: 42.0834,
    approximateLongitude: -71.3967,
    category: 'ambiguous-franklin'
  }
]

export const SMALL_CITY_TESTS: TestLocation[] = [
  { 
    input: 'Boulder, CO', 
    expectedCity: 'Boulder', 
    expectedState: 'Colorado', 
    expectedCountry: 'United States',
    approximateLatitude: 40.0150,
    approximateLongitude: -105.2705,
    category: 'small-cities'
  },
  { 
    input: 'Savannah, GA', 
    expectedCity: 'Savannah', 
    expectedState: 'Georgia', 
    expectedCountry: 'United States',
    approximateLatitude: 32.0835,
    approximateLongitude: -81.0998,
    category: 'small-cities'
  },
  { 
    input: 'Burlington, VT', 
    expectedCity: 'Burlington', 
    expectedState: 'Vermont', 
    expectedCountry: 'United States',
    approximateLatitude: 44.4759,
    approximateLongitude: -73.2121,
    category: 'small-cities'
  },
  { 
    input: 'Fargo, ND', 
    expectedCity: 'Fargo', 
    expectedState: 'North Dakota', 
    expectedCountry: 'United States',
    approximateLatitude: 46.8772,
    approximateLongitude: -96.7898,
    category: 'small-cities'
  },
  { 
    input: 'Cheyenne, WY', 
    expectedCity: 'Cheyenne', 
    expectedState: 'Wyoming', 
    expectedCountry: 'United States',
    approximateLatitude: 41.1400,
    approximateLongitude: -104.8197,
    category: 'small-cities'
  }
]

// Special US cases and state format variations
export const SPECIAL_US_CASES: TestLocation[] = [
  { 
    input: 'Washington, DC', 
    expectedCity: 'Washington', 
    expectedState: 'District of Columbia', 
    expectedCountry: 'United States',
    approximateLatitude: 38.9072,
    approximateLongitude: -77.0369,
    category: 'special-cases'
  },
  { 
    input: 'Las Vegas, NV', 
    expectedCity: 'Las Vegas', 
    expectedState: 'Nevada', 
    expectedCountry: 'United States',
    approximateLatitude: 36.1699,
    approximateLongitude: -115.1398,
    category: 'special-cases'
  },
  { 
    input: 'New Orleans, LA', 
    expectedCity: 'New Orleans', 
    expectedState: 'Louisiana', 
    expectedCountry: 'United States',
    approximateLatitude: 29.9511,
    approximateLongitude: -90.0715,
    category: 'special-cases'
  },
  { 
    input: 'Salt Lake City, UT', 
    expectedCity: 'Salt Lake City', 
    expectedState: 'Utah', 
    expectedCountry: 'United States',
    approximateLatitude: 40.7608,
    approximateLongitude: -111.8910,
    category: 'special-cases'
  }
]

// State format variations (abbreviation vs full name)
export const STATE_FORMAT_TESTS: TestLocation[] = [
  { 
    input: 'Austin, TX', 
    expectedCity: 'Austin', 
    expectedState: 'Texas', 
    expectedCountry: 'United States',
    approximateLatitude: 30.2672,
    approximateLongitude: -97.7431,
    category: 'state-format'
  },
  { 
    input: 'Austin, Texas', 
    expectedCity: 'Austin', 
    expectedState: 'Texas', 
    expectedCountry: 'United States',
    approximateLatitude: 30.2672,
    approximateLongitude: -97.7431,
    category: 'state-format'
  },
  { 
    input: 'Denver, CO', 
    expectedCity: 'Denver', 
    expectedState: 'Colorado', 
    expectedCountry: 'United States',
    approximateLatitude: 39.7392,
    approximateLongitude: -104.9903,
    category: 'state-format'
  },
  { 
    input: 'Denver, Colorado', 
    expectedCity: 'Denver', 
    expectedState: 'Colorado', 
    expectedCountry: 'United States',
    approximateLatitude: 39.7392,
    approximateLongitude: -104.9903,
    category: 'state-format'
  },
  { 
    input: 'Boston, MA', 
    expectedCity: 'Boston', 
    expectedState: 'Massachusetts', 
    expectedCountry: 'United States',
    approximateLatitude: 42.3601,
    approximateLongitude: -71.0589,
    category: 'state-format'
  },
  { 
    input: 'Boston, Massachusetts', 
    expectedCity: 'Boston', 
    expectedState: 'Massachusetts', 
    expectedCountry: 'United States',
    approximateLatitude: 42.3601,
    approximateLongitude: -71.0589,
    category: 'state-format'
  }
]

export const INTERNATIONAL_TESTS: TestLocation[] = [
  { 
    input: 'London, United Kingdom', 
    expectedCity: 'London', 
    expectedCountry: 'United Kingdom',
    approximateLatitude: 51.5074,
    approximateLongitude: -0.1278,
    category: 'international'
  },
  { 
    input: 'Paris, France', 
    expectedCity: 'Paris', 
    expectedCountry: 'France',
    approximateLatitude: 48.8566,
    approximateLongitude: 2.3522,
    category: 'international'
  },
  { 
    input: 'Tokyo, Japan', 
    expectedCity: 'Tokyo', 
    expectedCountry: 'Japan',
    approximateLatitude: 35.6762,
    approximateLongitude: 139.6503,
    category: 'international'
  },
  { 
    input: 'Sydney, Australia', 
    expectedCity: 'Sydney', 
    expectedCountry: 'Australia',
    approximateLatitude: -33.8688,
    approximateLongitude: 151.2093,
    category: 'international'
  },
  { 
    input: 'Toronto, Canada', 
    expectedCity: 'Toronto', 
    expectedCountry: 'Canada',
    approximateLatitude: 43.7,
    approximateLongitude: -79.4,
    category: 'international'
  },
  { 
    input: 'Berlin, Germany', 
    expectedCity: 'Berlin', 
    expectedCountry: 'Germany',
    approximateLatitude: 52.5200,
    approximateLongitude: 13.4050,
    category: 'international'
  },
  { 
    input: 'Rome, Italy', 
    expectedCity: 'Rome', 
    expectedCountry: 'Italy',
    approximateLatitude: 41.9028,
    approximateLongitude: 12.4964,
    category: 'international'
  },
  { 
    input: 'Athens, Greece', 
    expectedCity: 'Athens', 
    expectedCountry: 'Greece',
    approximateLatitude: 37.9755,
    approximateLongitude: 23.7348,
    category: 'international'
  },
  { 
    input: 'Manchester, England', 
    expectedCity: 'Manchester', 
    expectedCountry: 'United Kingdom',
    approximateLatitude: 53.4808,
    approximateLongitude: -2.2426,
    category: 'international'
  },
  { 
    input: 'Birmingham, England', 
    expectedCity: 'Birmingham', 
    expectedCountry: 'United Kingdom',
    approximateLatitude: 52.4862,
    approximateLongitude: -1.8904,
    category: 'international'
  },
  { 
    input: 'Mexico City, Mexico', 
    expectedCity: 'Mexico City', 
    expectedCountry: 'Mexico',
    approximateLatitude: 19.4326,
    approximateLongitude: -99.1332,
    category: 'international'
  },
  { 
    input: 'São Paulo, Brazil', 
    expectedCity: 'São Paulo', 
    expectedCountry: 'Brazil',
    approximateLatitude: -23.5505,
    approximateLongitude: -46.6333,
    category: 'international'
  },
  { 
    input: 'Mumbai, India', 
    expectedCity: 'Mumbai', 
    expectedCountry: 'India',
    approximateLatitude: 19.0760,
    approximateLongitude: 72.8777,
    category: 'international'
  },
  { 
    input: 'Lagos, Nigeria', 
    expectedCity: 'Lagos', 
    expectedCountry: 'Nigeria',
    approximateLatitude: 6.5244,
    approximateLongitude: 3.3792,
    category: 'international'
  },
  { 
    input: 'Moscow, Russia', 
    expectedCity: 'Moscow', 
    expectedCountry: 'Russia',
    approximateLatitude: 55.7558,
    approximateLongitude: 37.6176,
    category: 'international'
  }
]

export const COORDINATE_TESTS = [
  {
    input: '40.7128,-74.0060',
    expectedDescription: 'New York City coordinates',
    approximateLatitude: 40.7128,
    approximateLongitude: -74.0060,
    category: 'coordinates'
  },
  {
    input: '34.0522,-118.2437',
    expectedDescription: 'Los Angeles coordinates',
    approximateLatitude: 34.0522,
    approximateLongitude: -118.2437,
    category: 'coordinates'
  },
  {
    input: '25.7617,-80.1918',
    expectedDescription: 'Miami coordinates',
    approximateLatitude: 25.7617,
    approximateLongitude: -80.1918,
    category: 'coordinates'
  },
  {
    input: '51.5074,-0.1278',
    expectedDescription: 'London coordinates',
    approximateLatitude: 51.5074,
    approximateLongitude: -0.1278,
    category: 'coordinates'
  },
  {
    input: '48.8566,2.3522',
    expectedDescription: 'Paris coordinates',
    approximateLatitude: 48.8566,
    approximateLongitude: 2.3522,
    category: 'coordinates'
  },
  {
    input: '35.6762,139.6503',
    expectedDescription: 'Tokyo coordinates',
    approximateLatitude: 35.6762,
    approximateLongitude: 139.6503,
    category: 'coordinates'
  },
  {
    input: '-33.8688,151.2093',
    expectedDescription: 'Sydney coordinates',
    approximateLatitude: -33.8688,
    approximateLongitude: 151.2093,
    category: 'coordinates'
  }
]

export const ERROR_TEST_CASES = [
  {
    input: 'NonexistentCity12345',
    expectedError: 'No locations found',
    category: 'error-handling'
  },
  {
    input: 'Springfield, XX',
    expectedError: 'No locations found',
    category: 'error-handling'
  },
  {
    input: '',
    expectedError: 'empty',
    category: 'error-handling'
  },
  {
    input: '999,999',
    expectedError: 'coordinate',
    category: 'error-handling'
  },
  {
    input: '200,-400',
    expectedError: 'Invalid coordinates',
    category: 'error-handling'
  },
  {
    input: 'Miami FL',
    expectedError: 'format',
    category: 'error-handling'
  },
  {
    input: 'XYZ123Invalid',
    expectedError: 'No locations found',
    category: 'error-handling'
  },
  {
    input: '90,180',
    expectedError: 'boundary',
    category: 'error-handling'
  },
  {
    input: '-90,-180',
    expectedError: 'boundary',
    category: 'error-handling'
  },
  {
    input: '0,0',
    expectedError: 'equator',
    category: 'error-handling'
  }
]

// Temperature unit testing for different climate zones
export const TEMPERATURE_UNIT_TESTS = [
  {
    location: 'Phoenix, AZ',
    temperatureUnit: 'fahrenheit',
    expectedTempRange: [60, 120],
    climate: 'hot-desert',
    category: 'temperature-units'
  },
  {
    location: 'Phoenix, AZ',
    temperatureUnit: 'celsius',
    expectedTempRange: [15, 49],
    climate: 'hot-desert',
    category: 'temperature-units'
  },
  {
    location: 'Anchorage, AK',
    temperatureUnit: 'fahrenheit',
    expectedTempRange: [-20, 70],
    climate: 'cold-subarctic',
    category: 'temperature-units'
  },
  {
    location: 'Anchorage, AK',
    temperatureUnit: 'celsius',
    expectedTempRange: [-29, 21],
    climate: 'cold-subarctic',
    category: 'temperature-units'
  },
  {
    location: 'Miami, FL',
    temperatureUnit: 'fahrenheit',
    expectedTempRange: [70, 95],
    climate: 'tropical',
    category: 'temperature-units'
  },
  {
    location: 'Miami, FL',
    temperatureUnit: 'celsius',
    expectedTempRange: [21, 35],
    climate: 'tropical',
    category: 'temperature-units'
  },
  {
    location: 'San Francisco, CA',
    temperatureUnit: 'fahrenheit',
    expectedTempRange: [45, 75],
    climate: 'mediterranean',
    category: 'temperature-units'
  },
  {
    location: 'San Francisco, CA',
    temperatureUnit: 'celsius',
    expectedTempRange: [7, 24],
    climate: 'mediterranean',
    category: 'temperature-units'
  }
]

// Combine all location tests for bulk testing
export const ALL_LOCATION_TESTS: TestLocation[] = [
  ...US_CITY_STATE_TESTS,
  ...AMBIGUOUS_CITY_TESTS,
  ...SMALL_CITY_TESTS,
  ...SPECIAL_US_CASES,
  ...STATE_FORMAT_TESTS,
  ...INTERNATIONAL_TESTS
]

// All test fixtures combined (for counting)
export const ALL_TEST_FIXTURES = [
  ...US_CITY_STATE_TESTS,
  ...AMBIGUOUS_CITY_TESTS,
  ...SMALL_CITY_TESTS,
  ...SPECIAL_US_CASES,
  ...STATE_FORMAT_TESTS,
  ...INTERNATIONAL_TESTS,
  ...COORDINATE_TESTS,
  ...ERROR_TEST_CASES,
  ...TEMPERATURE_UNIT_TESTS
]