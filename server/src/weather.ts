import { parseLocationInput } from './geocoding.js'
import {
  convertTemperature,
  getTemperatureUnit,
  type TemperatureUnit,
} from './utils.js'

// Type definitions for API responses
interface WeatherData {
  latitude: number
  longitude: number
  timezone: string
  current: {
    time: string
    temperature_2m: number
    relative_humidity_2m: number
    apparent_temperature: number
    weather_code: number
    wind_speed_10m: number
    wind_direction_10m: number
    precipitation: number
  }
  current_units: {
    temperature_2m: string
    relative_humidity_2m: string
    apparent_temperature: string
    wind_speed_10m: string
    precipitation: string
  }
  daily?: {
    time: string[]
    weather_code: number[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    precipitation_sum: number[]
  }
  daily_units?: {
    temperature_2m_max: string
    temperature_2m_min: string
    precipitation_sum: string
  }
}

// Open-Meteo API configuration
const OPENMETEO_API_BASE = 'https://api.open-meteo.com/v1'
const USER_AGENT = 'weather-mcp-server/1.0'

// Weather code to description mapping (WMO Weather interpretation codes)
const WEATHER_CODES: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm: Slight or moderate',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
}

// Wind direction helper
function getWindDirection(degrees: number): string {
  const directions = [
    'N',
    'NNE',
    'NE',
    'ENE',
    'E',
    'ESE',
    'SE',
    'SSE',
    'S',
    'SSW',
    'SW',
    'WSW',
    'W',
    'WNW',
    'NW',
    'NNW',
  ]
  const index = Math.round(degrees / 22.5) % 16
  return directions[index]
}

// HTTP request helper
export async function makeApiRequest(url: string): Promise<any> {
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
      `API request failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    )
  }
}

// Current weather function with temperature unit support
export async function getCurrentWeather(
  latitude: number,
  longitude: number,
  temperatureUnit: TemperatureUnit = 'fahrenheit'
): Promise<string> {
  const url = `${OPENMETEO_API_BASE}/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,precipitation&timezone=auto`

  const data: WeatherData = await makeApiRequest(url)

  const current = data.current
  const units = data.current_units
  const weatherDescription =
    WEATHER_CODES[current.weather_code] || 'Unknown conditions'
  const windDirection = getWindDirection(current.wind_direction_10m)

  // Convert temperatures
  const temperature = convertTemperature(
    current.temperature_2m,
    temperatureUnit
  )
  const feelsLike = convertTemperature(
    current.apparent_temperature,
    temperatureUnit
  )
  const tempUnit = getTemperatureUnit(temperatureUnit)

  return `🌤️ Current Weather Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Location: ${data.latitude}°, ${data.longitude}°
🕐 Time: ${new Date(current.time).toLocaleString()}
🌍 Timezone: ${data.timezone}

🌡️ Temperature: ${temperature}${tempUnit}
🌡️ Feels like: ${feelsLike}${tempUnit}
☁️ Conditions: ${weatherDescription}
💧 Humidity: ${current.relative_humidity_2m}${units.relative_humidity_2m}
🌧️ Precipitation: ${current.precipitation}${units.precipitation}
💨 Wind: ${current.wind_speed_10m}${units.wind_speed_10m} ${windDirection} (${
    current.wind_direction_10m
  }°)`
}

// 3-day forecast function with temperature unit support
export async function getWeatherForecast(
  latitude: number,
  longitude: number,
  temperatureUnit: TemperatureUnit = 'fahrenheit'
): Promise<string> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=3`

  const data: WeatherData = await makeApiRequest(url)

  if (!data.daily) {
    throw new Error('Forecast data not available')
  }

  const current = data.current
  const daily = data.daily
  const dailyUnits = data.daily_units!
  const tempUnit = getTemperatureUnit(temperatureUnit)

  // Convert current temperature
  const currentTemp = convertTemperature(
    current.temperature_2m,
    temperatureUnit
  )

  let forecast = `🌤️ 3-Day Weather Forecast
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Location: ${data.latitude}°, ${data.longitude}°
🌍 Timezone: ${data.timezone}

🌡️ Current: ${currentTemp}${tempUnit} - ${
    WEATHER_CODES[current.weather_code] || 'Unknown'
  }

📅 Forecast:
`

  for (let i = 0; i < Math.min(3, daily.time.length); i++) {
    const date = new Date(daily.time[i]).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    })
    const weatherDesc = WEATHER_CODES[daily.weather_code[i]] || 'Unknown'

    // Convert daily temperatures
    const maxTemp = convertTemperature(
      daily.temperature_2m_max[i],
      temperatureUnit
    )
    const minTemp = convertTemperature(
      daily.temperature_2m_min[i],
      temperatureUnit
    )
    const precipitation = daily.precipitation_sum[i]

    forecast += `
${i === 0 ? '📅 Today' : i === 1 ? '📅 Tomorrow' : `📅 ${date}`}
   ☁️ ${weatherDesc}
   🌡️ High: ${maxTemp}${tempUnit} | Low: ${minTemp}${tempUnit}
   🌧️ Precipitation: ${precipitation}${dailyUnits.precipitation_sum}`
  }

  return forecast
}

// Enhanced current weather function that accepts location names or coordinates
export async function getCurrentWeatherByLocation(
  location: string,
  temperatureUnit: TemperatureUnit = 'fahrenheit'
): Promise<string> {
  const { latitude, longitude, locationName } = await parseLocationInput(
    location
  )

  const url = `${OPENMETEO_API_BASE}/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,precipitation&timezone=auto`

  const data: WeatherData = await makeApiRequest(url)

  const current = data.current
  const units = data.current_units
  const weatherDescription =
    WEATHER_CODES[current.weather_code] || 'Unknown conditions'
  const windDirection = getWindDirection(current.wind_direction_10m)

  // Convert temperatures
  const temperature = convertTemperature(
    current.temperature_2m,
    temperatureUnit
  )
  const feelsLike = convertTemperature(
    current.apparent_temperature,
    temperatureUnit
  )
  const tempUnit = getTemperatureUnit(temperatureUnit)

  // Use location name if available, otherwise show coordinates
  const displayLocation =
    locationName || `${data.latitude}°, ${data.longitude}°`

  return `🌤️ Current Weather Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Location: ${displayLocation}
📐 Coordinates: ${data.latitude}°, ${data.longitude}°
🕐 Time: ${new Date(current.time).toLocaleString()}
🌍 Timezone: ${data.timezone}

🌡️ Temperature: ${temperature}${tempUnit}
🌡️ Feels like: ${feelsLike}${tempUnit}
☁️ Conditions: ${weatherDescription}
💧 Humidity: ${current.relative_humidity_2m}${units.relative_humidity_2m}
🌧️ Precipitation: ${current.precipitation}${units.precipitation}
💨 Wind: ${current.wind_speed_10m}${units.wind_speed_10m} ${windDirection} (${
    current.wind_direction_10m
  }°)`
}

// Enhanced forecast function that accepts location names or coordinates
export async function getWeatherForecastByLocation(
  location: string,
  temperatureUnit: TemperatureUnit = 'fahrenheit'
): Promise<string> {
  const { latitude, longitude, locationName } = await parseLocationInput(
    location
  )

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=3`

  const data: WeatherData = await makeApiRequest(url)

  if (!data.daily) {
    throw new Error('Forecast data not available')
  }

  const current = data.current
  const daily = data.daily
  const dailyUnits = data.daily_units!
  const tempUnit = getTemperatureUnit(temperatureUnit)

  // Use location name if available, otherwise show coordinates
  const displayLocation =
    locationName || `${data.latitude}°, ${data.longitude}°`

  // Convert current temperature
  const currentTemp = convertTemperature(
    current.temperature_2m,
    temperatureUnit
  )

  let forecast = `🌤️ 3-Day Weather Forecast
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Location: ${displayLocation}
📐 Coordinates: ${data.latitude}°, ${data.longitude}°
🌍 Timezone: ${data.timezone}

🌡️ Current: ${currentTemp}${tempUnit} - ${
    WEATHER_CODES[current.weather_code] || 'Unknown'
  }

📅 Forecast:
`

  for (let i = 0; i < Math.min(3, daily.time.length); i++) {
    const date = new Date(daily.time[i]).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    })
    const weatherDesc = WEATHER_CODES[daily.weather_code[i]] || 'Unknown'

    // Convert daily temperatures
    const maxTemp = convertTemperature(
      daily.temperature_2m_max[i],
      temperatureUnit
    )
    const minTemp = convertTemperature(
      daily.temperature_2m_min[i],
      temperatureUnit
    )
    const precipitation = daily.precipitation_sum[i]

    forecast += `
${i === 0 ? '📅 Today' : i === 1 ? '📅 Tomorrow' : `📅 ${date}`}
   ☁️ ${weatherDesc}
   🌡️ High: ${maxTemp}${tempUnit} | Low: ${minTemp}${tempUnit}
   🌧️ Precipitation: ${precipitation}${dailyUnits.precipitation_sum}`
  }

  return forecast
}
