/**
 * Example: Medication Interaction Lens
 * 
 * This lens highlights drug interaction warnings based on medications
 * found in the patient's IPS.
 */

const { BaseLens } = require('../src/base-lens');

class MedicationInteractionLens extends BaseLens {
    getSpecification() {
        return "1.0.0";
    }

    async enhance() {
        console.log("__________ MEDICATION INTERACTION LENS STARTED _____________");

        // Validate inputs
        this.validate();

        // Extract all medications from IPS
        const medications = this.fhir.getMedications(this.ips);
        console.log(`Found ${medications.length} medication entries`);

        if (medications.length === 0) {
            console.log("No medications found");
            return this.html;
        }

        // Collect all medication and ingredient codes
        const medicationCodes = medications.flatMap(med => med.codes);
        console.log(`Total medication/ingredient codes: ${medicationCodes.length}`);

        // Find matching sections in ePI
        const categories = this.epiHelper.findSectionsByCode(
            this.epi,
            medicationCodes,
            true
        );

        console.log(`Found ${categories.length} interaction sections`);

        if (categories.length === 0) {
            return this.html;
        }

        // Annotate HTML
        const result = await this.htmlHelper.annotate({
            html: this.html,
            categories: categories,
            enhanceTag: 'highlight',
            lensName: 'interaction-lens'
        });

        console.log("__________ MEDICATION INTERACTION LENS FINISHED _____________");
        return result;
    }

    async explanation(lang = "en") {
        const medications = this.fhir.getMedications(this.ips);
        const messages = this.getMessages('standard');
        
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
}

// Export pattern for lens execution environment
let pvData = typeof pv !== 'undefined' ? pv : null;
let htmlData = typeof html !== 'undefined' ? html : "";
let epiData = typeof epi !== 'undefined' ? epi : null;
let ipsData = typeof ips !== 'undefined' ? ips : null;

const lens = new MedicationInteractionLens({
    pv: pvData,
    html: htmlData,
    epi: epiData,
    ips: ipsData
});

const lensInterface = lens.export();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = lensInterface;
}
