# Gravitate Health Lens Toolkit

A comprehensive helper library for developing Gravitate Health lens components. This toolkit eliminates 70-80% of boilerplate code and provides standardized, tested functions for common lens operations.

## 🎯 Purpose

The Gravitate Health Lens Toolkit simplifies lens development by providing:

- **FHIR Resource Extraction**: Easy access to IPS data (conditions, medications, observations, etc.)
- **ePI Processing**: Parse extensions, match identifiers, find annotated sections
- **HTML Annotation**: DOM manipulation with environment detection (Node.js/browser)
- **Internationalization**: Language detection and multi-language messages
- **Validation**: Input validation and helpful error messages
- **Utilities**: Common functions (date calculations, deep equality, etc.)

## 📦 Installation

```bash
npm install gravitate-lens-toolkit
```

Or include the library in your lens project directory.

## 🚀 Quick Start

### Option 1: Using BaseLens Class (Recommended)

```javascript
const { BaseLens } = require('gravitate-lens-toolkit');

class MyLens extends BaseLens {
    getSpecification() {
        return "1.0.0";
    }

    async enhance() {
        // Validate inputs
        this.validate();
        
        // Extract data from IPS
        const conditions = this.fhir.getConditions(this.ips);
        
        // Find matching ePI sections
        const categories = this.epiHelper.findSectionsByCode(
            this.epi,
            conditions.flatMap(c => c.codes)
        );
        
        // Annotate HTML
        return await this.htmlHelper.annotate({
            html: this.html,
            categories: categories,
            enhanceTag: 'highlight',
            lensName: 'my-lens'
        });
    }
}

// Export for lens execution environment
let lens = new MyLens({ pv, html, epi, ips });
module.exports = lens.export();
```

### Option 2: Using LensBuilder (Functional Approach)

```javascript
const { LensBuilder } = require('gravitate-lens-toolkit');

const myLens = LensBuilder.create({
    name: 'my-lens',
    version: '1.0.0',
    
    extract: async (context) => {
        const conditions = context.fhir.getConditions(context.ips);
        return { conditions };
    },
    
    annotate: async (context, data) => {
        const categories = context.epiHelper.findSectionsByCode(
            context.epi,
            data.conditions.flatMap(c => c.codes)
        );
        
        return await context.htmlHelper.annotate({
            html: context.html,
            categories,
            enhanceTag: 'highlight',
            lensName: 'my-lens'
        });
    }
});

module.exports = myLens;
```

## 📚 Core Modules

### FHIRHelper
Extract and parse FHIR resources from IPS bundles.

```javascript
// Get all conditions
const conditions = FHIRHelper.getConditions(ips);

// Get all medications (handles references and ingredients)
const medications = FHIRHelper.getMedications(ips);

// Get observations with filters
const lowPotassium = FHIRHelper.getObservationsByCode(
    ips,
    ["2823-3"],
    { valueFilter: (obs) => obs.value < 3.5 }
);

// Get patient info with calculated age
const patient = FHIRHelper.getPatientInfo(ips);
```

### EPIHelper
Parse ePI extensions and identifiers.

```javascript
// Find sections by code
const categories = EPIHelper.findSectionsByCode(
    epi,
    ["77386006", "69840006"]
);

// Match product identifiers
const isMatch = EPIHelper.matchProductIdentifier(
    epi,
    ["CIT-204447"]
);

// Get language
const lang = EPIHelper.getLanguage(epi);
```

### HTMLHelper
DOM manipulation and annotation.

```javascript
// Annotate sections
const result = await HTMLHelper.annotate({
    html: htmlData,
    categories: ['section-4.4', 'contraindications'],
    enhanceTag: 'highlight',
    lensName: 'my-lens'
});

// Insert banner
const result = await HTMLHelper.insertBanner({
    html: htmlData,
    content: '<div>Warning message</div>',
    position: 'top'
});
```

### LanguageHelper
Language detection and internationalization.

```javascript
// Detect language
const lang = LanguageHelper.detectLanguage(epi);

// Get translated messages
const messages = LanguageHelper.getStandardMessages(lang);
const conditionMessages = LanguageHelper.getConditionMessages(lang);
```

### ValidationHelper
Input validation and error handling.

```javascript
// Validate required inputs
ValidationHelper.requireIPS(ips);
ValidationHelper.requireEPI(epi);
ValidationHelper.requireComposition(epi);

// Validate complete context
const validation = ValidationHelper.validateLensContext({
    ips, epi, html, pv
});
```

### Utils
General utility functions.

```javascript
// Deep equality
if (Utils.deepEqual(obj1, obj2)) { }

// Age calculation
const age = Utils.calculateAge("1990-05-15");

// Date utilities
const futureDate = Utils.addMonths(new Date(), 10);
const isInRange = Utils.isDateInRange(date, start, end);

// Array utilities
const unique = Utils.unique([1, 2, 2, 3]);
const grouped = Utils.groupBy(items, 'type');
```

## 📖 Examples

See the `examples/` directory for complete working examples:

- **simple-condition-lens.js**: Highlight sections based on patient conditions
- **pregnancy-lens-builder.js**: Pregnancy/breastfeeding warnings using LensBuilder
- **medication-interaction-lens.js**: Drug interaction warnings

## 📄 Documentation

Full API documentation is available in `docs/API.md`.

## 🔧 Development

### Project Structure

```
gravitate-lens-toolkit/
├── src/
│   ├── fhir/
│   │   └── resource-extractor.js
│   ├── epi/
│   │   └── extension-parser.js
│   ├── html/
│   │   └── annotator.js
│   ├── i18n/
│   │   └── language-detector.js
│   ├── validation/
│   │   └── validators.js
│   ├── utils/
│   │   └── common.js
│   ├── base-lens.js
│   └── index.js
├── examples/
│   ├── simple-condition-lens.js
│   ├── pregnancy-lens-builder.js
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

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## 📧 Support

For questions or issues, please open an issue on the GitHub repository.
