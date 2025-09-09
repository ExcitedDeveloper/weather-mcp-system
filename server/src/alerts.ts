import { parseLocationInput } from './geocoding.js'
import { apiClient } from './api-client.js'
import { API_CONFIG, REQUEST_CONFIG } from './config.js'
import { 
  type NWSAlertsResponse, 
  type WeatherAlert, 
  type NWSAlertFeature,
  type Coordinates,
  type AlertSeverity
} from './types.js'

function buildAlertsUrl(coordinates: Coordinates): string {
  const baseUrl = `${API_CONFIG.NWS.BASE_URL}${API_CONFIG.NWS.ENDPOINTS.ACTIVE_ALERTS}`
  const params = new URLSearchParams({
    point: `${coordinates.latitude},${coordinates.longitude}`
  })

  return `${baseUrl}?${params.toString()}`
}

function getSeverityEmoji(severity: AlertSeverity): string {
  switch (severity) {
    case 'Extreme':
      return '🚨'
    case 'Severe':
      return '⚠️'
    case 'Moderate':
      return '⚡'
    case 'Minor':
      return 'ℹ️'
    default:
      return '📢'
  }
}

function getSeverityColor(severity: AlertSeverity): string {
  switch (severity) {
    case 'Extreme':
      return '🔴'
    case 'Severe':
      return '🟠'
    case 'Moderate':
      return '🟡'
    case 'Minor':
      return '🟢'
    default:
      return '⚪'
  }
}

function formatTimeString(timeStr: string): string {
  try {
    const date = new Date(timeStr)
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    })
  } catch (error) {
    return timeStr
  }
}

function parseNWSAlert(feature: NWSAlertFeature): WeatherAlert {
  const props = feature.properties
  
  return {
    id: props.id,
    title: props.headline || props.event,
    description: props.description || '',
    event: props.event,
    severity: props.severity,
    urgency: props.urgency,
    certainty: props.certainty,
    headline: props.headline,
    areaDesc: props.areaDesc,
    effective: props.effective,
    expires: props.expires,
    sent: props.sent,
    instruction: props.instruction || undefined,
    response: props.response || undefined,
    category: props.category,
    senderName: props.senderName
  }
}

function formatWeatherAlerts(alerts: WeatherAlert[], locationName?: string, coordinates?: Coordinates): string {
  if (alerts.length === 0) {
    const locationDisplay = locationName || (coordinates ? `${coordinates.latitude}°, ${coordinates.longitude}°` : 'this location')
    return `✅ **No Active Weather Alerts**

📍 Location: ${locationDisplay}
🕐 Checked: ${new Date().toLocaleString('en-US', { timeZoneName: 'short' })}

No weather alerts, warnings, or advisories are currently in effect for this area.`
  }

  const locationDisplay = locationName || (coordinates ? `${coordinates.latitude}°, ${coordinates.longitude}°` : 'Selected Location')
  
  let output = `🚨 **ACTIVE WEATHER ALERTS**

📍 Location: ${locationDisplay}
🕐 Updated: ${new Date().toLocaleString('en-US', { timeZoneName: 'short' })}
📊 Active Alerts: ${alerts.length}

`

  // Sort alerts by severity priority (Extreme > Severe > Moderate > Minor)
  const severityOrder: AlertSeverity[] = ['Extreme', 'Severe', 'Moderate', 'Minor']
  const sortedAlerts = alerts.sort((a, b) => {
    return severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity)
  })

  sortedAlerts.forEach((alert, index) => {
    const severityEmoji = getSeverityEmoji(alert.severity)
    const severityColor = getSeverityColor(alert.severity)
    
    output += `${severityEmoji} **${alert.event.toUpperCase()}** ${severityColor}
┌─ Severity: ${alert.severity} | Urgency: ${alert.urgency}
├─ Area: ${alert.areaDesc}
├─ Effective: ${formatTimeString(alert.effective)}
└─ Expires: ${formatTimeString(alert.expires)}

`

    if (alert.headline) {
      output += `📋 **Summary:**
${alert.headline}

`
    }

    if (alert.description) {
      // Truncate very long descriptions
      const description = alert.description.length > 500 
        ? alert.description.substring(0, 500) + '...'
        : alert.description
      
      output += `📝 **Details:**
${description}

`
    }

    if (alert.instruction) {
      output += `🛡️ **Safety Instructions:**
${alert.instruction}

`
    }

    // Add separator between alerts
    if (index < sortedAlerts.length - 1) {
      output += '─'.repeat(50) + '\n\n'
    }
  })

  return output.trim()
}

export async function getWeatherAlerts(location: string): Promise<string> {
  // Check if it's a coordinates issue (international location) BEFORE parsing
  if (location.includes(',') && !location.includes(' ')) {
    // Looks like coordinates format
    const coords = location.split(',')
    const lat = parseFloat(coords[0])
    const lng = parseFloat(coords[1])
    
    // Check if coordinates are outside US bounds (rough check)
    if (lat < 20 || lat > 70 || lng < -180 || lng > -60) {
      return `🌍 **Weather Alerts Not Available**

📍 Location: ${location}

Weather alerts are only available for locations within the United States and its territories. 

The National Weather Service (NWS) API only provides alerts for US locations. For international weather information, please use our other weather tools:
• get_current_weather_by_location
• get_weather_forecast_by_location
• get_weather_advice`
    }
  }

  try {
    const { latitude, longitude, locationName } = await parseLocationInput(location)
    const coordinates: Coordinates = { latitude, longitude }
    
    // Check if coordinates are outside US bounds AFTER we have valid coordinates
    if (latitude < 20 || latitude > 70 || longitude < -180 || longitude > -60) {
      return `🌍 **Weather Alerts Not Available**

📍 Location: ${locationName || location}

Weather alerts are only available for locations within the United States and its territories. 

The National Weather Service (NWS) API only provides alerts for US locations. For international weather information, please use our other weather tools:
• get_current_weather_by_location
• get_weather_forecast_by_location
• get_weather_advice`
    }
    
    const url = buildAlertsUrl(coordinates)
    
    // Use NWS-specific headers
    const data = await apiClient.get<NWSAlertsResponse>(url, {
      headers: REQUEST_CONFIG.NWS_HEADERS
    })
    
    // Parse alerts from NWS response
    const alerts: WeatherAlert[] = (data.features || []).map(parseNWSAlert)
    
    // Format and return the alerts
    return formatWeatherAlerts(alerts, locationName, coordinates)
    
  } catch (error) {
    
    // Handle location parsing errors (ambiguous locations, not found, etc.)
    if (error instanceof Error) {
      // Location ambiguity error (multiple locations found)
      if (error.message.includes('Multiple locations found')) {
        return `📍 **Location Clarification Needed**

${error.message}

Once you specify the exact location, you can get weather alerts for that area.`
      }
      
      // Location not found error
      if (error.message.includes('not found') || error.message.includes('No locations found')) {
        return `🌍 **Weather Alerts Not Available**

📍 Location: ${location}

${error.message}

Weather alerts are only available for locations within the United States and its territories. For international weather information, please use our other weather tools:
• get_current_weather_by_location
• get_weather_forecast_by_location
• get_weather_advice`
      }
    }
    
    // Network or API errors
    if (error instanceof Error && (error.message.includes('fetch') || error.message.includes('network'))) {
      return `❌ **Weather Alerts Service Temporarily Unavailable**

📍 Location: ${location}

Unable to retrieve weather alerts at this time due to a network issue. Please try again in a few minutes.

For current weather conditions, you can use:
• get_current_weather_by_location
• get_weather_forecast_by_location`
    }
    
    // Generic error fallback
    throw new Error(`Failed to get weather alerts for ${location}: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}