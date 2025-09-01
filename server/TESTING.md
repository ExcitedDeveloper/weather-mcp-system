# Automated Testing Documentation

## Overview

This project now includes comprehensive automated integration testing that replaces the need for manual testing of all 60+ test cases documented in the PRD.md. The testing framework validates real API integration with Open-Meteo services and ensures location parsing precision for Issue #3.

## Testing Framework Architecture

### Core Components

1. **Vitest Test Runner** - Modern, fast testing framework with TypeScript support
2. **MCP Test Client** (`tests/helpers/mcp-test-client.ts`) - Specialized client for testing MCP servers
3. **Test Fixtures** (`tests/fixtures/test-locations.ts`) - Comprehensive test data with 60+ location test cases
4. **Integration Tests** - Three main test suites covering all functionality

### Test Structure

```
server/tests/
├── helpers/
│   └── mcp-test-client.ts      # MCP server test client utility
├── fixtures/
│   └── test-locations.ts       # Test data with expected results
└── integration/
    ├── basic.test.ts           # Basic MCP server connectivity tests
    ├── location-parsing.test.ts # Comprehensive location testing (Issue #3)
    ├── weather-api.test.ts     # Weather API integration tests
    └── error-handling.test.ts  # Error handling and edge cases
```

## Test Categories

### 1. US City/State Format Testing (Critical for Issue #3)
- Tests all major US cities with state filtering
- Validates state abbreviation vs full name handling
- Ensures precise location disambiguation

**Example Test Cases:**
- `Chicago, IL` → Illinois filtering
- `Houston, TX` → Texas filtering  
- `Phoenix, AZ` → Arizona filtering

### 2. Ambiguous City Name Disambiguation
- **Springfield Tests**: IL, MA, MO, OH disambiguation
- **Portland Tests**: OR vs ME disambiguation  
- **Columbus Tests**: OH vs GA disambiguation

### 3. Small City Recognition
- Boulder, CO
- Savannah, GA
- Burlington, VT
- Fargo, ND
- Cheyenne, WY

### 4. International Location Handling
- London, UK
- Paris, France
- Tokyo, Japan
- Sydney, Australia
- Toronto, Canada

### 5. Coordinate Input Testing
- New York City: `40.7128,-74.0060`
- Los Angeles: `34.0522,-118.2437`
- Miami: `25.7617,-80.1918`

### 6. Weather API Integration
- Temperature unit conversion validation
- Response structure verification
- Climate zone temperature range validation
- MCP protocol compliance

### 7. Error Handling
- Invalid locations and coordinates
- Empty/malformed inputs
- API failure scenarios
- Parameter validation

## Running Tests

### Quick Test Commands

```bash
# Run all tests
npm test

# Run tests once (CI mode)
npm run test:run

# Run with UI interface
npm run test:ui

# Run with coverage
npm run test:coverage

# Run specific test file
npx vitest run tests/integration/location-parsing.test.ts
```

### Test Configuration

The tests are configured in `vitest.config.ts` with:
- **Test Timeout**: 15 seconds for API calls
- **Hook Timeout**: 30 seconds for setup/teardown
- **Max Concurrency**: 5 tests to avoid API rate limiting
- **Retry Logic**: 1 retry for transient network issues

## Key Features

### Real API Integration Testing
- ✅ Makes actual calls to Open-Meteo APIs (no mocking)
- ✅ Validates location parsing precision
- ✅ Tests temperature unit conversion with live data
- ✅ Verifies geocoding accuracy

### Comprehensive Location Testing  
- ✅ All 60+ test cases from PRD.md automated
- ✅ US state filtering precision validation
- ✅ International location handling
- ✅ Coordinate input validation

### MCP Protocol Compliance
- ✅ Tests all 5 MCP tools
- ✅ Validates response format structure
- ✅ Parameter validation and error handling
- ✅ Tool discovery and execution

### CI/CD Integration
- ✅ GitHub Actions workflow (`.github/workflows/test.yml`)
- ✅ Runs on Node.js 18.x and 20.x
- ✅ Coverage reporting
- ✅ Test validation checks

## Benefits Over Manual Testing

### Automation Advantages
- **Speed**: Complete test suite runs in ~20 seconds vs hours of manual testing
- **Consistency**: Same test conditions every time
- **Regression Prevention**: Catches issues immediately
- **CI/CD Ready**: Runs on every commit/PR

### Coverage Benefits
- **100% Tool Coverage**: Tests all 5 MCP tools
- **Edge Case Testing**: Validates error conditions and boundary cases
- **Real API Validation**: Ensures integration works with live services
- **Cross-Platform**: Tests work on Windows, macOS, and Linux

## Test Results and Validation

### Expected Test Coverage
- **Location Parsing**: 39 tests covering all disambiguation scenarios
- **Weather Integration**: 15 tests for API functionality
- **Error Handling**: 12 tests for edge cases
- **Basic Functionality**: 4 tests for core MCP operations

### Success Criteria
Tests validate that:
1. All US city/state combinations resolve correctly
2. State filtering works precisely for ambiguous cities
3. International locations are handled properly
4. Temperature conversions are accurate
5. Error conditions provide helpful messages
6. MCP protocol compliance is maintained

## Troubleshooting

### Common Issues

**Test Timeouts**
- Increase `hookTimeout` in `vitest.config.ts`
- Check network connectivity to Open-Meteo APIs

**Coordinate Precision Failures**
- Adjust precision tolerance in test assertions
- Geocoding APIs may return slightly different coordinates

**Windows-Specific Issues**
- Test client handles Windows npm commands automatically
- Uses shell mode for subprocess execution

### Network Dependencies
Tests require internet connectivity to:
- Open-Meteo Weather API (`https://api.open-meteo.com/v1/`)
- Open-Meteo Geocoding API (`https://geocoding-api.open-meteo.com/v1/`)

## Future Enhancements

### Potential Additions
- Performance benchmarking tests
- Load testing with multiple concurrent requests
- Response time validation
- API rate limiting tests
- Mock API tests for offline development

### Test Data Expansion
- Additional climate zones
- More international cities
- Edge case coordinates (poles, date line)
- Special character handling in city names

## Summary

The automated testing system completely replaces manual testing requirements and provides:
- **Comprehensive validation** of all 60+ location test cases
- **Real API integration testing** without mocking
- **Fast feedback loop** for development
- **CI/CD integration** for continuous validation
- **Regression prevention** for location parsing improvements

This testing framework ensures that Issue #3 location parsing improvements are thoroughly validated and that any future changes maintain the precision and accuracy of the weather MCP server.