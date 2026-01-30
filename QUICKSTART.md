# Quick Start Guide: Gravitate Lens Toolkit

Get started building lenses in 5 minutes!

## Step 1: Understand the Context

Every lens receives four global variables:
- `pv` - Persona Vector (patient preferences/context)
- `html` - HTML content from ePI
- `epi` - ePI FHIR Bundle (electronic Product Information)
- `ips` - IPS FHIR Bundle (International Patient Summary)

## Step 2: Choose Your Approach

### Option A: BaseLens (Class-based)
Best for: Complex lenses with multiple methods

```javascript
const { BaseLens } = require('./gravitate-lens-toolkit/src/index');

class MyLens extends BaseLens {
    getSpecification() {
        return "1.0.0";
    }

    async enhance() {
        this.validate();
        
        // Your logic here
        const conditions = this.fhir.getConditions(this.ips);
        
        // Return enhanced HTML
        return this.html;
    }
}

// Export
let lens = new MyLens({ pv, html, epi, ips });
module.exports = lens.export();
```

### Option B: LensBuilder (Functional)
Best for: Simple, focused lenses

```javascript
const { LensBuilder } = require('./@gravitate-health/lens-tool-lib/src/index');

module.exports = LensBuilder.create({
    name: 'my-lens',
    version: '1.0.0',
    
    extract: async (context) => {
        return {
            conditions: context.fhir.getConditions(context.ips)
        };
    },
    
    annotate: async (context, data) => {
        // Return enhanced HTML
        return context.html;
    }
});
```

## Step 3: Common Patterns

### Pattern 1: Highlight Sections Based on IPS Data

```javascript
async enhance() {
    this.validate();
    
    // 1. Extract data from IPS
    const conditions = this.fhir.getConditions(this.ips);
    
    // 2. Find matching sections in ePI
    const categories = this.epiHelper.findSectionsByCode(
        this.epi,
        conditions.flatMap(c => c.codes)
    );
    
    // 3. Annotate HTML
    return await this.htmlHelper.annotate({
        html: this.html,
        categories: categories,
        enhanceTag: 'highlight',
        lensName: 'my-lens'
    });
}
```

### Pattern 2: Insert Warning Banner

```javascript
async enhance() {
    this.validate();
    
    // Check condition
    const patient = this.fhir.getPatientInfo(this.ips);
    if (patient.age < 18) {
        return await this.htmlHelper.insertBanner({
            html: this.html,
            content: '<div class="warning">Not recommended for children</div>',
            position: 'top'
        });
    }
    
    return this.html;
}
```

### Pattern 3: Conditional Enhancement

```javascript
async enhance() {
    this.validate();
    
    // Check observations
    const labs = this.fhir.getObservationsByCode(
        this.ips,
        ["2823-3"],  // Potassium
        { valueFilter: (obs) => obs.value < 3.5 }
    );
    
    if (labs.length > 0) {
        // Highlight renal dosing sections
        return await this.htmlHelper.annotate({
            html: this.html,
            categories: ['renal-dosing'],
            enhanceTag: 'highlight',
            lensName: 'renal-lens'
        });
    }
    
    return this.html;
}
```

## Step 4: Most Used Helper Functions

### From IPS (this.fhir)

```javascript
// Get patient info
const patient = this.fhir.getPatientInfo(this.ips);
// → {gender, birthDate, age, ...}

// Get conditions
const conditions = this.fhir.getConditions(this.ips);
// → [{id, codes, text, clinicalStatus}]

// Get medications
const medications = this.fhir.getMedications(this.ips);
// → [{resourceType, codes}] (includes ingredients)

// Get observations
const obs = this.fhir.getObservationsByCode(this.ips, ["2823-3"]);
// → [{id, codes, value, unit}]

// Get allergies
const allergies = this.fhir.getAllergies(this.ips);
// → [{id, codes, text, criticality}]
```

### From ePI (this.epiHelper)

```javascript
// Find sections by code
const categories = this.epiHelper.findSectionsByCode(
    this.epi,
    ["77386006", "69840006"]
);
// → ["pregnancy-section", "breastfeeding-section"]

// Match product identifier
const isMatch = this.epiHelper.matchProductIdentifier(
    this.epi,
    ["CIT-204447"]
);
// → true/false

// Get language
const lang = this.epiHelper.getLanguage(this.epi);
// → "en", "pt-PT", etc.
```

### HTML Annotation (this.htmlHelper)

```javascript
// Basic annotation
const result = await this.htmlHelper.annotate({
    html: this.html,
    categories: ['section-4.4'],
    enhanceTag: 'highlight',
    lensName: 'my-lens'
});

// Insert banner
const result = await this.htmlHelper.insertBanner({
    html: this.html,
    content: '<div>Warning</div>',
    position: 'top'
});
```

### Language (this.lang)

```javascript
// Detect language
const lang = this.detectLanguage();  // or this.lang.detectLanguage(this.epi)

// Get messages
const messages = this.getMessages('standard');
// → {noDataFound: "...", dataDetected: "..."}

const pregMessages = this.getMessages('pregnancy');
// → {childbearingAge: "...", pregnant: "..."}
```

### Validation (this.validator)

```javascript
// Validate all at once
this.validate();  // Checks IPS, ePI, HTML, and Composition

// Individual validation
this.validator.requireIPS(this.ips);
this.validator.requireEPI(this.epi);
this.validator.requireComposition(this.epi);
```

### Utilities (this.utils)

```javascript
// Age calculation
const age = this.utils.calculateAge("1990-05-15");

// Date utilities
const futureDate = this.utils.addMonths(new Date(), 10);
const isInRange = this.utils.isDateInRange(date, start, end);

// Deep equality
if (this.utils.deepEqual(obj1, obj2)) { }

// Array contains
if (this.utils.arrayContains(array, {code: "123"}, ["code"])) { }
```

## Step 5: Test Your Lens

1. Save your lens file
2. Test with the Gravitate Health testing environment
3. Check the console logs for debugging
4. Verify HTML output

## Common Pitfalls to Avoid

❌ **Don't forget to validate**
```javascript
// BAD - no validation
async enhance() {
    const conditions = this.fhir.getConditions(this.ips);
    // ...
}

// GOOD - validate first
async enhance() {
    this.validate();  // ← Add this!
    const conditions = this.fhir.getConditions(this.ips);
    // ...
}
```

❌ **Don't forget to return HTML**
```javascript
// BAD - no return
async enhance() {
    this.validate();
    // ... logic
}

// GOOD - always return HTML
async enhance() {
    this.validate();
    // ... logic
    return this.html;  // ← Return something!
}
```

❌ **Don't forget async/await**
```javascript
// BAD - missing await
const result = this.htmlHelper.annotate({...});

// GOOD - use await
const result = await this.htmlHelper.annotate({...});
```

## Example: Complete Simple Lens

```javascript
const { BaseLens } = require('./gravitate-lens-toolkit/src/index');

class SimpleAllergyLens extends BaseLens {
    getSpecification() {
        return "1.0.0";
    }

    async enhance() {
        // Step 1: Validate
        this.validate();
        
        // Step 2: Get allergies from IPS
        const allergies = this.fhir.getAllergies(this.ips);
        
        if (allergies.length === 0) {
            return this.html;  // No changes needed
        }
        
        // Step 3: Find matching sections in ePI
        const categories = this.epiHelper.findSectionsByCode(
            this.epi,
            allergies.flatMap(a => a.codes)
        );
        
        if (categories.length === 0) {
            return this.html;  // No matching sections
        }
        
        // Step 4: Annotate HTML
        return await this.htmlHelper.annotate({
            html: this.html,
            categories: categories,
            enhanceTag: 'highlight',
            lensName: 'allergy-lens'
        });
    }
}

// Export for lens execution environment
let lens = new SimpleAllergyLens({ pv, html, epi, ips });
module.exports = lens.export();
```

## Next Steps

1. **Review examples**: Check `@gravitate-health/lens-tool-lib/examples/` for more patterns
2. **Read API docs**: Full documentation in `@gravitate-health/lens-tool-lib/docs/API.md`
3. **Explore helpers**: Each helper module has comprehensive functions
4. **Test thoroughly**: Use real IPS and ePI data

## Need Help?

- 📖 Full API Documentation: `docs/API.md`
- 💡 More Examples: `examples/` directory
- 📝 Legacy Code: `legacy-lenses/` for reference
- 🐛 Issues: Open an issue on GitHub

Happy lens development! 🎉
