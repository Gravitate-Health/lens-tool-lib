/**
 * Example: Pregnancy Lens
 * 
 * This lens highlights pregnancy and breastfeeding information for
 * women of childbearing age.
 */

const { getPatientInfo, getObservationsByCode } = require('@gravitate-health/lens-tool-lib/fhir/ips');
const { findSectionsByCode } = require('@gravitate-health/lens-tool-lib/fhir/epi');
const { addClasses } = require('@gravitate-health/lens-tool-lib/html/dom');
const { addYears, addMonths } = require('@gravitate-health/lens-tool-lib/utils/common');

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
 * Enhance function: Transforms the original content to highlight pregnancy-related sections.
 * @returns {Promise<string>} Enhanced HTML
 */
async function enhance() {
    console.log("__________ PREGNANCY LENS STARTED _____________");

    // Extract patient info
    const patient = getPatientInfo(ipsData);
    
    // Check if patient is female and of childbearing age
    const pregnancyStatus = {
        childbearingAge: false,
        pregnant: false,
        breastfeeding: false
    };

    if (!patient || patient.gender !== 'female') {
        console.log("Patient is not female - collapsing pregnancy sections");
        return await collapsePregnancySections();
    }

    const age = patient.age;
    if (age >= 60 || age < 14) {
        console.log("Patient not in childbearing age - collapsing pregnancy sections");
        return await collapsePregnancySections();
    }

    pregnancyStatus.childbearingAge = true;

    // Check for pregnancy observations
    const pregnancyObs = getObservationsByCode(
        ipsData,
        ["82810-3", "11778-8"],  // Pregnancy status and delivery date
        { includeDisplay: 'pregnancy' }
    );

    pregnancyObs.forEach(obs => {
        // Check delivery date
        if (obs.valueDateTime) {
            const deliveryDate = new Date(obs.valueDateTime);
            const now = new Date();
            const twoYearsAgo = addYears(now, -2);
            const tenMonthsFromNow = addMonths(now, 10);

            if (deliveryDate > now && deliveryDate <= tenMonthsFromNow) {
                pregnancyStatus.pregnant = true;
            }

            if (deliveryDate < now && deliveryDate >= twoYearsAgo) {
                pregnancyStatus.breastfeeding = true;
            }
        }

        // Check pregnancy status codes
        if (obs.valueCodeableConcept?.coding) {
            obs.valueCodeableConcept.coding.forEach(coding => {
                const positivePregnancyCodes = ["77386006", "146799005", "152231000119106"];
                const negativePregnancyCodes = ["60001007"];

                if (positivePregnancyCodes.includes(coding.code)) {
                    pregnancyStatus.pregnant = true;
                }
                if (negativePregnancyCodes.includes(coding.code)) {
                    pregnancyStatus.pregnant = false;
                }
            });
        }
    });

    console.log("Pregnancy status:", pregnancyStatus);

    // Determine enhance tag
    const enhanceTag = pregnancyStatus.childbearingAge ? 'highlight' : 'collapse';

    // Search for pregnancy-related sections in ePI
    const pregnancyCategories = ["W78", "77386006", "69840006"];  // Pregnancy, breastfeeding codes
    const categories = findSectionsByCode(
        epiData,
        pregnancyCategories,
        false  // Match code only, not system
    );

    if (categories.length === 0) {
        console.log("No pregnancy-related sections found");
        return htmlData;
    }

    // Add CSS classes to matching sections
    const result = await addClasses(
        htmlData,
        categories,
        enhanceTag,
        'pregnancy-lens'
    );

    console.log("__________ PREGNANCY LENS FINISHED _____________");
    return result;
}

/**
 * Helper function to collapse pregnancy sections
 */
async function collapsePregnancySections() {
    const pregnancyCategories = ["W78", "77386006", "69840006"];
    const categories = findSectionsByCode(
        epiData,
        pregnancyCategories,
        false
    );

    if (categories.length === 0) {
        return htmlData;
    }

    return await addClasses(
        htmlData,
        categories,
        'collapse',
        'pregnancy-lens'
    );
}

/**
 * Explanation function: Provides an explanation for the lens's behavior.
 * @returns {string} Explanation text
 */
function explanation() {
    const patient = getPatientInfo(ipsData);
    
    if (!patient || patient.gender !== 'female') {
        return "This lens is not applicable for this patient.";
    }
    
    const age = patient.age;
    if (age >= 60 || age < 14) {
        return "This lens highlights pregnancy and breastfeeding information, but is not applicable for this patient's age.";
    }
    
    return "This lens highlights pregnancy and breastfeeding information relevant for women of childbearing age.";
}

return {
    enhance: enhance,
    explanation: explanation
};
