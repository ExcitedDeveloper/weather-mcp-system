# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a weather MCP (Model Context Protocol) system consisting of a TypeScript-based MCP server that provides weather data via the Open-Meteo API. The system supports both coordinate-based and location name queries with intelligent geocoding and temperature unit conversion.

## Key Development Commands

### Server Development

```bash
cd server
npm install
npm run dev        # Development mode with tsx
npm run build      # Compile TypeScript
npm start          # Run compiled server
```

### Run MCP Inspector

```bash
cd server
npm run build
npx @modelcontextprotocol/inspector node dist/index.js
```

### Testing

- **Automated Testing**: Vitest framework with unit and integration tests
- **Test Structure**: Tests organized in `server/tests/` and `server/src/tests/`
- **Manual Testing**: Use MCP Inspector for interactive testing of all tools
- **Testing Commands**: 
  ```bash
  npm test          # Run all tests
  npm run test:coverage  # Run tests with coverage report
  npm run test:watch     # Run tests in watch mode
  ```

## Architecture Overview

### MCP Server Structure (`server/src/`)

- **`index.ts`**: Main server entry point with MCP protocol handling
- **`tools/index.ts`**: Tool handler definitions and request routing
- **`schemas.ts`**: JSON schema definitions for all MCP tools
- **`weather.ts`**: Weather data retrieval and formatting using Open-Meteo API
- **`geocoding.ts`**: Location search and coordinate resolution with state filtering
- **`api-client.ts`**: HTTP client with error handling for API requests
- **`formatters.ts`**: Weather data formatting and display utilities
- **`validation.ts`**: Input validation and sanitization logic
- **`config.ts`**: API endpoints, constants, and configuration
- **`types.ts`**: TypeScript interface definitions
- **`utils.ts`**: Temperature conversion utilities (Fahrenheit/Celsius)
- **`alerts.ts`**: Weather alerts and warnings integration with NWS API

### Core MCP Tools

1. `get_current_weather` - Weather by coordinates
2. `get_weather_forecast` - 3-day forecast by coordinates
3. `get_current_weather_by_location` - Weather by location name or coordinates
4. `get_weather_forecast_by_location` - 3-day forecast by location name or coordinates
5. `search_locations` - Geocoding and location search
6. `get_weather_advice` - Weather-based clothing and activity recommendations
7. `get_weather_alerts` - Active weather alerts and warnings (US only)

### Key Features

- **Temperature Units**: Supports both Fahrenheit (default) and Celsius with automatic conversion
- **Location Intelligence**: Handles US city/state format ("Miami, FL") with precise state filtering
- **Global Coverage**: Uses Open-Meteo API for worldwide weather data
- **Error Handling**: Comprehensive validation and error messages for invalid inputs
- **No API Keys**: Uses free Open-Meteo services

## Technology Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript with ES2022 target
- **Protocol**: Model Context Protocol (MCP) via `@modelcontextprotocol/sdk`
- **APIs**: Open-Meteo weather and geocoding (free, no authentication), NWS weather alerts (US only, free)
- **Transport**: STDIO (for MCP clients like Claude Desktop)

## Development Workflow

### Making Changes

1. **Server Changes**: Edit files in `server/src/`, then run `npm run build` and test with MCP Inspector
2. **Tool Development**: Add new tools by updating `tools/index.ts`, `schemas.ts`, and implementing handlers
3. **Schema Changes**: Update tool schemas in `schemas.ts` for input validation
4. **API Integration**: Use `api-client.ts` for external API calls with proper error handling
5. **Temperature Conversions**: Use existing utilities in `utils.ts` - don't implement new conversion logic
6. **Location Handling**: Leverage `geocoding.ts` functions for parsing location inputs
7. **Validation**: Use `validation.ts` functions for input sanitization and validation
8. **Configuration**: Add new constants and endpoints to `config.ts`
9. **Type Safety**: Define interfaces in `types.ts` for new data structures
10. **Formatting**: Use `formatters.ts` for consistent output formatting
11. **Testing**: Write unit tests in `server/tests/unit/` and integration tests in `server/tests/integration/`

### Code Conventions

- **ES Modules**: Uses import/export syntax throughout
- **Type Safety**: Comprehensive TypeScript interfaces for API responses
- **Async/Await**: All API calls use modern async patterns
- **Error Throwing**: Throw descriptive Error objects for tool failures

### Testing Approach

- **Automated Tests**: Vitest test suites with unit and integration testing
- **Test Coverage**: 80%+ code coverage requirement with comprehensive test suites
- **Mock Testing**: API responses mocked in `server/tests/__mocks__/` for consistent results
- **Manual Testing**: MCP Inspector for interactive testing and debugging
- **Focus Areas**: Location search accuracy, temperature unit conversion, US state filtering
- **Edge Cases**: Invalid locations, coordinate validation, API failures
- **Test Structure**: 
  - Unit tests in `server/tests/unit/` for individual modules
  - Integration tests in `server/tests/integration/` for end-to-end functionality
  - Test utilities in `server/tests/utils/` for shared test helpers

## Important Implementation Details

### Location Parsing Logic

- Coordinates: Accepts "latitude,longitude" format in location fields
- US Cities: Supports "City, State" format with state abbreviation filtering
- International: Handles "City, Country" format
- Validation: Strict coordinate range checking (-90 to 90 lat, -180 to 180 lng)

### Temperature System

- **Default**: All temperatures display in Fahrenheit unless specified
- **Conversion**: Automatic Celsius ↔ Fahrenheit conversion using `utils.ts`
- **API Integration**: Open-Meteo returns Celsius, converted to user preference
- **Display**: Includes proper temperature units (°F/°C) in formatted output

### API Integration Patterns

- **Error Handling**: Wraps fetch calls with comprehensive error catching
- **User Agent**: Sets custom user agent for API requests
- **Response Processing**: Structured parsing with TypeScript interfaces
- **Rate Limiting**: Graceful degradation on API failures

### MCP Protocol Compliance

- **Tool Schema**: Proper JSON schema definitions for all tool inputs
- **Response Format**: Returns MCP-compliant content objects with text
- **Error Codes**: Uses standard MCP error codes for failures

## Deployment Architecture

The system is designed for multi-transport deployment:

- **Development**: STDIO transport for Claude Desktop integration
- **Production**: HTTP transport for web client integration (planned Railway deployment)
- **Health Checks**: Includes health endpoint for production monitoring
- **CORS**: Configured for client-side access

## External Dependencies

### Required Services

- **Open-Meteo Weather API**: `https://api.open-meteo.com/v1/`
- **Open-Meteo Geocoding API**: `https://geocoding-api.open-meteo.com/v1/`

### Node Dependencies

- `@modelcontextprotocol/sdk`: Core MCP functionality
- `typescript` & `tsx`: TypeScript compilation and development
- Express dependencies (cors, express): For HTTP transport mode

## Modular Architecture Benefits

The codebase has been refactored into a highly modular architecture with clear separation of concerns:

### Core Modules
- **Tool System**: Handlers separated from schema definitions for maintainability
- **API Layer**: Centralized HTTP client with comprehensive error handling
- **Validation Layer**: Dedicated input validation and sanitization
- **Configuration Management**: Centralized constants and API configuration
- **Type System**: Comprehensive TypeScript interfaces for type safety
- **Testing Infrastructure**: Organized test suites with mocks and utilities

### Development Benefits
- **Maintainability**: Each module has a single responsibility
- **Testability**: Individual modules can be unit tested in isolation
- **Extensibility**: New tools and features can be added easily
- **Debugging**: Clear separation makes issues easier to locate and fix
- **Code Reuse**: Shared utilities and types across modules

## Common Development Tasks

### Adding New Weather Parameters

1. Update TypeScript interfaces in `weather.ts`
2. Modify Open-Meteo API query URLs
3. Update response formatting functions
4. Test with various locations and units

### Enhancing Location Search

1. Modify search logic in `geocoding.ts`
2. Update parsing functions for new location formats
3. Test with edge cases and international locations
4. Ensure US state filtering remains precise

### Error Handling Improvements

1. Add error cases to existing try/catch blocks
2. Provide user-friendly error messages
3. Test error scenarios manually with invalid inputs
4. Update error response formatting for consistency
