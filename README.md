# Gravitate Health Lens Toolkit

A comprehensive helper library for developing Gravitate Health lens components. This toolkit eliminates 70-80% of boilerplate code and provides standardized, tested functions for common lens operations.

## 🎯 Purpose

The Gravitate Health Lens Toolkit simplifies lens development by providing:

- **FHIR Resource Extraction**: Easy access to IPS data (conditions, medications, observations, etc.)
- **ePI Processing**: Parse extensions, match identifiers, find annotated sections
- **HTML DOM Manipulation**: DOM manipulation with environment detection (Node.js/browser)
- **Internationalization**: Language detection and multi-language messages
- **Utilities**: Common functions (date calculations, deep equality, validation helpers, etc.)

## 📦 Installation

```bash
npm install @gravitate-health/lens-tool-lib
```

Or include the library in your lens project directory.

## 🚀 Quick Start

### Simple Function-Based Approach

Just export `enhance()` and `getSpecification()` functions. Import only what you need:

```javascript
const { getConditions } = require('@gravitate-health/lens-tool-lib');
const { findSectionsByCode } = require('@gravitate-health/lens-tool-lib');
const { addClasses } = require('@gravitate-health/lens-tool-lib');

// Or import multiple functions at once:
const { 
    getConditions, 
    findSectionsByCode, 
    addClasses 
} = require('@gravitate-health/lens-tool-lib');

/**
 * Main enhance function - receives validated context
 * @param {Object} context - Contains pv, html, epi, ips (already validated)
 * @returns {Promise<string>} Enhanced HTML
 */
async function enhance(context) {
    // Extract data from IPS
    const conditions = getConditions(context.ips);
    
    // Find matching ePI sections
    const categories = findSectionsByCode(
        context.epi,
        conditions.flatMap(c => c.codes)
    );
    
    // Add CSS classes to matching sections
    return await addClasses(
        context.html,
        categories,
        'highlight',
        'my-lens'
    );
}

function getSpecification() {
    return "1.0.0";
}

async function explanation(context, lang = "en") {
    return "Explanation text";
}

// Export lens interface
module.exports = {
    enhance,
    getSpecification,
    explanation
};
```

## 📚 Core Modules

### Lens Context

Your lens functions receive a `context` object that is already validated and contains:
- `context.pv` - Persona Vector (patient preferences)
- `context.html` - HTML content from ePI
- `context.epi` - ePI FHIR Bundle
- `context.ips` - IPS FHIR Bundle

No need to validate or create context - it's ready to use!

### FHIR Functions

The library provides three main FHIR modules:

#### Common FHIR Functions (from fhir/common.js)
Low-level helpers for working with FHIR resources:
- `getResourcesByType()` - Get resources by type from any bundle
- `resolveReference()` - Resolve FHIR references
- `extractCodes()` - Extract codes from CodeableConcepts
- `matchCodes()` - Match codes with optional system matching

#### IPS Functions (from fhir/ips.js)
Extract and parse FHIR resources from IPS bundles:

```javascript
const { 
    getConditions, 
    getMedications, 
    getObservationsByCode, 
    getPatientInfo 
} = require('@gravitate-health/lens-tool-lib');

// Get all conditions
const conditions = getConditions(context.ips);

// Get all medications (handles references and ingredients)
const medications = getMedications(context.ips);

// Get observations with filters
const lowPotassium = getObservationsByCode(
    context.ips,
    ["2823-3"],
    { valueFilter: (obs) => obs.value < 3.5 }
);

// Get patient info with calculated age
const patient = getPatientInfo(context.ips);
```

#### ePI Functions (from fhir/epi.js)
Parse ePI bundles and extensions (ePI IS FHIR).

```javascript
const { 
    findSectionsByCode, 
    matchProductIdentifier, 
    getLanguage 
} = require('@gravitate-health/lens-tool-lib');

// Find sections by code
const categories = findSectionsByCode(
    context.epi,
    ["77386006", "69840006"]
);

// Match product identifiers
const isMatch = matchProductIdentifier(
    context.epi,
    ["CIT-204447"]
);

// Get language
const lang = getLanguage(context.epi);
```

### HTML Functions (from html/dom.js)
DOM manipulation and HTML processing.

```javascript
const { addClasses, insertBanner, traverseDOM } = require('@gravitate-health/lens-tool-lib');

// Add CSS classes to elements
const result = await addClasses(
    context.html,
    ['section-4.4', 'contraindications'],
    'highlight',
    'my-lens'
);

// Insert banner
const result = await insertBanner(
    context.html,
    '<div>Warning message</div>',
    'top',
    'banner-class'
);

// Traverse DOM with custom visitor
const result = await traverseDOM(context.html, (element, doc) => {
    if (element.tagName === 'DIV' && element.classList.contains('warning')) {
        element.classList.add('highlight');
    }
});
```

### Language Functions (from i18n/language.js)
Language detection and internationalization.

```javascript
const { 
    getLanguage,  // from fhir/epi
    getStandardMessages, 
    getLangKey,
    translate
} = require('@gravitate-health/lens-tool-lib');

// Detect language (use getLanguage from fhir/epi module)
const lang = getLanguage(context.epi);

// Get translated messages
const messages = getStandardMessages(lang);
```

### Utility Functions (from utils/common.js)
General utility functions including validation helpers.

```javascript
const { 
    deepEqual,
    calculateAge,
    addMonths,
    isDateInRange,
    unique,
    groupBy,
    ensureArray,
    isEmpty,
    validateRequiredFields,
    safeGet
} = require('@gravitate-health/lens-tool-lib');

// Deep equality
if (deepEqual(obj1, obj2)) { }

// Age calculation
const age = calculateAge("1990-05-15");

// Date utilities
const futureDate = addMonths(new Date(), 10);
const isInRange = isDateInRange(date, start, end);

// Array utilities
const uniqueValues = unique([1, 2, 2, 3]);
const grouped = groupBy(items, 'type');

// Validation helpers
const arr = ensureArray(value);
if (isEmpty(arr)) { }

const validation = validateRequiredFields(obj, ['field1', 'field2']);
const value = safeGet(obj, 'nested.path.value', defaultValue);
```

## 📖 Examples

See the `examples/` directory for complete working examples:

- **simple-condition-lens.js**: Highlight sections based on patient conditions
- **pregnancy-lens.js**: Pregnancy/breastfeeding warnings with age checks
- **medication-interaction-lens.js**: Drug interaction warnings

All examples use the functional approach with `createLens()`.

## 📄 Documentation

Full API documentation is available in `docs/API.md`.

## 🔧 Development

### Project Structure

```
@gravitate-health/lens-tool-lib/
├── src/
│   ├── fhir/
│   │   ├── common.js       # Common FHIR helpers
│   │   ├── ips.js          # IPS-specific functions
│   │   └── epi.js          # ePI-specific functions (ePI IS FHIR)
│   ├── html/
│   │   └── dom.js          # DOM manipulation utilities
│   ├── i18n/
│   │   └── language.js     # Translations and i18n
│   ├── utils/
│   │   └── common.js       # Utility functions
│   └── index.js
├── examples/
│   ├── simple-condition-lens.js
│   ├── pregnancy-lens.js
│   └── medication-interaction-lens.js
├── docs/
│   └── API.md
├── package.json
└── README.md
```

## 🎯 Benefits for Developers

- **70-80% Less Code**: Eliminate repetitive boilerplate
- **Consistency**: All lenses follow same patterns
- **Tested**: Pre-tested, reliable functions
- **Type Safety**: Clear function signatures
- **Documentation**: Comprehensive API docs and examples
- **Maintainability**: Bug fixes benefit all lenses
- **Faster Development**: Focus on business logic, not infrastructure
- **No Classes**: Pure functional approach - just import and use functions

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## 📧 Support

For questions or issues, please open an issue on the GitHub repository.
