# Gravitate Health Lens Toolkit - API Documentation

A comprehensive helper library for developing Gravitate Health lens components. This toolkit provides standardized functions for common operations with FHIR resources, ePI processing, HTML annotation, and internationalization.

## Installation

```bash
npm install @gravitate-health/lens-tool-lib
```

## Quick Start

### Simple Function-Based Approach

Just export `enhance()` and `getSpecification()` functions. Import only what you need:

```javascript
const { getConditions, findSectionsByCode, addClasses } = require('@gravitate-health/lens-tool-lib');

/**
 * Main enhance function - receives validated context
 * @param {Object} context - Contains pv, html, epi, ips (already validated)
 * @returns {Promise<string>} Enhanced HTML
 */
async function enhance(context) {
    // Extract conditions from IPS
    const conditions = getConditions(context.ips);
    
    // Find matching sections in ePI
    const categories = findSectionsByCode(
        context.epi,
        conditions.flatMap(c => c.codes)
    );
    
    // Add CSS classes to matching sections
    return await addClasses(
        context.html,
        categories,
        'highlight',
        'my-condition-lens'
    );
}

function getSpecification() {
    return "1.0.0";
}

async function explanation(context, lang = "en") {
    return "Explanation text";
}

module.exports = {
    enhance,
    getSpecification,
    explanation
};
```

## Lens Context

Your lens functions receive a `context` object that is already validated and contains:
- `context.pv` - Persona Vector (patient preferences)
- `context.html` - HTML content from ePI
- `context.epi` - ePI FHIR Bundle
- `context.ips` - IPS FHIR Bundle

No need to validate or create context - it's ready to use!

## API Documentation

Functions for extracting and parsing FHIR resources from IPS bundles.

#### `getResourcesByType(bundle, resourceType)`
Get all resources of a specific type.

```javascript
const patients = FHIRHelper.getResourcesByType(ipsBundle, "Patient");
const observations = FHIRHelper.getResourcesByType(ipsBundle, "Observation");
```

#### `resolveReference(reference, entries)`
Resolve a FHIR reference to its actual resource.

```javascript
const medication = FHIRHelper.resolveReference("Medication/123", ipsBundle.entry);
```

#### `extractCodes(codeableConcept)`
Extract all codes from a CodeableConcept.

```javascript
const codes = FHIRHelper.extractCodes(condition.code);
// Returns: [{code: "...", system: "...", display: "..."}]
```

#### `getMedications(ipsBundle)`
Get all medications (handles both CodeableConcept and Reference).

```javascript
const medications = FHIRHelper.getMedications(ipsBundle);
// Returns array with codes, including ingredients
```

#### `getObservationsByCode(ipsBundle, codes, options)`
Get observations by LOINC or SNOMED codes.

```javascript
const potassiumLabs = FHIRHelper.getObservationsByCode(
    ipsBundle,
    ["2823-3", "6298-4"],
    { valueFilter: (obs) => obs.value < 3.5 }
);
```

#### `getConditions(ipsBundle)`
Get all conditions from IPS.

```javascript
const conditions = FHIRHelper.getConditions(ipsBundle);
// Returns: [{id, codes, text, clinicalStatus}]
```

#### `getAllergies(ipsBundle)`
Get all allergies/intolerances.

```javascript
const allergies = FHIRHelper.getAllergies(ipsBundle);
```

#### `getPatientInfo(ipsBundle)`
Get patient demographic information including calculated age.

```javascript
const patient = FHIRHelper.getPatientInfo(ipsBundle);
// Returns: {gender, birthDate, age, ...}
```

#### `getPatientContacts(ipsBundle)`
Get patient contacts (general practitioner, etc.).

```javascript
const contacts = FHIRHelper.getPatientContacts(ipsBundle);
// Returns: [{type: "phone", value: "+123...", resourceType: "Practitioner"}]
```

---

### EPIHelper

Functions for parsing ePI extensions and identifiers.

#### `getAnnotatedSections(epiBundle)`
Get all annotated sections from ePI Composition extensions.

```javascript
const sections = EPIHelper.getAnnotatedSections(epiBundle);
// Returns: [{category: "...", codes: [...]}]
```

#### `findSectionsByCode(epiBundle, codesToSearch, matchSystem)`
Find sections matching specific codes.

```javascript
const categories = EPIHelper.findSectionsByCode(
    epiBundle,
    ["77386006", "69840006"],
    true
);
// Returns: ["pregnancy-section", "breastfeeding-section"]
```

#### `getMedicinalProductId(epiBundle)`
Get MedicinalProductDefinition ID from ePI.

```javascript
const productId = EPIHelper.getMedicinalProductId(epiBundle);
```

#### `matchBundleIdentifier(epiBundle, identifierList)`
Check if ePI bundle identifier matches any in a list.

```javascript
const isMatch = EPIHelper.matchBundleIdentifier(
    epiBundle,
    ["epibundle-123", "epibundle-abc"]
);
```

#### `matchProductIdentifier(epiBundle, identifierList)`
Check if MedicinalProductDefinition identifier matches.

```javascript
const isMatch = EPIHelper.matchProductIdentifier(
    epiBundle,
    ["CIT-204447", "RIS-197361"]
);
```

#### `validateEPI(epiBundle)`
Validate ePI structure.

```javascript
const validation = EPIHelper.validateEPI(epiBundle);
// Returns: {valid: true/false, errors: [...]}
```

#### `getLanguage(epiBundle)`
Get language from ePI (Composition or Bundle).

```javascript
const lang = EPIHelper.getLanguage(epiBundle);
// Returns: "en", "pt-PT", etc.
```

---

### HTMLHelper

Functions for DOM manipulation and HTML processing.

#### `addClasses(html, categories, enhanceTag, lensName)`
Add CSS classes to elements matching specific categories.

**Parameters:**
- `html` (string): HTML string to process
- `categories` (Array<string>): Array of CSS class names to search for
- `enhanceTag` (string): CSS class to add (e.g., "highlight", "collapse")
- `lensName` (string, optional): Lens name for additional CSS class

**Returns:** Promise<string> - Modified HTML string

```javascript
const result = await addClasses(
    htmlData,
    ['pregnancy-section', 'contraindications'],
    'highlight',
    'pregnancy-lens'
);
```

#### `insertBanner(html, content, position, cssClass)`
Insert banner or content at top or bottom of HTML.

**Parameters:**
- `html` (string): HTML string
- `content` (string): Content to insert (HTML string)
- `position` (string, optional): 'top' or 'bottom' (default: 'top')
- `cssClass` (string, optional): CSS class for wrapper div

**Returns:** Promise<string> - Modified HTML string

```javascript
const result = await insertBanner(
    htmlData,
    '<div class="warning">Important notice</div>',
    'top',
    'alert-banner'
);
```

#### `traverseDOM(html, visitor)`
Traverse DOM tree and apply visitor function to each element.

**Parameters:**
- `html` (string): HTML string
- `visitor` (Function): Function called for each element: `visitor(element, document)`

**Returns:** Promise<string> - Modified HTML string

```javascript
// Add class to all divs with specific attribute
const result = await traverseDOM(htmlData, (element, doc) => {
    if (element.tagName === 'DIV' && element.hasAttribute('data-risk')) {
        element.classList.add('high-risk');
    }
});

// Remove all images
const result = await traverseDOM(htmlData, (element) => {
    if (element.tagName === 'IMG') {
        element.remove();
    }
});
```
    },
    lensName: 'questionnaire-lens'
});
```

---

### LanguageHelper

Functions for language detection and translations.

#### `detectLanguage(epiBundle)`
Detect language from ePI bundle.

```javascript
const lang = LanguageHelper.detectLanguage(epiBundle);
// Returns: "en", "pt-PT", etc.
```

#### `getLangKey(languageCode)`
Get simplified language key.

```javascript
const key = LanguageHelper.getLangKey("pt-PT");
// Returns: "pt"
```

#### `getStandardMessages(lang)`
Get standard messages for a language.

```javascript
const messages = LanguageHelper.getStandardMessages("en");
// Returns: {noDataFound: "...", dataDetected: "...", ...}
```

#### `getPregnancyMessages(lang)`
Get pregnancy-specific messages.

```javascript
const messages = LanguageHelper.getPregnancyMessages("pt");
```

#### `getConditionMessages(lang)`
Get condition-specific messages.

```javascript
const messages = LanguageHelper.getConditionMessages("es");
```

#### `getQuestionnaireMessages(lang)`
Get questionnaire-specific messages.

```javascript
const messages = LanguageHelper.getQuestionnaireMessages("da");
```

---

### Utils (utils/common.js)

General utility functions for common operations.

#### Array Utilities

**`ensureArray(value)`**  
Ensures value is always an array.

```javascript
ensureArray(null);           // → []
ensureArray("single");       // → ["single"]
ensureArray([1, 2, 3]);      // → [1, 2, 3]
```

**`isEmpty(value)`**  
Check if value is empty/null/undefined.

```javascript
isEmpty(null);               // → true
isEmpty([]);                 // → true
isEmpty({});                 // → true
isEmpty("text");             // → false
```

**`arrayContains(array, target, keys)`**  
Check if array contains object with matching properties.

```javascript
arrayContains(
    [{code: "123", system: "test"}],
    {code: "123"},
    ["code"]
); // → true
```

#### Object Utilities

**`validateRequiredFields(obj, fields)`**  
Validate required fields exist (throws if missing).

```javascript
validateRequiredFields(
    {name: "John"},
    ["name", "age"]
); // throws Error
```

**`safeGet(obj, path, defaultValue)`**  
Safely access nested properties.

```javascript
safeGet(obj, "user.address.city", "Unknown");
```

#### Date Utilities

**`calculateAge(birthDate)`**  
Calculate age from birth date.

```javascript
calculateAge("1990-05-15"); // → 35
```

**`addMonths(date, months)`**  
Add months to a date.

```javascript
addMonths(new Date(), 6); // → Date 6 months from now
```

**`isDateInRange(date, start, end)`**  
Check if date is within range.

```javascript
isDateInRange(new Date(), startDate, endDate); // → true/false
```

---

### FHIR Code Validation (fhir/common.js)

Functions for validating FHIR codes and codings.

**`isValidCode(code)`**  
Check if code object is valid.

```javascript
isValidCode({code: "123", system: "test"}); // → true
isValidCode({code: "123"});                  // → true
isValidCode({});                             // → false
```

**`areValidCodes(codes)`**  
Check if array contains valid codes.

```javascript
areValidCodes([
    {code: "123", system: "test"},
    {code: "456"}
]); // → true
```

**`codesMatch(code1, code2, includeSystem)`**  
Check if two codes match.

```javascript
codesMatch(
    {code: "123", system: "http://..."},
    {code: "123", system: "http://..."}
); // → true
```

---

## Module Organization

The library is organized into focused modules:

- **fhir/common.js** - Common FHIR utilities for all bundle types
- **fhir/ips.js** - IPS-specific resource extraction  
- **fhir/epi.js** - ePI-specific functions
- **html/dom.js** - DOM manipulation utilities
- **i18n/language.js** - Translation and i18n
- **utils/common.js** - General utility functions

Import only what you need:

```javascript
const { 
    getConditions,           // from fhir/ips
    findSectionsByCode,      // from fhir/epi
    addClasses,              // from html/dom
    ensureArray              // from utils/common
} = require('@gravitate-health/lens-tool-lib');
```

---

## Complete Example

See `examples/simple-condition-lens.js` for a complete working example.

## License

MIT
