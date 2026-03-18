/**
 * ============================================================================
 * THEME MANAGEMENT - Tracker do Koda
 * ============================================================================
 * Gerencia temas de cores do aplicativo com persistência em localStorage
 *
 * @module theme
 * @author Tracker do Koda Team
 * @version 2.0.0
 * ============================================================================
 */

(function() {
    'use strict';

    // ============================================================================
    // CONSTANTS
    // ============================================================================

    /** Tema padrão do aplicativo */
    const DEFAULT_THEME = 'brown';

    /** Chave do localStorage para armazenar o tema */
    const STORAGE_KEY = 'theme';

    // ============================================================================
    // THEME DEFINITIONS
    // ============================================================================

    /**
     * Definições de temas disponíveis
     * Cada tema define cores CSS para personalização visual
     * @constant {Object<string, Object>}
     */
    const THEMES = {
        brown: {
            '--primary-color': '#8B6F47',
            '--secondary-color': '#A0826D',
            '--accent-color': '#D4A574',
            '--light-color': '#F5E6D3',
            '--dark-color': '#5D4E37',
            '--gradient-start': '#C4A484',
            '--gradient-end': '#8B7355'
        },
        blue: {
            '--primary-color': '#667eea',
            '--secondary-color': '#764ba2',
            '--accent-color': '#8860d6',
            '--light-color': '#e8eaf6',
            '--dark-color': '#4a4a6a',
            '--gradient-start': '#667eea',
            '--gradient-end': '#764ba2'
        },
        pink: {
            '--primary-color': '#f5576c',
            '--secondary-color': '#f093fb',
            '--accent-color': '#ff8a9d',
            '--light-color': '#fff0f3',
            '--dark-color': '#a6384a',
            '--gradient-start': '#f093fb',
            '--gradient-end': '#f5576c'
        },
        green: {
            '--primary-color': '#11998e',
            '--secondary-color': '#38ef7d',
            '--accent-color': '#20e6a8',
            '--light-color': '#e0f7f0',
            '--dark-color': '#0d7a73',
            '--gradient-start': '#11998e',
            '--gradient-end': '#38ef7d'
        },
        purple: {
            '--primary-color': '#8E2DE2',
            '--secondary-color': '#4A00E0',
            '--accent-color': '#a855f7',
            '--light-color': '#f3e8ff',
            '--dark-color': '#5c1db8',
            '--gradient-start': '#8E2DE2',
            '--gradient-end': '#4A00E0'
        }
    };

    // ============================================================================
    // THEME FUNCTIONS
    // ============================================================================

    /**
     * Aplica um tema ao documento
     * @param {string} themeName - Nome do tema a ser aplicado
     * @returns {boolean} True se aplicado com sucesso
     */
    function applyTheme(themeName) {
        const theme = THEMES[themeName];
        if (!theme) {
            console.warn(`Theme "${themeName}" not found`);
            return false;
        }

        const root = document.documentElement;
        for (const [property, value] of Object.entries(theme)) {
            root.style.setProperty(property, value);
        }

        return true;
    }

    /**
     * Obtém o tema salvo ou retorna o padrão
     * @returns {string} Nome do tema
     */
    function getSavedTheme() {
        return localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
    }

    /**
     * Salva o tema escolhido
     * @param {string} themeName - Nome do tema a salvar
     */
    function saveTheme(themeName) {
        if (!THEMES[themeName]) {
            console.warn(`Cannot save invalid theme: "${themeName}"`);
            return;
        }
        localStorage.setItem(STORAGE_KEY, themeName);
    }

    /**
     * Retorna lista de temas disponíveis
     * @returns {Array<string>} Nomes dos temas disponíveis
     */
    function getAvailableThemes() {
        return Object.keys(THEMES);
    }

    // ============================================================================
    // INITIALIZATION
    // ============================================================================

    /**
     * Inicializa o tema
     * Carrega o tema salvo ou usa o padrão, aplicando imediatamente
     */
    function init() {
        const savedTheme = getSavedTheme();

        // Aplica tema imediatamente (antes de renderizar)
        applyTheme(savedTheme);

        // Re-aplica quando DOM estiver carregado (evita flash)
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                applyTheme(savedTheme);
            });
        }
    }

    // ============================================================================
    // GLOBAL API
    // ============================================================================

    // Expõe API globalmente para uso em outras partes do app
    window.ThemeManager = {
        apply: applyTheme,
        save: saveTheme,
        getCurrent: getSavedTheme,
        getAvailable: getAvailableThemes,
        THEMES
    };

    // Inicializa tema imediatamente
    init();

})();

