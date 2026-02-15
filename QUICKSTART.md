# Quick Start Guide: Gravitate Lens Toolkit

Get started building lenses in 5 minutes!

## Step 1: Understand the Context

Every lens receives four global variables:
- `pv` - Persona Vector (patient preferences/context)
- `html` - HTML content from ePI
- `epi` - ePI FHIR Bundle (electronic Product Information)
- `ips` - IPS FHIR Bundle (International Patient Summary)

## Step 2: Import What You Need

Import only the functions you'll use:

```javascript
const { getConditions } = require('@gravitate-health/lens-tool-lib');
const { findSectionsByCode } = require('@gravitate-health/lens-tool-lib');
const { addClasses } = require('@gravitate-health/lens-tool-lib');

// Or import multiple at once:
const { 
    getConditions, 
    findSectionsByCode, 
    addClasses 
} = require('@gravitate-health/lens-tool-lib');
```

## Step 3: Write Your Lens Functions

Just export `enhance()` and `getSpecification()` functions. Context is already validated:

```javascript
const { getConditions, findSectionsByCode, addClasses } = require('@gravitate-health/lens-tool-lib');

/**
 * Main enhance function
 * @param {Object} context - Already validated, contains pv, html, epi, ips
 * @returns {Promise<string>} Enhanced HTML
 */
async function enhance(context) {
    // Your logic here
    const conditions = getConditions(context.ips);
    
    // Return enhanced HTML
    return context.html;
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

## Step 4: Common Patterns

### Pattern 1: Highlight Sections Based on IPS Data

```javascript
const { getConditions, findSectionsByCode, addClasses } = require('@gravitate-health/lens-tool-lib');

async function enhance(context) {
    // 1. Extract data from IPS
    const conditions = getConditions(context.ips);
    
    // 2. Find matching sections in ePI
    const categories = findSectionsByCode(
        context.epi,
        conditions.flatMap(c => c.codes)
    );
    
    // 3. Add CSS classes to matching sections
    return await addClasses(
        context.html,
        categories,
        'highlight',
        'condition-lens'
    );
}

module.exports = { enhance, getSpecification: () => "1.0.0" };
```

### Pattern 2: Insert Warning Banner

```javascript
const { getPatientInfo, insertBanner } = require('@gravitate-health/lens-tool-lib');

async function enhance(context) {
    // Check condition
    const patient = getPatientInfo(context.ips);
    if (patient.age < 18) {
        return await insertBanner(
            context.html,
            '<div class="warning">Not recommended for children</div>',
            'top'
        );
    }
    
    return context.html;
}

module.exports = { enhance, getSpecification: () => "1.0.0" };
```

### Pattern 3: Conditional Enhancement

```javascript
const { getObservationsByCode, addClasses } = require('@gravitate-health/lens-tool-lib');

async function enhance(context) {
    // Check observations
    const labs = getObservationsByCode(
        context.ips,
        ["2823-3"],  // Potassium
        { valueFilter: (obs) => obs.value < 3.5 }
    );
    
    if (labs.length > 0) {
        // Highlight renal dosing sections
        return await addClasses(
            context.html,
            ['renal-dosing'],
            'highlight',
            'renal-lens'
        );
    }
    
    return context.html;
}

module.exports = { enhance, getSpecification: () => "1.0.0" };
```

## Step 5: Most Used Helper Functions

### From IPS (fhir/ips.js)

```javascript
const { 
    getPatientInfo, 
    getConditions, 
    getMedications, 
    getObservationsByCode, 
    getAllergies 
} = require('@gravitate-health/lens-tool-lib');

// Get patient info
const patient = getPatientInfo(context.ips);
// → {gender, birthDate, age, ...}

// Get conditions
const conditions = getConditions(context.ips);
// → [{id, codes, text, clinicalStatus}]

// Get medications
const medications = getMedications(context.ips);
// → [{resourceType, codes}] (includes ingredients)

// Get observations
const obs = getObservationsByCode(context.ips, ["2823-3"]);
// → [{id, codes, value, unit}]

// Get allergies
const allergies = getAllergies(context.ips);
// → [{id, codes, text, criticality}]
```

### From ePI (fhir/epi.js)

ePI IS FHIR - these functions work with ePI bundles.

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
// → ["pregnancy-section", "breastfeeding-section"]

// Match product identifier
const isMatch = matchProductIdentifier(
    context.epi,
    ["CIT-204447"]
);
// → true/false

// Get language
const lang = getLanguage(context.epi);
// → "en", "pt-PT", etc.
```

### HTML Functions (html/dom.js)

```javascript
const { addClasses, insertBanner, traverseDOM } = require('@gravitate-health/lens-tool-lib');

// Add CSS classes to elements
const result = await addClasses(
    context.html,
    ['section-4.4'],
    'highlight',
    'my-lens'
);

// Insert banner
const result = await insertBanner(
    context.html,
    '<div>Warning</div>',
    'top'
);

// Traverse DOM with visitor function
const result = await traverseDOM(context.html, (element, doc) => {
    if (element.classList.contains('warning')) {
        element.style.color = 'red';
    }
});
```

### Language Functions (i18n/language.js)

```javascript
const { 
    getLanguage,  // from fhir/epi
    getStandardMessages,
    getLangKey,
    translate
} = require('@gravitate-health/lens-tool-lib');

// Detect language (use getLanguage from fhir/epi module)
const lang = getLanguage(context.epi);

// Get messages
const messages = getStandardMessages(lang);
// → {noDataFound: "...", dataDetected: "..."}
```

### Utilities (utils/common.js)

```javascript
const { 
    calculateAge, 
    addMonths, 
    isDateInRange, 
    deepEqual, 
    arrayContains,
    ensureArray,
    isEmpty,
    validateRequiredFields,
    safeGet
} = require('@gravitate-health/lens-tool-lib');

// Array utilities
ensureArray(value);           // Always returns array
isEmpty(value);               // Check if value is empty/null

// Object utilities  
validateRequiredFields(obj, fields);  // Throws if missing fields
safeGet(obj, path, defaultVal);       // Safe nested access

// Age calculation
const age = calculateAge("1990-05-15");

// Date utilities
const futureDate = addMonths(new Date(), 10);
const isInRange = isDateInRange(date, start, end);

// Deep equality
if (deepEqual(obj1, obj2)) { }

// Array contains
if (arrayContains(array, {code: "123"}, ["code"])) { }
```

## Step 6: Test Your Lens

1. Save your lens file
2. Test with the Gravitate Health testing environment
3. Check the console logs for debugging
4. Verify HTML output

## Common Pitfalls to Avoid

❌ **Don't forget to return HTML**
```javascript
// BAD - no return
async function enhance(context) {
    const conditions = getConditions(context.ips);
    // ... logic
}

// GOOD - always return HTML
async function enhance(context) {
    const conditions = getConditions(context.ips);
    // ... logic
    return context.html;  // ← Return something!
}
```

❌ **Don't forget async/await**
```javascript
const { addClasses } = require('@gravitate-health/lens-tool-lib');

// BAD - missing await
const result = addClasses(html, categories, 'highlight');

// GOOD - use await
const result = await addClasses(html, categories, 'highlight');
```

✅ **Context is already validated!**
```javascript
// No need to validate - context is ready to use
async function enhance(context) {
    // Just use it directly!
    const conditions = getConditions(context.ips);
    // ...
}
```

## Example: Complete Simple Lens

```javascript
const { 
    getAllergies, 
    findSectionsByCode, 
    addClasses 
} = require('@gravitate-health/lens-tool-lib');

/**
 * Simple allergy lens - highlights allergy-related sections
 */
async function enhance(context) {
    // Step 1: Get allergies from IPS
    const allergies = getAllergies(context.ips);
    
    if (allergies.length === 0) {
        return context.html;  // No changes needed
    }
    
    // Step 2: Find matching sections in ePI
    const categories = findSectionsByCode(
        context.epi,
        allergies.flatMap(a => a.codes)
    );
    
    if (categories.length === 0) {
        return context.html;  // No matching sections
    }
    
    // Step 3: Add CSS classes to matching sections
    return await addClasses(
        context.html,
        categories,
        'highlight',
        'allergy-lens'
    );
}

function getSpecification() {
    return "1.0.0";
}

// Export lens interface
module.exports = {
    enhance,
    getSpecification
};
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
