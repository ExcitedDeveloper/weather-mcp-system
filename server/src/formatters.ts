import { WEATHER_CODES, VALIDATION_CONFIG } from './config.js'
import { convertTemperature, getTemperatureUnit } from './utils.js'
import { type WeatherApiResponse, type GeocodingResult, type TemperatureUnit } from './types.js'

export function getWindDirection(degrees: number): string {
  const directions = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
  ]
  const index = Math.round(degrees / 22.5) % 16
  return directions[index]
}

export function formatWeatherDescription(weatherCode: number): string {
  return WEATHER_CODES[weatherCode] || 'Unknown conditions'
}

export function formatCurrentWeatherReport(
  data: WeatherApiResponse,
  temperatureUnit: TemperatureUnit,
  displayLocation?: string
): string {
  const current = data.current
  const units = data.current_units
  const weatherDescription = formatWeatherDescription(current.weather_code)
  const windDirection = getWindDirection(current.wind_direction_10m)

  const temperature = convertTemperature(current.temperature_2m, temperatureUnit)
  const feelsLike = convertTemperature(current.apparent_temperature, temperatureUnit)
  const tempUnit = getTemperatureUnit(temperatureUnit)

  const locationDisplay = displayLocation || `${data.latitude}°, ${data.longitude}°`
  const coordinatesLine = displayLocation
    ? `📐 Coordinates: ${data.latitude}°, ${data.longitude}°`
    : ''

  return `🌤️ Current Weather Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Location: ${locationDisplay}${coordinatesLine ? '\n' + coordinatesLine : ''}
🕐 Time: ${new Date(current.time).toLocaleString()}
🌍 Timezone: ${data.timezone}

🌡️ Temperature: ${temperature}${tempUnit}
🌡️ Feels like: ${feelsLike}${tempUnit}
☁️ Conditions: ${weatherDescription}
💧 Humidity: ${current.relative_humidity_2m}${units.relative_humidity_2m}
🌧️ Precipitation: ${current.precipitation}${units.precipitation}
💨 Wind: ${current.wind_speed_10m}${units.wind_speed_10m} ${windDirection} (${current.wind_direction_10m}°)`
}

export function formatWeatherForecast(
  data: WeatherApiResponse,
  temperatureUnit: TemperatureUnit,
  displayLocation?: string
): string {
  if (!data.daily || !data.daily_units) {
    throw new Error('Forecast data not available')
  }

  const current = data.current
  const daily = data.daily
  const dailyUnits = data.daily_units
  const tempUnit = getTemperatureUnit(temperatureUnit)

  const locationDisplay = displayLocation || `${data.latitude}°, ${data.longitude}°`
  const coordinatesLine = displayLocation
    ? `📐 Coordinates: ${data.latitude}°, ${data.longitude}°`
    : ''

  const currentTemp = convertTemperature(current.temperature_2m, temperatureUnit)

  let forecast = `🌤️ 3-Day Weather Forecast
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Location: ${locationDisplay}${coordinatesLine ? '\n' + coordinatesLine : ''}
🌍 Timezone: ${data.timezone}

🌡️ Current: ${currentTemp}${tempUnit} - ${formatWeatherDescription(current.weather_code)}

📅 Forecast:
`

  const maxDays = Math.min(VALIDATION_CONFIG.FORECAST_DAYS, daily.time.length)
  
  for (let i = 0; i < maxDays; i++) {
    const date = new Date(daily.time[i]).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    })
    const weatherDesc = formatWeatherDescription(daily.weather_code[i])

    const maxTemp = convertTemperature(daily.temperature_2m_max[i], temperatureUnit)
    const minTemp = convertTemperature(daily.temperature_2m_min[i], temperatureUnit)
    const precipitation = daily.precipitation_sum[i]

    const dayLabel = i === 0 ? '📅 Today' : i === 1 ? '📅 Tomorrow' : `📅 ${date}`

    forecast += `
${dayLabel}
   ☁️ ${weatherDesc}
   🌡️ High: ${maxTemp}${tempUnit} | Low: ${minTemp}${tempUnit}
   🌧️ Precipitation: ${precipitation}${dailyUnits.precipitation_sum}`
  }

  return forecast
}

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

export function formatSearchResults(results: GeocodingResult[]): string {
  const displayCount = Math.min(10, results.length)
  
  let output = `🔍 Location Search Results
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Found ${results.length} location(s):

`

  for (let i = 0; i < displayCount; i++) {
    const result = results[i]
    const locationName = formatLocationName(result)
    const population = result.population
      ? ` (Pop: ${result.population.toLocaleString()})`
      : ''
    const elevation = result.elevation ? ` • ${result.elevation}m elevation` : ''
    const timezone = result.timezone ? ` • ${result.timezone}` : ''

    output += `${i + 1}. 📍 ${locationName}${population}
   📐 Coordinates: ${result.latitude}, ${result.longitude}${elevation}${timezone}

`
  }

  output += `💡 Use coordinates or specific location names for weather queries.`

  return output
}