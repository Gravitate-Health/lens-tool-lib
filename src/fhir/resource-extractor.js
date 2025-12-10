/**
 * FHIR Resource Extractor
 * Utility functions for extracting and parsing FHIR resources from IPS bundles
 */

const FHIRHelper = {
    /**
     * Get all resources of a specific type from a FHIR bundle
     * @param {Object} bundle - FHIR Bundle
     * @param {string} resourceType - Resource type to filter (e.g., "Condition", "Observation")
     * @returns {Array} Array of resources matching the type
     */
    getResourcesByType(bundle, resourceType) {
        if (!bundle || !bundle.entry || !Array.isArray(bundle.entry)) {
            return [];
        }
        return bundle.entry
            .filter(entry => entry.resource?.resourceType === resourceType)
            .map(entry => entry.resource);
    },

    /**
     * Resolve a FHIR reference to its actual resource
     * @param {string} reference - Reference string (e.g., "Medication/123")
     * @param {Array} entries - Array of bundle entries
     * @returns {Object|null} The resolved resource or null
     */
    resolveReference(reference, entries) {
        if (!reference || !entries) return null;
        
        const [type, id] = reference.split('/');
        const entry = entries.find(
            (el) => el.resource?.resourceType === type && el.resource?.id === id
        );
        return entry?.resource || null;
    },

    /**
     * Extract all codes from a CodeableConcept
     * @param {Object} codeableConcept - FHIR CodeableConcept
     * @returns {Array} Array of {code, system, display} objects
     */
    extractCodes(codeableConcept) {
        if (!codeableConcept?.coding || !Array.isArray(codeableConcept.coding)) {
            return [];
        }
        return codeableConcept.coding.map(coding => ({
            code: coding.code,
            system: coding.system || "",
            display: coding.display || ""
        }));
    },

    /**
     * Match if a code exists in an array of codes
     * @param {Array} arrayOfCodes - Array of {code, system} objects
     * @param {Object} searchCode - {code, system} object to search for
     * @param {boolean} includeSystem - Whether to match system as well
     * @returns {boolean} True if match found
     */
    matchCodes(arrayOfCodes, searchCode, includeSystem = true) {
        if (!Array.isArray(arrayOfCodes) || !searchCode) return false;
        
        return arrayOfCodes.some(element => {
            if (includeSystem) {
                return element.code === searchCode.code && element.system === searchCode.system;
            }
            return element.code === searchCode.code;
        });
    },

    /**
     * Get patient demographic information
     * @param {Object} ipsBundle - IPS FHIR Bundle
     * @returns {Object|null} Patient resource with helpful properties
     */
    getPatientInfo(ipsBundle) {
        const patients = this.getResourcesByType(ipsBundle, "Patient");
        if (patients.length === 0) return null;
        
        const patient = patients[0];
        return {
            ...patient,
            age: patient.birthDate ? this._calculateAge(patient.birthDate) : null
        };
    },

    /**
     * Get all medications from IPS (handles both CodeableConcept and Reference)
     * @param {Object} ipsBundle - IPS FHIR Bundle
     * @returns {Array} Array of medication information with codes
     */
    getMedications(ipsBundle) {
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
                const med = this.resolveReference(
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
    },

    /**
     * Get observations by LOINC or SNOMED codes
     * @param {Object} ipsBundle - IPS FHIR Bundle
     * @param {Array} codes - Array of code strings to search for
     * @param {Object} options - {includeDisplay: boolean, valueFilter: function}
     * @returns {Array} Array of matching observations
     */
    getObservationsByCode(ipsBundle, codes, options = {}) {
        const observations = this.getResourcesByType(ipsBundle, "Observation");
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
                    codes: this.extractCodes(obs.code),
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
    },

    /**
     * Get all conditions from IPS
     * @param {Object} ipsBundle - IPS FHIR Bundle
     * @returns {Array} Array of condition information
     */
    getConditions(ipsBundle) {
        const conditions = this.getResourcesByType(ipsBundle, "Condition");
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
    },

    /**
     * Get all allergies/intolerances from IPS
     * @param {Object} ipsBundle - IPS FHIR Bundle
     * @returns {Array} Array of allergy information
     */
    getAllergies(ipsBundle) {
        const allergies = this.getResourcesByType(ipsBundle, "AllergyIntolerance");
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
    },

    /**
     * Get patient contacts (general practitioner, etc.)
     * @param {Object} ipsBundle - IPS FHIR Bundle
     * @returns {Array} Array of contact information
     */
    getPatientContacts(ipsBundle) {
        const patients = this.getResourcesByType(ipsBundle, "Patient");
        if (patients.length === 0) return [];

        const contacts = [];
        const patient = patients[0];

        if (Array.isArray(patient.generalPractitioner)) {
            patient.generalPractitioner.forEach(gpRef => {
                const gpId = gpRef.reference?.split("/")[1];
                if (!gpId) return;

                const gpResource = this.resolveReference(gpRef.reference, ipsBundle.entry);
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
    },

    /**
     * Get patient extensions
     * @param {Object} ipsBundle - IPS FHIR Bundle
     * @param {string} extensionUrl - Extension URL to search for
     * @returns {Array} Array of matching extensions
     */
    getPatientExtensions(ipsBundle, extensionUrl) {
        const patients = this.getResourcesByType(ipsBundle, "Patient");
        if (patients.length === 0) return [];

        const patient = patients[0];
        if (!Array.isArray(patient.extension)) return [];

        return patient.extension.filter(ext => ext.url === extensionUrl);
    },

    /**
     * Check if patient has specific occupation
     * @param {Object} ipsBundle - IPS FHIR Bundle
     * @param {string} occupationCode - Occupation code to check
     * @returns {boolean} True if patient has this occupation
     */
    hasOccupation(ipsBundle, occupationCode) {
        const extensions = this.getPatientExtensions(
            ipsBundle,
            "http://hl7.org/fhir/StructureDefinition/individual-occupation"
        );

        return extensions.some(ext => 
            ext.valueCodeableConcept?.coding?.some(coding => 
                coding.code === occupationCode
            )
        );
    },

    /**
     * Private: Calculate age from birth date
     */
    _calculateAge(birthDate) {
        const today = new Date();
        const birthDateParsed = new Date(birthDate);
        const ageMiliseconds = today - birthDateParsed;
        return Math.floor(ageMiliseconds / 31536000000);
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FHIRHelper;
}
