/**
 * Tests for Common Utilities
 */

const {
    isObject,
    deepEqual,
    arrayContains,
    uniqueByKey,
    calculateAge,
    flatten,
    groupBy
} = require('../src/utils/common');

describe('Common Utilities', () => {
    
    describe('isObject', () => {
        
        test('should return true for objects', () => {
            expect(isObject({})).toBe(true);
            expect(isObject({ key: 'value' })).toBe(true);
            expect(isObject([])).toBe(true);
        });
        
        test('should return false for non-objects', () => {
            expect(isObject(null)).toBe(false);
            expect(isObject(undefined)).toBe(false);
            expect(isObject('string')).toBe(false);
            expect(isObject(123)).toBe(false);
            expect(isObject(true)).toBe(false);
        });
    });
    
    describe('deepEqual', () => {
        
        test('should return true for equal primitives', () => {
            expect(deepEqual(1, 1)).toBe(true);
            expect(deepEqual('test', 'test')).toBe(true);
            expect(deepEqual(true, true)).toBe(true);
            expect(deepEqual(null, null)).toBe(true);
        });
        
        test('should return false for different primitives', () => {
            expect(deepEqual(1, 2)).toBe(false);
            expect(deepEqual('test', 'other')).toBe(false);
            expect(deepEqual(true, false)).toBe(false);
        });
        
        test('should return true for deeply equal objects', () => {
            const obj1 = { a: 1, b: { c: 2, d: 3 } };
            const obj2 = { a: 1, b: { c: 2, d: 3 } };
            
            expect(deepEqual(obj1, obj2)).toBe(true);
        });
        
        test('should return false for different objects', () => {
            const obj1 = { a: 1, b: { c: 2 } };
            const obj2 = { a: 1, b: { c: 3 } };
            
            expect(deepEqual(obj1, obj2)).toBe(false);
        });
        
        test('should handle nested arrays', () => {
            const arr1 = [1, [2, 3], { a: 4 }];
            const arr2 = [1, [2, 3], { a: 4 }];
            
            expect(deepEqual(arr1, arr2)).toBe(true);
        });
        
        test('should return false for objects with different keys', () => {
            const obj1 = { a: 1, b: 2 };
            const obj2 = { a: 1, c: 2 };
            
            expect(deepEqual(obj1, obj2)).toBe(false);
        });
    });
    
    describe('arrayContains', () => {
        
        test('should find matching object in array', () => {
            const array = [
                { id: 1, name: 'John' },
                { id: 2, name: 'Jane' },
                { id: 3, name: 'Bob' }
            ];
            
            expect(arrayContains(array, { id: 2 })).toBe(true);
            expect(arrayContains(array, { name: 'Jane' })).toBe(true);
        });
        
        test('should return false when no match found', () => {
            const array = [
                { id: 1, name: 'John' },
                { id: 2, name: 'Jane' }
            ];
            
            expect(arrayContains(array, { id: 99 })).toBe(false);
        });
        
        test('should use compareFields when provided', () => {
            const array = [
                { id: 1, name: 'John', age: 30 },
                { id: 2, name: 'Jane', age: 25 }
            ];
            
            expect(arrayContains(array, { name: 'John', age: 99 }, ['name'])).toBe(true);
            expect(arrayContains(array, { name: 'John', age: 99 }, ['name', 'age'])).toBe(false);
        });
        
        test('should return false for invalid inputs', () => {
            expect(arrayContains(null, { id: 1 })).toBe(false);
            expect(arrayContains([], null)).toBe(false);
            expect(arrayContains('not-array', { id: 1 })).toBe(false);
        });
    });
    
    describe('uniqueByKey', () => {
        
        test('should return unique items by key', () => {
            const array = [
                { id: 1, name: 'John' },
                { id: 2, name: 'Jane' },
                { id: 1, name: 'John Duplicate' }
            ];
            
            const unique = uniqueByKey(array, 'id');
            
            expect(unique).toHaveLength(2);
            expect(unique[0].name).toBe('John');
            expect(unique[1].name).toBe('Jane');
        });
        
        test('should handle empty array', () => {
            expect(uniqueByKey([], 'id')).toEqual([]);
        });
        
        test('should handle non-array input', () => {
            expect(uniqueByKey(null, 'id')).toEqual([]);
            expect(uniqueByKey('not-array', 'id')).toEqual([]);
        });
    });
    
    describe('calculateAge', () => {
        
        test('should calculate age from birth date', () => {
            const birthDate = '1990-01-01';
            const age = calculateAge(birthDate);
            
            expect(typeof age).toBe('number');
            expect(age).toBeGreaterThan(30);
            expect(age).toBeLessThan(40);
        });
        
        test('should return null for invalid input', () => {
            expect(calculateAge(null)).toBeNull();
            expect(calculateAge(undefined)).toBeNull();
            expect(calculateAge('')).toBeNull();
        });
        
        test('should handle recent birth dates', () => {
            const lastYear = new Date();
            lastYear.setFullYear(lastYear.getFullYear() - 1);
            const birthDate = lastYear.toISOString().split('T')[0];
            
            const age = calculateAge(birthDate);
            expect(age).toBeLessThanOrEqual(1);
        });
    });
    
    describe('flatten', () => {
        
        test('should flatten nested arrays', () => {
            const nested = [1, [2, 3], [4, [5, 6]]];
            const flattened = flatten(nested, 2);
            
            expect(flattened).toEqual([1, 2, 3, 4, 5, 6]);
        });
        
        test('should handle already flat arrays', () => {
            const flat = [1, 2, 3, 4];
            const result = flatten(flat);
            
            expect(result).toEqual([1, 2, 3, 4]);
        });
        
        test('should handle empty arrays', () => {
            expect(flatten([])).toEqual([]);
        });
    });
    
    describe('groupBy', () => {
        
        test('should group items by key', () => {
            const items = [
                { type: 'fruit', name: 'apple' },
                { type: 'vegetable', name: 'carrot' },
                { type: 'fruit', name: 'banana' }
            ];
            
            const grouped = groupBy(items, 'type');
            
            expect(grouped.fruit).toHaveLength(2);
            expect(grouped.vegetable).toHaveLength(1);
        });
        
        test('should handle empty arrays', () => {
            expect(groupBy([], 'key')).toEqual({});
        });
    });
});
