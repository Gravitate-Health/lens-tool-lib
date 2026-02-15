/**
 * Example: Medication Interaction Lens
 * 
 * This lens highlights drug interaction warnings based on medications
 * found in the patient's IPS.
 */

const { getMedications } = require('@gravitate-health/lens-tool-lib/fhir/ips');
const { findSectionsByCode } = require('@gravitate-health/lens-tool-lib/fhir/epi');
const { addClasses } = require('@gravitate-health/lens-tool-lib/html/dom');
const { getStandardMessages } = require('@gravitate-health/lens-tool-lib/i18n/language');

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
 * Enhance function: Transforms the original content to highlight medication interaction sections.
 * @returns {Promise<string>} Enhanced HTML
 */
async function enhance() {
    console.log("__________ MEDICATION INTERACTION LENS STARTED _____________");

    // Extract all medications from IPS
    const medications = getMedications(ipsData);
    console.log(`Found ${medications.length} medication entries`);

    if (medications.length === 0) {
        console.log("No medications found");
        return htmlData;
    }

    // Collect all medication and ingredient codes
    const medicationCodes = medications.flatMap(med => med.codes);
    console.log(`Total medication/ingredient codes: ${medicationCodes.length}`);

    // Find matching sections in ePI
    const categories = findSectionsByCode(
        epiData,
        medicationCodes,
        true
    );

    console.log(`Found ${categories.length} interaction sections`);

    if (categories.length === 0) {
        return htmlData;
    }

    // Add CSS classes to matching sections
    const result = await addClasses(
        htmlData,
        categories,
        'highlight',
        'medication-interaction-lens'
    );

    console.log("__________ MEDICATION INTERACTION LENS FINISHED _____________");
    return result;
}

/**
 * Explanation function: Provides an explanation for the lens's behavior.
 * @returns {string} Explanation text
 */
function explanation() {
    const medications = getMedications(ipsData);
    const messages = getStandardMessages("en");
    
    if (medications.length > 0) {
        const medNames = medications
            .map(m => m.codes[0]?.display)
            .filter(Boolean)
            .slice(0, 3)
            .join(", ");
        
        return `Potential interactions found with your medications: ${medNames}`;
    }
    
    return messages.noDataFound;
}

return {
    enhance: enhance,
    explanation: explanation
};
