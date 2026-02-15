---
name: Bug report
about: Report a bug or unexpected behavior in lens-tool-lib
title: '[BUG] '
labels: bug
assignees: ''
---

## Bug Description
A clear and concise description of what the bug is.

## To Reproduce
Steps to reproduce the behavior:
1. Import function '...'
2. Call with parameters '...'
3. Expected result '...'
4. Actual result '...'

## Code Example
```javascript
const { getConditions } = require('@gravitate-health/lens-tool-lib');

// Minimal code to reproduce the issue
const conditions = getConditions(ipsBundle);
```

## Environment
- **Node.js version**: [e.g., 18.x]
- **Browser** (if applicable): [e.g., Chrome 120, Firefox 121]
- **Library version**: [e.g., 1.0.0]
- **Environment**: [Node.js / Browser / Both]

## Expected Behavior
A clear and concise description of what you expected to happen.

## Actual Behavior
What actually happened.

## FHIR Bundle Sample (if relevant)
```json
{
  "resourceType": "Bundle",
  "entry": [...]
}
```

## Additional Context
Add any other context about the problem here (error messages, logs, etc.)
