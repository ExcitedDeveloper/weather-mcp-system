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
