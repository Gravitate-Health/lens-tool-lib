/**
 * FHIR ePI (Electronic Product Information) Utilities
 * Helper functions for working with ePI bundles
 */

const { getResourcesByType } = require('./common');
const { deepEqual } = require('../utils/common');

/**
 * Get all annotated sections from ePI Composition extensions
 * @param {Object} epiBundle - ePI FHIR Bundle
 * @returns {Array} Array of {category, codes} objects
 */
function getAnnotatedSections(epiBundle) {
    if (!epiBundle?.entry) return [];

    const sections = [];
    epiBundle.entry.forEach(entry => {
        if (entry.resource?.resourceType !== "Composition") return;
        if (!Array.isArray(entry.resource.extension)) return;

        entry.resource.extension.forEach(element => {
            if (element.extension?.[1]?.url !== "concept") return;

            const category = element.extension[0]?.valueString;
            const concept = element.extension[1]?.valueCodeableReference?.concept;

            if (category && concept?.coding) {
                sections.push({
                    category: category,
                    codes: concept.coding.map(coding => ({
                        code: coding.code,
                        system: coding.system || "",
                        display: coding.display || ""
                    }))
                });
            }
        });
    });

    return sections;
}

/**
 * Find sections in ePI matching specific codes
 * @param {Object} epiBundle - ePI FHIR Bundle
 * @param {Array} codesToSearch - Array of codes or {code, system} objects to search for
 * @param {boolean} matchSystem - Whether to match system as well
 * @returns {Array} Array of matching category strings
 */
function findSectionsByCode(epiBundle, codesToSearch, matchSystem = true) {
    if (!epiBundle?.entry || !Array.isArray(codesToSearch)) return [];

    const categories = [];
    const sections = getAnnotatedSections(epiBundle);

    sections.forEach(section => {
        const hasMatch = section.codes.some(coding => {
            return codesToSearch.some(searchCode => {
                // Handle both string codes and {code, system} objects
                if (typeof searchCode === 'string') {
                    return coding.code === searchCode;
                }
                if (matchSystem) {
                    return coding.code === searchCode.code && 
                           coding.system === searchCode.system;
                }
                return coding.code === searchCode.code;
            });
        });

        if (hasMatch && !categories.includes(section.category)) {
            categories.push(section.category);
        }
    });

    return categories;
}

/**
 * Get MedicinalProductDefinition ID from ePI
 * @param {Object} epiBundle - ePI FHIR Bundle
 * @returns {string|null} MedicinalProductDefinition ID or null
 */
function getMedicinalProductId(epiBundle) {
    if (!epiBundle?.entry) return null;

    for (let i = 0; i < epiBundle.entry.length; i++) {
        if (epiBundle.entry[i].resource?.resourceType === "MedicinalProductDefinition") {
            return epiBundle.entry[i].resource.id;
        }
    }
    return null;
}

/**
 * Check if ePI bundle identifier matches any in a list
 * @param {Object} epiBundle - ePI FHIR Bundle
 * @param {Array} identifierList - Array of identifier values to match
 * @returns {boolean} True if match found
 */
function matchBundleIdentifier(epiBundle, identifierList) {
    if (!epiBundle?.identifier || !Array.isArray(identifierList)) {
        return false;
    }
    return identifierList.includes(epiBundle.identifier.value);
}

/**
 * Check if MedicinalProductDefinition identifier matches any in a list
 * @param {Object} epiBundle - ePI FHIR Bundle
 * @param {Array} identifierList - Array of identifier values to match
 * @returns {boolean} True if match found
 */
function matchProductIdentifier(epiBundle, identifierList) {
    if (!epiBundle?.entry || !Array.isArray(identifierList)) {
        return false;
    }

    for (const entry of epiBundle.entry) {
        const resource = entry.resource;
        if (resource?.resourceType === "MedicinalProductDefinition") {
            const ids = resource.identifier || [];
            for (const id of ids) {
                if (identifierList.includes(id.value)) {
                    return true;
                }
            }
        }
    }
    return false;
}

/**
 * Validate ePI structure
 * @param {Object} epiBundle - ePI FHIR Bundle
 * @returns {Object} {valid: boolean, errors: Array}
 */
function validateEPI(epiBundle) {
    const errors = [];

    if (!epiBundle) {
        errors.push("ePI bundle is null or undefined");
        return { valid: false, errors };
    }

    if (!epiBundle.entry || !Array.isArray(epiBundle.entry)) {
        errors.push("ePI bundle has no entries array");
        return { valid: false, errors };
    }

    if (epiBundle.entry.length === 0) {
        errors.push("ePI bundle entries array is empty");
        return { valid: false, errors };
    }

    const hasComposition = epiBundle.entry.some(
        entry => entry.resource?.resourceType === "Composition"
    );

    if (!hasComposition) {
        errors.push('No Composition resource found in ePI bundle');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Get Composition resource from ePI
 * @param {Object} epiBundle - ePI FHIR Bundle
 * @returns {Object|null} Composition resource or null
 */
function getComposition(epiBundle) {
    if (!epiBundle?.entry) return null;

    const entry = epiBundle.entry.find(
        e => e.resource?.resourceType === "Composition"
    );
    return entry?.resource || null;
}

/**
 * Get language from ePI
 * @param {Object} epiBundle - ePI FHIR Bundle
 * @returns {string|null} Language code or null
 */
function getLanguage(epiBundle) {
    // Try Composition.language first
    const composition = getComposition(epiBundle);
    if (composition?.language) {
        return composition.language;
    }

    // Fallback to Bundle.language
    if (epiBundle?.language) {
        return epiBundle.language;
    }

    return null;
}

/**
 * Add or update extension in ePI section
 * @param {Object} epiBundle - ePI FHIR Bundle
 * @param {number} sectionIndex - Section index (e.g., [0].section[0])
 * @param {Object} newExtension - Extension object to add
 * @param {boolean} checkDuplicates - Whether to check for duplicates before adding
 * @returns {boolean} True if extension was added
 */
function addExtensionToSection(epiBundle, sectionIndex, newExtension, checkDuplicates = true) {
    if (!epiBundle?.entry?.[0]?.resource?.section) return false;

    const section = epiBundle.entry[0].resource.section[sectionIndex];
    if (!section) return false;

    // Initialize extension array if needed
    if (!section.extension) {
        section.extension = [];
    }

    // Check for duplicates if requested
    if (checkDuplicates) {
        const exists = section.extension.some(ext => 
            deepEqual(ext, newExtension)
        );
        if (exists) return false;
    }

    section.extension.push(newExtension);
    return true;
}

/**
 * Create extension object for AdditionalInformation
 * @param {string} code - Type code
 * @param {string} display - Type display
 * @param {string} conceptValue - Concept value (URL or base64)
 * @param {string} conceptType - Type of concept ('url' or 'base64')
 * @returns {Object} Extension object
 */
function createAdditionalInfoExtension(code, display, conceptValue, conceptType = 'url') {
    const extension = {
        extension: [
            {
                url: "type",
                valueCodeableConcept: {
                    coding: [
                        {
                            system: "http://hl7.eu/fhir/ig/gravitate-health/CodeSystem/type-of-data-cs",
                            code: code,
                            display: display
                        }
                    ]
                }
            },
            {
                url: "concept"
            }
        ],
        url: "http://hl7.eu/fhir/ig/gravitate-health/StructureDefinition/AdditionalInformation"
    };

    // Add the appropriate concept value
    if (conceptType === 'url') {
        extension.extension[1].valueUrl = conceptValue;
    } else if (conceptType === 'base64') {
        extension.extension[1].valueBase64Binary = conceptValue;
    }

    return extension;
}

/**
 * Parse attachment to get code and display for content type
 * @param {Object} attachment - FHIR Attachment object
 * @returns {Object|null} {code, display} or null
 */
function parseAttachmentType(attachment) {
    if (!attachment) return null;

    if (attachment.contentType === "text/html") {
        if (attachment.duration) {
            if (attachment.url?.includes("youtube")) {
                return { code: "video-inapp", display: "VIDEO" };
            } else {
                return { code: "audio-inapp", display: "AUDIO" };
            }
        } else {
            return { code: "image-inapp", display: "IMG" };
        }
    }

    const typeMap = {
        "video/mp4": { code: "video", display: "VIDEO" },
        "application/pdf": { code: "pdf", display: "PDF" },
        "audio/mpeg": { code: "audio", display: "AUDIO" },
        "image/jpg": { code: "image", display: "IMG" },
        "image/jpeg": { code: "image", display: "IMG" }
    };

    return typeMap[attachment.contentType] || null;
}

module.exports = {
    getAnnotatedSections,
    findSectionsByCode,
    getMedicinalProductId,
    matchBundleIdentifier,
    matchProductIdentifier,
    validateEPI,
    getComposition,
    getLanguage,
    addExtensionToSection,
    createAdditionalInfoExtension,
    parseAttachmentType
};
