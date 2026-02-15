# Gravitate Health Lens Toolkit - AI Development Guide

## Project Purpose
This is a **utility library** (not a lens itself) for building Gravitate Health lens components. Lenses transform electronic Product Information (ePI) HTML by analyzing patient health data (IPS) to highlight relevant medical information.

## Architecture

### Core Separation: Library vs. Consumer Lenses
- **This library**: Provides tested helper functions that eliminate 70-80% of boilerplate
- **Consumer lenses**: Import specific functions from this library to process ePI/IPS data
- Consumer lenses receive four global variables: `pv`, `html`, `epi`, `ips` (pre-validated by lens execution environment)

### Module Structure (src/)
- `fhir/common.js` - Low-level FHIR utilities (getResourcesByType, resolveReference, extractCodes)
- `fhir/ips.js` - IPS-specific extractors (getConditions, getMedications, getPatientInfo)
- `fhir/epi.js` - ePI parsing (findSectionsByCode, getAnnotatedSections)
- `fhir/pv.js` - Persona Vector utilities
- `html/dom.js` - DOM manipulation with **dual-environment support** (Node.js via JSDOM / browser)
- `i18n/language.js` - Internationalization helpers
- `utils/common.js` - Generic utilities (deepEqual, calculateAge, validators)

All functions are **flat-exported** via `src/index.js` for simple destructured imports:
```javascript
const { getConditions, findSectionsByCode, addClasses } = require('@gravitate-health/lens-tool-lib');
```

## Key Technical Patterns

### FHIR Resource Handling
- ePI and IPS bundles follow FHIR R4 structure: `bundle.entry[].resource`
- Medication extraction handles **both** `medicationCodeableConcept` and `medicationReference` patterns (the latter requires resolving references and extracting ingredients)
- Code matching supports **system-agnostic** matching (`matchSystem` parameter) since healthcare terminologies vary
- Example: `getMedications()` in `src/fhir/ips.js` lines 25-90 shows reference resolution pattern

### Environment Detection
- `html/dom.js` detects execution context: `typeof window === "undefined"` → use JSDOM in Node.js
- JSDOM is **lazy-loaded** (`getJSDOM()` function) to avoid breaking browser environments
- Always extract final HTML via internal `_extractHTML()` helper (handles doctype/serialization)

### Testing Strategy
- Tests use **FHIR fixture files** (`test/fixtures/epi.json`, `ips.json`, `pv.json`) containing realistic bundles
- Each module has dedicated test file: `test/fhir-ips.test.js`, `test/html-dom.test.js`, etc.
- Run tests: `npm test` (uses Jest with coverage reporting)
- Coverage excludes `src/index.js` (just exports) but covers all logic files

## Development Workflows

### Adding New Functions
1. Add to appropriate module (e.g., new IPS extractor → `src/fhir/ips.js`)
2. Export from that module's `module.exports`
3. Verify auto-export in `src/index.js` (uses spread operator)
4. Add tests in corresponding `test/*.test.js` file
5. Document in `docs/API.md` with code examples

### Testing Commands
- `npm test` - Run all tests once
- `npm run test:watch` - Watch mode for development
- `npm run test:coverage` - Generate coverage report in `coverage/`
- `npm run test:verbose` - Detailed test output

### Code Style
- Use JSDoc comments with `@param` and `@returns` tags (see any function in `src/fhir/`)
- Early returns for invalid input: `if (!bundle?.entry) return []`
- Validate required parameters: `throw new Error("addClasses requires html, categories, and enhanceTag")`
- Return empty arrays (not null) for list queries: `getResourcesByType()` returns `[]` if no matches

## Common Pitfalls

1. **Don't confuse this library with lens implementations** - Examples in `examples/` show how lenses *use* this library
2. **FHIR reference resolution is critical** - Medications often use references that must be resolved via `resolveReference()`
3. **HTML manipulation must support both environments** - Test DOM functions work in Node.js (JSDOM) and browser contexts
4. **Code matching needs flexibility** - Healthcare systems use different code systems; support both strict and loose matching
5. **Return types matter** - Functions like `getConditions()` should return empty arrays, not null, to avoid breaking `flatMap()` chains

## Performance Considerations

**Critical: 1-second execution timeout** - Lenses using this library are orchestrated by the Lens Execution Environment (LEE) from `@gravitate-health/lens-execution-environment`, which enforces a **1-second timeout** for complete lens execution. Multiple lenses can be stacked per ePI, so speed is crucial for user experience.

### Dual Environment Support
- Lenses run in **both Node.js (server-side focusing)** and **browser (client-side focusing)**
- All DOM functions must support both environments (see `html/dom.js` for pattern)
- JSDOM is lazy-loaded in Node.js to avoid startup overhead

### Optimization Guidelines
- **Early exits**: Return immediately when no processing needed (`if (conditions.length === 0) return html`)
- **Minimize DOM operations**: Batch element lookups, avoid unnecessary traversals
- **Efficient FHIR queries**: Use `getResourcesByType()` once, then filter in memory
- **Avoid deep cloning**: Work directly with resources when safe
- **Cache repeated lookups**: Store results of `getAnnotatedSections()` if reused

### Performance Anti-Patterns
- Multiple `getResourcesByType()` calls for same type
- Searching entire bundle for each condition/medication separately
- Recreating DOM multiple times (parse HTML once, modify in place)
- Synchronous file I/O or external API calls

## Contributing

This library collects **common functions used across multiple lenses**. The contribution process is intentionally open, lean, and simple.

### When to Add Functions
- Function is needed by **2+ lenses** (avoid one-off utilities)
- Eliminates significant boilerplate (aim for 70-80% code reduction)
- Handles common FHIR/ePI patterns consistently
- Improves performance or reliability across lenses

### Contribution Workflow
1. **Fork & Branch**: Create feature branch from `main`
2. **Implement**: Add function to appropriate module (`src/fhir/`, `src/html/`, etc.)
3. **Test**: Write tests with real FHIR fixtures (see `test/fixtures/`)
4. **Document**: Add JSDoc + example in `docs/API.md`
5. **PR**: Open pull request with clear description of use case
6. **Review**: Maintainers will review for correctness, performance, and fit

### PR Guidelines
- Keep PRs focused (one function or related set)
- Include test coverage for new functions
- Follow existing patterns (JSDoc, early returns, error handling)
- Demonstrate value across multiple lens use cases
- Ensure both Node.js and browser compatibility for DOM functions

### Code Review Focus
- Correctness with FHIR R4 spec
- Performance impact (remember 1-second timeout)
- API clarity and consistency
- Test coverage and edge cases

## Key Files for Context
- [README.md](../README.md) - Library usage examples
- [docs/API.md](../docs/API.md) - Complete API reference with examples
- [QUICKSTART.md](../QUICKSTART.md) - Quick start for lens developers
- [examples/](../examples/) - Real lens implementations using this library
- [test/fixtures/](../test/fixtures/) - FHIR sample data for understanding bundle structure

## Release Process

Follow these steps to release a new version of the library package:

1.  **Test:** Run comprehensive test suite
    ```bash
    npm test
    ```
    *   All tests must pass before release (currently 128 tests)

2.  **Security Audit:** Check for known vulnerabilities in dependencies
    ```bash
    npm audit
    ```
    *   Review any vulnerabilities found
    *   If fixable issues exist, run `npm audit fix` to automatically update dependencies
    *   If breaking changes are required, run `npm audit fix --force` (use with caution)
    *   Re-run tests after fixing: `npm test`
    *   Critical/High severity issues should be resolved before release

3.  **Dry Run:** Verify package contents before publishing
    ```bash
    npm pack --dry-run
    ```
    *   Review the file list to ensure correct files are included
    *   Verify package size is reasonable (~60KB packed)
    *   Check that test fixtures and source files are present

4.  **Version Bump:** Update package version based on semver
    ```bash
    npm version patch   # Bug fixes (1.0.0 → 1.0.1)
    npm version minor   # New features, backwards compatible (1.0.0 → 1.1.0)
    npm version major   # Breaking changes (1.0.0 → 2.0.0)
    ```
    *   Default to `patch` for bug fixes
    *   Use `minor` for new helper functions (most common for this library)
    *   Use `major` only for breaking API changes
    *   This automatically updates `package.json` and `package-lock.json`
    *   Creates a git commit with message "v{version}"
    *   Creates a git tag "v{version}"

5.  **Review Changes:** Verify the automated commit and tag
    ```bash
    git show HEAD        # Review the version bump commit
    git tag --list       # Verify new tag was created
    ```

6.  **Push:** Push commits and tags to remote repository
    ```bash
    git push && git push --tags
    ```
    *   Pushes the version commit to main branch
    *   Pushes the version tag (triggers any CI/CD if configured)

7.  **NPM Login:** Ensure authentication is ready (if not already logged in)
    ```bash
    npm login
    ```
    *   Required for publishing to npm registry
    *   Only needed once per session/machine

8.  **Publish:** Publish the package to the registry
    ```bash
    npm publish
    ```
    *   Uploads package to npm registry
    *   Package becomes available at `@gravitate-health/lens-tool-lib@{version}`
    *   Verify publication at https://www.npmjs.com/package/@gravitate-health/lens-tool-lib