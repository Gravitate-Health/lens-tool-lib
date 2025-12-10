/**
 * Validators
 * Utility functions for validation and error handling
 */

const ValidationHelper = {
    /**
     * Require IPS to be present and valid
     * @param {Object} ips - IPS FHIR Bundle
     * @throws {Error} If IPS is invalid
     */
    requireIPS(ips) {
        if (!ips || ips === "" || ips === null) {
            throw new Error("Failed to load IPS: the LEE is getting an empty IPS");
        }

        if (!ips.entry || !Array.isArray(ips.entry)) {
            throw new Error("IPS has no entries array");
        }

        if (ips.entry.length === 0) {
            throw new Error("IPS entries array is empty");
        }
    },

    /**
     * Require ePI to be present and valid
     * @param {Object} epi - ePI FHIR Bundle
     * @throws {Error} If ePI is invalid
     */
    requireEPI(epi) {
        if (!epi || epi === "" || epi === null) {
            throw new Error("Failed to load ePI: the LEE is getting an empty ePI");
        }

        if (!epi.entry || !Array.isArray(epi.entry)) {
            throw new Error("ePI has no entries array");
        }

        if (epi.entry.length === 0) {
            throw new Error("ePI entries array is empty");
        }
    },

    /**
     * Check if ePI has Composition resource
     * @param {Object} epiBundle - ePI FHIR Bundle
     * @returns {boolean} True if Composition exists
     */
    hasComposition(epiBundle) {
        if (!epiBundle?.entry) return false;

        return epiBundle.entry.some(
            entry => entry.resource?.resourceType === "Composition"
        );
    },

    /**
     * Require Composition in ePI
     * @param {Object} epiBundle - ePI FHIR Bundle
     * @throws {Error} If no Composition found
     */
    requireComposition(epiBundle) {
        if (!this.hasComposition(epiBundle)) {
            throw new Error('Bad ePI: no category "Composition" found');
        }
    },

    /**
     * Check if IPS has Patient resource
     * @param {Object} ipsBundle - IPS FHIR Bundle
     * @returns {boolean} True if Patient exists
     */
    hasPatient(ipsBundle) {
        if (!ipsBundle?.entry) return false;

        return ipsBundle.entry.some(
            entry => entry.resource?.resourceType === "Patient"
        );
    },

    /**
     * Require Patient in IPS
     * @param {Object} ipsBundle - IPS FHIR Bundle
     * @throws {Error} If no Patient found
     */
    requirePatient(ipsBundle) {
        if (!this.hasPatient(ipsBundle)) {
            throw new Error('Bad IPS: no "Patient" resource found');
        }
    },

    /**
     * Ensure value is an array
     * @param {*} value - Value to check
     * @returns {Array} Array (empty if value was not an array)
     */
    ensureArray(value) {
        if (Array.isArray(value)) {
            return value;
        }
        return [];
    },

    /**
     * Check if array is empty or undefined
     * @param {*} array - Array to check
     * @returns {boolean} True if empty or not an array
     */
    isEmpty(array) {
        return !array || !Array.isArray(array) || array.length === 0;
    },

    /**
     * Validate FHIR Bundle structure
     * @param {Object} bundle - FHIR Bundle
     * @param {string} bundleType - Type name for error messages (e.g., "IPS", "ePI")
     * @returns {Object} {valid: boolean, errors: Array}
     */
    validateBundle(bundle, bundleType = "Bundle") {
        const errors = [];

        if (!bundle) {
            errors.push(`${bundleType} is null or undefined`);
            return { valid: false, errors };
        }

        if (!bundle.resourceType || bundle.resourceType !== "Bundle") {
            errors.push(`${bundleType} resourceType is not "Bundle"`);
        }

        if (!bundle.entry || !Array.isArray(bundle.entry)) {
            errors.push(`${bundleType} has no entries array`);
        } else if (bundle.entry.length === 0) {
            errors.push(`${bundleType} entries array is empty`);
        }

        return {
            valid: errors.length === 0,
            errors
        };
    },

    /**
     * Validate HTML string
     * @param {string} html - HTML string
     * @throws {Error} If HTML is invalid
     */
    requireHTML(html) {
        if (!html || html === "" || html === null) {
            throw new Error("HTML data is empty or null");
        }
    },

    /**
     * Validate that required fields exist in object
     * @param {Object} obj - Object to validate
     * @param {Array} requiredFields - Array of required field names
     * @param {string} objectName - Name for error messages
     * @returns {Object} {valid: boolean, errors: Array}
     */
    validateRequiredFields(obj, requiredFields, objectName = "Object") {
        const errors = [];

        if (!obj) {
            errors.push(`${objectName} is null or undefined`);
            return { valid: false, errors };
        }

        requiredFields.forEach(field => {
            if (obj[field] === undefined || obj[field] === null) {
                errors.push(`${objectName} is missing required field: ${field}`);
            }
        });

        return {
            valid: errors.length === 0,
            errors
        };
    },

    /**
     * Validate lens context (pv, html, epi, ips)
     * @param {Object} context - Lens context object
     * @returns {Object} {valid: boolean, errors: Array}
     */
    validateLensContext(context) {
        const errors = [];

        if (!context) {
            errors.push("Lens context is null or undefined");
            return { valid: false, errors };
        }

        // Validate IPS
        if (!context.ips) {
            errors.push("IPS is missing from context");
        } else {
            const ipsValidation = this.validateBundle(context.ips, "IPS");
            if (!ipsValidation.valid) {
                errors.push(...ipsValidation.errors);
            }
        }

        // Validate ePI
        if (!context.epi) {
            errors.push("ePI is missing from context");
        } else {
            const epiValidation = this.validateBundle(context.epi, "ePI");
            if (!epiValidation.valid) {
                errors.push(...epiValidation.errors);
            }
        }

        // Validate HTML
        if (!context.html || context.html === "") {
            errors.push("HTML is missing or empty in context");
        }

        return {
            valid: errors.length === 0,
            errors
        };
    },

    /**
     * Safe get with default value
     * @param {Object} obj - Object to get value from
     * @param {string} path - Dot-notation path (e.g., "resource.code.coding")
     * @param {*} defaultValue - Default value if path doesn't exist
     * @returns {*} Value at path or default value
     */
    safeGet(obj, path, defaultValue = null) {
        if (!obj || !path) return defaultValue;

        const keys = path.split('.');
        let result = obj;

        for (const key of keys) {
            if (result && typeof result === 'object' && key in result) {
                result = result[key];
            } else {
                return defaultValue;
            }
        }

        return result !== undefined ? result : defaultValue;
    },

    /**
     * Validate code object structure
     * @param {Object} code - Code object to validate
     * @returns {boolean} True if valid code object
     */
    isValidCode(code) {
        return code && 
               typeof code === 'object' && 
               'code' in code &&
               code.code !== undefined &&
               code.code !== null;
    },

    /**
     * Validate array of codes
     * @param {Array} codes - Array of code objects
     * @returns {boolean} True if all codes are valid
     */
    areValidCodes(codes) {
        if (!Array.isArray(codes)) return false;
        if (codes.length === 0) return false;
        return codes.every(code => this.isValidCode(code));
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ValidationHelper;
}
