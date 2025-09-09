import { type WeatherApiResponse, type GeocodingApiResponse, type NWSAlertsResponse } from '../../src/types.js'

export const mockWeatherResponse: WeatherApiResponse = {
  latitude: 40.7128,
  longitude: -74.006,
  timezone: 'America/New_York',
  current: {
    time: '2024-01-15T12:00:00Z',
    temperature_2m: 20.5,
    relative_humidity_2m: 65,
    apparent_temperature: 18.2,
    weather_code: 1,
    wind_speed_10m: 15.5,
    wind_direction_10m: 225,
    precipitation: 0.0,
  },
  current_units: {
    temperature_2m: '°C',
    relative_humidity_2m: '%',
    apparent_temperature: '°C',
    wind_speed_10m: 'km/h',
    precipitation: 'mm',
  },
  daily: {
    time: ['2024-01-15', '2024-01-16', '2024-01-17'],
    weather_code: [1, 3, 61],
    temperature_2m_max: [22.0, 18.5, 15.2],
    temperature_2m_min: [18.0, 12.3, 8.7],
    precipitation_sum: [0.0, 0.2, 5.8],
  },
  daily_units: {
    temperature_2m_max: '°C',
    temperature_2m_min: '°C',
    precipitation_sum: 'mm',
  },
}

export const mockGeocodingResponse: GeocodingApiResponse = {
  results: [
    {
      name: 'New York',
      latitude: 40.7128,
      longitude: -74.006,
      country: 'United States',
      country_code: 'US',
      admin1: 'New York',
      admin2: 'New York County',
      timezone: 'America/New_York',
      population: 8175133,
      elevation: 10,
      feature_code: 'PPLC',
    },
    {
      name: 'New York Mills',
      latitude: 43.1051,
      longitude: -75.2913,
      country: 'United States',
      country_code: 'US',
      admin1: 'New York',
      admin2: 'Oneida County',
      population: 3327,
    },
  ],
  generationtime_ms: 2.5,
}

export const mockMiamiGeocodingResponse: GeocodingApiResponse = {
  results: [
    {
      name: 'Miami',
      latitude: 25.7617,
      longitude: -80.1918,
      country: 'United States',
      country_code: 'US',
      admin1: 'Florida',
      admin2: 'Miami-Dade County',
      timezone: 'America/New_York',
      population: 442241,
      feature_code: 'PPL',
    },
  ],
  generationtime_ms: 1.8,
}

export const mockEmptyGeocodingResponse: GeocodingApiResponse = {
  results: [],
  generationtime_ms: 1.2,
}

export const mockNWSAlertsWithWarnings: NWSAlertsResponse = {
  '@context': {},
  type: 'FeatureCollection',
  title: 'Active weather alerts for 25.7617,-80.1918',
  updated: '2024-01-15T15:30:00Z',
  features: [
    {
      id: 'alert-1',
      type: 'Feature',
      geometry: null,
      properties: {
        '@id': 'https://api.weather.gov/alerts/urn:oid:2.49.0.1.840.0.test1',
        '@type': 'wx:Alert',
        id: 'urn:oid:2.49.0.1.840.0.test1',
        areaDesc: 'Miami-Dade County, FL',
        geocode: {
          SAME: ['012086'],
          UGC: ['FLC086']
        },
        affectedZones: ['https://api.weather.gov/zones/county/FLC086'],
        references: [],
        sent: '2024-01-15T14:00:00Z',
        effective: '2024-01-15T15:00:00Z',
        onset: '2024-01-15T15:00:00Z',
        expires: '2024-01-15T23:00:00Z',
        ends: '2024-01-15T20:00:00Z',
        status: 'Actual',
        messageType: 'Alert',
        category: 'Met',
        severity: 'Severe',
        certainty: 'Likely',
        urgency: 'Expected',
        event: 'Severe Thunderstorm Warning',
        sender: 'w-nws.webmaster@noaa.gov',
        senderName: 'NWS Miami FL',
        headline: 'Severe Thunderstorm Warning issued January 15 at 3:00PM EST until January 15 at 8:00PM EST by NWS Miami FL',
        description: 'At 300 PM EST, a severe thunderstorm was located near Miami, moving east at 25 mph. HAZARD...60 mph wind gusts and quarter size hail. SOURCE...Radar indicated. IMPACT...Hail damage to vehicles is expected. Expect wind damage to roofs, siding, and trees.',
        instruction: 'For your protection move to an interior room on the lowest floor of a building. Large hail and damaging winds and continuous cloud to ground lightning is occurring with this storm.',
        response: 'Shelter',
        parameters: {
          VTEC: ['/O.NEW.KMFL.SV.W.0001.240115T2000Z-240116T0100Z/'],
          EAS: ['SVR']
        }
      }
    },
    {
      id: 'alert-2',
      type: 'Feature',
      geometry: null,
      properties: {
        '@id': 'https://api.weather.gov/alerts/urn:oid:2.49.0.1.840.0.test2',
        '@type': 'wx:Alert',
        id: 'urn:oid:2.49.0.1.840.0.test2',
        areaDesc: 'Coastal Miami-Dade County, FL',
        geocode: {
          SAME: ['012086'],
          UGC: ['FLZ173']
        },
        affectedZones: ['https://api.weather.gov/zones/forecast/FLZ173'],
        references: [],
        sent: '2024-01-15T12:00:00Z',
        effective: '2024-01-15T12:00:00Z',
        onset: '2024-01-15T18:00:00Z',
        expires: '2024-01-16T06:00:00Z',
        ends: '2024-01-16T06:00:00Z',
        status: 'Actual',
        messageType: 'Alert',
        category: 'Met',
        severity: 'Minor',
        certainty: 'Possible',
        urgency: 'Future',
        event: 'Rip Current Statement',
        sender: 'w-nws.webmaster@noaa.gov',
        senderName: 'NWS Miami FL',
        headline: 'Rip Current Statement issued January 15 at 12:00PM EST until January 16 at 6:00AM EST by NWS Miami FL',
        description: 'A moderate risk of rip currents exists along all Atlantic-facing beaches. Rip currents can sweep even the best swimmers away from shore into deeper water.',
        instruction: 'Swim near a lifeguard. If caught in a rip current, relax and float. Don\'t swim against the current. If able, swim in a direction following the shoreline. If unable to escape, face the shore and call or wave for help.',
        response: 'Avoid',
        parameters: {
          VTEC: ['/O.NEW.KMFL.RP.S.0001.240115T2300Z-240116T1100Z/']
        }
      }
    }
  ]
}

export const mockNWSAlertsEmpty: NWSAlertsResponse = {
  '@context': {},
  type: 'FeatureCollection',
  title: 'Active weather alerts for 40.7128,-74.0060',
  updated: '2024-01-15T15:30:00Z',
  features: []
}

export const mockNWSAlertsExtreme: NWSAlertsResponse = {
  '@context': {},
  type: 'FeatureCollection',
  title: 'Active weather alerts for 30.2672,-97.7431',
  updated: '2024-01-15T15:30:00Z',
  features: [
    {
      id: 'alert-extreme',
      type: 'Feature',
      geometry: null,
      properties: {
        '@id': 'https://api.weather.gov/alerts/urn:oid:2.49.0.1.840.0.extreme1',
        '@type': 'wx:Alert',
        id: 'urn:oid:2.49.0.1.840.0.extreme1',
        areaDesc: 'Travis County, TX',
        geocode: {
          SAME: ['048453'],
          UGC: ['TXC453']
        },
        affectedZones: ['https://api.weather.gov/zones/county/TXC453'],
        references: [],
        sent: '2024-01-15T14:00:00Z',
        effective: '2024-01-15T14:00:00Z',
        onset: '2024-01-15T16:00:00Z',
        expires: '2024-01-15T20:00:00Z',
        ends: '2024-01-15T18:00:00Z',
        status: 'Actual',
        messageType: 'Alert',
        category: 'Met',
        severity: 'Extreme',
        certainty: 'Observed',
        urgency: 'Immediate',
        event: 'Tornado Warning',
        sender: 'w-nws.webmaster@noaa.gov',
        senderName: 'NWS Austin/San Antonio TX',
        headline: 'Tornado Warning issued January 15 at 2:00PM CST until January 15 at 6:00PM CST by NWS Austin/San Antonio TX',
        description: 'A confirmed tornado was located near Austin, moving northeast at 35 mph. HAZARD...Tornado. SOURCE...Weather spotters confirmed tornado. IMPACT...Flying debris will be dangerous to those caught without shelter.',
        instruction: 'TAKE COVER NOW! Move to a basement or an interior room on the lowest floor of a sturdy building. Avoid windows. If you are outdoors, in a mobile home, or in a vehicle, move to the closest substantial shelter and protect yourself from flying debris.',
        response: 'Shelter',
        parameters: {
          VTEC: ['/O.NEW.KEWX.TO.W.0001.240115T2000Z-240116T0000Z/'],
          EAS: ['TOR']
        }
      }
    }
  ]
}