/**
 * Tests for FHIR Common Utilities
 */

const { 
    getResourcesByType, 
    resolveReference, 
    extractCodes 
} = require('../src/fhir/common');

describe('FHIR Common Utilities', () => {
    
    describe('getResourcesByType', () => {
        
        test('should return resources of specified type', () => {
            const bundle = {
                entry: [
                    { resource: { resourceType: 'Patient', id: '1' } },
                    { resource: { resourceType: 'Condition', id: '2' } },
                    { resource: { resourceType: 'Patient', id: '3' } }
                ]
            };
            
            const patients = getResourcesByType(bundle, 'Patient');
            expect(patients).toHaveLength(2);
            expect(patients[0].id).toBe('1');
            expect(patients[1].id).toBe('3');
        });
        
        test('should return empty array for non-existent type', () => {
            const bundle = {
                entry: [
                    { resource: { resourceType: 'Patient', id: '1' } }
                ]
            };
            
            const results = getResourcesByType(bundle, 'Medication');
            expect(results).toEqual([]);
        });
        
        test('should handle null/undefined bundle', () => {
            expect(getResourcesByType(null, 'Patient')).toEqual([]);
            expect(getResourcesByType(undefined, 'Patient')).toEqual([]);
            expect(getResourcesByType({}, 'Patient')).toEqual([]);
        });
        
        test('should handle malformed bundle', () => {
            expect(getResourcesByType({ entry: null }, 'Patient')).toEqual([]);
            expect(getResourcesByType({ entry: 'not-array' }, 'Patient')).toEqual([]);
        });
    });
    
    describe('resolveReference', () => {
        
        test('should resolve reference correctly', () => {
            const entries = [
                { resource: { resourceType: 'Medication', id: '123', name: 'Aspirin' } },
                { resource: { resourceType: 'Patient', id: '456' } }
            ];
            
            const resolved = resolveReference('Medication/123', entries);
            expect(resolved).not.toBeNull();
            expect(resolved.name).toBe('Aspirin');
        });
        
        test('should return null for non-existent reference', () => {
            const entries = [
                { resource: { resourceType: 'Medication', id: '123' } }
            ];
            
            const resolved = resolveReference('Medication/999', entries);
            expect(resolved).toBeNull();
        });
        
        test('should return null for invalid reference', () => {
            const entries = [
                { resource: { resourceType: 'Medication', id: '123' } }
            ];
            
            expect(resolveReference(null, entries)).toBeNull();
            expect(resolveReference('', entries)).toBeNull();
            expect(resolveReference('invalid', entries)).toBeNull();
        });
        
        test('should return null for null entries', () => {
            expect(resolveReference('Medication/123', null)).toBeNull();
        });
    });
    
    describe('extractCodes', () => {
        
        test('should extract codes from CodeableConcept', () => {
            const codeableConcept = {
                coding: [
                    { code: 'A123', system: 'http://snomed.info/sct', display: 'Test Code 1' },
                    { code: 'B456', system: 'http://loinc.org', display: 'Test Code 2' }
                ]
            };
            
            const codes = extractCodes(codeableConcept);
            expect(codes).toHaveLength(2);
            expect(codes[0]).toEqual({ code: 'A123', system: 'http://snomed.info/sct', display: 'Test Code 1' });
            expect(codes[1]).toEqual({ code: 'B456', system: 'http://loinc.org', display: 'Test Code 2' });
        });
        
        test('should handle missing system or display', () => {
            const codeableConcept = {
                coding: [
                    { code: 'A123' }
                ]
            };
            
            const codes = extractCodes(codeableConcept);
            expect(codes).toHaveLength(1);
            expect(codes[0]).toEqual({ code: 'A123', system: '', display: '' });
        });
        
        test('should return empty array for null/undefined', () => {
            expect(extractCodes(null)).toEqual([]);
            expect(extractCodes(undefined)).toEqual([]);
            expect(extractCodes({})).toEqual([]);
        });
        
        test('should return empty array for invalid coding', () => {
            expect(extractCodes({ coding: null })).toEqual([]);
            expect(extractCodes({ coding: 'not-array' })).toEqual([]);
        });
    });
});
