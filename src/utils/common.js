/**
 * Common Utilities
 * General utility functions for lens development
 */

/**
 * Check if value is an object
 * @param {*} object - Value to check
 * @returns {boolean} True if value is an object
 */
function isObject(object) {
    return object != null && typeof object === 'object';
}

/**
 * Deep equality check for objects
 * @param {*} object1 - First object
 * @param {*} object2 - Second object
 * @returns {boolean} True if objects are deeply equal
 */
function deepEqual(object1, object2) {
    if (object1 === object2) return true;

    if (!isObject(object1) || !isObject(object2)) {
        return object1 === object2;
    }

    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (const key of keys1) {
        const val1 = object1[key];
        const val2 = object2[key];
        const areObjects = isObject(val1) && isObject(val2);
        
        if (
            (areObjects && !deepEqual(val1, val2)) ||
            (!areObjects && val1 !== val2)
        ) {
            return false;
        }
    }

    return true;
}

/**
 * Check if array contains object matching criteria
 * @param {Array} array - Array to search
 * @param {Object} searchObj - Object with properties to match
 * @param {Array} compareFields - Fields to compare (default: all fields in searchObj)
 * @returns {boolean} True if match found
 */
function arrayContains(array, searchObj, compareFields = null) {
    if (!Array.isArray(array) || !searchObj) return false;

    const fieldsToCompare = compareFields || Object.keys(searchObj);

    return array.some(element => {
        return fieldsToCompare.every(field => {
            return element[field] === searchObj[field];
        });
    });
}

/**
 * Get unique items from array by key
 * @param {Array} array - Array to filter
 * @param {string} key - Key to use for uniqueness
 * @returns {Array} Array with unique items
 */
function uniqueByKey(array, key) {
    if (!Array.isArray(array)) return [];

    const seen = new Set();
    return array.filter(item => {
        const keyValue = item[key];
        if (seen.has(keyValue)) {
            return false;
        }
        seen.add(keyValue);
        return true;
    });
}

/**
 * Calculate age from birth date
 * @param {string} birthDate - Birth date string (ISO format)
 * @returns {number} Age in years
 */
function calculateAge(birthDate) {
    if (!birthDate) return null;

    const today = new Date();
    const birthDateParsed = new Date(birthDate);

    if (isNaN(birthDateParsed.getTime())) {
        return null;
    }

    const ageMiliseconds = today - birthDateParsed;
    return Math.floor(ageMiliseconds / 31536000000);
}

/**
 * Check if date is in range
 * @param {Date|string} date - Date to check
 * @param {Date|string} startDate - Start of range
 * @param {Date|string} endDate - End of range
 * @returns {boolean} True if date is in range
 */
function isDateInRange(date, startDate, endDate) {
    const d = new Date(date);
    const start = new Date(startDate);
    const end = new Date(endDate);

    return d >= start && d <= end;
}

/**
 * Get date with offset in months
 * @param {Date} date - Starting date
 * @param {number} months - Number of months to add (negative to subtract)
 * @returns {Date} New date
 */
function addMonths(date, months) {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + months);
    return newDate;
}

/**
 * Get date with offset in years
 * @param {Date} date - Starting date
 * @param {number} years - Number of years to add (negative to subtract)
 * @returns {Date} New date
 */
function addYears(date, years) {
    const newDate = new Date(date);
    newDate.setFullYear(newDate.getFullYear() + years);
    return newDate;
}

/**
 * Check if two codes match
 * @param {Object} code1 - First code {code, system}
 * @param {Object} code2 - Second code {code, system}
 * @param {boolean} includeSystem - Whether to compare system as well
 * @returns {boolean} True if codes match
 */
function codesMatch(code1, code2, includeSystem = true) {
    if (!code1 || !code2) return false;

    if (includeSystem) {
        return code1.code === code2.code && code1.system === code2.system;
    }

    return code1.code === code2.code;
}

/**
 * Flatten nested arrays
 * @param {Array} array - Array to flatten
 * @param {number} depth - Depth to flatten (default: 1)
 * @returns {Array} Flattened array
 */
function flatten(array, depth = 1) {
    if (!Array.isArray(array)) return [];

    if (depth === 0) return array;

    return array.reduce((acc, val) => {
        if (Array.isArray(val)) {
            acc.push(...flatten(val, depth - 1));
        } else {
            acc.push(val);
        }
        return acc;
    }, []);
}

/**
 * Group array items by key
 * @param {Array} array - Array to group
 * @param {string} key - Key to group by
 * @returns {Object} Object with grouped items
 */
function groupBy(array, key) {
    if (!Array.isArray(array)) return {};

    return array.reduce((result, item) => {
        const groupKey = item[key];
        if (!result[groupKey]) {
            result[groupKey] = [];
        }
        result[groupKey].push(item);
        return result;
    }, {});
}

/**
 * Debounce function execution
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Check if string contains any of the keywords (case-insensitive)
 * @param {string} text - Text to search in
 * @param {Array} keywords - Keywords to search for
 * @returns {boolean} True if any keyword found
 */
function containsAny(text, keywords) {
    if (!text || !Array.isArray(keywords)) return false;

    const lowerText = text.toLowerCase();
    return keywords.some(keyword => 
        lowerText.includes(keyword.toLowerCase())
    );
}

/**
 * Check if string contains all keywords (case-insensitive)
 * @param {string} text - Text to search in
 * @param {Array} keywords - Keywords to search for
 * @returns {boolean} True if all keywords found
 */
function containsAll(text, keywords) {
    if (!text || !Array.isArray(keywords)) return false;

    const lowerText = text.toLowerCase();
    return keywords.every(keyword => 
        lowerText.includes(keyword.toLowerCase())
    );
}

/**
 * Safely parse JSON
 * @param {string} jsonString - JSON string to parse
 * @param {*} defaultValue - Default value if parsing fails
 * @returns {*} Parsed object or default value
 */
function safeJSONParse(jsonString, defaultValue = null) {
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        return defaultValue;
    }
}

/**
 * Truncate string to max length
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default: "...")
 * @returns {string} Truncated string
 */
function truncate(str, maxLength, suffix = "...") {
    if (!str || str.length <= maxLength) return str;
    return str.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Convert string to title case
 * @param {string} str - String to convert
 * @returns {string} Title case string
 */
function toTitleCase(str) {
    if (!str) return "";
    return str.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

/**
 * Remove duplicates from array
 * @param {Array} array - Array to deduplicate
 * @returns {Array} Array without duplicates
 */
function unique(array) {
    if (!Array.isArray(array)) return [];
    return [...new Set(array)];
}

/**
 * Merge objects deeply
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} Merged object
 */
function deepMerge(target, source) {
    const output = { ...target };

    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target)) {
                    output[key] = source[key];
                } else {
                    output[key] = deepMerge(target[key], source[key]);
                }
            } else {
                output[key] = source[key];
            }
        });
    }

    return output;
}

/**
 * Sleep/delay function
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after ms
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxAttempts - Maximum number of attempts
 * @param {number} delay - Initial delay in ms
 * @returns {Promise} Promise that resolves with function result
 */
async function retry(fn, maxAttempts = 3, delay = 1000) {
    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (attempt < maxAttempts) {
                await sleep(delay * attempt);
            }
        }
    }

    throw lastError;
}

/**
 * Ensure value is an array
 * @param {*} value - Value to check
 * @returns {Array} Array (empty if value was not an array)
 */
function ensureArray(value) {
    if (Array.isArray(value)) {
        return value;
    }
    return [];
}

/**
 * Check if array is empty or undefined
 * @param {*} array - Array to check
 * @returns {boolean} True if empty or not an array
 */
function isEmpty(array) {
    return !array || !Array.isArray(array) || array.length === 0;
}

/**
 * Validate that required fields exist in object
 * @param {Object} obj - Object to validate
 * @param {Array} requiredFields - Array of required field names
 * @param {string} objectName - Name for error messages
 * @returns {Object} {valid: boolean, errors: Array}
 */
function validateRequiredFields(obj, requiredFields, objectName = "Object") {
    const errors = [];

    if (!obj) {
        errors.push(`${objectName} is null or undefined`);
        return { valid: false, errors };
    }

    requiredFields.forEach(field => {
        if (obj[field] === undefined || obj[field] === null) {
            errors.push(`${objectName} is missing required field: ${field}`);
        }
    });

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Safe get with default value
 * @param {Object} obj - Object to get value from
 * @param {string} path - Dot-notation path (e.g., "resource.code.coding")
 * @param {*} defaultValue - Default value if path doesn't exist
 * @returns {*} Value at path or default value
 */
function safeGet(obj, path, defaultValue = null) {
    if (!obj || !path) return defaultValue;

    const keys = path.split('.');
    let result = obj;

    for (const key of keys) {
        if (result && typeof result === 'object' && key in result) {
            result = result[key];
        } else {
            return defaultValue;
        }
    }

    return result !== undefined ? result : defaultValue;
}

// Export all functions
module.exports = {
    isObject,
    deepEqual,
    arrayContains,
    uniqueByKey,
    calculateAge,
    isDateInRange,
    addMonths,
    addYears,
    codesMatch,
    flatten,
    groupBy,
    debounce,
    containsAny,
    containsAll,
    safeJSONParse,
    truncate,
    toTitleCase,
    unique,
    deepMerge,
    sleep,
    retry,
    ensureArray,
    isEmpty,
    validateRequiredFields,
    safeGet
};
