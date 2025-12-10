/**
 * Example: Pregnancy Lens using LensBuilder
 * 
 * This lens highlights pregnancy and breastfeeding information for
 * women of childbearing age.
 */

const { LensBuilder } = require('../src/index');

const pregnancyLens = LensBuilder.create({
    name: 'pregnancy-lens',
    version: '1.0.0',

    /**
     * Extract pregnancy-related data from IPS
     */
    extract: async (context) => {
        console.log("__________ PREGNANCY LENS EXTRACTION STARTED _____________");

        const patient = context.fhir.getPatientInfo(context.ips);
        
        // Check if patient is female and of childbearing age
        const pregnancyStatus = {
            childbearingAge: false,
            pregnant: false,
            breastfeeding: false
        };

        if (!patient || patient.gender !== 'female') {
            return { pregnancyStatus, enhanceTag: 'collapse' };
        }

        const age = patient.age;
        if (age >= 60 || age < 14) {
            return { pregnancyStatus, enhanceTag: 'collapse' };
        }

        pregnancyStatus.childbearingAge = true;

        // Check for pregnancy observations
        const pregnancyObs = context.fhir.getObservationsByCode(
            context.ips,
            ["82810-3", "11778-8"],  // Pregnancy status and delivery date
            { includeDisplay: 'pregnancy' }
        );

        pregnancyObs.forEach(obs => {
            // Check delivery date
            if (obs.valueDateTime) {
                const deliveryDate = new Date(obs.valueDateTime);
                const now = new Date();
                const twoYearsAgo = context.utils.addYears(now, -2);
                const tenMonthsFromNow = context.utils.addMonths(now, 10);

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

        const enhanceTag = pregnancyStatus.childbearingAge ? 'highlight' : 'collapse';

        console.log("Pregnancy status:", pregnancyStatus);
        return { pregnancyStatus, enhanceTag };
    },

    /**
     * Annotate HTML based on pregnancy status
     */
    annotate: async (context, data) => {
        console.log("__________ PREGNANCY LENS ANNOTATION STARTED _____________");

        const { pregnancyStatus, enhanceTag } = data;

        // Search for pregnancy-related sections in ePI
        const pregnancyCategories = ["W78", "77386006", "69840006"];  // Pregnancy, breastfeeding codes
        const categories = context.epiHelper.findSectionsByCode(
            context.epi,
            pregnancyCategories,
            false  // Match code only, not system
        );

        if (categories.length === 0) {
            console.log("No pregnancy-related sections found");
            return context.html;
        }

        // Annotate HTML
        const result = await context.htmlHelper.annotate({
            html: context.html,
            categories: categories,
            enhanceTag: enhanceTag,
            lensName: 'pregnancy-lens'
        });

        console.log("__________ PREGNANCY LENS EXECUTION FINISHED _____________");
        return result;
    },

    /**
     * Explanation function
     */
    explanation: (context, lang = "en") => {
        const messages = context.lang.getPregnancyMessages(lang);
        
        // Access the extracted data (need to store in context during extract)
        // For simplicity, returning a generic message
        return messages.childbearingAge;
    },

    /**
     * Report function
     */
    report: (context, lang = "en") => {
        const messages = context.lang.getPregnancyMessages(lang);
        return messages.childbearingAge;
    }
});

// Export for use in lens execution environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = pregnancyLens;
}
