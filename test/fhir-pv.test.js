/**
 * Tests for FHIR Persona Vector (PV) Utilities
 */

const {
    validatePersonaVector,
    getAllDimensions,
    getDimensionByCode,
    getDimensionsByCodes,
    getHealthLiteracy,
    getDigitalLiteracy,
    getEmployment,
    getDimensionsByValueType,
    findDimensionsByValue,
    getSubject,
    groupDimensionsBySubject,
    getDimensionsSummary,
    hasDimension,
    getAvailableDimensionCodes,
    matchDimensions,
    DIMENSION_CODES,
    PD_CODE_SYSTEM
} = require('../src/fhir/pv');

const pvFixture = require('./fixtures/pv.json');

describe('FHIR Persona Vector Utilities', () => {
    
    describe('validatePersonaVector', () => {
        
        test('should validate a proper PV bundle', () => {
            const result = validatePersonaVector(pvFixture);
            expect(result.valid).toBe(true);
            expect(result.errors).toEqual([]);
        });
        
        test('should reject null/undefined bundle', () => {
            const result1 = validatePersonaVector(null);
            expect(result1.valid).toBe(false);
            expect(result1.errors).toContain("Persona Vector bundle is null or undefined");
            
            const result2 = validatePersonaVector(undefined);
            expect(result2.valid).toBe(false);
        });
        
        test('should reject non-Bundle resource', () => {
            const result = validatePersonaVector({ resourceType: 'Observation' });
            expect(result.valid).toBe(false);
            expect(result.errors).toContain("Resource is not a Bundle");
        });
        
        test('should reject non-collection bundle type', () => {
            const bundle = {
                resourceType: 'Bundle',
                type: 'searchset',
                entry: []
            };
            const result = validatePersonaVector(bundle);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain("Bundle type must be 'collection'");
        });
        
        test('should reject bundle without observations', () => {
            const bundle = {
                resourceType: 'Bundle',
                type: 'collection',
                entry: [{ resource: { resourceType: 'Patient' } }]
            };
            const result = validatePersonaVector(bundle);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain("No Observation resources found in bundle");
        });
    });
    
    describe('getAllDimensions', () => {
        
        test('should extract all dimensions from PV bundle', () => {
            const dimensions = getAllDimensions(pvFixture);
            
            expect(Array.isArray(dimensions)).toBe(true);
            expect(dimensions.length).toBeGreaterThan(0);
            
            dimensions.forEach(dim => {
                expect(dim).toHaveProperty('id');
                expect(dim).toHaveProperty('status');
                expect(dim).toHaveProperty('dimensionCode');
                expect(dim).toHaveProperty('value');
                expect(dim).toHaveProperty('valueType');
                expect(dim).toHaveProperty('subject');
            });
        });
        
        test('should extract dimension codes correctly', () => {
            const dimensions = getAllDimensions(pvFixture);
            const empDimension = dimensions.find(d => d.dimensionCode === 'EMP');
            
            expect(empDimension).toBeDefined();
            expect(empDimension.dimensionCode).toBe('EMP');
        });
        
        test('should handle different value types', () => {
            const dimensions = getAllDimensions(pvFixture);
            
            // String value
            const stringDim = dimensions.find(d => d.valueType === 'String');
            expect(stringDim).toBeDefined();
            expect(typeof stringDim.value).toBe('string');
            
            // Integer value
            const intDim = dimensions.find(d => d.valueType === 'Integer');
            expect(intDim).toBeDefined();
            expect(typeof intDim.value).toBe('number');
            
            // CodeableConcept value
            const codeDim = dimensions.find(d => d.valueType === 'CodeableConcept');
            expect(codeDim).toBeDefined();
            expect(codeDim.valueCodes).toBeDefined();
        });
        
        test('should return empty array for invalid bundle', () => {
            expect(getAllDimensions(null)).toEqual([]);
            expect(getAllDimensions({})).toEqual([]);
            expect(getAllDimensions({ entry: [] })).toEqual([]);
        });
    });
    
    describe('getDimensionByCode', () => {
        
        test('should get employment dimension', () => {
            const dimension = getDimensionByCode(pvFixture, DIMENSION_CODES.EMPLOYMENT);
            
            expect(dimension).not.toBeNull();
            expect(dimension.dimensionCode).toBe(DIMENSION_CODES.EMPLOYMENT);
        });
        
        test('should get health literacy dimension', () => {
            const dimension = getDimensionByCode(pvFixture, DIMENSION_CODES.HEALTH_LITERACY);
            
            expect(dimension).not.toBeNull();
            expect(dimension.dimensionCode).toBe(DIMENSION_CODES.HEALTH_LITERACY);
        });
        
        test('should return null for non-existent dimension', () => {
            const dimension = getDimensionByCode(pvFixture, 'NONEXISTENT');
            expect(dimension).toBeNull();
        });
    });
    
    describe('getDimensionsByCodes', () => {
        
        test('should get multiple dimensions by codes', () => {
            const dimensions = getDimensionsByCodes(pvFixture, [
                DIMENSION_CODES.HEALTH_LITERACY,
                DIMENSION_CODES.DIGITAL_LITERACY
            ]);
            
            expect(dimensions.length).toBe(2);
            expect(dimensions[0].dimensionCode).toBe(DIMENSION_CODES.HEALTH_LITERACY);
            expect(dimensions[1].dimensionCode).toBe(DIMENSION_CODES.DIGITAL_LITERACY);
        });
        
        test('should return empty array for invalid input', () => {
            expect(getDimensionsByCodes(pvFixture, null)).toEqual([]);
            expect(getDimensionsByCodes(pvFixture, 'string')).toEqual([]);
        });
        
        test('should return empty array when no codes match', () => {
            const dimensions = getDimensionsByCodes(pvFixture, ['NONEXISTENT']);
            expect(dimensions).toEqual([]);
        });
    });
    
    describe('Specific dimension getters', () => {
        
        test('getHealthLiteracy should return health literacy dimension', () => {
            const dimension = getHealthLiteracy(pvFixture);
            
            expect(dimension).not.toBeNull();
            expect(dimension.dimensionCode).toBe(DIMENSION_CODES.HEALTH_LITERACY);
            expect(dimension.valueType).toBe('String');
        });
        
        test('getDigitalLiteracy should return digital literacy dimension', () => {
            const dimension = getDigitalLiteracy(pvFixture);
            
            expect(dimension).not.toBeNull();
            expect(dimension.dimensionCode).toBe(DIMENSION_CODES.DIGITAL_LITERACY);
            expect(dimension.valueType).toBe('String');
        });
        
        test('getEmployment should return employment dimension', () => {
            const dimension = getEmployment(pvFixture);
            
            expect(dimension).not.toBeNull();
            expect(dimension.dimensionCode).toBe(DIMENSION_CODES.EMPLOYMENT);
            expect(dimension.valueType).toBe('CodeableConcept');
        });
    });
    
    describe('getDimensionsByValueType', () => {
        
        test('should filter dimensions by String value type', () => {
            const dimensions = getDimensionsByValueType(pvFixture, 'String');
            
            expect(Array.isArray(dimensions)).toBe(true);
            dimensions.forEach(dim => {
                expect(dim.valueType).toBe('String');
            });
        });
        
        test('should filter dimensions by Integer value type', () => {
            const dimensions = getDimensionsByValueType(pvFixture, 'Integer');
            
            expect(Array.isArray(dimensions)).toBe(true);
            dimensions.forEach(dim => {
                expect(dim.valueType).toBe('Integer');
            });
        });
        
        test('should filter dimensions by CodeableConcept value type', () => {
            const dimensions = getDimensionsByValueType(pvFixture, 'CodeableConcept');
            
            expect(Array.isArray(dimensions)).toBe(true);
            dimensions.forEach(dim => {
                expect(dim.valueType).toBe('CodeableConcept');
                expect(dim.valueCodes).toBeDefined();
            });
        });
    });
    
    describe('findDimensionsByValue', () => {
        
        test('should find dimensions with predicate function', () => {
            const dimensions = findDimensionsByValue(pvFixture, (value) => {
                return typeof value === 'string' && value.includes('literacy');
            });
            
            expect(dimensions.length).toBeGreaterThan(0);
        });
        
        test('should find integer dimensions greater than a value', () => {
            const dimensions = findDimensionsByValue(pvFixture, (value) => {
                return typeof value === 'number' && value > 3;
            });
            
            expect(Array.isArray(dimensions)).toBe(true);
        });
        
        test('should return empty array for invalid predicate', () => {
            expect(findDimensionsByValue(pvFixture, null)).toEqual([]);
            expect(findDimensionsByValue(pvFixture, 'not-a-function')).toEqual([]);
        });
    });
    
    describe('getSubject', () => {
        
        test('should get subject from PV bundle', () => {
            const subject = getSubject(pvFixture);
            
            expect(subject).toBeDefined();
            expect(typeof subject).toBe('string');
        });
        
        test('should return null for empty bundle', () => {
            const emptyBundle = { entry: [] };
            expect(getSubject(emptyBundle)).toBeNull();
        });
    });
    
    describe('groupDimensionsBySubject', () => {
        
        test('should group dimensions by subject', () => {
            const grouped = groupDimensionsBySubject(pvFixture);
            
            expect(typeof grouped).toBe('object');
            expect(Object.keys(grouped).length).toBeGreaterThan(0);
            
            Object.values(grouped).forEach(dimensions => {
                expect(Array.isArray(dimensions)).toBe(true);
            });
        });
    });
    
    describe('getDimensionsSummary', () => {
        
        test('should generate comprehensive summary', () => {
            const summary = getDimensionsSummary(pvFixture);
            
            expect(summary).toHaveProperty('totalDimensions');
            expect(summary).toHaveProperty('dimensionCodes');
            expect(summary).toHaveProperty('valueTypes');
            expect(summary).toHaveProperty('subject');
            expect(summary).toHaveProperty('bundleId');
            expect(summary).toHaveProperty('identifier');
            
            expect(typeof summary.totalDimensions).toBe('number');
            expect(Array.isArray(summary.dimensionCodes)).toBe(true);
            expect(typeof summary.valueTypes).toBe('object');
        });
        
        test('should count dimensions correctly', () => {
            const summary = getDimensionsSummary(pvFixture);
            const dimensions = getAllDimensions(pvFixture);
            
            expect(summary.totalDimensions).toBe(dimensions.length);
        });
    });
    
    describe('hasDimension', () => {
        
        test('should return true for existing dimension', () => {
            expect(hasDimension(pvFixture, DIMENSION_CODES.HEALTH_LITERACY)).toBe(true);
            expect(hasDimension(pvFixture, DIMENSION_CODES.DIGITAL_LITERACY)).toBe(true);
        });
        
        test('should return false for non-existent dimension', () => {
            expect(hasDimension(pvFixture, 'NONEXISTENT')).toBe(false);
        });
    });
    
    describe('getAvailableDimensionCodes', () => {
        
        test('should return all unique dimension codes', () => {
            const codes = getAvailableDimensionCodes(pvFixture);
            
            expect(Array.isArray(codes)).toBe(true);
            expect(codes.length).toBeGreaterThan(0);
            
            // Check for duplicates
            const uniqueCodes = new Set(codes);
            expect(uniqueCodes.size).toBe(codes.length);
        });
        
        test('should include expected dimension codes', () => {
            const codes = getAvailableDimensionCodes(pvFixture);
            
            expect(codes).toContain(DIMENSION_CODES.HEALTH_LITERACY);
            expect(codes).toContain(DIMENSION_CODES.DIGITAL_LITERACY);
        });
    });
    
    describe('matchDimensions', () => {
        
        test('should match by dimension code', () => {
            const matches = matchDimensions(pvFixture, {
                dimensionCode: DIMENSION_CODES.HEALTH_LITERACY
            });
            
            expect(matches.length).toBe(1);
            expect(matches[0].dimensionCode).toBe(DIMENSION_CODES.HEALTH_LITERACY);
        });
        
        test('should match by value type', () => {
            const matches = matchDimensions(pvFixture, {
                valueType: 'Integer'
            });
            
            expect(Array.isArray(matches)).toBe(true);
            matches.forEach(dim => {
                expect(dim.valueType).toBe('Integer');
            });
        });
        
        test('should match by value predicate', () => {
            const matches = matchDimensions(pvFixture, {
                valuePredicate: (value) => typeof value === 'number' && value > 3
            });
            
            expect(Array.isArray(matches)).toBe(true);
            matches.forEach(dim => {
                expect(typeof dim.value).toBe('number');
                expect(dim.value).toBeGreaterThan(3);
            });
        });
        
        test('should match by multiple criteria', () => {
            const matches = matchDimensions(pvFixture, {
                dimensionCode: DIMENSION_CODES.EMOTIONAL_RATIONAL,
                valueType: 'Integer'
            });
            
            expect(matches.length).toBeGreaterThanOrEqual(0);
            matches.forEach(dim => {
                expect(dim.dimensionCode).toBe(DIMENSION_CODES.EMOTIONAL_RATIONAL);
                expect(dim.valueType).toBe('Integer');
            });
        });
    });
    
    describe('Constants', () => {
        
        test('DIMENSION_CODES should contain expected codes', () => {
            expect(DIMENSION_CODES).toHaveProperty('EMPLOYMENT');
            expect(DIMENSION_CODES).toHaveProperty('HEALTH_LITERACY');
            expect(DIMENSION_CODES).toHaveProperty('DIGITAL_LITERACY');
            expect(DIMENSION_CODES).toHaveProperty('WORK_LIFE');
            expect(DIMENSION_CODES).toHaveProperty('EXTROVERT_INTROVERT');
        });
        
        test('PD_CODE_SYSTEM should be correct', () => {
            expect(PD_CODE_SYSTEM).toBe("http://hl7.eu/fhir/ig/gravitate-health/CodeSystem/pd-type-cs");
        });
    });
});
