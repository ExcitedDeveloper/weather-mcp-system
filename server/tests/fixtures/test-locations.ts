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
  }
]

export const ERROR_TEST_CASES = [
  {
    input: 'NonexistentCity12345',
    expectedError: 'No locations found',
    category: 'invalid-location'
  },
  {
    input: 'Springfield, XX',
    expectedError: 'No locations found',
    category: 'invalid-state'
  },
  {
    input: '',
    expectedError: 'empty',
    category: 'empty-input'
  },
  {
    input: '999,999',
    expectedError: 'coordinate',
    category: 'invalid-coordinates'
  }
]

// Combine all location tests for bulk testing
export const ALL_LOCATION_TESTS: TestLocation[] = [
  ...US_CITY_STATE_TESTS,
  ...AMBIGUOUS_CITY_TESTS,
  ...SMALL_CITY_TESTS,
  ...INTERNATIONAL_TESTS
]

// Climate zone tests for temperature validation
export const CLIMATE_ZONE_TESTS = [
  { location: 'Anchorage, AK', expectedTempRange: [-20, 70], season: 'winter' },
  { location: 'Phoenix, AZ', expectedTempRange: [60, 120], season: 'summer' },
  { location: 'Miami, FL', expectedTempRange: [70, 95], season: 'year-round' },
  { location: 'International Falls, MN', expectedTempRange: [-30, 85], season: 'winter-summer' }
]