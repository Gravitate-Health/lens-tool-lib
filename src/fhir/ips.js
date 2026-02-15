/**
 * FHIR IPS (International Patient Summary) Utilities
 * Helper functions for extracting information from IPS bundles
 */

const { getResourcesByType, resolveReference, extractCodes } = require('./common');
const { calculateAge } = require('../utils/common');

/**
 * Get patient demographic information
 * @param {Object} ipsBundle - IPS FHIR Bundle
 * @returns {Object|null} Patient resource with helpful properties
 */
function getPatientInfo(ipsBundle) {
    const patients = getResourcesByType(ipsBundle, "Patient");
    if (patients.length === 0) return null;
    
    const patient = patients[0];
    return {
        ...patient,
        age: patient.birthDate ? calculateAge(patient.birthDate) : null
    };
}

/**
 * Get all medications from IPS (handles both CodeableConcept and Reference)
 * @param {Object} ipsBundle - IPS FHIR Bundle
 * @returns {Array} Array of medication information with codes
 */
function getMedications(ipsBundle) {
    if (!ipsBundle?.entry) return [];

    const medications = [];
    const medicationTypes = [
        "MedicationStatement",
        "MedicationDispense",
        "MedicationAdministration",
        "MedicationRequest"
    ];

    ipsBundle.entry.forEach((entry) => {
        const resource = entry.resource;
        if (!medicationTypes.includes(resource?.resourceType)) return;

        const medicationData = {
            resourceType: resource.resourceType,
            id: resource.id,
            codes: []
        };

        // Case 1: medicationCodeableConcept
        if (resource.medicationCodeableConcept?.coding) {
            resource.medicationCodeableConcept.coding.forEach((coding) => {
                medicationData.codes.push({
                    code: coding.code,
                    system: coding.system || "",
                    display: coding.display || ""
                });
            });
        }

        // Case 2: medicationReference → resolve → extract code + ingredients
        if (resource.medicationReference?.reference) {
            const med = resolveReference(
                resource.medicationReference.reference, 
                ipsBundle.entry
            );

            if (med) {
                // Medication.code
                med.code?.coding?.forEach((coding) => {
                    medicationData.codes.push({
                        code: coding.code,
                        system: coding.system || "",
                        display: coding.display || "",
                        source: 'medication-code'
                    });
                });

                // Medication.ingredient
                med.ingredient?.forEach((ingredient) => {
                    ingredient.itemCodeableConcept?.coding?.forEach((coding) => {
                        medicationData.codes.push({
                            code: coding.code,
                            system: coding.system || "",
                            display: coding.display || "",
                            source: 'ingredient'
                        });
                    });
                });
            }
        }

        if (medicationData.codes.length > 0) {
            medications.push(medicationData);
        }
    });

    return medications;
}

/**
 * Get observations by LOINC or SNOMED codes
 * @param {Object} ipsBundle - IPS FHIR Bundle
 * @param {Array} codes - Array of code strings to search for
 * @param {Object} options - {includeDisplay: boolean, valueFilter: function}
 * @returns {Array} Array of matching observations
 */
function getObservationsByCode(ipsBundle, codes, options = {}) {
    const observations = getResourcesByType(ipsBundle, "Observation");
    const results = [];

    observations.forEach(obs => {
        if (!obs.code?.coding) return;

        const hasMatchingCode = obs.code.coding.some(coding => 
            codes.includes(coding.code) || 
            (options.includeDisplay && coding.display?.toLowerCase().includes(options.includeDisplay))
        );

        if (hasMatchingCode) {
            const result = {
                id: obs.id,
                codes: extractCodes(obs.code),
                value: obs.valueQuantity?.value,
                unit: obs.valueQuantity?.unit,
                valueCodeableConcept: obs.valueCodeableConcept,
                valueDateTime: obs.valueDateTime,
                effectiveDateTime: obs.effectiveDateTime
            };

            // Apply value filter if provided
            if (!options.valueFilter || options.valueFilter(result)) {
                results.push(result);
            }
        }
    });

    return results;
}

/**
 * Get all conditions from IPS
 * @param {Object} ipsBundle - IPS FHIR Bundle
 * @returns {Array} Array of condition information
 */
function getConditions(ipsBundle) {
    const conditions = getResourcesByType(ipsBundle, "Condition");
    return conditions.map(condition => ({
        id: condition.id,
        codes: condition.code?.coding?.map(coding => ({
            code: coding.code,
            system: coding.system || "",
            display: coding.display || ""
        })) || [],
        text: condition.code?.text || "",
        clinicalStatus: condition.clinicalStatus?.coding?.[0]?.code,
        verificationStatus: condition.verificationStatus?.coding?.[0]?.code
    }));
}

/**
 * Get all allergies/intolerances from IPS
 * @param {Object} ipsBundle - IPS FHIR Bundle
 * @returns {Array} Array of allergy information
 */
function getAllergies(ipsBundle) {
    const allergies = getResourcesByType(ipsBundle, "AllergyIntolerance");
    return allergies.map(allergy => ({
        id: allergy.id,
        codes: allergy.code?.coding?.map(coding => ({
            code: coding.code,
            system: coding.system || "",
            display: coding.display || ""
        })) || [],
        text: allergy.code?.text || "",
        criticality: allergy.criticality,
        type: allergy.type
    }));
}

/**
 * Get patient contacts (general practitioner, etc.)
 * @param {Object} ipsBundle - IPS FHIR Bundle
 * @returns {Array} Array of contact information
 */
function getPatientContacts(ipsBundle) {
    const patients = getResourcesByType(ipsBundle, "Patient");
    if (patients.length === 0) return [];

    const contacts = [];
    const patient = patients[0];

    if (Array.isArray(patient.generalPractitioner)) {
        patient.generalPractitioner.forEach(gpRef => {
            const gpId = gpRef.reference?.split("/")[1];
            if (!gpId) return;

            const gpResource = resolveReference(gpRef.reference, ipsBundle.entry);
            if (!gpResource) return;

            if (
                gpResource.resourceType === "Practitioner" ||
                gpResource.resourceType === "Organization"
            ) {
                const telecoms = gpResource.telecom;
                if (Array.isArray(telecoms)) {
                    telecoms
                        .filter(t => ["phone", "email"].includes(t.system))
                        .forEach(telecom => {
                            contacts.push({
                                type: telecom.system,
                                value: telecom.value,
                                resourceType: gpResource.resourceType,
                                id: gpResource.id
                            });
                        });
                }
            }
        });
    }

    return contacts;
}

/**
 * Get patient extensions
 * @param {Object} ipsBundle - IPS FHIR Bundle
 * @param {string} extensionUrl - Extension URL to search for
 * @returns {Array} Array of matching extensions
 */
function getPatientExtensions(ipsBundle, extensionUrl) {
    const patients = getResourcesByType(ipsBundle, "Patient");
    if (patients.length === 0) return [];

    const patient = patients[0];
    if (!Array.isArray(patient.extension)) return [];

    return patient.extension.filter(ext => ext.url === extensionUrl);
}

/**
 * Check if patient has specific occupation
 * @param {Object} ipsBundle - IPS FHIR Bundle
 * @param {string} occupationCode - Occupation code to check
 * @returns {boolean} True if patient has this occupation
 */
function hasOccupation(ipsBundle, occupationCode) {
    const extensions = getPatientExtensions(
        ipsBundle,
        "http://hl7.org/fhir/StructureDefinition/individual-occupation"
    );

    return extensions.some(ext => 
        ext.valueCodeableConcept?.coding?.some(coding => 
            coding.code === occupationCode
        )
    );
}

module.exports = {
    getPatientInfo,
    getMedications,
    getObservationsByCode,
    getConditions,
    getAllergies,
    getPatientContacts,
    getPatientExtensions,
    hasOccupation
};
