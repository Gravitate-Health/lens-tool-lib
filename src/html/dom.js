/**
 * HTML DOM Utilities
 * Functions for DOM manipulation and HTML processing
 */


/**
 * Add CSS classes to elements matching specific categories
 * @param {string} html - HTML string to process
 * @param {Array<string>} categories - Array of CSS class names to search for
 * @param {string} enhanceTag - CSS class to add (e.g., "highlight", "collapse")
 * @param {string} [lensName] - Optional lens name for additional CSS class
 * @returns {Promise<string>} Modified HTML string
 */
async function addClasses(html, categories, enhanceTag, lensName) {
    if (!html || !categories || !enhanceTag) {
        throw new Error("addClasses requires html, categories, and enhanceTag");
    }

    let response = html;
    let document;

    // Handle both Node.js (JSDOM) and browser environments
    if (typeof window === "undefined") {
        const jsdom = await import("jsdom");
        const { JSDOM } = jsdom;
        const dom = new JSDOM(html);
        document = dom.window.document;
    } else {
        document = window.document;
    }

    // Process each category
    categories.forEach((check) => {
        if (response.includes(check)) {
            const elements = document.getElementsByClassName(check);
            for (let i = 0; i < elements.length; i++) {
                elements[i].classList.add(enhanceTag);
                if (lensName) {
                    elements[i].classList.add(lensName);
                }
            }
        }
    });

    // Clean up and extract result
    response = _extractHTML(document);

    if (response == null || response === "") {
        throw new Error("Processing failed: Returned empty or null response");
    }

    return response;
}

/**
 * Insert banner or content at top or bottom of HTML
 * @param {string} html - HTML string
 * @param {string} content - Content to insert (HTML string)
 * @param {string} [position='top'] - 'top' or 'bottom'
 * @param {string} [cssClass=''] - Optional CSS class for wrapper div
 * @returns {Promise<string>} Modified HTML string
 */
async function insertBanner(html, content, position = 'top', cssClass = '') {
    if (!html || !content) {
        throw new Error("insertBanner requires html and content");
    }

    let document;

    if (typeof window === "undefined") {
        const jsdom = await import("jsdom");
        const { JSDOM } = jsdom;
        const dom = new JSDOM(html);
        document = dom.window.document;
    } else {
        document = window.document;
    }

    const bannerDiv = document.createElement("div");
    if (cssClass) {
        bannerDiv.className = cssClass;
    }
    bannerDiv.innerHTML = content;

    const body = document.querySelector("body");
    if (body) {
        if (position === 'top') {
            body.insertBefore(bannerDiv, body.firstChild);
        } else {
            body.appendChild(bannerDiv);
        }
    }

    return _extractHTML(document);
}

/**
 * Traverse DOM tree and apply visitor function to each element
 * @param {string} html - HTML string
 * @param {Function} visitor - Function called for each element: visitor(element, document)
 * @returns {Promise<string>} Modified HTML string
 * 
 * @example
 * // Add a class to all divs
 * const result = await traverseDOM(html, (el) => {
 *   if (el.tagName === 'DIV') {
 *     el.classList.add('processed');
 *   }
 * });
 * 
 * @example
 * // Remove all images
 * const result = await traverseDOM(html, (el) => {
 *   if (el.tagName === 'IMG') {
 *     el.remove();
 *   }
 * });
 */
async function traverseDOM(html, visitor) {
    if (!html || typeof visitor !== 'function') {
        throw new Error("traverseDOM requires html and visitor function");
    }

    let document;

    if (typeof window === "undefined") {
        const jsdom = await import("jsdom");
        const { JSDOM } = jsdom;
        const dom = new JSDOM(html);
        document = dom.window.document;
    } else {
        document = window.document;
    }

    // Traverse all elements in the document
    const traverse = (element) => {
        if (!element) return;
        
        // Call visitor for current element
        visitor(element, document);
        
        // Recursively traverse children
        // Use Array.from to avoid issues with live collections
        const children = Array.from(element.children);
        children.forEach(child => traverse(child));
    };

    // Start traversal from body or documentElement
    const root = document.body || document.documentElement;
    if (root) {
        traverse(root);
    }

    return _extractHTML(document);
}

/**
 * Extract HTML content from document
 * @private
 * @param {Document} document - DOM document
 * @returns {string} HTML string
 */
function _extractHTML(document) {
    // Remove head tag if present
    if (document.getElementsByTagName("head").length > 0) {
        document.getElementsByTagName("head")[0].remove();
    }

    // Extract body or documentElement
    if (document.getElementsByTagName("body").length > 0) {
        return document.getElementsByTagName("body")[0].innerHTML;
    } else {
        return document.documentElement.innerHTML;
    }
}

module.exports = {
    addClasses,
    insertBanner,
    traverseDOM
};
