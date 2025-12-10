/**
 * Base Lens Class
 * Template class for creating new lenses
 */

const FHIRHelper = require('./fhir/resource-extractor');
const EPIHelper = require('./epi/extension-parser');
const HTMLHelper = require('./html/annotator');
const LanguageHelper = require('./i18n/language-detector');
const ValidationHelper = require('./validation/validators');
const Utils = require('./utils/common');

class BaseLens {
    /**
     * Create a new lens instance
     * @param {Object} context - Lens context
     * @param {Object} context.pv - Persona Vector
     * @param {string} context.html - HTML data
     * @param {Object} context.epi - ePI FHIR Bundle
     * @param {Object} context.ips - IPS FHIR Bundle
     */
    constructor(context = {}) {
        this.pv = context.pv || null;
        this.html = context.html || "";
        this.epi = context.epi || null;
        this.ips = context.ips || null;
        
        // Helpers available to all lenses
        this.fhir = FHIRHelper;
        this.epiHelper = EPIHelper;
        this.htmlHelper = HTMLHelper;
        this.lang = LanguageHelper;
        this.validator = ValidationHelper;
        this.utils = Utils;

        // Detected language
        this.detectedLanguage = null;
    }

    /**
     * Get lens specification version
     * Override in subclass
     * @returns {string} Specification version
     */
    getSpecification() {
        return "1.0.0";
    }

    /**
     * Main enhance function
     * Override in subclass to implement lens logic
     * @returns {Promise<string>} Enhanced HTML
     */
    async enhance() {
        throw new Error("enhance() method must be implemented by subclass");
    }

    /**
     * Optional: Provide explanation of what the lens did
     * @param {string} lang - Language code
     * @returns {Promise<string>} Explanation text
     */
    async explanation(lang = "en") {
        return "No explanation provided";
    }

    /**
     * Optional: Provide report for the user
     * @param {string} lang - Language code
     * @returns {Promise<string>} Report text
     */
    async report(lang = "en") {
        return "No report provided";
    }

    /**
     * Validate lens context (IPS, ePI, HTML)
     * @throws {Error} If context is invalid
     */
    validate() {
        this.validator.requireIPS(this.ips);
        this.validator.requireEPI(this.epi);
        this.validator.requireHTML(this.html);
        this.validator.requireComposition(this.epi);
    }

    /**
     * Detect language from ePI
     * @returns {string|null} Detected language code
     */
    detectLanguage() {
        if (!this.detectedLanguage) {
            this.detectedLanguage = this.lang.detectLanguage(this.epi);
        }
        return this.detectedLanguage;
    }

    /**
     * Get language-specific messages
     * @param {string} messageType - Type of messages (e.g., "standard", "pregnancy", "condition")
     * @returns {Object} Messages object
     */
    getMessages(messageType = "standard") {
        const lang = this.detectLanguage() || "en";
        
        switch (messageType) {
            case "pregnancy":
                return this.lang.getPregnancyMessages(lang);
            case "condition":
                return this.lang.getConditionMessages(lang);
            case "questionnaire":
                return this.lang.getQuestionnaireMessages(lang);
            default:
                return this.lang.getStandardMessages(lang);
        }
    }

    /**
     * Export lens for use in lens execution environment
     * @returns {Object} Lens interface object
     */
    export() {
        return {
            enhance: this.enhance.bind(this),
            getSpecification: this.getSpecification.bind(this),
            explanation: this.explanation.bind(this),
            report: this.report.bind(this)
        };
    }
}

/**
 * Lens Builder - Functional approach to creating lenses
 */
class LensBuilder {
    /**
     * Create a lens from configuration
     * @param {Object} config - Lens configuration
     * @param {string} config.name - Lens name
     * @param {string} config.version - Lens version
     * @param {Function} config.validate - Optional validation function
     * @param {Function} config.extract - Data extraction function
     * @param {Function} config.annotate - HTML annotation function
     * @param {Function} config.explanation - Optional explanation function
     * @param {Function} config.report - Optional report function
     * @returns {Object} Lens interface object
     */
    static create(config) {
        const {
            name,
            version = "1.0.0",
            validate,
            extract,
            annotate,
            explanation,
            report
        } = config;

        // Create a context holder
        let context = {
            pv: null,
            html: null,
            epi: null,
            ips: null,
            fhir: FHIRHelper,
            epiHelper: EPIHelper,
            htmlHelper: HTMLHelper,
            lang: LanguageHelper,
            validator: ValidationHelper,
            utils: Utils
        };

        // Main enhance function
        const enhance = async function() {
            // Set context from global variables
            context.pv = typeof pv !== 'undefined' ? pv : null;
            context.html = typeof html !== 'undefined' ? html : "";
            context.epi = typeof epi !== 'undefined' ? epi : null;
            context.ips = typeof ips !== 'undefined' ? ips : null;

            // Run validation if provided
            if (validate) {
                await validate(context);
            } else {
                // Default validation
                context.validator.requireIPS(context.ips);
                context.validator.requireEPI(context.epi);
                context.validator.requireHTML(context.html);
            }

            // Extract data
            const extractedData = extract ? await extract(context) : {};

            // Annotate HTML
            const result = annotate ? await annotate(context, extractedData) : context.html;

            return result;
        };

        const getSpecification = () => version;

        const explanationFunc = explanation ? 
            async (lang = "en") => explanation(context, lang) :
            async () => "No explanation provided";

        const reportFunc = report ?
            async (lang = "en") => report(context, lang) :
            async () => "No report provided";

        return {
            enhance,
            getSpecification,
            explanation: explanationFunc,
            report: reportFunc
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BaseLens, LensBuilder };
}
