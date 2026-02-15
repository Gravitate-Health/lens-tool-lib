/**
 * FHIR Common Utilities
 * Common helper functions for working with FHIR resources
 */

/**
 * Get all resources of a specific type from a FHIR bundle
 * @param {Object} bundle - FHIR Bundle
 * @param {string} resourceType - Resource type to filter (e.g., "Condition", "Observation")
 * @returns {Array} Array of resources matching the type
 */
function getResourcesByType(bundle, resourceType) {
    if (!bundle || !bundle.entry || !Array.isArray(bundle.entry)) {
        return [];
    }
    return bundle.entry
        .filter(entry => entry.resource?.resourceType === resourceType)
        .map(entry => entry.resource);
}

/**
 * Resolve a FHIR reference to its actual resource
 * @param {string} reference - Reference string (e.g., "Medication/123")
 * @param {Array} entries - Array of bundle entries
 * @returns {Object|null} The resolved resource or null
 */
function resolveReference(reference, entries) {
    if (!reference || !entries) return null;
    
    const [type, id] = reference.split('/');
    const entry = entries.find(
        (el) => el.resource?.resourceType === type && el.resource?.id === id
    );
    return entry?.resource || null;
}

/**
 * Extract all codes from a CodeableConcept
 * @param {Object} codeableConcept - FHIR CodeableConcept
 * @returns {Array} Array of {code, system, display} objects
 */
function extractCodes(codeableConcept) {
    if (!codeableConcept?.coding || !Array.isArray(codeableConcept.coding)) {
        return [];
    }
    return codeableConcept.coding.map(coding => ({
        code: coding.code,
        system: coding.system || "",
        display: coding.display || ""
    }));
}

/**
 * Match if a code exists in an array of codes
 * @param {Array} arrayOfCodes - Array of {code, system} objects
 * @param {Object} searchCode - {code, system} object to search for
 * @param {boolean} includeSystem - Whether to match system as well
 * @returns {boolean} True if match found
 */
function matchCodes(arrayOfCodes, searchCode, includeSystem = true) {
    if (!Array.isArray(arrayOfCodes) || !searchCode) return false;
    
    return arrayOfCodes.some(element => {
        if (includeSystem) {
            return element.code === searchCode.code && element.system === searchCode.system;
        }
        return element.code === searchCode.code;
    });
}

/**
 * Validate code object structure
 * @param {Object} code - Code object to validate
 * @returns {boolean} True if valid code object with required properties
 */
function isValidCode(code) {
    return code && 
           typeof code === 'object' && 
           'code' in code &&
           code.code !== undefined &&
           code.code !== null;
}

/**
 * Validate array of codes
 * @param {Array} codes - Array of code objects
 * @returns {boolean} True if all codes are valid
 */
function areValidCodes(codes) {
    if (!Array.isArray(codes)) return false;
    if (codes.length === 0) return false;
    return codes.every(code => isValidCode(code));
}

module.exports = {
    getResourcesByType,
    resolveReference,
    extractCodes,
    matchCodes,
    isValidCode,
    areValidCodes
};
