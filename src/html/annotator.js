/**
 * HTML Annotator
 * Utility functions for DOM manipulation and HTML annotation
 */

const HTMLHelper = {
    /**
     * Annotate HTML by adding CSS classes to elements
     * @param {Object} options - Configuration object
     * @param {string} options.html - HTML string to annotate
     * @param {Array} options.categories - Array of CSS class names to search for
     * @param {string} options.enhanceTag - CSS class to add (e.g., "highlight", "collapse")
     * @param {string} options.lensName - Name of lens for additional CSS class
     * @returns {Promise<string>} Annotated HTML string
     */
    async annotate({ html, categories, enhanceTag, lensName }) {
        if (!html || !categories || !enhanceTag) {
            throw new Error("HTMLHelper.annotate requires html, categories, and enhanceTag");
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
        response = this._extractHTML(document);

        if (response == null || response === "") {
            throw new Error("Annotation process failed: Returned empty or null response");
        }

        return response;
    },

    /**
     * Insert banner or content at top or bottom of HTML
     * @param {Object} options - Configuration object
     * @param {string} options.html - HTML string
     * @param {string} options.content - Content to insert (HTML string)
     * @param {string} options.position - 'top' or 'bottom'
     * @param {string} options.cssClass - Optional CSS class for wrapper
     * @returns {Promise<string>} Modified HTML string
     */
    async insertBanner({ html, content, position = 'top', cssClass = '' }) {
        if (!html || !content) {
            throw new Error("HTMLHelper.insertBanner requires html and content");
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

        return this._extractHTML(document);
    },

    /**
     * Wrap elements with links
     * @param {Object} options - Configuration object
     * @param {string} options.html - HTML string
     * @param {Array} options.categories - CSS classes to search for
     * @param {Function} options.linkBuilder - Function that returns {href, target, text}
     * @param {string} options.lensName - Optional lens name for CSS class
     * @param {boolean} options.wrapContent - If true, wraps content; if false, appends link
     * @returns {Promise<string>} Modified HTML string
     */
    async wrapWithLinks({ html, categories, linkBuilder, lensName, wrapContent = true }) {
        if (!html || !categories || !linkBuilder) {
            throw new Error("HTMLHelper.wrapWithLinks requires html, categories, and linkBuilder");
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

        categories.forEach((className) => {
            const elements = document.getElementsByClassName(className);
            for (let i = 0; i < elements.length; i++) {
                const el = elements[i];
                const linkConfig = linkBuilder(el);

                if (linkConfig && linkConfig.href) {
                    const link = document.createElement("a");
                    link.setAttribute("href", linkConfig.href);
                    if (linkConfig.target) {
                        link.setAttribute("target", linkConfig.target);
                    }
                    if (lensName) {
                        link.classList.add(lensName);
                    }

                    if (wrapContent) {
                        // Wrap existing content
                        link.innerHTML = el.innerHTML;
                        el.innerHTML = "";
                        el.appendChild(link);
                    } else {
                        // Append link
                        link.innerHTML = linkConfig.text || "Link";
                        el.appendChild(link);
                    }
                }
            }
        });

        return this._extractHTML(document);
    },

    /**
     * Add content to sections matching categories
     * @param {Object} options - Configuration object
     * @param {string} options.html - HTML string
     * @param {Array} options.categories - CSS classes to search for
     * @param {string} options.content - Content to add (HTML string)
     * @param {string} options.position - 'before', 'after', 'prepend', or 'append'
     * @returns {Promise<string>} Modified HTML string
     */
    async appendToSections({ html, categories, content, position = 'append' }) {
        if (!html || !categories || !content) {
            throw new Error("HTMLHelper.appendToSections requires html, categories, and content");
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

        categories.forEach((className) => {
            const elements = document.getElementsByClassName(className);
            for (let i = 0; i < elements.length; i++) {
                const el = elements[i];
                const contentDiv = document.createElement("div");
                contentDiv.innerHTML = content;

                switch (position) {
                    case 'before':
                        el.parentNode.insertBefore(contentDiv, el);
                        break;
                    case 'after':
                        el.parentNode.insertBefore(contentDiv, el.nextSibling);
                        break;
                    case 'prepend':
                        el.insertBefore(contentDiv, el.firstChild);
                        break;
                    case 'append':
                    default:
                        el.appendChild(contentDiv);
                        break;
                }
            }
        });

        return this._extractHTML(document);
    },

    /**
     * Insert questionnaire link (specific use case)
     * @param {Object} options - Configuration object
     * @param {string} options.html - HTML string
     * @param {Array} options.categories - CSS classes to search for
     * @param {string} options.linkURL - URL for questionnaire
     * @param {Object} options.messages - Language-specific messages
     * @param {string} options.lensName - Lens name for CSS class
     * @param {boolean} options.shouldAppend - Whether to append or wrap
     * @returns {Promise<string>} Modified HTML string
     */
    async insertQuestionnaireLink({ html, categories, linkURL, messages, lensName, shouldAppend = false }) {
        let document;
        let response = html;
        let foundCategory = false;

        if (typeof window === "undefined") {
            const jsdom = await import("jsdom");
            const { JSDOM } = jsdom;
            const dom = new JSDOM(html);
            document = dom.window.document;
        } else {
            document = window.document;
        }

        categories.forEach((className) => {
            if (
                response.includes(`class="${className}`) ||
                response.includes(`class='${className}`)
            ) {
                const elements = document.getElementsByClassName(className);
                for (let i = 0; i < elements.length; i++) {
                    const el = elements[i];
                    const link = document.createElement("a");
                    link.setAttribute("href", linkURL);
                    link.setAttribute("target", "_blank");
                    if (lensName) {
                        link.setAttribute("class", lensName);
                    }

                    if (shouldAppend) {
                        link.innerHTML = messages.fillQuestionnaire || "Fill questionnaire";
                        el.appendChild(link);
                    } else {
                        link.innerHTML = el.innerHTML;
                        el.innerHTML = "";
                        el.appendChild(link);
                    }
                }
                foundCategory = true;
            }
        });

        // No matching category → inject banner at top
        if (!foundCategory) {
            const bannerDiv = document.createElement("div");
            bannerDiv.innerHTML = `
                <div class="alert-banner ${lensName || ''}" style="background-color:#ffdddd;padding:1em;border:1px solid #ff8888;margin-bottom:1em;">
                    ${messages.bannerWarning || "Warning"}
                    <a href="${linkURL}" target="_blank" style="margin-left: 1em;">${messages.questionnaireLink || "Link"}</a>
                </div>
            `;

            const body = document.querySelector("body");
            if (body) {
                body.insertBefore(bannerDiv, body.firstChild);
            }
        }

        return this._extractHTML(document);
    },

    /**
     * Insert contact links (specific use case)
     * @param {Object} options - Configuration object
     * @param {string} options.html - HTML string
     * @param {Array} options.categories - CSS classes to search for
     * @param {Array} options.contacts - Array of contact objects {type, value}
     * @param {string} options.lensName - Lens name for CSS class
     * @returns {Promise<string>} Modified HTML string
     */
    async insertContactLinks({ html, categories, contacts, lensName }) {
        if (!html || !categories || !contacts) {
            throw new Error("HTMLHelper.insertContactLinks requires html, categories, and contacts");
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

        categories.forEach((className) => {
            const elements = document.getElementsByClassName(className);
            for (let i = 0; i < elements.length; i++) {
                const el = elements[i];

                contacts.forEach(contact => {
                    let href = "";
                    if (contact.type === "email") {
                        href = `mailto:${contact.value}`;
                    } else if (contact.type === "phone") {
                        href = `tel:${contact.value}`;
                    }

                    if (href) {
                        const a = document.createElement("a");
                        a.setAttribute("href", href);
                        a.setAttribute("target", "_blank");
                        if (lensName) {
                            a.classList.add(lensName);
                        }

                        a.innerHTML = el.innerHTML;
                        el.innerHTML = "";
                        el.appendChild(a);
                    }
                });
            }
        });

        return this._extractHTML(document);
    },

    /**
     * Private: Extract HTML from document
     */
    _extractHTML(document) {
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
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HTMLHelper;
}
