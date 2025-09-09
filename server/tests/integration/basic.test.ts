import { describe, test, expect, beforeAll, afterAll } from 'vitest'
import { MCPTestClient } from '../helpers/mcp-test-client.js'

describe('Basic MCP Server Integration', () => {
  let client: MCPTestClient

  beforeAll(async () => {
    client = new MCPTestClient()
    await client.connect()
  })

  afterAll(async () => {
    await client.cleanup()
  })

  test('should connect to MCP server successfully', async () => {
    expect(client).toBeDefined()
  })

  test('should list available tools', async () => {
    const tools = await client.listTools()
    
    expect(tools).toBeDefined()
    expect(Array.isArray(tools)).toBe(true)
    expect(tools.length).toBe(7)
    
    const toolNames = tools.map(tool => tool.name)
    expect(toolNames).toContain('get_current_weather')
    expect(toolNames).toContain('get_weather_forecast')
    expect(toolNames).toContain('get_current_weather_by_location')
    expect(toolNames).toContain('get_weather_forecast_by_location')
    expect(toolNames).toContain('search_locations')
    expect(toolNames).toContain('get_weather_advice')
    expect(toolNames).toContain('get_weather_alerts')
  })

  test('should execute search_locations tool successfully', async () => {
    const result = await client.callTool('search_locations', {
      query: 'Miami, FL'
    })

    expect(result.isError).toBe(false)
    expect(result.content).toBeDefined()
    expect(result.content[0]).toHaveProperty('type', 'text')
    expect(result.content[0].text).toContain('Miami')
    expect(result.content[0].text).toContain('Florida')
  })

  test('should execute get_current_weather tool with coordinates', async () => {
    const result = await client.callTool('get_current_weather', {
      latitude: 25.7617,
      longitude: -80.1918,
      temperature_unit: 'fahrenheit'
    })

    expect(result.isError).toBe(false)
    expect(result.content[0].text).toMatch(/Temperature: -?\d+(\.\d+)?°F/)
    expect(result.content[0].text).toMatch(/Humidity: \d+%/)
  })
})