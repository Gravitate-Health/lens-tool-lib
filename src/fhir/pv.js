/**
 * FHIR Persona Vector (PV) Utilities
 * Helper functions for working with Persona Vector collections
 * Persona Vectors contain dimension observations used for ePI focusing
 */

const { getResourcesByType, extractCodes } = require('./common');

/**
 * Persona dimension code system
 */
const PD_CODE_SYSTEM = "http://hl7.eu/fhir/ig/gravitate-health/CodeSystem/pd-type-cs";

/**
 * Common dimension codes
 */
const DIMENSION_CODES = {
    EMPLOYMENT: "EMP",
    SHARE_WILLINGLY: "SHW",
    WORK_LIFE: "WKL",
    EXTROVERT_INTROVERT: "EVI",
    EMOTIONAL_RATIONAL: "ER",
    HEALTH_LITERACY: "HL",
    DIGITAL_LITERACY: "DL",
    TOOL_SUPPORT_INTEREST: "TSI"
};

/**
 * Validate if bundle is a Persona Vector collection
 * @param {Object} pvBundle - Persona Vector FHIR Bundle
 * @returns {Object} {valid: boolean, errors: Array}
 */
function validatePersonaVector(pvBundle) {
    const errors = [];

    if (!pvBundle) {
        errors.push("Persona Vector bundle is null or undefined");
        return { valid: false, errors };
    }

    if (pvBundle.resourceType !== "Bundle") {
        errors.push("Resource is not a Bundle");
        return { valid: false, errors };
    }

    if (pvBundle.type !== "collection") {
        errors.push("Bundle type must be 'collection'");
    }

    if (!pvBundle.entry || !Array.isArray(pvBundle.entry)) {
        errors.push("Bundle has no entries array");
        return { valid: false, errors };
    }

    const observations = getResourcesByType(pvBundle, "Observation");
    if (observations.length === 0) {
        errors.push("No Observation resources found in bundle");
    }

    return { valid: errors.length === 0, errors };
}

/**
 * Get all dimension observations from PV bundle
 * @param {Object} pvBundle - Persona Vector FHIR Bundle
 * @returns {Array} Array of observations with extracted information
 */
function getAllDimensions(pvBundle) {
    const observations = getResourcesByType(pvBundle, "Observation");
    
    return observations.map(obs => {
        const dimension = {
            id: obs.id,
            status: obs.status,
            dimensionCode: null,
            dimensionDisplay: null,
            subject: obs.subject?.display || obs.subject?.reference || null,
            effectiveDateTime: obs.effectiveDateTime || null,
            value: null,
            valueType: null,
            codes: []
        };

        // Extract dimension code
        if (obs.code?.coding) {
            const dimensionCoding = obs.code.coding.find(
                c => c.system === PD_CODE_SYSTEM
            );
            if (dimensionCoding) {
                dimension.dimensionCode = dimensionCoding.code;
                dimension.dimensionDisplay = dimensionCoding.display || null;
            }
            dimension.codes = extractCodes(obs.code);
        }

        // Extract value based on type
        if (obs.valueCodeableConcept) {
            dimension.valueType = "CodeableConcept";
            dimension.value = obs.valueCodeableConcept;
            dimension.valueCodes = extractCodes(obs.valueCodeableConcept);
        } else if (obs.valueString !== undefined) {
            dimension.valueType = "String";
            dimension.value = obs.valueString;
        } else if (obs.valueInteger !== undefined) {
            dimension.valueType = "Integer";
            dimension.value = obs.valueInteger;
        } else if (obs.valueBoolean !== undefined) {
            dimension.valueType = "Boolean";
            dimension.value = obs.valueBoolean;
        } else if (obs.valueQuantity) {
            dimension.valueType = "Quantity";
            dimension.value = obs.valueQuantity.value;
            dimension.unit = obs.valueQuantity.unit;
        }

        return dimension;
    });
}

/**
 * Get a specific dimension by code
 * @param {Object} pvBundle - Persona Vector FHIR Bundle
 * @param {string} dimensionCode - Dimension code (e.g., "EMP", "HL", "DL")
 * @returns {Object|null} Dimension observation or null if not found
 */
function getDimensionByCode(pvBundle, dimensionCode) {
    const dimensions = getAllDimensions(pvBundle);
    return dimensions.find(d => d.dimensionCode === dimensionCode) || null;
}

/**
 * Get dimensions matching specific codes
 * @param {Object} pvBundle - Persona Vector FHIR Bundle
 * @param {Array} dimensionCodes - Array of dimension codes to filter
 * @returns {Array} Array of matching dimensions
 */
function getDimensionsByCodes(pvBundle, dimensionCodes) {
    if (!Array.isArray(dimensionCodes)) return [];
    
    const dimensions = getAllDimensions(pvBundle);
    return dimensions.filter(d => dimensionCodes.includes(d.dimensionCode));
}

/**
 * Get health literacy dimension
 * @param {Object} pvBundle - Persona Vector FHIR Bundle
 * @returns {Object|null} Health literacy dimension or null
 */
function getHealthLiteracy(pvBundle) {
    return getDimensionByCode(pvBundle, DIMENSION_CODES.HEALTH_LITERACY);
}

/**
 * Get digital literacy dimension
 * @param {Object} pvBundle - Persona Vector FHIR Bundle
 * @returns {Object|null} Digital literacy dimension or null
 */
function getDigitalLiteracy(pvBundle) {
    return getDimensionByCode(pvBundle, DIMENSION_CODES.DIGITAL_LITERACY);
}

/**
 * Get employment dimension
 * @param {Object} pvBundle - Persona Vector FHIR Bundle
 * @returns {Object|null} Employment dimension or null
 */
function getEmployment(pvBundle) {
    return getDimensionByCode(pvBundle, DIMENSION_CODES.EMPLOYMENT);
}

/**
 * Filter dimensions by value type
 * @param {Object} pvBundle - Persona Vector FHIR Bundle
 * @param {string} valueType - Value type to filter (e.g., "String", "Integer", "CodeableConcept")
 * @returns {Array} Array of matching dimensions
 */
function getDimensionsByValueType(pvBundle, valueType) {
    const dimensions = getAllDimensions(pvBundle);
    return dimensions.filter(d => d.valueType === valueType);
}

/**
 * Find dimensions with specific value matching a predicate
 * @param {Object} pvBundle - Persona Vector FHIR Bundle
 * @param {Function} predicate - Function to test each dimension value
 * @returns {Array} Array of matching dimensions
 */
function findDimensionsByValue(pvBundle, predicate) {
    if (typeof predicate !== 'function') return [];
    
    const dimensions = getAllDimensions(pvBundle);
    return dimensions.filter(d => predicate(d.value, d));
}

/**
 * Get subject/patient identifier from PV bundle
 * @param {Object} pvBundle - Persona Vector FHIR Bundle
 * @returns {string|null} Subject display or reference
 */
function getSubject(pvBundle) {
    const dimensions = getAllDimensions(pvBundle);
    if (dimensions.length === 0) return null;
    return dimensions[0].subject;
}

/**
 * Group dimensions by subject
 * @param {Object} pvBundle - Persona Vector FHIR Bundle
 * @returns {Object} Object with subjects as keys and arrays of dimensions as values
 */
function groupDimensionsBySubject(pvBundle) {
    const dimensions = getAllDimensions(pvBundle);
    const grouped = {};
    
    dimensions.forEach(dimension => {
        const subject = dimension.subject || 'unknown';
        if (!grouped[subject]) {
            grouped[subject] = [];
        }
        grouped[subject].push(dimension);
    });
    
    return grouped;
}

/**
 * Get summary of all dimensions in the bundle
 * @param {Object} pvBundle - Persona Vector FHIR Bundle
 * @returns {Object} Summary with counts and available dimensions
 */
function getDimensionsSummary(pvBundle) {
    const dimensions = getAllDimensions(pvBundle);
    const valueTypes = {};
    const dimensionCodes = [];
    
    dimensions.forEach(dim => {
        if (dim.dimensionCode && !dimensionCodes.includes(dim.dimensionCode)) {
            dimensionCodes.push(dim.dimensionCode);
        }
        valueTypes[dim.valueType] = (valueTypes[dim.valueType] || 0) + 1;
    });
    
    return {
        totalDimensions: dimensions.length,
        dimensionCodes: dimensionCodes,
        valueTypes: valueTypes,
        subject: getSubject(pvBundle),
        bundleId: pvBundle.id || null,
        identifier: pvBundle.identifier?.value || null
    };
}

/**
 * Check if bundle has specific dimension
 * @param {Object} pvBundle - Persona Vector FHIR Bundle
 * @param {string} dimensionCode - Dimension code to check
 * @returns {boolean} True if dimension exists
 */
function hasDimension(pvBundle, dimensionCode) {
    return getDimensionByCode(pvBundle, dimensionCode) !== null;
}

/**
 * Get all unique dimension codes in the bundle
 * @param {Object} pvBundle - Persona Vector FHIR Bundle
 * @returns {Array} Array of unique dimension codes
 */
function getAvailableDimensionCodes(pvBundle) {
    const dimensions = getAllDimensions(pvBundle);
    const codes = new Set();
    
    dimensions.forEach(dim => {
        if (dim.dimensionCode) {
            codes.add(dim.dimensionCode);
        }
    });
    
    return Array.from(codes);
}

/**
 * Match dimension values against a search object
 * @param {Object} pvBundle - Persona Vector FHIR Bundle
 * @param {Object} searchCriteria - Object with dimensionCode and value/valuePredicate
 * @returns {Array} Array of matching dimensions
 */
function matchDimensions(pvBundle, searchCriteria) {
    const dimensions = getAllDimensions(pvBundle);
    
    return dimensions.filter(dim => {
        // Check dimension code
        if (searchCriteria.dimensionCode && 
            dim.dimensionCode !== searchCriteria.dimensionCode) {
            return false;
        }
        
        // Check value equality
        if (searchCriteria.value !== undefined && 
            dim.value !== searchCriteria.value) {
            return false;
        }
        
        // Check value with predicate
        if (searchCriteria.valuePredicate && 
            typeof searchCriteria.valuePredicate === 'function' &&
            !searchCriteria.valuePredicate(dim.value, dim)) {
            return false;
        }
        
        // Check value type
        if (searchCriteria.valueType && 
            dim.valueType !== searchCriteria.valueType) {
            return false;
        }
        
        return true;
    });
}

module.exports = {
    // Constants
    DIMENSION_CODES,
    PD_CODE_SYSTEM,
    
    // Validation
    validatePersonaVector,
    
    // Core functions
    getAllDimensions,
    getDimensionByCode,
    getDimensionsByCodes,
    
    // Specific dimensions
    getHealthLiteracy,
    getDigitalLiteracy,
    getEmployment,
    
    // Filtering and searching
    getDimensionsByValueType,
    findDimensionsByValue,
    matchDimensions,
    
    // Utility functions
    getSubject,
    groupDimensionsBySubject,
    getDimensionsSummary,
    hasDimension,
    getAvailableDimensionCodes
};
