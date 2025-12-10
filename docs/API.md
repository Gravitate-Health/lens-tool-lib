# Gravitate Health Lens Toolkit

A comprehensive helper library for developing Gravitate Health lens components. This toolkit provides standardized functions for common operations with FHIR resources, ePI processing, HTML annotation, and internationalization.

## Installation

```bash
npm install gravitate-lens-toolkit
```

## Quick Start

### Using BaseLens Class

```javascript
const { BaseLens } = require('gravitate-lens-toolkit');

class MyConditionLens extends BaseLens {
    getSpecification() {
        return "1.0.0";
    }

    async enhance() {
        // Validate inputs
        this.validate();
        
        // Extract conditions from IPS
        const conditions = this.fhir.getConditions(this.ips);
        
        // Find matching sections in ePI
        const categories = this.epiHelper.findSectionsByCode(
            this.epi,
            conditions.flatMap(c => c.codes)
        );
        
        // Annotate HTML
        return await this.htmlHelper.annotate({
            html: this.html,
            categories: categories,
            enhanceTag: 'highlight',
            lensName: 'my-condition-lens'
        });
    }
}

// Create lens instance with context
const lens = new MyConditionLens({ pv, html, epi, ips });
const result = lens.export();
```

### Using LensBuilder (Functional Approach)

```javascript
const { LensBuilder } = require('gravitate-lens-toolkit');

const myLens = LensBuilder.create({
    name: 'my-simple-lens',
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
            lensName: 'my-simple-lens'
        });
    }
});
```

## API Documentation

### FHIRHelper

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

Functions for DOM manipulation and HTML annotation.

#### `annotate(options)`
Annotate HTML by adding CSS classes to elements.

```javascript
const result = await HTMLHelper.annotate({
    html: htmlData,
    categories: ['pregnancy-section', 'contraindications'],
    enhanceTag: 'highlight',
    lensName: 'pregnancy-lens'
});
```

#### `insertBanner(options)`
Insert banner or content at top or bottom of HTML.

```javascript
const result = await HTMLHelper.insertBanner({
    html: htmlData,
    content: '<div class="warning">Important notice</div>',
    position: 'top',
    cssClass: 'alert-banner'
});
```

#### `wrapWithLinks(options)`
Wrap elements with links.

```javascript
const result = await HTMLHelper.wrapWithLinks({
    html: htmlData,
    categories: ['section-4.4'],
    linkBuilder: (element) => ({
        href: 'https://example.com/questionnaire',
        target: '_blank'
    }),
    lensName: 'questionnaire-lens'
});
```

#### `insertQuestionnaireLink(options)`
Insert questionnaire link (specific use case).

```javascript
const result = await HTMLHelper.insertQuestionnaireLink({
    html: htmlData,
    categories: ['high-risk-section'],
    linkURL: 'https://example.com/questionnaire',
    messages: {
        bannerWarning: "⚠️ Warning",
        questionnaireLink: "Fill questionnaire"
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

### ValidationHelper

Functions for validation and error handling.

#### `requireIPS(ips)` / `requireEPI(epi)`
Validate required bundles (throws error if invalid).

```javascript
ValidationHelper.requireIPS(ips);
ValidationHelper.requireEPI(epi);
```

#### `hasComposition(epiBundle)` / `requireComposition(epiBundle)`
Check for or require Composition resource.

```javascript
if (ValidationHelper.hasComposition(epiBundle)) {
    // ...
}
ValidationHelper.requireComposition(epiBundle); // throws if not found
```

#### `validateBundle(bundle, bundleType)`
Validate FHIR Bundle structure.

```javascript
const validation = ValidationHelper.validateBundle(ipsBundle, "IPS");
// Returns: {valid: true/false, errors: [...]}
```

#### `validateLensContext(context)`
Validate complete lens context.

```javascript
const validation = ValidationHelper.validateLensContext({
    ips, epi, html, pv
});
```

---

### Utils

General utility functions.

#### `deepEqual(obj1, obj2)`
Deep equality check for objects.

```javascript
if (Utils.deepEqual(extension1, extension2)) {
    // ...
}
```

#### `calculateAge(birthDate)`
Calculate age from birth date.

```javascript
const age = Utils.calculateAge("1990-05-15");
// Returns: 35
```

#### `codesMatch(code1, code2, includeSystem)`
Check if two codes match.

```javascript
if (Utils.codesMatch(
    {code: "123", system: "http://..."},
    {code: "123", system: "http://..."}
)) {
    // ...
}
```

#### `arrayContains(array, searchObj, compareFields)`
Check if array contains object matching criteria.

```javascript
const exists = Utils.arrayContains(
    medications,
    {code: "204447", system: "http://..."},
    ["code", "system"]
);
```

#### Other utilities
- `isDateInRange(date, start, end)`
- `addMonths(date, months)`
- `addYears(date, years)`
- `flatten(array, depth)`
- `groupBy(array, key)`
- `unique(array)`
- `deepMerge(target, source)`
- `retry(fn, maxAttempts, delay)`

---

## Complete Example

See `examples/simple-condition-lens.js` for a complete working example.

## License

MIT
