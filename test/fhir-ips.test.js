/**
 * Tests for FHIR IPS Utilities
 */

const { 
    getPatientInfo,
    getMedications,
    getConditions,
    getAllergies
} = require('../src/fhir/ips');

const ipsFixture = require('./fixtures/ips.json');

describe('FHIR IPS Utilities', () => {
    
    describe('getPatientInfo', () => {
        
        test('should extract patient info from IPS bundle', () => {
            const patient = getPatientInfo(ipsFixture);
            
            expect(patient).not.toBeNull();
            expect(patient.resourceType).toBe('Patient');
            expect(patient).toHaveProperty('age');
        });
        
        test('should return null when no patient found', () => {
            const emptyBundle = { entry: [] };
            const patient = getPatientInfo(emptyBundle);
            
            expect(patient).toBeNull();
        });
        
        test('should handle null/undefined bundle', () => {
            expect(getPatientInfo(null)).toBeNull();
            expect(getPatientInfo(undefined)).toBeNull();
        });
    });
    
    describe('getMedications', () => {
        
        test('should extract medications from IPS bundle', () => {
            const medications = getMedications(ipsFixture);
            
            expect(Array.isArray(medications)).toBe(true);
            // Check that each medication has required structure
            medications.forEach(med => {
                expect(med).toHaveProperty('resourceType');
                expect(med).toHaveProperty('codes');
                expect(Array.isArray(med.codes)).toBe(true);
            });
        });
        
        test('should handle bundle with medicationCodeableConcept', () => {
            const bundle = {
                entry: [
                    {
                        resource: {
                            resourceType: 'MedicationStatement',
                            id: 'med1',
                            medicationCodeableConcept: {
                                coding: [
                                    { code: '123', system: 'http://www.nlm.nih.gov/research/umls/rxnorm', display: 'Aspirin' }
                                ]
                            }
                        }
                    }
                ]
            };
            
            const medications = getMedications(bundle);
            expect(medications).toHaveLength(1);
            expect(medications[0].codes).toHaveLength(1);
            expect(medications[0].codes[0].code).toBe('123');
        });
        
        test('should handle bundle with medicationReference', () => {
            const bundle = {
                entry: [
                    {
                        resource: {
                            resourceType: 'MedicationStatement',
                            id: 'med1',
                            medicationReference: {
                                reference: 'Medication/aspirin'
                            }
                        }
                    },
                    {
                        resource: {
                            resourceType: 'Medication',
                            id: 'aspirin',
                            code: {
                                coding: [
                                    { code: '123', system: 'http://www.nlm.nih.gov/research/umls/rxnorm', display: 'Aspirin' }
                                ]
                            }
                        }
                    }
                ]
            };
            
            const medications = getMedications(bundle);
            expect(medications).toHaveLength(1);
            expect(medications[0].codes.length).toBeGreaterThan(0);
        });
        
        test('should return empty array for null/undefined bundle', () => {
            expect(getMedications(null)).toEqual([]);
            expect(getMedications(undefined)).toEqual([]);
            expect(getMedications({})).toEqual([]);
        });
    });
    
    describe('getConditions', () => {
        
        test('should extract conditions from IPS bundle', () => {
            const conditions = getConditions(ipsFixture);
            
            expect(Array.isArray(conditions)).toBe(true);
            conditions.forEach(condition => {
                expect(condition).toHaveProperty('codes');
                expect(Array.isArray(condition.codes)).toBe(true);
            });
        });
        
        test('should extract condition codes properly', () => {
            const bundle = {
                entry: [
                    {
                        resource: {
                            resourceType: 'Condition',
                            id: 'cond1',
                            code: {
                                coding: [
                                    { code: '38341003', system: 'http://snomed.info/sct', display: 'Hypertension' }
                                ]
                            }
                        }
                    }
                ]
            };
            
            const conditions = getConditions(bundle);
            expect(conditions).toHaveLength(1);
            expect(conditions[0].codes[0].code).toBe('38341003');
        });
        
        test('should return empty array for null/undefined bundle', () => {
            expect(getConditions(null)).toEqual([]);
            expect(getConditions(undefined)).toEqual([]);
        });
    });
    
    describe('getAllergies', () => {
        
        test('should extract allergies from IPS bundle', () => {
            const allergies = getAllergies(ipsFixture);
            
            expect(Array.isArray(allergies)).toBe(true);
            allergies.forEach(allergy => {
                expect(allergy).toHaveProperty('codes');
                expect(Array.isArray(allergy.codes)).toBe(true);
            });
        });
        
        test('should return empty array for null/undefined bundle', () => {
            expect(getAllergies(null)).toEqual([]);
            expect(getAllergies(undefined)).toEqual([]);
        });
    });
});
