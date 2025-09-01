import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { spawn, ChildProcess } from 'child_process'
import path from 'path'

export interface MCPTestResponse {
  content: Array<{ type: string; text: string }>
  isError?: boolean
}

export class MCPTestClient {
  private client: Client | null = null
  private transport: StdioClientTransport | null = null
  private serverProcess: ChildProcess | null = null

  async connect(): Promise<void> {
    try {
      // Build the server first to ensure we have fresh dist files
      await this.buildServer()

      // Start the MCP server process
      const serverPath = path.resolve('dist/index.js')
      
      // Create transport using command and args for Windows compatibility
      this.transport = new StdioClientTransport({
        command: 'node',
        args: [serverPath],
        cwd: process.cwd()
      })

      // Create and connect client
      this.client = new Client(
        { name: 'weather-test-client', version: '1.0.0' },
        { capabilities: {} }
      )

      await this.client.connect(this.transport)
    } catch (error) {
      await this.cleanup()
      throw new Error(`Failed to connect to MCP server: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async callTool(name: string, args: Record<string, any>): Promise<MCPTestResponse> {
    if (!this.client) {
      throw new Error('Client not connected. Call connect() first.')
    }

    try {
      const result = await this.client.callTool({
        name,
        arguments: args
      })

      return {
        content: result.content || [],
        isError: result.isError || false
      }
    } catch (error) {
      return {
        content: [{ 
          type: 'text', 
          text: error instanceof Error ? error.message : 'Unknown error' 
        }],
        isError: true
      }
    }
  }

  async listTools(): Promise<any[]> {
    if (!this.client) {
      throw new Error('Client not connected. Call connect() first.')
    }

    const result = await this.client.listTools()
    return result.tools || []
  }

  async cleanup(): Promise<void> {
    try {
      if (this.client) {
        await this.client.close()
        this.client = null
      }

      if (this.transport) {
        await this.transport.close()
        this.transport = null
      }
    } catch (error) {
      console.error('Error during cleanup:', error)
    }
  }

  private async buildServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Handle Windows npm command
      const isWindows = process.platform === 'win32'
      const npmCmd = isWindows ? 'npm.cmd' : 'npm'
      
      const buildProcess = spawn(npmCmd, ['run', 'build'], {
        cwd: process.cwd(),
        stdio: 'pipe',
        shell: isWindows // Use shell on Windows
      })

      buildProcess.on('close', (code) => {
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`Build failed with exit code ${code}`))
        }
      })

      buildProcess.on('error', (error) => {
        reject(new Error(`Build process error: ${error.message}`))
      })
    })
  }
}

// Helper function to extract temperature from weather response text
export function extractTemperature(text: string, unit: '°F' | '°C'): number {
  const regex = unit === '°F' 
    ? /Temperature: (-?\d+(?:\.\d+)?)°F/
    : /Temperature: (-?\d+(?:\.\d+)?)°C/
  
  const match = text.match(regex)
  if (!match) {
    throw new Error(`Could not extract temperature in ${unit} from: ${text}`)
  }
  
  return parseFloat(match[1])
}

// Helper function to extract coordinates from location search response
export function extractCoordinates(text: string): { latitude: number; longitude: number } {
  const coordinateMatch = text.match(/📐 Coordinates: ([-\d.]+), ([-\d.]+)/)
  if (!coordinateMatch) {
    throw new Error(`Could not extract coordinates from: ${text}`)
  }
  
  return {
    latitude: parseFloat(coordinateMatch[1]),
    longitude: parseFloat(coordinateMatch[2])
  }
}

// Helper function to check if text contains expected location information
export function validateLocationText(text: string, expectedCity: string, expectedState?: string, expectedCountry?: string): boolean {
  const lowerText = text.toLowerCase()
  const lowerCity = expectedCity.toLowerCase()
  
  if (!lowerText.includes(lowerCity)) {
    return false
  }
  
  if (expectedState && !lowerText.includes(expectedState.toLowerCase())) {
    return false
  }
  
  if (expectedCountry && !lowerText.includes(expectedCountry.toLowerCase())) {
    return false
  }
  
  return true
}