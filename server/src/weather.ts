import { parseLocationInput } from './geocoding.js'
import { apiClient } from './api-client.js'
import { formatCurrentWeatherReport, formatWeatherForecast } from './formatters.js'
import { API_CONFIG, VALIDATION_CONFIG } from './config.js'
import { type WeatherApiResponse, type TemperatureUnit, type Coordinates } from './types.js'

function buildWeatherUrl(coordinates: Coordinates, includeForecast: boolean = false): string {
  const baseUrl = `${API_CONFIG.WEATHER.BASE_URL}${API_CONFIG.WEATHER.ENDPOINTS.FORECAST}`
  const params = new URLSearchParams({
    latitude: coordinates.latitude.toString(),
    longitude: coordinates.longitude.toString(),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,precipitation',
    timezone: 'auto',
  })

  if (includeForecast) {
    params.append('daily', 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum')
    params.append('forecast_days', VALIDATION_CONFIG.FORECAST_DAYS.toString())
  }

  return `${baseUrl}?${params.toString()}`
}

export async function getCurrentWeather(
  latitude: number,
  longitude: number,
  temperatureUnit: TemperatureUnit = 'fahrenheit'
): Promise<string> {
  const coordinates: Coordinates = { latitude, longitude }
  const url = buildWeatherUrl(coordinates)
  
  const data = await apiClient.get<WeatherApiResponse>(url)
  
  return formatCurrentWeatherReport(data, temperatureUnit)
}

export async function getWeatherForecast(
  latitude: number,
  longitude: number,
  temperatureUnit: TemperatureUnit = 'fahrenheit'
): Promise<string> {
  const coordinates: Coordinates = { latitude, longitude }
  const url = buildWeatherUrl(coordinates, true)
  
  const data = await apiClient.get<WeatherApiResponse>(url)
  
  return formatWeatherForecast(data, temperatureUnit)
}

export async function getCurrentWeatherByLocation(
  location: string,
  temperatureUnit: TemperatureUnit = 'fahrenheit'
): Promise<string> {
  const { latitude, longitude, locationName } = await parseLocationInput(location)
  const coordinates: Coordinates = { latitude, longitude }
  const url = buildWeatherUrl(coordinates)
  
  const data = await apiClient.get<WeatherApiResponse>(url)
  
  return formatCurrentWeatherReport(data, temperatureUnit, locationName)
}

export async function getWeatherForecastByLocation(
  location: string,
  temperatureUnit: TemperatureUnit = 'fahrenheit'
): Promise<string> {
  const { latitude, longitude, locationName } = await parseLocationInput(location)
  const coordinates: Coordinates = { latitude, longitude }
  const url = buildWeatherUrl(coordinates, true)
  
  const data = await apiClient.get<WeatherApiResponse>(url)
  
  return formatWeatherForecast(data, temperatureUnit, locationName)
}