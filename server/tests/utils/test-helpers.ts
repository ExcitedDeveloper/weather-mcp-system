import { vi, type MockedFunction } from 'vitest'

export function createMockFetch(responses: Array<{ url?: string; response: any; status?: number }>): MockedFunction<typeof fetch> {
  return vi.fn().mockImplementation((url: string) => {
    const matchingResponse = responses.find(r => !r.url || url.includes(r.url))
    
    if (!matchingResponse) {
      return Promise.reject(new Error(`No mock response found for URL: ${url}`))
    }

    const status = matchingResponse.status || 200
    const ok = status >= 200 && status < 300

    return Promise.resolve({
      ok,
      status,
      statusText: ok ? 'OK' : 'Error',
      json: () => Promise.resolve(matchingResponse.response),
      text: () => Promise.resolve(JSON.stringify(matchingResponse.response)),
    } as Response)
  })
}

export function expectErrorMessage(error: unknown, expectedMessage: string): void {
  expect(error).toBeInstanceOf(Error)
  expect((error as Error).message).toBe(expectedMessage)
}

export function expectErrorToContain(error: unknown, expectedSubstring: string): void {
  expect(error).toBeInstanceOf(Error)
  expect((error as Error).message).toContain(expectedSubstring)
}