/**
 * Language Detector and Internationalization Helper
 * Utility functions for language detection and translations
 */

const LanguageHelper = {
    /**
     * Detect language from ePI bundle
     * @param {Object} epiBundle - ePI FHIR Bundle
     * @returns {string|null} Language code or null
     */
    detectLanguage(epiBundle) {
        if (!epiBundle) return null;

        // Try Composition.language first
        if (epiBundle.entry && Array.isArray(epiBundle.entry)) {
            for (const entry of epiBundle.entry) {
                const res = entry.resource;
                if (res?.resourceType === "Composition" && res.language) {
                    return res.language;
                }
            }
        }

        // Fallback to Bundle.language
        if (epiBundle.language) {
            return epiBundle.language;
        }

        return null;
    },

    /**
     * Get simplified language key from language code
     * @param {string} languageCode - Full language code (e.g., "pt-PT", "en-US")
     * @returns {string} Simplified language key (e.g., "pt", "en")
     */
    getLangKey(languageCode) {
        if (!languageCode) return "en";
        
        if (languageCode.startsWith("pt")) return "pt";
        if (languageCode.startsWith("es")) return "es";
        if (languageCode.startsWith("da")) return "da";
        if (languageCode.startsWith("fr")) return "fr";
        if (languageCode.startsWith("de")) return "de";
        if (languageCode.startsWith("it")) return "it";
        if (languageCode.startsWith("nl")) return "nl";
        
        return "en"; // Default to English
    },

    /**
     * Get translation from dictionary
     * @param {string} key - Translation key
     * @param {string} lang - Language code
     * @param {Object} dictionary - Translation dictionary object
     * @param {string} fallback - Fallback language (default: "en")
     * @returns {string} Translated text
     */
    translate(key, lang, dictionary, fallback = "en") {
        if (!dictionary) return key;
        
        const langKey = this.getLangKey(lang);
        
        if (dictionary[langKey] && dictionary[langKey][key]) {
            return dictionary[langKey][key];
        }
        
        if (dictionary[fallback] && dictionary[fallback][key]) {
            return dictionary[fallback][key];
        }
        
        return key;
    },

    /**
     * Standard message templates for common lens operations
     */
    standardMessages: {
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
    },

    /**
     * Get standard messages for a language
     * @param {string} lang - Language code
     * @returns {Object} Standard messages object
     */
    getStandardMessages(lang) {
        const langKey = this.getLangKey(lang);
        return this.standardMessages[langKey] || this.standardMessages.en;
    },

    /**
     * Pregnancy-specific messages
     */
    pregnancyMessages: {
        en: {
            childbearingAge: "You are seeing this because you are of childbearing age.",
            pregnant: "You are seeing this because you are pregnant.",
            breastfeeding: "You are seeing this because you are breastfeeding.",
            notRelevant: "This information is not relevant to you."
        },
        es: {
            childbearingAge: "Ves esto porque estás en edad fértil.",
            pregnant: "Ves esto porque estás embarazada.",
            breastfeeding: "Ves esto porque estás amamantando.",
            notRelevant: "Esta información no es relevante para ti."
        },
        pt: {
            childbearingAge: "Você está vendo isso porque está em idade fértil.",
            pregnant: "Você está vendo isso porque está grávida.",
            breastfeeding: "Você está vendo isso porque está amamentando.",
            notRelevant: "Esta informação não é relevante para você."
        },
        da: {
            childbearingAge: "Du ser dette, fordi du er i den fødedygtige alder.",
            pregnant: "Du ser dette, fordi du er gravid.",
            breastfeeding: "Du ser dette, fordi du ammer.",
            notRelevant: "Denne information er ikke relevant for dig."
        }
    },

    /**
     * Condition-specific messages
     */
    conditionMessages: {
        en: {
            report: (conditions) => conditions.length
                ? `You are seeing this because you have: ${conditions.join(", ")}.`
                : "No relevant conditions detected.",
            explanation: (conditions) => conditions.length
                ? `The following conditions were detected and highlighted: ${conditions.join(", ")}.`
                : "No conditions found in your health record."
        },
        es: {
            report: (conditions) => conditions.length
                ? `Ves esto porque tienes: ${conditions.join(", ")}.`
                : "No se detectaron condiciones relevantes.",
            explanation: (conditions) => conditions.length
                ? `Se detectaron y resaltaron las siguientes condiciones: ${conditions.join(", ")}.`
                : "No se encontraron condiciones en su historial de salud."
        },
        pt: {
            report: (conditions) => conditions.length
                ? `Você está vendo isso porque tem: ${conditions.join(", ")}.`
                : "Nenhuma condição relevante detectada.",
            explanation: (conditions) => conditions.length
                ? `As seguintes condições foram detectadas e destacadas: ${conditions.join(", ")}.`
                : "Nenhuma condição encontrada no seu histórico de saúde."
        },
        da: {
            report: (conditions) => conditions.length
                ? `Du ser dette, fordi du har: ${conditions.join(", ")}.`
                : "Ingen relevante tilstande fundet.",
            explanation: (conditions) => conditions.length
                ? `Følgende tilstande blev fundet og fremhævet: ${conditions.join(", ")}.`
                : "Ingen tilstande fundet i din journal."
        }
    },

    /**
     * Questionnaire-specific messages
     */
    questionnaireMessages: {
        en: {
            bannerWarning: "⚠️ This medication may cause high-risk side effects.",
            questionnaireLink: "Fill out safety questionnaire",
            fillQuestionnaire: "📝 Fill out safety questionnaire",
            linkAdded: "A link to a safety questionnaire has been added to help you assess if this medication is safe for you.",
            linkNotAdded: "Your profile does not match the conditions to add a questionnaire link."
        },
        es: {
            bannerWarning: "⚠️ Este medicamento puede causar efectos secundarios de alto riesgo.",
            questionnaireLink: "Rellenar cuestionario de seguridad",
            fillQuestionnaire: "📝 Rellenar cuestionario de seguridad",
            linkAdded: "Se ha añadido un enlace a un cuestionario de seguridad para ayudarle a evaluar si este medicamento es seguro para usted.",
            linkNotAdded: "Su perfil no coincide con las condiciones para añadir un enlace al cuestionario."
        },
        pt: {
            bannerWarning: "⚠️ Este medicamento pode causar efeitos secundários de alto risco.",
            questionnaireLink: "Preencher questionário de segurança",
            fillQuestionnaire: "📝 Preencher questionário de segurança",
            linkAdded: "Foi adicionado um link para um questionário de segurança para ajudá-lo a avaliar se este medicamento é seguro para você.",
            linkNotAdded: "Seu perfil não corresponde às condições para adicionar um link para o questionário."
        },
        da: {
            bannerWarning: "⚠️ Denne medicin kan forårsage alvorlige bivirkninger.",
            questionnaireLink: "Udfyld sikkerhedsspørgeskema",
            fillQuestionnaire: "📝 Udfyld sikkerhedsspørgeskema",
            linkAdded: "Der er tilføjet et link til et sikkerhedsspørgeskema for at hjælpe dig med at vurdere, om denne medicin er sikker for dig.",
            linkNotAdded: "Din profil matcher ikke betingelserne for at tilføje et spørgeskemalink."
        }
    },

    /**
     * Get pregnancy messages
     * @param {string} lang - Language code
     * @returns {Object} Pregnancy messages
     */
    getPregnancyMessages(lang) {
        const langKey = this.getLangKey(lang);
        return this.pregnancyMessages[langKey] || this.pregnancyMessages.en;
    },

    /**
     * Get condition messages
     * @param {string} lang - Language code
     * @returns {Object} Condition messages
     */
    getConditionMessages(lang) {
        const langKey = this.getLangKey(lang);
        return this.conditionMessages[langKey] || this.conditionMessages.en;
    },

    /**
     * Get questionnaire messages
     * @param {string} lang - Language code
     * @returns {Object} Questionnaire messages
     */
    getQuestionnaireMessages(lang) {
        const langKey = this.getLangKey(lang);
        return this.questionnaireMessages[langKey] || this.questionnaireMessages.en;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LanguageHelper;
}
