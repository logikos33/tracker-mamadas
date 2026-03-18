// Utility Functions for Tracker de Mamadas

/**
 * Convert minutes to hours format (e.g., 90 -> "1h30min", 150 -> "2h30min")
 * @param {number} minutes - Minutes to convert
 * @returns {string} Formatted time string
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
 * Format duration for display in feeds
 * @param {number} minutes - Minutes to format
 * @param {string} type - Type of feed (materno, formula, medicamento)
 * @returns {string} Formatted duration
 */
function formatDuration(minutes, type = 'materno') {
    if (type === 'medicamento') {
        return minutes; // For medications, return the dosage as-is
    }
    return formatMinutesToHours(minutes);
}

/**
 * Add time to duration input
 * @param {number} minutes - Minutes to add
 */
function addDuration(minutes) {
    const input = document.getElementById('feedDuration');
    if (input) {
        const currentValue = parseInt(input.value) || 0;
        const newValue = currentValue + minutes;
        input.value = newValue;
    }
}

/**
 * Show/hide medication fields based on feed type
 * @param {string} type - Selected feed type
 */
function handleFeedTypeChange(type) {
    const durationGroup = document.getElementById('durationGroup');
    const medicationGroup = document.getElementById('medicationGroup');
    const dosageGroup = document.getElementById('dosageGroup');

    if (type === 'medicamento') {
        if (durationGroup) durationGroup.style.display = 'none';
        if (medicationGroup) medicationGroup.style.display = 'block';
        if (dosageGroup) dosageGroup.style.display = 'block';
        // Update required attribute
        const durationInput = document.getElementById('feedDuration');
        if (durationInput) durationInput.removeAttribute('required');
    } else if (type === 'fralda') {
        if (durationGroup) durationGroup.style.display = 'none';
        if (medicationGroup) medicationGroup.style.display = 'none';
        if (dosageGroup) dosageGroup.style.display = 'none';
        // Update required attribute
        const durationInput = document.getElementById('feedDuration');
        if (durationInput) durationInput.removeAttribute('required');
    } else {
        if (durationGroup) durationGroup.style.display = 'block';
        if (medicationGroup) medicationGroup.style.display = 'none';
        if (dosageGroup) dosageGroup.style.display = 'none';
        // Update required attribute
        const durationInput = document.getElementById('feedDuration');
        if (durationInput) durationInput.setAttribute('required', 'true');
    }
}

/**
 * Populate medication select dropdown
 * @param {Array} medications - Array of medication objects
 */
function populateMedicationSelect(medications) {
    const select = document.getElementById('medicationSelect');
    if (!select) return;

    // Clear existing options except first
    while (select.options.length > 1) {
        select.remove(1);
    }

    // Add medication options
    medications.forEach(med => {
        const option = document.createElement('option');
        option.value = med.id;
        option.textContent = `${med.name} (${med.dosage})`;
        select.appendChild(option);
    });
}

/**
 * Show add medication modal (to be implemented)
 */
function showAddMedicationModal() {
    const medicationName = prompt('Nome do medicamento:');
    if (!medicationName) return;

    const dosage = prompt('Dosagem (ex: 5ml, 1 gota, 10mg):');
    if (!dosage) return;

    const instructions = prompt('Instruções (opcional):');

    // Create medication
    medicationsManager.createMedication({
        name: medicationName,
        dosage: dosage,
        instructions: instructions
    }).then(result => {
        if (result.success) {
            app.showSuccess('Medicamento adicionado com sucesso!');
            // Reload medications and update select
            medicationsManager.loadMedications();
        } else {
            app.showError('Erro ao adicionar medicamento: ' + result.error);
        }
    });
}

/**
 * Get feed type icon
 * @param {string} type - Feed type
 * @returns {string} Icon emoji
 */
function getFeedTypeIcon(type) {
    switch (type) {
        case 'materno':
            return '🤱';
        case 'formula':
            return '🍼';
        case 'fralda':
            return '👶';
        case 'medicamento':
            return '💊';
        default:
            return '📝';
    }
}

/**
 * Get feed type label
 * @param {string} type - Feed type
 * @returns {string} Type label
 */
function getFeedTypeLabel(type) {
    switch (type) {
        case 'materno':
            return 'Leite Materno';
        case 'formula':
            return 'Fórmula';
        case 'fralda':
            return 'Troca de Fralda';
        case 'medicamento':
            return 'Medicamento';
        default:
            return type;
    }
}

// Expose functions globally for HTML onclick handlers
window.addDuration = addDuration;
window.handleFeedTypeChange = handleFeedTypeChange;
window.showAddMedicationModal = showAddMedicationModal;
window.getFeedTypeIcon = getFeedTypeIcon;
window.getFeedTypeLabel = getFeedTypeLabel;

/**
 * Quick diaper change registration
 */
async function quickDiaperChange() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const feedDate = now.toISOString().slice(0, 16);

    // Visual feedback
    const button = document.querySelector('.btn-quick-diaper');
    if (button) {
        button.classList.add('bounce');
        setTimeout(() => button.classList.remove('bounce'), 500);
    }

    // Create diaper change record
    const result = await feedsManager.createFeed({
        type: 'fralda',
        duration: 0,
        feed_date: feedDate,
        notes: 'Troca rápida de fralda'
    });

    if (result.success) {
        app.showSuccess('👶 Fralda trocada com sucesso!');
        app.updateDiaperStats();
    } else {
        app.showError('Erro ao registrar troca: ' + result.error);
    }
}

window.quickDiaperChange = quickDiaperChange;

