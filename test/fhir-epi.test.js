/**
 * Tests for FHIR ePI Utilities
 */

const {
    getAnnotatedSections,
    findSectionsByCode,
    getMedicinalProductId,
    matchBundleIdentifier
} = require('../src/fhir/epi');

const epiFixture = require('./fixtures/epi.json');

describe('FHIR ePI Utilities', () => {
    
    describe('getAnnotatedSections', () => {
        
        test('should extract annotated sections from ePI bundle', () => {
            const sections = getAnnotatedSections(epiFixture);
            
            expect(Array.isArray(sections)).toBe(true);
            sections.forEach(section => {
                expect(section).toHaveProperty('category');
                expect(section).toHaveProperty('codes');
                expect(Array.isArray(section.codes)).toBe(true);
            });
        });
        
        test('should return empty array for null/undefined bundle', () => {
            expect(getAnnotatedSections(null)).toEqual([]);
            expect(getAnnotatedSections(undefined)).toEqual([]);
            expect(getAnnotatedSections({})).toEqual([]);
        });
        
        test('should handle bundle without composition', () => {
            const bundle = { entry: [{ resource: { resourceType: 'Medication' } }] };
            expect(getAnnotatedSections(bundle)).toEqual([]);
        });
    });
    
    describe('findSectionsByCode', () => {
        
        test('should find sections matching code strings', () => {
            const mockBundle = {
                entry: [{
                    resource: {
                        resourceType: 'Composition',
                        extension: [{
                            extension: [
                                { url: 'category', valueString: 'section-1' },
                                {
                                    url: 'concept',
                                    valueCodeableReference: {
                                        concept: {
                                            coding: [
                                                { code: '123', system: 'http://example.com' }
                                            ]
                                        }
                                    }
                                }
                            ]
                        }]
                    }
                }]
            };
            
            const categories = findSectionsByCode(mockBundle, ['123'], false);
            expect(categories).toContain('section-1');
        });
        
        test('should match with system when matchSystem is true', () => {
            const mockBundle = {
                entry: [{
                    resource: {
                        resourceType: 'Composition',
                        extension: [{
                            extension: [
                                { url: 'category', valueString: 'section-1' },
                                {
                                    url: 'concept',
                                    valueCodeableReference: {
                                        concept: {
                                            coding: [
                                                { code: '123', system: 'http://example.com' }
                                            ]
                                        }
                                    }
                                }
                            ]
                        }]
                    }
                }]
            };
            
            const categories = findSectionsByCode(
                mockBundle, 
                [{ code: '123', system: 'http://example.com' }], 
                true
            );
            expect(categories).toContain('section-1');
        });
        
        test('should not match when system differs', () => {
            const mockBundle = {
                entry: [{
                    resource: {
                        resourceType: 'Composition',
                        extension: [{
                            extension: [
                                { url: 'category', valueString: 'section-1' },
                                {
                                    url: 'concept',
                                    valueCodeableReference: {
                                        concept: {
                                            coding: [
                                                { code: '123', system: 'http://example.com' }
                                            ]
                                        }
                                    }
                                }
                            ]
                        }]
                    }
                }]
            };
            
            const categories = findSectionsByCode(
                mockBundle, 
                [{ code: '123', system: 'http://different.com' }], 
                true
            );
            expect(categories).toEqual([]);
        });
        
        test('should return empty array for null/undefined inputs', () => {
            expect(findSectionsByCode(null, ['123'])).toEqual([]);
            expect(findSectionsByCode({}, null)).toEqual([]);
            expect(findSectionsByCode({}, 'not-array')).toEqual([]);
        });
        
        test('should not duplicate categories', () => {
            const mockBundle = {
                entry: [{
                    resource: {
                        resourceType: 'Composition',
                        extension: [
                            {
                                extension: [
                                    { url: 'category', valueString: 'section-1' },
                                    {
                                        url: 'concept',
                                        valueCodeableReference: {
                                            concept: {
                                                coding: [
                                                    { code: '123', system: 'http://example.com' }
                                                ]
                                            }
                                        }
                                    }
                                ]
                            },
                            {
                                extension: [
                                    { url: 'category', valueString: 'section-1' },
                                    {
                                        url: 'concept',
                                        valueCodeableReference: {
                                            concept: {
                                                coding: [
                                                    { code: '456', system: 'http://example.com' }
                                                ]
                                            }
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                }]
            };
            
            const categories = findSectionsByCode(mockBundle, ['123', '456'], false);
            expect(categories).toHaveLength(1);
            expect(categories[0]).toBe('section-1');
        });
    });
    
    describe('getMedicinalProductId', () => {
        
        test('should extract MedicinalProductDefinition ID from ePI bundle', () => {
            const productId = getMedicinalProductId(epiFixture);
            
            expect(typeof productId === 'string' || productId === null).toBe(true);
        });
        
        test('should return null when no MedicinalProductDefinition found', () => {
            const bundle = { entry: [{ resource: { resourceType: 'Composition' } }] };
            const productId = getMedicinalProductId(bundle);
            
            expect(productId).toBeNull();
        });
        
        test('should return null for null/undefined bundle', () => {
            expect(getMedicinalProductId(null)).toBeNull();
            expect(getMedicinalProductId(undefined)).toBeNull();
            expect(getMedicinalProductId({})).toBeNull();
        });
    });
    
    describe('matchBundleIdentifier', () => {
        
        test('should match bundle identifier against list', () => {
            const bundle = {
                identifier: {
                    value: 'test-id-123'
                }
            };
            
            const matches = matchBundleIdentifier(bundle, ['test-id-123', 'other-id']);
            expect(matches).toBe(true);
        });
        
        test('should return false when no match found', () => {
            const bundle = {
                identifier: {
                    value: 'test-id-123'
                }
            };
            
            const matches = matchBundleIdentifier(bundle, ['other-id', 'another-id']);
            expect(matches).toBe(false);
        });
        
        test('should return false for null/undefined inputs', () => {
            expect(matchBundleIdentifier(null, ['test'])).toBe(false);
            expect(matchBundleIdentifier({}, null)).toBe(false);
        });
    });
});
