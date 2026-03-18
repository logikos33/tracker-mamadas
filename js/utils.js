/**
 * ============================================================================
 * UTILITIES - Tracker do Koda
 * ============================================================================
 * Funções utilitárias e helpers para o aplicativo
 *
 * @module utils
 * @author Tracker do Koda Team
 * @version 2.0.0
 * ============================================================================
 */

// ============================================================================
// TIME FORMATTING
// ============================================================================

/**
 * Converte minutos para formato de horas (ex: 90 -> "1h30min", 150 -> "2h30min")
 * @param {number} minutes - Minutos para converter
 * @returns {string} Tempo formatado
 *
 * @example
 * formatMinutesToHours(90)    // "1h30min"
 * formatMinutesToHours(120)   // "2h"
 * formatMinutesToHours(45)    // "45min"
 * formatMinutesToHours(0)     // "0min"
 */
function formatMinutesToHours(minutes) {
    if (minutes === 0) return '0min';

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) {
        return `${remainingMinutes}min`;
    } else if (remainingMinutes === 0) {
        return `${hours}h`;
    } else {
        return `${hours}h${remainingMinutes}min`;
    }
}

/**
 * Formata duração para exibição em feeds
 * @param {number} minutes - Minutos para formatar
 * @param {string} type - Tipo de feed (materno, formula, medicamento)
 * @returns {string} Duração formatada
 */
function formatDuration(minutes, type = 'materno') {
    if (type === 'medicamento') {
        return minutes; // Para medicamentos, retorna a dosagem como está
    }
    return formatMinutesToHours(minutes);
}

// ============================================================================
// DOM HELPERS
// ============================================================================

/**
 * Adiciona tempo ao input de duração
 * @param {number} minutes - Minutos para adicionar
 */
function addDuration(minutes) {
    const input = document.getElementById('feedDuration');
    if (!input) return;

    const currentValue = parseInt(input.value) || 0;
    const newValue = currentValue + minutes;
    input.value = newValue;
}

/**
 * Alterna visibilidade dos campos baseado no tipo de alimentação
 * @param {string} type - Tipo selecionado
 */
function handleFeedTypeChange(type) {
    const durationGroup = document.getElementById('durationGroup');
    const medicationGroup = document.getElementById('medicationGroup');
    const dosageGroup = document.getElementById('dosageGroup');
    const durationInput = document.getElementById('feedDuration');

    // Reset todos para oculto primeiro
    if (durationGroup) durationGroup.style.display = 'none';
    if (medicationGroup) medicationGroup.style.display = 'none';
    if (dosageGroup) dosageGroup.style.display = 'none';

    // Mostra campos apropriados baseado no tipo
    switch (type) {
        case 'medicamento':
            if (medicationGroup) medicationGroup.style.display = 'block';
            if (dosageGroup) dosageGroup.style.display = 'block';
            if (durationInput) durationInput.removeAttribute('required');
            break;

        case 'fralda':
            // Nenhum campo adicional necessário
            if (durationInput) durationInput.removeAttribute('required');
            break;

        case 'materno':
        case 'formula':
        default:
            if (durationGroup) durationGroup.style.display = 'block';
            if (durationInput) durationInput.setAttribute('required', 'true');
            break;
    }
}

/**
 * Popula dropdown de medicamentos
 * @param {Array<Object>} medications - Array de objetos de medicamentos
 */
function populateMedicationSelect(medications) {
    const select = document.getElementById('medicationSelect');
    if (!select) return;

    // Limpa opções existentes exceto a primeira
    while (select.options.length > 1) {
        select.remove(1);
    }

    // Adiciona opções de medicamentos
    medications.forEach(med => {
        const option = document.createElement('option');
        option.value = med.id;
        option.textContent = `${med.name} (${med.dosage})`;
        select.appendChild(option);
    });
}

// ============================================================================
// MODAL MANAGEMENT
// ============================================================================

/**
 * Abre modal de medicamento e foca no primeiro input
 */
function openMedicationModal() {
    const modal = document.getElementById('medicationModal');
    if (!modal) {
        console.error('Modal element not found');
        return;
    }

    modal.style.display = 'flex';

    // Foca no primeiro input após pequeno delay
    setTimeout(() => {
        const nameInput = document.getElementById('newMedicationName');
        if (nameInput) {
            nameInput.focus();
        }
    }, 100);
}

/**
 * Fecha modal de medicamento e reseta formulário
 */
function closeMedicationModal() {
    const modal = document.getElementById('medicationModal');
    if (!modal) return;

    modal.style.display = 'none';

    // Reseta formulário
    const form = document.getElementById('medicationForm');
    if (form) {
        form.reset();
    }
}

/**
 * Manipula submissão do formulário de medicamento
 * @async
 * @param {Event} event - Evento de submissão do formulário
 */
async function handleMedicationSubmit(event) {
    event.preventDefault();

    // Coleta dados do formulário
    const name = document.getElementById('newMedicationName').value.trim();
    const dosage = document.getElementById('newMedicationDosage').value.trim();
    const frequency = document.getElementById('newMedicationFrequency').value.trim();
    const notes = document.getElementById('newMedicationNotes').value.trim();

    // Valida campos obrigatórios
    if (!name || !dosage) {
        app.showError('Por favor, preencha os campos obrigatórios.');
        return;
    }

    // Cria medicamento
    const result = await medicationsManager.createMedication({
        name,
        dosage,
        frequency: frequency || null,
        instructions: notes || null
    });

    // Processa resultado
    if (result.success) {
        app.showSuccess('💊 Medicamento adicionado com sucesso!');
        closeMedicationModal();
        await medicationsManager.loadMedications();
        populateMedicationSelect(medicationsManager.getAllMedications());
    } else {
        app.showError(`Erro ao adicionar medicamento: ${result.error}`);
    }
}

// ============================================================================
// FEED TYPE HELPERS
// ============================================================================

/**
 * Mapa de ícones por tipo de alimentação
 * @constant {Object<string, string>}
 */
const FEED_ICONS = {
    materno: '🤱',
    formula: '🍼',
    fralda: '👶',
    medicamento: '💊'
};

/**
 * Mapa de labels por tipo de alimentação
 * @constant {Object<string, string>}
 */
const FEED_LABELS = {
    materno: 'Leite Materno',
    formula: 'Fórmula',
    fralda: 'Troca de Fralda',
    medicamento: 'Medicamento'
};

/**
 * Retorna ícone para tipo de alimentação
 * @param {string} type - Tipo de alimentação
 * @returns {string} Emoji do ícone
 */
function getFeedTypeIcon(type) {
    return FEED_ICONS[type] || '📝';
}

/**
 * Retorna label para tipo de alimentação
 * @param {string} type - Tipo de alimentação
 * @returns {string} Label descritiva
 */
function getFeedTypeLabel(type) {
    return FEED_LABELS[type] || type;
}

// ============================================================================
// QUICK ACTIONS
// ============================================================================

/**
 * Registro rápido de troca de fralda
 * @async
 */
async function quickDiaperChange() {
    const feedDate = new Date().toISOString();

    // Feedback visual
    const button = document.querySelector('.btn-quick-diaper');
    if (button) {
        button.classList.add('bounce');
        setTimeout(() => button.classList.remove('bounce'), 500);
    }

    // Cria registro
    const result = await feedsManager.createFeed({
        type: 'fralda',
        duration: 0,
        feed_date: feedDate,
        notes: 'Troca rápida de fralda'
    });

    // Processa resultado
    if (result.success) {
        app.showSuccess('👶 Fralda trocada com sucesso!');
        app.updateDiaperStats();
    } else {
        app.showError(`Erro ao registrar troca: ${result.error}`);
    }
}

// ============================================================================
// GLOBAL EXPORTS
// ============================================================================

// Expõe funções globalmente para handlers HTML
window.addDuration = addDuration;
window.handleFeedTypeChange = handleFeedTypeChange;
window.openMedicationModal = openMedicationModal;
window.closeMedicationModal = closeMedicationModal;
window.handleMedicationSubmit = handleMedicationSubmit;
window.getFeedTypeIcon = getFeedTypeIcon;
window.getFeedTypeLabel = getFeedTypeLabel;
window.quickDiaperChange = quickDiaperChange;
