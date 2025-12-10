/**
 * Common Utilities
 * General utility functions for lens development
 */

const Utils = {
    /**
     * Deep equality check for objects
     * @param {*} object1 - First object
     * @param {*} object2 - Second object
     * @returns {boolean} True if objects are deeply equal
     */
    deepEqual(object1, object2) {
        if (object1 === object2) return true;

        if (!this.isObject(object1) || !this.isObject(object2)) {
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
            const areObjects = this.isObject(val1) && this.isObject(val2);
            
            if (
                (areObjects && !this.deepEqual(val1, val2)) ||
                (!areObjects && val1 !== val2)
            ) {
                return false;
            }
        }

        return true;
    },

    /**
     * Check if value is an object
     * @param {*} object - Value to check
     * @returns {boolean} True if value is an object
     */
    isObject(object) {
        return object != null && typeof object === 'object';
    },

    /**
     * Check if array contains object matching criteria
     * @param {Array} array - Array to search
     * @param {Object} searchObj - Object with properties to match
     * @param {Array} compareFields - Fields to compare (default: all fields in searchObj)
     * @returns {boolean} True if match found
     */
    arrayContains(array, searchObj, compareFields = null) {
        if (!Array.isArray(array) || !searchObj) return false;

        const fieldsToCompare = compareFields || Object.keys(searchObj);

        return array.some(element => {
            return fieldsToCompare.every(field => {
                return element[field] === searchObj[field];
            });
        });
    },

    /**
     * Get unique items from array by key
     * @param {Array} array - Array to filter
     * @param {string} key - Key to use for uniqueness
     * @returns {Array} Array with unique items
     */
    uniqueByKey(array, key) {
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
    },

    /**
     * Calculate age from birth date
     * @param {string} birthDate - Birth date string (ISO format)
     * @returns {number} Age in years
     */
    calculateAge(birthDate) {
        if (!birthDate) return null;

        const today = new Date();
        const birthDateParsed = new Date(birthDate);

        if (isNaN(birthDateParsed.getTime())) {
            return null;
        }

        const ageMiliseconds = today - birthDateParsed;
        return Math.floor(ageMiliseconds / 31536000000);
    },

    /**
     * Check if date is in range
     * @param {Date|string} date - Date to check
     * @param {Date|string} startDate - Start of range
     * @param {Date|string} endDate - End of range
     * @returns {boolean} True if date is in range
     */
    isDateInRange(date, startDate, endDate) {
        const d = new Date(date);
        const start = new Date(startDate);
        const end = new Date(endDate);

        return d >= start && d <= end;
    },

    /**
     * Get date with offset in months
     * @param {Date} date - Starting date
     * @param {number} months - Number of months to add (negative to subtract)
     * @returns {Date} New date
     */
    addMonths(date, months) {
        const newDate = new Date(date);
        newDate.setMonth(newDate.getMonth() + months);
        return newDate;
    },

    /**
     * Get date with offset in years
     * @param {Date} date - Starting date
     * @param {number} years - Number of years to add (negative to subtract)
     * @returns {Date} New date
     */
    addYears(date, years) {
        const newDate = new Date(date);
        newDate.setFullYear(newDate.getFullYear() + years);
        return newDate;
    },

    /**
     * Check if two codes match
     * @param {Object} code1 - First code {code, system}
     * @param {Object} code2 - Second code {code, system}
     * @param {boolean} includeSystem - Whether to compare system as well
     * @returns {boolean} True if codes match
     */
    codesMatch(code1, code2, includeSystem = true) {
        if (!code1 || !code2) return false;

        if (includeSystem) {
            return code1.code === code2.code && code1.system === code2.system;
        }

        return code1.code === code2.code;
    },

    /**
     * Flatten nested arrays
     * @param {Array} array - Array to flatten
     * @param {number} depth - Depth to flatten (default: 1)
     * @returns {Array} Flattened array
     */
    flatten(array, depth = 1) {
        if (!Array.isArray(array)) return [];

        if (depth === 0) return array;

        return array.reduce((acc, val) => {
            if (Array.isArray(val)) {
                acc.push(...this.flatten(val, depth - 1));
            } else {
                acc.push(val);
            }
            return acc;
        }, []);
    },

    /**
     * Group array items by key
     * @param {Array} array - Array to group
     * @param {string} key - Key to group by
     * @returns {Object} Object with grouped items
     */
    groupBy(array, key) {
        if (!Array.isArray(array)) return {};

        return array.reduce((result, item) => {
            const groupKey = item[key];
            if (!result[groupKey]) {
                result[groupKey] = [];
            }
            result[groupKey].push(item);
            return result;
        }, {});
    },

    /**
     * Debounce function execution
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Check if string contains any of the keywords (case-insensitive)
     * @param {string} text - Text to search in
     * @param {Array} keywords - Keywords to search for
     * @returns {boolean} True if any keyword found
     */
    containsAny(text, keywords) {
        if (!text || !Array.isArray(keywords)) return false;

        const lowerText = text.toLowerCase();
        return keywords.some(keyword => 
            lowerText.includes(keyword.toLowerCase())
        );
    },

    /**
     * Check if string contains all keywords (case-insensitive)
     * @param {string} text - Text to search in
     * @param {Array} keywords - Keywords to search for
     * @returns {boolean} True if all keywords found
     */
    containsAll(text, keywords) {
        if (!text || !Array.isArray(keywords)) return false;

        const lowerText = text.toLowerCase();
        return keywords.every(keyword => 
            lowerText.includes(keyword.toLowerCase())
        );
    },

    /**
     * Safely parse JSON
     * @param {string} jsonString - JSON string to parse
     * @param {*} defaultValue - Default value if parsing fails
     * @returns {*} Parsed object or default value
     */
    safeJSONParse(jsonString, defaultValue = null) {
        try {
            return JSON.parse(jsonString);
        } catch (e) {
            return defaultValue;
        }
    },

    /**
     * Truncate string to max length
     * @param {string} str - String to truncate
     * @param {number} maxLength - Maximum length
     * @param {string} suffix - Suffix to add (default: "...")
     * @returns {string} Truncated string
     */
    truncate(str, maxLength, suffix = "...") {
        if (!str || str.length <= maxLength) return str;
        return str.substring(0, maxLength - suffix.length) + suffix;
    },

    /**
     * Convert string to title case
     * @param {string} str - String to convert
     * @returns {string} Title case string
     */
    toTitleCase(str) {
        if (!str) return "";
        return str.replace(/\w\S*/g, (txt) => {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    },

    /**
     * Remove duplicates from array
     * @param {Array} array - Array to deduplicate
     * @returns {Array} Array without duplicates
     */
    unique(array) {
        if (!Array.isArray(array)) return [];
        return [...new Set(array)];
    },

    /**
     * Merge objects deeply
     * @param {Object} target - Target object
     * @param {Object} source - Source object
     * @returns {Object} Merged object
     */
    deepMerge(target, source) {
        const output = { ...target };

        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this.isObject(source[key])) {
                    if (!(key in target)) {
                        output[key] = source[key];
                    } else {
                        output[key] = this.deepMerge(target[key], source[key]);
                    }
                } else {
                    output[key] = source[key];
                }
            });
        }

        return output;
    },

    /**
     * Sleep/delay function
     * @param {number} ms - Milliseconds to sleep
     * @returns {Promise} Promise that resolves after ms
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Retry function with exponential backoff
     * @param {Function} fn - Function to retry
     * @param {number} maxAttempts - Maximum number of attempts
     * @param {number} delay - Initial delay in ms
     * @returns {Promise} Promise that resolves with function result
     */
    async retry(fn, maxAttempts = 3, delay = 1000) {
        let lastError;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                if (attempt < maxAttempts) {
                    await this.sleep(delay * attempt);
                }
            }
        }

        throw lastError;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
