## Description
Brief description of what this PR adds/fixes.

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New function (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [ ] Documentation update

## Use Case
**Required for new functions**: Which lenses need this? (must be 2+ lenses)
- Lens 1: [name/description]
- Lens 2: [name/description]

## Implementation Details
### Module
- [ ] `fhir/common.js` - Low-level FHIR utilities
- [ ] `fhir/ips.js` - IPS-specific extractors
- [ ] `fhir/epi.js` - ePI parsing functions
- [ ] `fhir/pv.js` - Persona Vector utilities
- [ ] `html/dom.js` - DOM manipulation
- [ ] `i18n/language.js` - Internationalization
- [ ] `utils/common.js` - General utilities

### Checklist
- [ ] Function added to appropriate module (`src/fhir/`, `src/html/`, etc.)
- [ ] Function exported from module's `module.exports`
- [ ] Function auto-exported in `src/index.js` (verify spread operator works)
- [ ] Tests added in corresponding `test/*.test.js` file
- [ ] Tests use FHIR fixtures from `test/fixtures/`
- [ ] All tests pass (`npm test`)
- [ ] JSDoc comments with `@param` and `@returns`
- [ ] Documentation added to `docs/API.md` with code examples
- [ ] Early returns for invalid input (e.g., `if (!bundle?.entry) return []`)
- [ ] Returns empty arrays (not null) for list queries
- [ ] For DOM functions: Works in both Node.js (JSDOM) and browser

## Performance Impact
- [ ] No performance concerns
- [ ] Function is optimized for 1-second lens timeout
- [ ] Avoids common anti-patterns (see AI instructions)
- [ ] N/A - Documentation/test only

**Performance notes** (if applicable):
[Describe any performance considerations]

## Breaking Changes
**If breaking change**, describe:
- What breaks
- Migration path for existing lenses
- Justification for breaking change

## Testing
```bash
npm test
```

**Test coverage:**
- [ ] All new functions have unit tests
- [ ] Edge cases covered (null/undefined/empty inputs)
- [ ] FHIR reference resolution tested (if applicable)
- [ ] Both Node.js and browser environments tested (if DOM function)

## Examples
```javascript
const { myNewFunction } = require('@gravitate-health/lens-tool-lib');

// Example showing usage
const result = myNewFunction(context.ips, params);
```

## Related Issues
Closes #[issue_number]

## Additional Notes
[Any additional context for reviewers]
