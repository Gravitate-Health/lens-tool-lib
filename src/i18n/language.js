/**
 * Language and Internationalization Utilities
 * Helper functions for translations and language-specific messages
 */


/**
 * Get simplified language key from language code
 * @param {string} languageCode - Full language code (e.g., "pt-PT", "en-US")
 * @returns {string} Simplified language key (e.g., "pt", "en")
 */
function getLangKey(languageCode) {
        if (!languageCode) return "en";
        
        if (languageCode.startsWith("pt")) return "pt";
        if (languageCode.startsWith("es")) return "es";
        if (languageCode.startsWith("da")) return "da";
        if (languageCode.startsWith("fr")) return "fr";
        if (languageCode.startsWith("de")) return "de";
        if (languageCode.startsWith("it")) return "it";
        if (languageCode.startsWith("nl")) return "nl";
        
        return "en"; // Default to English
}

/**
 * Get translation from dictionary
 * @param {string} key - Translation key
 * @param {string} lang - Language code
 * @param {Object} dictionary - Translation dictionary object
 * @param {string} fallback - Fallback language (default: "en")
 * @returns {string} Translated text
 */
function translate(key, lang, dictionary, fallback = "en") {
        if (!dictionary) return key;
        
        const langKey = this.getLangKey(lang);
        
        if (dictionary[langKey] && dictionary[langKey][key]) {
            return dictionary[langKey][key];
        }
        
        if (dictionary[fallback] && dictionary[fallback][key]) {
            return dictionary[fallback][key];
        }
        
        return key;
}

/**
 * Standard message templates for common lens operations
 */
const standardMessages = {
        en: {
            noDataFound: "No relevant data found.",
            dataDetected: "Relevant information detected.",
            highlighting: "Highlighting relevant sections.",
            warningBanner: "⚠️ Warning",
            information: "ℹ️ Information",
            contactDoctor: "Contact your doctor for more information."
        },
        es: {
            noDataFound: "No se encontraron datos relevantes.",
            dataDetected: "Se detectó información relevante.",
            highlighting: "Resaltando secciones relevantes.",
            warningBanner: "⚠️ Advertencia",
            information: "ℹ️ Información",
            contactDoctor: "Contacte a su médico para más información."
        },
        pt: {
            noDataFound: "Nenhum dado relevante encontrado.",
            dataDetected: "Informação relevante detectada.",
            highlighting: "Destacando seções relevantes.",
            warningBanner: "⚠️ Aviso",
            information: "ℹ️ Informação",
            contactDoctor: "Contacte o seu médico para mais informações."
        },
        da: {
            noDataFound: "Ingen relevante data fundet.",
            dataDetected: "Relevant information fundet.",
            highlighting: "Fremhævning af relevante sektioner.",
            warningBanner: "⚠️ Advarsel",
            information: "ℹ️ Information",
            contactDoctor: "Kontakt din læge for mere information."
        },
        fr: {
            noDataFound: "Aucune donnée pertinente trouvée.",
            dataDetected: "Informations pertinentes détectées.",
            highlighting: "Mise en évidence des sections pertinentes.",
            warningBanner: "⚠️ Avertissement",
            information: "ℹ️ Information",
            contactDoctor: "Contactez votre médecin pour plus d'informations."
        },
        de: {
            noDataFound: "Keine relevanten Daten gefunden.",
            dataDetected: "Relevante Informationen erkannt.",
            highlighting: "Hervorhebung relevanter Abschnitte.",
            warningBanner: "⚠️ Warnung",
            information: "ℹ️ Information",
            contactDoctor: "Kontaktieren Sie Ihren Arzt für weitere Informationen."
        },
        it: {
            noDataFound: "Nessun dato rilevante trovato.",
            dataDetected: "Informazioni rilevanti rilevate.",
            highlighting: "Evidenziazione delle sezioni rilevanti.",
            warningBanner: "⚠️ Avviso",
            information: "ℹ️ Informazione",
            contactDoctor: "Contatta il tuo medico per ulteriori informazioni."
        },
        nl: {
            noDataFound: "Geen relevante gegevens gevonden.",
            dataDetected: "Relevante informatie gedetecteerd.",
            highlighting: "Relevante secties markeren.",
            warningBanner: "⚠️ Waarschuwing",
            information: "ℹ️ Informatie",
            contactDoctor: "Neem contact op met uw arts voor meer informatie."
        }
}

/**
 * Get standard messages for a language
 * @param {string} lang - Language code
 * @returns {Object} Standard messages object
 */
function getStandardMessages(lang) {
        const langKey = this.getLangKey(lang);
        return this.standardMessages[langKey] || this.standardMessages.en;
}

module.exports = {
    getLangKey,
    translate,
    getStandardMessages,
    standardMessages
};
