# Test Suite

This directory contains the comprehensive test suite for the Gravitate Health Lens Tool Library.

## Test Structure

The tests are organized by module:

- **fhir-common.test.js** - Tests for common FHIR utilities (getResourcesByType, resolveReference, extractCodes)
- **fhir-ips.test.js** - Tests for IPS (International Patient Summary) utilities
- **fhir-epi.test.js** - Tests for ePI (Electronic Product Information) utilities
- **html-dom.test.js** - Tests for HTML/DOM manipulation functions
- **utils-common.test.js** - Tests for common utility functions
- **i18n-language.test.js** - Tests for language and internationalization utilities
- **integration.test.js** - Integration tests using real fixture data

## Fixtures

The `fixtures/` directory contains example FHIR resources used for testing:

- **ips.json** - Sample International Patient Summary bundle
- **epi.json** - Sample Electronic Product Information bundle
- **pv.json** - Sample Pharmacovigilance data

These fixtures contain valid FHIR data structures that can be used to test the library's functionality.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with verbose output
npm run test:verbose
```

## Coverage

The test suite aims for comprehensive coverage of:

- ✅ Happy path scenarios
- ✅ Edge cases (null/undefined inputs, empty arrays, etc.)
- ✅ Error handling
- ✅ Integration scenarios using real fixture data

Coverage reports are generated in the `coverage/` directory when running `npm run test:coverage`.

## Writing New Tests

When adding new functionality to the library:

1. Create or update the corresponding test file
2. Include tests for:
   - Normal operation
   - Edge cases
   - Error conditions
   - Integration with other modules (if applicable)
3. Use the fixtures when testing with FHIR data
4. Run the test suite to ensure all tests pass

## Test Framework

The test suite uses [Jest](https://jestjs.io/) as the testing framework, which provides:

- Fast and isolated test execution
- Built-in mocking capabilities
- Code coverage reporting
- Snapshot testing (if needed)
- Watch mode for development

## Example Test

```javascript
const { getResourcesByType } = require('../src/fhir/common');

test('should return resources of specified type', () => {
    const bundle = {
        entry: [
            { resource: { resourceType: 'Patient', id: '1' } },
            { resource: { resourceType: 'Condition', id: '2' } }
        ]
    };
    
    const patients = getResourcesByType(bundle, 'Patient');
    expect(patients).toHaveLength(1);
    expect(patients[0].id).toBe('1');
});
```
