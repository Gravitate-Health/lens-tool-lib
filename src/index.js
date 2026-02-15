/**
 * Gravitate Health Lens Toolkit
 * Main export file - Direct function exports
 * 
 * Import only what you need:
 * const { getConditions, getMedications, addClasses } = require('@gravitate-health/lens-tool-lib');
 */

// Import all functions from modules
const fhirCommon = require('./fhir/common');
const fhirIPS = require('./fhir/ips');
const fhirEPI = require('./fhir/epi');
const htmlFunctions = require('./html/dom');
const i18nFunctions = require('./i18n/language');
const utilityFunctions = require('./utils/common');

// Export everything as plain functions
module.exports = {
    ...fhirCommon,
    ...fhirIPS,
    ...fhirEPI,
    ...htmlFunctions,
    ...i18nFunctions,
    ...utilityFunctions,
    version: '1.0.0'
};
