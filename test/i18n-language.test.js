/**
 * Tests for Language and i18n Utilities
 */

const {
    getLangKey,
    translate,
    getStandardMessages,
    standardMessages
} = require('../src/i18n/language');

describe('Language and i18n Utilities', () => {
    
    describe('getLangKey', () => {
        
        test('should return simplified language keys', () => {
            expect(getLangKey('pt-PT')).toBe('pt');
            expect(getLangKey('pt-BR')).toBe('pt');
            expect(getLangKey('es-ES')).toBe('es');
            expect(getLangKey('en-US')).toBe('en');
            expect(getLangKey('en-GB')).toBe('en');
        });
        
        test('should handle various European languages', () => {
            expect(getLangKey('da-DK')).toBe('da');
            expect(getLangKey('fr-FR')).toBe('fr');
            expect(getLangKey('de-DE')).toBe('de');
            expect(getLangKey('it-IT')).toBe('it');
            expect(getLangKey('nl-NL')).toBe('nl');
        });
        
        test('should default to English for unknown languages', () => {
            expect(getLangKey('xx-XX')).toBe('en');
            expect(getLangKey('unknown')).toBe('en');
        });
        
        test('should handle null/undefined', () => {
            expect(getLangKey(null)).toBe('en');
            expect(getLangKey(undefined)).toBe('en');
            expect(getLangKey('')).toBe('en');
        });
        
        test('should handle language codes without region', () => {
            expect(getLangKey('pt')).toBe('pt');
            expect(getLangKey('es')).toBe('es');
            expect(getLangKey('en')).toBe('en');
        });
    });
    
    describe('translate', () => {
        
        test('should translate keys from dictionary', () => {
            const dictionary = {
                en: {
                    greeting: 'Hello',
                    goodbye: 'Goodbye'
                },
                pt: {
                    greeting: 'Olá',
                    goodbye: 'Adeus'
                }
            };
            
            expect(translate('greeting', 'en', dictionary)).toBe('Hello');
            expect(translate('greeting', 'pt', dictionary)).toBe('Olá');
        });
        
        test('should use fallback language when key not found', () => {
            const dictionary = {
                en: {
                    greeting: 'Hello'
                },
                pt: {
                    other: 'Outro'
                }
            };
            
            expect(translate('greeting', 'pt', dictionary, 'en')).toBe('Hello');
        });
        
        test('should return key when translation not found', () => {
            const dictionary = {
                en: {
                    greeting: 'Hello'
                }
            };
            
            expect(translate('unknown-key', 'en', dictionary)).toBe('unknown-key');
        });
        
        test('should handle language variants', () => {
            const dictionary = {
                en: {
                    greeting: 'Hello'
                },
                pt: {
                    greeting: 'Olá'
                }
            };
            
            expect(translate('greeting', 'pt-PT', dictionary)).toBe('Olá');
            expect(translate('greeting', 'en-US', dictionary)).toBe('Hello');
        });

        test('should handle null/undefined dictionary', () => {
            expect(translate('greeting', 'en', null)).toBe('greeting');
            expect(translate('greeting', 'en', undefined)).toBe('greeting');
        });
    });
});
