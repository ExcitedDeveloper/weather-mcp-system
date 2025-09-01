import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { HttpApiClient, ApiError, NetworkError } from '../../src/api-client.js'
import { createMockFetch } from '../utils/test-helpers.js'

// Mock global fetch
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('api-client', () => {
  let client: HttpApiClient

  beforeEach(() => {
    client = new HttpApiClient()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('HttpApiClient', () => {
    describe('successful requests', () => {
      it('makes successful GET request', async () => {
        const responseData = { test: 'data' }
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: () => Promise.resolve(responseData),
        })

        const result = await client.get('https://api.example.com/test')
        
        expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/test', {
          method: 'GET',
          headers: {
            'User-Agent': 'weather-mcp-server/1.0',
            'Accept': 'application/json',
          },
          signal: expect.any(AbortSignal),
        })
        expect(result).toEqual(responseData)
      })

      it('includes custom headers', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({}),
        })

        await client.get('https://api.example.com/test', {
          headers: { 'Custom-Header': 'value' },
        })

        expect(mockFetch).toHaveBeenCalledWith(expect.any(String), {
          method: 'GET',
          headers: {
            'User-Agent': 'weather-mcp-server/1.0',
            'Accept': 'application/json',
            'Custom-Header': 'value',
          },
          signal: expect.any(AbortSignal),
        })
      })
    })

    describe('error handling', () => {
      it('throws ApiError for HTTP error responses', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          text: () => Promise.resolve('Resource not found'),
        })

        try {
          await client.get('https://api.example.com/not-found')
          expect.fail('Should have thrown an error')
        } catch (error) {
          expect(error).toBeInstanceOf(ApiError)
          const apiError = error as ApiError
          expect(apiError.status).toBe(404)
          expect(apiError.statusText).toBe('Not Found')
          expect(apiError.message).toContain('HTTP 404: Not Found - Resource not found')
        }
      })

      it('handles response.text() failure gracefully', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          text: () => Promise.reject(new Error('Cannot read response')),
        })

        await expect(client.get('https://api.example.com/error'))
          .rejects.toThrow('HTTP 500: Internal Server Error')
      })

      it('throws NetworkError for network failures', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network connection failed'))

        await expect(client.get('https://api.example.com/test'))
          .rejects.toThrow(NetworkError)

        try {
          await client.get('https://api.example.com/test')
        } catch (error) {
          expect(error).toBeInstanceOf(NetworkError)
          const networkError = error as NetworkError
          expect(networkError.url).toBe('https://api.example.com/test')
          expect(networkError.cause).toBeInstanceOf(Error)
        }
      })

      it('throws NetworkError for request timeout', async () => {
        mockFetch.mockImplementation(() => {
          return new Promise((resolve, reject) => {
            const error = new Error('Request timeout')
            error.name = 'AbortError'
            setTimeout(() => reject(error), 100)
          })
        })

        await expect(client.get('https://api.example.com/slow', { timeout: 50 }))
          .rejects.toThrow(NetworkError)

        try {
          await client.get('https://api.example.com/slow', { timeout: 50 })
        } catch (error) {
          expect(error).toBeInstanceOf(NetworkError)
          expect((error as NetworkError).message).toContain('Request timeout after 50ms')
        }
      })

      it('handles unknown errors', async () => {
        mockFetch.mockRejectedValueOnce('String error')

        await expect(client.get('https://api.example.com/test'))
          .rejects.toThrow('Unknown network error occurred')
      })
    })

    describe('timeout handling', () => {
      it('uses default timeout', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({}),
        })

        await client.get('https://api.example.com/test')
        
        // Verify that AbortController was used (indicates timeout setup)
        expect(mockFetch).toHaveBeenCalledWith(expect.any(String), 
          expect.objectContaining({
            signal: expect.any(AbortSignal),
          })
        )
      })

      it('uses custom timeout', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({}),
        })

        await client.get('https://api.example.com/test', { timeout: 5000 })
        
        expect(mockFetch).toHaveBeenCalledWith(expect.any(String), 
          expect.objectContaining({
            signal: expect.any(AbortSignal),
          })
        )
      })
    })
  })

  describe('error classes', () => {
    it('creates proper ApiError instances', () => {
      const error = new ApiError('Test message', 'https://api.example.com', 404, 'Not Found')
      
      expect(error.name).toBe('ApiError')
      expect(error.message).toBe('Test message')
      expect(error.url).toBe('https://api.example.com')
      expect(error.status).toBe(404)
      expect(error.statusText).toBe('Not Found')
      expect(error).toBeInstanceOf(Error)
    })

    it('creates proper NetworkError instances', () => {
      const cause = new Error('Original error')
      const error = new NetworkError('Test message', 'https://api.example.com', cause)
      
      expect(error.name).toBe('NetworkError')
      expect(error.message).toBe('Test message')
      expect(error.url).toBe('https://api.example.com')
      expect(error.cause).toBe(cause)
      expect(error).toBeInstanceOf(Error)
    })
  })
})