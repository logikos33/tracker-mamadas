/**
 * ============================================================================
 * DEMO MODE CONFIGURATION - Tracker do Koda
 * ============================================================================
 * Configurações para o modo de demonstração (sem autenticação)
 *
 * ⚠️ MODO DEMO:
 * - Usuário pode usar o app sem login
 * - Dados são compartilhados entre todos os usuários demo
 * - Dados podem ser limpos a qualquer momento
 * - Para uso pessoal, crie uma conta!
 *
 * @module config-demo
 * @version 2.0.0
 * ============================================================================
 */

// ============================================================================
// DEMO USER CREDENTIALS
// ============================================================================

/**
 * Credenciais do usuário demo
 * Este usuário é compartilhado por todos os visitantes do modo demo
 *
 * ⚠️ IMPORTANTE: Crie este usuário manualmente no Supabase:
 * 1. Acesse Authentication → Users
 * 2. Clique "Add user" → "Create new user"
 * 3. Email: demo@tracker-koda.com
 * 4. Password: demo123456
 * 5. Auto Confirm User: ✅ ON
 * 6. Clique em "Create user"
 *
 * OU execute o script: database/criar-usuario-demo.sql
 */
const DEMO_USER = {
    email: 'demo@tracker-koda.com',
    password: 'demo123456', // ⚠️ Senha pública do modo demo
    name: 'Visitante Demo',
    isDemo: true
};

// ============================================================================
// DEMO MODE SETTINGS
// ============================================================================

/**
 * Configurações do modo demo
 */
const DEMO_CONFIG = {
    enabled: true,                    // Modo demo habilitado
    autoLogin: true,                  // Login automático
    showWarning: true,                // Mostrar aviso de demo
    warningTimeout: 5000,             // Tempo para fechar aviso (ms)
    dataRetentionDays: 7,             // Dias para reter dados demo
    allowSignup: true,                // Permitir criar conta real
    maxFeedsPerDay: 50                // Limite de registros por dia (spam)
};

// ============================================================================
// DEMO MESSAGES
// ============================================================================

/**
 * Mensagens do modo demo
 */
const DEMO_MESSAGES = {
    welcome: '🎮 Você está no MODO DEMO! Dados são temporários e compartilhados.',
    warning: '⚠️ Dados demo podem ser limpos a qualquer momento. Crie uma conta para salvar seus dados!',
    loginSuccess: '✅ Entrou no modo demo. Divirta-se explorando!',
    logout: '👋 Saindo do modo demo...',
    dataLimit: '⚠️ Limite diário atingido. Crie uma conta para uso ilimitado!'
};

// ============================================================================
// DEMO HELPERS
// ============================================================================

/**
 * Verifica se está em modo demo
 * @returns {boolean}
 */
function isDemoMode() {
    return DEMO_CONFIG.enabled && localStorage.getItem('isDemoMode') === 'true';
}

/**
 * Define modo demo
 * @param {boolean} enabled
 */
function setDemoMode(enabled) {
    if (enabled) {
        localStorage.setItem('isDemoMode', 'true');
    } else {
        localStorage.removeItem('isDemoMode');
    }
}

/**
 * Retorna mensagem de boas-vindas demo
 * @returns {string}
 */
function getDemoWelcomeMessage() {
    return DEMO_MESSAGES.welcome;
}

/**
 * Mostra aviso de demo no app
 */
function showDemoWarning() {
    if (!DEMO_CONFIG.showWarning) return;

    // Cria elemento de aviso
    const warning = document.createElement('div');
    warning.className = 'demo-warning';
    warning.innerHTML = `
        <div class="demo-warning-content">
            <span class="demo-warning-icon">🎮</span>
            <div class="demo-warning-text">
                <strong>MODO DEMO</strong>
                <p>Dados são temporários. <a href="register.html">Crie uma conta grátis!</a></p>
            </div>
            <button class="demo-warning-close" onclick="this.parentElement.parentElement.remove()">✕</button>
        </div>
    `;

    // Insere no topo do container
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(warning, container.firstChild);
    }

    // Auto-remove após timeout
    setTimeout(() => {
        if (warning.parentElement) {
            warning.remove();
        }
    }, DEMO_CONFIG.warningTimeout);
}

// ============================================================================
// GLOBAL EXPORTS
// ============================================================================

// Expõe API globalmente para uso em outras partes do app
window.DemoConfig = {
    ...DEMO_CONFIG,
    user: DEMO_USER,
    messages: DEMO_MESSAGES,
    isDemo: isDemoMode,
    setMode: setDemoMode,
    getWelcomeMessage: getDemoWelcomeMessage,
    showWarning: showDemoWarning
};
