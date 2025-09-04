import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import { validateCoordinates, validateLocation, validateTemperatureUnit } from '../validation.js'
import { 
  getCurrentWeather, 
  getWeatherForecast,
  getCurrentWeatherByLocation,
  getWeatherForecastByLocation
} from '../weather.js'
import { searchLocations, formatSearchResults } from '../geocoding.js'
import { generateWeatherAdvice } from '../advice.js'
import { type ToolInput } from '../types.js'

export async function handleGetCurrentWeather(args: ToolInput): Promise<CallToolResult> {
  const { latitude, longitude } = validateCoordinates(args.latitude, args.longitude)
  const temperatureUnit = validateTemperatureUnit(args.temperature_unit)

  const weather = await getCurrentWeather(latitude, longitude, temperatureUnit)
  
  return {
    content: [{ type: 'text', text: weather }],
  }
}

export async function handleGetWeatherForecast(args: ToolInput): Promise<CallToolResult> {
  const { latitude, longitude } = validateCoordinates(args.latitude, args.longitude)
  const temperatureUnit = validateTemperatureUnit(args.temperature_unit)

  const forecast = await getWeatherForecast(latitude, longitude, temperatureUnit)
  
  return {
    content: [{ type: 'text', text: forecast }],
  }
}

export async function handleGetCurrentWeatherByLocation(args: ToolInput): Promise<CallToolResult> {
  const location = validateLocation(args.location)
  const temperatureUnit = validateTemperatureUnit(args.temperature_unit)

  const weather = await getCurrentWeatherByLocation(location, temperatureUnit)
  
  return {
    content: [{ type: 'text', text: weather }],
  }
}

export async function handleGetWeatherForecastByLocation(args: ToolInput): Promise<CallToolResult> {
  const location = validateLocation(args.location)
  const temperatureUnit = validateTemperatureUnit(args.temperature_unit)

  const forecast = await getWeatherForecastByLocation(location, temperatureUnit)
  
  return {
    content: [{ type: 'text', text: forecast }],
  }
}

export async function handleSearchLocations(args: ToolInput): Promise<CallToolResult> {
  const query = validateLocation(args.query)

  const results = await searchLocations(query)
  const formattedResults = formatSearchResults(results)
  
  return {
    content: [{ type: 'text', text: formattedResults }],
  }
}

export async function handleGetWeatherAdvice(args: ToolInput): Promise<CallToolResult> {
  const location = validateLocation(args.location)
  const temperatureUnit = validateTemperatureUnit(args.temperature_unit)

  const advice = await generateWeatherAdvice(location, temperatureUnit)
  
  return {
    content: [{ type: 'text', text: advice }],
  }
}

export const TOOL_HANDLERS = {
  get_current_weather: handleGetCurrentWeather,
  get_weather_forecast: handleGetWeatherForecast,
  get_current_weather_by_location: handleGetCurrentWeatherByLocation,
  get_weather_forecast_by_location: handleGetWeatherForecastByLocation,
  search_locations: handleSearchLocations,
  get_weather_advice: handleGetWeatherAdvice,
} as const

export type ToolName = keyof typeof TOOL_HANDLERS