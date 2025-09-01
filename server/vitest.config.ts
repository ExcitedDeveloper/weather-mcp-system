import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',
    
    // Test patterns
    include: ['tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist'],
    
    // Timeout configuration for API calls
    testTimeout: 15000, // 15 seconds for integration tests with real APIs
    hookTimeout: 30000, // 30 seconds for setup/teardown hooks
    
    // Concurrency settings to avoid overwhelming APIs
    maxConcurrency: 5,
    
    // Retry failed tests once for network issues
    retry: 1,
    
    // Coverage settings
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts'] // Exclude main server file from coverage
    },
    
    // Global setup
    globals: true,
    
    // Reporter configuration
    reporter: ['verbose', 'json']
  }
})