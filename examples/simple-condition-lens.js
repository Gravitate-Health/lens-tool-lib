/**
 * Example: Simple Condition Lens
 * 
 * This lens highlights sections in the ePI that are relevant to 
 * conditions found in the patient's IPS.
 */

const { getConditions } = require('@gravitate-health/lens-tool-lib/fhir/ips');
const { findSectionsByCode } = require('@gravitate-health/lens-tool-lib/fhir/epi');
const { addClasses } = require('@gravitate-health/lens-tool-lib/html/dom');

/*
  Input data
    These variables are automatically populated by the lens execution environment.
*/
// ePI data
let epiData = epi;
// IPS data
let ipsData = ips;
// PV data (for future use)
let pvData = pv;
// Original HTML content to be transformed
let htmlData = html;

/**
 * Enhance function: Transforms the original content to highlight condition-relevant sections.
 * @returns {Promise<string>} Enhanced HTML
 */
async function enhance() {
    console.log("__________ SIMPLE CONDITION LENS EXECUTION STARTED _____________");

    // Extract conditions from IPS
    const conditions = getConditions(ipsData);
    console.log(`Found ${conditions.length} conditions in IPS`);

    if (conditions.length === 0) {
        console.log("No conditions found - returning original HTML");
        return htmlData;
    }

    // Collect all condition codes
    const conditionCodes = conditions.flatMap(condition => condition.codes);
    console.log("Condition codes:", conditionCodes);

    // Find matching sections in ePI
    const categories = findSectionsByCode(
        epiData,
        conditionCodes,
        true  // Match system as well as code
    );
    console.log(`Found ${categories.length} matching sections in ePI`);

    if (categories.length === 0) {
        console.log("No matching sections found - returning original HTML");
        return htmlData;
    }

    // Add CSS classes to matching sections
    const result = await addClasses(
        htmlData,
        categories,
        'highlight',
        'simple-condition-lens'
    );

    console.log("__________ SIMPLE CONDITION LENS EXECUTION FINISHED _____________");
    return result;
}

/**
 * Explanation function: Provides an explanation for the lens's behavior.
 * @returns {string} Explanation text
 */
function explanation() {
    const conditions = getConditions(ipsData);
    
    if (conditions.length === 0) {
        return "No conditions found in your health record.";
    }
    
    const conditionNames = conditions
        .map(c => c.text || c.codes[0]?.display)
        .filter(Boolean)
        .slice(0, 3)
        .join(", ");

    return `This lens highlights sections relevant to your health conditions: ${conditionNames}`;
}

return {
    enhance: enhance,
    explanation: explanation
};
