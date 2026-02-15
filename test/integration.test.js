/**
 * Integration tests using actual fixture data
 */

const { getPatientInfo, getMedications, getConditions } = require('../src/fhir/ips');
const { getAnnotatedSections, findSectionsByCode } = require('../src/fhir/epi');
const { addClasses } = require('../src/html/dom');

const ipsFixture = require('./fixtures/ips.json');
const epiFixture = require('./fixtures/epi.json');

describe('Integration Tests with Fixtures', () => {
    
    describe('IPS Processing', () => {
        
        test('should extract patient information from real IPS fixture', () => {
            const patient = getPatientInfo(ipsFixture);
            
            expect(patient).not.toBeNull();
            expect(patient.resourceType).toBe('Patient');
            expect(patient).toHaveProperty('id');
        });
        
        test('should extract medications from real IPS fixture', () => {
            const medications = getMedications(ipsFixture);
            
            expect(Array.isArray(medications)).toBe(true);
            
            // Log some info about medications found
            if (medications.length > 0) {
                console.log(`Found ${medications.length} medications in IPS fixture`);
                medications.forEach(med => {
                    expect(med).toHaveProperty('resourceType');
                    expect(med).toHaveProperty('codes');
                    expect(Array.isArray(med.codes)).toBe(true);
                });
            }
        });
        
        test('should extract conditions from real IPS fixture', () => {
            const conditions = getConditions(ipsFixture);
            
            expect(Array.isArray(conditions)).toBe(true);
            
            if (conditions.length > 0) {
                console.log(`Found ${conditions.length} conditions in IPS fixture`);
                conditions.forEach(condition => {
                    expect(condition).toHaveProperty('codes');
                    expect(Array.isArray(condition.codes)).toBe(true);
                });
            }
        });
    });
    
    describe('ePI Processing', () => {
        
        test('should extract annotated sections from real ePI fixture', () => {
            const sections = getAnnotatedSections(epiFixture);
            
            expect(Array.isArray(sections)).toBe(true);
            
            if (sections.length > 0) {
                console.log(`Found ${sections.length} annotated sections in ePI fixture`);
                sections.forEach(section => {
                    expect(section).toHaveProperty('category');
                    expect(section).toHaveProperty('codes');
                    expect(typeof section.category).toBe('string');
                    expect(Array.isArray(section.codes)).toBe(true);
                });
            }
        });
        
        test('should find sections by code in real ePI fixture', () => {
            const sections = getAnnotatedSections(epiFixture);
            
            if (sections.length > 0 && sections[0].codes.length > 0) {
                const testCode = sections[0].codes[0].code;
                const matchingCategories = findSectionsByCode(epiFixture, [testCode], false);
                
                expect(Array.isArray(matchingCategories)).toBe(true);
                expect(matchingCategories.length).toBeGreaterThan(0);
            }
        });
    });
    
    describe('End-to-End Lens Workflow', () => {
        
        test('should simulate a simple condition lens workflow', async () => {
            // 1. Extract conditions from IPS
            const conditions = getConditions(ipsFixture);
            
            // 2. Get condition codes
            const conditionCodes = conditions.flatMap(c => c.codes.map(code => code.code));
            
            // 3. Find matching sections in ePI
            const matchingCategories = findSectionsByCode(epiFixture, conditionCodes, false);
            
            expect(Array.isArray(matchingCategories)).toBe(true);
            
            // 4. Add classes to HTML (if categories found)
            if (matchingCategories.length > 0) {
                const testHtml = `
                    <html>
                        <body>
                            ${matchingCategories.map(cat => `<div class="${cat}">Section content</div>`).join('\n')}
                        </body>
                    </html>
                `;
                
                const enhancedHtml = await addClasses(testHtml, matchingCategories, 'highlight');
                
                expect(enhancedHtml).toContain('highlight');
                matchingCategories.forEach(category => {
                    expect(enhancedHtml).toContain(category);
                });
            }
        });
        
        test('should simulate a medication interaction lens workflow', async () => {
            // 1. Extract medications from IPS
            const medications = getMedications(ipsFixture);
            
            expect(Array.isArray(medications)).toBe(true);
            
            // 2. Get medication codes
            const medicationCodes = medications.flatMap(m => m.codes.map(code => code.code));
            
            // 3. Find matching sections in ePI
            const matchingCategories = findSectionsByCode(epiFixture, medicationCodes, false);
            
            expect(Array.isArray(matchingCategories)).toBe(true);
            
            console.log(`Medication lens found ${matchingCategories.length} matching sections`);
        });
    });
});
