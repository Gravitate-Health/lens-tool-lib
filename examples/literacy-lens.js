/**
 * Example: Persona Vector Literacy-Based Lens
 * 
 * This lens demonstrates how to use Persona Vector dimensions to adapt
 * content based on patient's health literacy and digital literacy levels.
 */

const {
    getHealthLiteracy,
    getDigitalLiteracy,
    getEmployment,
    getAllDimensions,
    getDimensionsSummary,
    DIMENSION_CODES,
    getLanguage
} = require('@gravitate-health/lens-tool-lib');

/**
 * Main enhance function - adapts content based on literacy levels
 */
async function enhance() {
    console.log('\n=== Persona Vector Literacy-Based Lens ===\n');
    
    // Get overall summary of persona dimensions
    const summary = getDimensionsSummary(pv);
    console.log('Persona Vector Summary:');
    console.log(`- Subject: ${summary.subject}`);
    console.log(`- Total Dimensions: ${summary.totalDimensions}`);
    console.log(`- Available Codes: ${summary.dimensionCodes.join(', ')}`);
    
    // Get specific literacy dimensions
    const healthLiteracy = getHealthLiteracy(pv);
    const digitalLiteracy = getDigitalLiteracy(pv);
    const employment = getEmployment(pv);
    
    console.log('\nKey Dimensions:');
    if (healthLiteracy) {
        console.log(`- Health Literacy: ${healthLiteracy.value} (${healthLiteracy.valueType})`);
    }
    if (digitalLiteracy) {
        console.log(`- Digital Literacy: ${digitalLiteracy.value} (${digitalLiteracy.valueType})`);
    }
    if (employment) {
        console.log(`- Employment: ${employment.valueCodes?.[0]?.display || employment.value}`);
    }
    
    // Adapt content based on health literacy
    let adaptedHtml = context.html;
    
    if (healthLiteracy && healthLiteracy.value) {
        const literacyValue = healthLiteracy.value.toLowerCase();
        
        if (literacyValue.includes('low')) {
            console.log('\n📚 Adapting for LOW health literacy:');
            console.log('- Simplifying medical terminology');
            console.log('- Adding explanatory notes');
            console.log('- Highlighting critical information');
            
            // In a real lens, you would:
            // - Replace complex medical terms with simpler alternatives
            // - Add tooltips or explanatory notes
            // - Highlight the most important information
            adaptedHtml = `<!-- LOW HEALTH LITERACY MODE -->\n${adaptedHtml}`;
        }
        else if (literacyValue.includes('medium')) {
            console.log('\n📖 Adapting for MEDIUM health literacy:');
            console.log('- Balanced medical terminology');
            console.log('- Some explanatory context');
            
            adaptedHtml = `<!-- MEDIUM HEALTH LITERACY MODE -->\n${adaptedHtml}`;
        }
        else if (literacyValue.includes('high')) {
            console.log('\n📕 Adapting for HIGH health literacy:');
            console.log('- Full medical terminology');
            console.log('- Detailed technical information');
            
            adaptedHtml = `<!-- HIGH HEALTH LITERACY MODE -->\n${adaptedHtml}`;
        }
    }
    
    // Adapt based on digital literacy
    if (digitalLiteracy && digitalLiteracy.value) {
        const digitalValue = digitalLiteracy.value.toLowerCase();
        
        if (digitalValue.includes('high')) {
            console.log('\n💻 High digital literacy detected:');
            console.log('- Can add interactive features');
            console.log('- Can use advanced UI components');
            console.log('- Can link to digital resources');
        }
    }
    
    // Example: Get all numeric dimensions
    const allDimensions = getAllDimensions(context.pv);
    const numericDimensions = allDimensions.filter(d => 
        d.valueType === 'Integer' || d.valueType === 'Quantity'
    );
    
    if (numericDimensions.length > 0) {
        console.log('\nNumeric Dimensions:');
        numericDimensions.forEach(dim => {
            console.log(`- ${dim.dimensionCode}: ${dim.value} ${dim.unit || ''}`);
        });
    }
    
    return adaptedHtml;
}

/**
 * Provide explanation in multiple languages
 */
async function explanation() {
    const lang = getLanguage(epi) || 'en'; // This could be dynamically determined based on user preferences
    const translations = {
        en: "This lens adapts content based on your health literacy and digital literacy levels to make information easier to understand.",
        es: "Este lente adapta el contenido según sus niveles de alfabetización en salud y digital para facilitar la comprensión de la información.",
        pt: "Esta lente adapta o conteúdo com base nos seus níveis de literacia em saúde e digital para facilitar a compreensão da informação."
    };
    
    return translations[lang] || translations.en;
}

module.exports = {
    enhance,
    getSpecification,
    explanation
};

// Example usage (for testing)
if (require.main === module) {
    const pvFixture = require('../test/fixtures/pv.json');
    
    const mockContext = {
        pv: pvFixture,
        html: '<div>Sample ePI content</div>',
        epi: {},
        ips: {}
    };
    
    enhance(mockContext).then(result => {
        console.log('\n=== Enhanced HTML ===');
        console.log(result.substring(0, 200) + '...');
    }).catch(err => {
        console.error('Error:', err);
    });
}
