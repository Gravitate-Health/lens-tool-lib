/**
 * Example: Simple Condition Lens using BaseLens
 * 
 * This lens highlights sections in the ePI that are relevant to 
 * conditions found in the patient's IPS.
 */

const { BaseLens } = require('../src/base-lens');

class SimpleConditionLens extends BaseLens {
    /**
     * Get lens specification version
     */
    getSpecification() {
        return "1.0.0";
    }

    /**
     * Main enhance function
     */
    async enhance() {
        console.log("__________ SIMPLE CONDITION LENS EXECUTION STARTED _____________");

        // Step 1: Validate inputs
        try {
            this.validate();
        } catch (error) {
            console.error("Validation failed:", error.message);
            return this.html;
        }

        // Step 2: Extract conditions from IPS
        const conditions = this.fhir.getConditions(this.ips);
        console.log(`Found ${conditions.length} conditions in IPS`);

        if (conditions.length === 0) {
            console.log("No conditions found - returning original HTML");
            return this.html;
        }

        // Step 3: Collect all condition codes
        const conditionCodes = conditions.flatMap(condition => condition.codes);
        console.log("Condition codes:", conditionCodes);

        // Step 4: Find matching sections in ePI
        const categories = this.epiHelper.findSectionsByCode(
            this.epi,
            conditionCodes,
            true  // Match system as well as code
        );
        console.log(`Found ${categories.length} matching sections in ePI`);

        if (categories.length === 0) {
            console.log("No matching sections found - returning original HTML");
            return this.html;
        }

        // Step 5: Annotate HTML
        const result = await this.htmlHelper.annotate({
            html: this.html,
            categories: categories,
            enhanceTag: 'highlight',
            lensName: 'simple-condition-lens'
        });

        console.log("__________ SIMPLE CONDITION LENS EXECUTION FINISHED _____________");
        return result;
    }

    /**
     * Provide explanation for the user
     */
    async explanation(lang = "en") {
        const conditions = this.fhir.getConditions(this.ips);
        const messages = this.getMessages('condition');
        
        const conditionNames = conditions
            .map(c => c.text || c.codes[0]?.display)
            .filter(Boolean);

        return messages.explanation(conditionNames);
    }

    /**
     * Provide report for the user
     */
    async report(lang = "en") {
        const conditions = this.fhir.getConditions(this.ips);
        const messages = this.getMessages('condition');
        
        const conditionNames = conditions
            .map(c => c.text || c.codes[0]?.display)
            .filter(Boolean);

        return messages.report(conditionNames);
    }
}

// Export for use in lens execution environment
// This pattern allows the lens to be used with global variables (pv, html, epi, ips)
let pvData = typeof pv !== 'undefined' ? pv : null;
let htmlData = typeof html !== 'undefined' ? html : "";
let epiData = typeof epi !== 'undefined' ? epi : null;
let ipsData = typeof ips !== 'undefined' ? ips : null;

const lens = new SimpleConditionLens({
    pv: pvData,
    html: htmlData,
    epi: epiData,
    ips: ipsData
});

// Return the lens interface
const lensInterface = lens.export();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = lensInterface;
}
