/**
 * Gravitate Health Lens Toolkit
 * Main export file
 */

// Core helpers
const FHIRHelper = require('./fhir/resource-extractor');
const EPIHelper = require('./epi/extension-parser');
const HTMLHelper = require('./html/annotator');
const LanguageHelper = require('./i18n/language-detector');
const ValidationHelper = require('./validation/validators');
const Utils = require('./utils/common');

// Base lens class and builder
const { BaseLens, LensBuilder } = require('./base-lens');

// Export all modules
module.exports = {
    // Helpers
    FHIRHelper,
    EPIHelper,
    HTMLHelper,
    LanguageHelper,
    ValidationHelper,
    Utils,

    // Base classes
    BaseLens,
    LensBuilder,

    // Version
    version: '1.0.0'
};

// Also export for ES6 modules if supported
if (typeof exports !== 'undefined') {
    exports.FHIRHelper = FHIRHelper;
    exports.EPIHelper = EPIHelper;
    exports.HTMLHelper = HTMLHelper;
    exports.LanguageHelper = LanguageHelper;
    exports.ValidationHelper = ValidationHelper;
    exports.Utils = Utils;
    exports.BaseLens = BaseLens;
    exports.LensBuilder = LensBuilder;
}
