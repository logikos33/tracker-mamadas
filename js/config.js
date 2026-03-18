/**
 * ============================================================================
 * CONFIGURAÇÕES GLOBAIS - Tracker do Koda
 * ============================================================================
 * Centraliza todas as constantes e configurações do aplicativo
 *
 * @module config
 * @author Tracker do Koda Team
 * @version 2.0.0
 * ============================================================================
 */

// ============================================================================
// SUPABASE CONFIGURATION
// ============================================================================

/**
 * Credenciais do Supabase
 * @constant {Object}
 * @property {string} url - URL do projeto Supabase
 * @property {string} anonKey - Chave pública anônima
 *
 * ⚠️ IMPORTANTE: Para obter suas credenciais:
 * 1. Acesse https://supabase.com
 * 2. Crie um projeto ou selecione um existente
 * 3. Vá em Settings → API
 * 4. Copie a URL e a anon public key
 */
const SUPABASE_CONFIG = {
    url: 'https://kjchwkftkdiuhqisifbm.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqY2h3a2Z0a2RpdWhxaXNpZmJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4Mzk2NjcsImV4cCI6MjA4OTQxNTY2N30.9ZS8hu1WXnQ6kIQAf6zzLJpbfEk1-xkxq94AM3x7gPY'
};

// ============================================================================
// DATABASE TABLES
// ============================================================================

/**
 * Nomes das tabelas no banco de dados
 * @constant {Object}
 * @property {string} PROFILES - Tabela de perfis de usuários
 * @property {string} FEEDS - Tabela de alimentações/registros
 * @property {string} REMINDERS - Tabela de lembretes
 * @property {string} MEDICATIONS - Tabela de medicamentos cadastrados
 * @property {string} MEDICATION_LOGS - Tabela de histórico de medicamentos
 */
const TABLES = {
    PROFILES: 'profiles',
    FEEDS: 'feeds',
    REMINDERS: 'reminders',
    MEDICATIONS: 'medications',
    MEDICATION_LOGS: 'medication_logs'
};

// ============================================================================
// FEED TYPES ENUM
// ============================================================================

/**
 * Tipos de registros de alimentação/cuidado
 * @constant {Object}
 * @property {string} MATERNO - Leite materno
 * @property {string} FORMULA - Fórmula infantil
 * @property {string} FRALDA - Troca de fralda
 * @property {string} MEDICAMENTO - Medicamento administrado
 */
const FEED_TYPES = {
    MATERNO: 'materno',
    FORMULA: 'formula',
    FRALDA: 'fralda',
    MEDICAMENTO: 'medicamento'
};

// ============================================================================
// REMINDER CONFIGURATION
// ============================================================================

/**
 * Configurações padrão para lembretes
 * @constant {Object}
 * @property {number} CHECK_INTERVAL - Intervalo de verificação (ms)
 * @property {string} NOTIFICATION_PERMISSION - Permissão padrão de notificação
 */
const REMINDER_DEFAULTS = {
    CHECK_INTERVAL: 60000, // Verificar a cada minuto (60.000ms)
    NOTIFICATION_PERMISSION: 'default'
};

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Valida se as configurações do Supabase estão presentes
 * @returns {boolean} True se configurações são válidas
 */
function validateConfig() {
    return !!(SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey);
}

// Log warning se config inválida
if (!validateConfig()) {
    console.error('⚠️ SUPABASE_CONFIG inválida! Verifique o arquivo js/config.js');
}

