---
name: Feature request
about: Propose a new helper function for the library
title: '[FEATURE] '
labels: enhancement
assignees: ''
---

## Function Purpose
A clear and concise description of what functionality you'd like to add.

## Use Case
Describe which lenses need this function and why (remember: functions should be needed by 2+ lenses).

**Lens examples:**
- Lens 1: [name/description]
- Lens 2: [name/description]

## Proposed API
```javascript
/**
 * Function description
 * @param {Object} bundle - FHIR Bundle
 * @param {string} param - Parameter description
 * @returns {Array} Return value description
 */
function myNewFunction(bundle, param) {
    // Implementation idea
}
```

## Example Usage
```javascript
const { myNewFunction } = require('@gravitate-health/lens-tool-lib');

// Example showing how it would be used in a lens
const result = myNewFunction(context.ips, 'value');
```

## Boilerplate Reduction
Estimate how much boilerplate code this eliminates (aim for 70-80% reduction).

**Without this function:**
```javascript
// ~20 lines of repetitive code
```

**With this function:**
```javascript
// ~3 lines using the helper
```

## Performance Considerations
- Does this need to work in both Node.js and browser? [Yes/No]
- Any performance implications? (remember: 1-second lens timeout)

## Alternatives Considered
Describe alternative approaches you've considered.

## Additional Context
Add any other context, examples, or FHIR spec references.
