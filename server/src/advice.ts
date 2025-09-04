import { parseLocationInput } from './geocoding.js'
import { apiClient } from './api-client.js'
import { formatWeatherDescription } from './formatters.js'
import { convertTemperature, getTemperatureUnit } from './utils.js'
import { API_CONFIG } from './config.js'
import { type WeatherApiResponse, type TemperatureUnit, type Coordinates } from './types.js'

function buildWeatherUrl(coordinates: Coordinates): string {
  const baseUrl = `${API_CONFIG.WEATHER.BASE_URL}${API_CONFIG.WEATHER.ENDPOINTS.FORECAST}`
  const params = new URLSearchParams({
    latitude: coordinates.latitude.toString(),
    longitude: coordinates.longitude.toString(),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,precipitation',
    timezone: 'auto',
  })

  return `${baseUrl}?${params.toString()}`
}

interface ClothingAdvice {
  primary: string[]
  accessories: string[]
  footwear: string[]
}

interface ActivityAdvice {
  outdoor: string[]
  indoor: string[]
  travel: string[]
}

interface WeatherWarnings {
  conditions: string[]
  safety: string[]
}

function getClothingRecommendations(tempF: number, weatherCode: number, humidity: number, windSpeed: number): ClothingAdvice {
  const clothing: ClothingAdvice = {
    primary: [],
    accessories: [],
    footwear: []
  }

  // Temperature-based clothing
  if (tempF < 20) {
    clothing.primary.push('Heavy winter coat or parka', 'Multiple warm layers (thermal underwear, sweater)', 'Insulated pants or snow pants')
    clothing.accessories.push('Insulated gloves or mittens', 'Warm winter hat covering ears', 'Scarf or neck warmer', 'Face protection in extreme cold')
    clothing.footwear.push('Insulated waterproof boots', 'Warm wool or thermal socks')
  } else if (tempF < 40) {
    clothing.primary.push('Heavy jacket or coat', 'Warm layers (sweater, fleece)', 'Long pants')
    clothing.accessories.push('Gloves', 'Warm hat or beanie', 'Scarf (optional)')
    clothing.footwear.push('Closed-toe shoes or boots', 'Warm socks')
  } else if (tempF < 60) {
    clothing.primary.push('Light jacket or sweater', 'Long sleeves or layered clothing', 'Long pants or jeans')
    clothing.accessories.push('Light gloves (optional)', 'Light hat (optional)')
    clothing.footwear.push('Comfortable closed-toe shoes', 'Regular socks')
  } else if (tempF < 75) {
    clothing.primary.push('T-shirt or light long sleeves', 'Comfortable pants, jeans, or shorts')
    clothing.accessories.push('Sunglasses', 'Light hat for sun protection')
    clothing.footwear.push('Comfortable shoes or sneakers', 'Light socks')
  } else if (tempF < 85) {
    clothing.primary.push('Light t-shirt or tank top', 'Shorts or light pants', 'Breathable, light-colored clothing')
    clothing.accessories.push('Sunglasses', 'Sun hat or cap', 'Sunscreen')
    clothing.footwear.push('Breathable shoes or sandals', 'Light, moisture-wicking socks')
  } else {
    clothing.primary.push('Minimal, very light clothing', 'Light-colored, loose-fitting clothes', 'Moisture-wicking fabrics')
    clothing.accessories.push('Wide-brimmed hat', 'Sunglasses (UV protection)', 'Sunscreen (high SPF)', 'Cooling towel')
    clothing.footwear.push('Breathable sandals or ventilated shoes', 'Moisture-wicking socks or no socks')
  }

  // Weather condition modifications
  if (weatherCode >= 51 && weatherCode <= 67) { // Rain
    clothing.accessories.push('Umbrella or rain hat')
    clothing.primary.push('Water-resistant or waterproof outer layer')
    clothing.footwear.push('Waterproof shoes or rain boots')
  }

  if (weatherCode >= 71 && weatherCode <= 86) { // Snow
    clothing.accessories.push('Waterproof gloves', 'Warm, waterproof hat')
    clothing.primary.push('Waterproof outer layer')
    clothing.footwear.push('Waterproof boots with good traction')
  }

  // Wind adjustments
  if (windSpeed > 15) {
    clothing.accessories.push('Windproof outer layer', 'Secure hat or hood')
    clothing.primary.push('Wind-resistant jacket')
  }

  // High humidity adjustments
  if (humidity > 80) {
    clothing.primary.push('Breathable, moisture-wicking fabrics')
    clothing.accessories.push('Sweat-wicking headband (if active)')
  }

  return clothing
}

function getActivityRecommendations(tempF: number, weatherCode: number, windSpeed: number, precipitation: number): ActivityAdvice {
  const activities: ActivityAdvice = {
    outdoor: [],
    indoor: [],
    travel: []
  }

  // Temperature-based activity advice
  if (tempF < 20) {
    activities.outdoor.push('Limit outdoor exposure', 'Winter sports with proper gear', 'Keep activities brief')
    activities.indoor.push('Ideal for indoor activities', 'Warm beverages recommended')
    activities.travel.push('Allow extra travel time', 'Keep car emergency kit handy', 'Check road conditions')
  } else if (tempF < 40) {
    activities.outdoor.push('Outdoor activities with warm clothing', 'Great for winter hiking with layers')
    activities.indoor.push('Comfortable for most indoor activities')
    activities.travel.push('Normal travel conditions', 'Keep warm clothes in car')
  } else if (tempF < 60) {
    activities.outdoor.push('Excellent for outdoor activities', 'Perfect hiking weather', 'Great for sports with layers')
    activities.indoor.push('Comfortable indoor temperature')
    activities.travel.push('Ideal travel conditions')
  } else if (tempF < 75) {
    activities.outdoor.push('Perfect outdoor weather', 'Ideal for all outdoor sports', 'Great for walking, running, cycling')
    activities.indoor.push('May want to open windows for fresh air')
    activities.travel.push('Excellent travel weather')
  } else if (tempF < 85) {
    activities.outdoor.push('Great for outdoor activities', 'Stay hydrated during activities', 'Early morning/evening preferred for intense activities')
    activities.indoor.push('May want air conditioning')
    activities.travel.push('Good travel weather', 'Stay hydrated')
  } else {
    activities.outdoor.push('Limit midday outdoor activities', 'Seek shade frequently', 'Stay very hydrated')
    activities.indoor.push('Air conditioning recommended', 'Cool, indoor activities preferred')
    activities.travel.push('Avoid leaving items in hot cars', 'Stay hydrated', 'Take breaks in air conditioning')
  }

  // Weather condition modifications
  if (weatherCode >= 51 && weatherCode <= 67) { // Rain
    activities.outdoor.push('Indoor activities preferred', 'If outdoors, seek covered areas')
    activities.travel.push('Drive carefully on wet roads', 'Allow extra travel time', 'Use headlights')
  }

  if (weatherCode >= 71 && weatherCode <= 86) { // Snow
    activities.outdoor.push('Great for winter sports', 'Use caution on icy surfaces')
    activities.travel.push('Drive slowly and carefully', 'Keep emergency supplies', 'Check road conditions before travel')
  }

  if (windSpeed > 20) {
    activities.outdoor.push('Secure loose items', 'Avoid activities with lightweight objects')
    activities.travel.push('Be cautious of high-profile vehicles', 'Watch for debris')
  }

  if (precipitation > 5) {
    activities.outdoor.push('Heavy precipitation - stay indoors when possible')
    activities.travel.push('Avoid unnecessary travel', 'Flash flooding possible in some areas')
  }

  return activities
}

function getWeatherWarnings(tempF: number, weatherCode: number, windSpeed: number, humidity: number, precipitation: number): WeatherWarnings {
  const warnings: WeatherWarnings = {
    conditions: [],
    safety: []
  }

  // Temperature warnings
  if (tempF < 0) {
    warnings.conditions.push('Extreme cold - frostbite risk within minutes')
    warnings.safety.push('Limit outdoor exposure', 'Cover all exposed skin', 'Watch for signs of hypothermia')
  } else if (tempF < 20) {
    warnings.conditions.push('Very cold - frostbite possible with prolonged exposure')
    warnings.safety.push('Dress in layers', 'Keep extremities warm', 'Limit time outdoors')
  } else if (tempF > 100) {
    warnings.conditions.push('Extreme heat - heat exhaustion and heat stroke risk')
    warnings.safety.push('Stay hydrated', 'Avoid prolonged sun exposure', 'Seek air conditioning', 'Never leave people or pets in cars')
  } else if (tempF > 90) {
    warnings.conditions.push('Very hot - heat-related illness possible')
    warnings.safety.push('Drink plenty of water', 'Take frequent breaks in shade', 'Avoid strenuous outdoor activities during peak hours')
  }

  // Weather condition warnings
  if (weatherCode >= 95 && weatherCode <= 99) { // Thunderstorms
    warnings.conditions.push('Thunderstorms present - lightning risk')
    warnings.safety.push('Seek indoor shelter', 'Avoid open areas and tall objects', 'Stay away from water')
  }

  if (weatherCode >= 51 && weatherCode <= 67) { // Rain
    warnings.conditions.push('Wet conditions - slippery surfaces')
    warnings.safety.push('Drive carefully', 'Watch for puddles and reduced visibility', 'Use appropriate footwear')
  }

  if (weatherCode >= 71 && weatherCode <= 86) { // Snow
    warnings.conditions.push('Snow conditions - reduced visibility and traction')
    warnings.safety.push('Drive slowly', 'Allow extra travel time', 'Clear snow from vehicles', 'Watch for ice')
  }

  // Wind warnings
  if (windSpeed > 25) {
    warnings.conditions.push('High winds - potential for falling objects')
    warnings.safety.push('Secure loose outdoor items', 'Avoid parking under trees', 'Be cautious when driving')
  } else if (windSpeed > 15) {
    warnings.conditions.push('Windy conditions')
    warnings.safety.push('Secure lightweight items', 'Be aware of wind chill effects')
  }

  // Visibility warnings
  if (weatherCode >= 45 && weatherCode <= 48) { // Fog
    warnings.conditions.push('Foggy conditions - reduced visibility')
    warnings.safety.push('Drive with headlights', 'Reduce speed', 'Allow extra following distance')
  }

  // High humidity warnings
  if (humidity > 90 && tempF > 80) {
    warnings.conditions.push('Very high humidity - feels much hotter')
    warnings.safety.push('Heat index may be dangerous', 'Stay hydrated', 'Take frequent breaks')
  }

  return warnings
}

export async function generateWeatherAdvice(
  location: string,
  temperatureUnit: TemperatureUnit = 'fahrenheit'
): Promise<string> {
  const { latitude, longitude, locationName } = await parseLocationInput(location)
  const coordinates: Coordinates = { latitude, longitude }
  const url = buildWeatherUrl(coordinates)
  
  const data = await apiClient.get<WeatherApiResponse>(url)
  const current = data.current

  // API always returns Celsius, convert to Fahrenheit for recommendation logic
  const tempF = (current.temperature_2m * 9/5) + 32

  const displayTemp = convertTemperature(current.temperature_2m, temperatureUnit)
  const tempUnit = getTemperatureUnit(temperatureUnit)
  const weatherDescription = formatWeatherDescription(current.weather_code)
  const locationDisplay = locationName || `${data.latitude}�, ${data.longitude}�`

  const clothing = getClothingRecommendations(tempF, current.weather_code, current.relative_humidity_2m, current.wind_speed_10m)
  const activities = getActivityRecommendations(tempF, current.weather_code, current.wind_speed_10m, current.precipitation)
  const warnings = getWeatherWarnings(tempF, current.weather_code, current.wind_speed_10m, current.relative_humidity_2m, current.precipitation)

  let advice = `<� Weather Advice for ${locationDisplay}


<! Current: ${displayTemp}${tempUnit} - ${weatherDescription}
=� Humidity: ${current.relative_humidity_2m}%
=� Wind: ${current.wind_speed_10m} km/h

=T CLOTHING RECOMMENDATIONS:
`

  clothing.primary.forEach(item => advice += `" ${item}\n`)
  if (clothing.accessories.length > 0) {
    advice += `\n<� Accessories:\n`
    clothing.accessories.forEach(item => advice += `" ${item}\n`)
  }
  if (clothing.footwear.length > 0) {
    advice += `\n=_ Footwear:\n`
    clothing.footwear.forEach(item => advice += `" ${item}\n`)
  }

  if (warnings.conditions.length > 0 || warnings.safety.length > 0) {
    advice += `\n� WEATHER WARNINGS:\n`
    warnings.conditions.forEach(warning => advice += `" ${warning}\n`)
    warnings.safety.forEach(safety => advice += `" ${safety}\n`)
  }

  advice += `\n<� ACTIVITY RECOMMENDATIONS:\n`
  if (activities.outdoor.length > 0) {
    advice += `\n<3 Outdoor Activities:\n`
    activities.outdoor.forEach(activity => advice += `" ${activity}\n`)
  }
  if (activities.indoor.length > 0) {
    advice += `\n<� Indoor Activities:\n`
    activities.indoor.forEach(activity => advice += `" ${activity}\n`)
  }
  if (activities.travel.length > 0) {
    advice += `\n=� Travel Considerations:\n`
    activities.travel.forEach(travel => advice += `" ${travel}\n`)
  }

  return advice.trim()
}