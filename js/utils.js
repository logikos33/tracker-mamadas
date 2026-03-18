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
 * Open medication modal
 */
function openMedicationModal() {
    console.log('Opening medication modal...');
    const modal = document.getElementById('medicationModal');
    console.log('Modal element:', modal);

    if (modal) {
        modal.style.display = 'flex';
        console.log('Modal display set to flex');
        // Focus on first input
        setTimeout(() => {
            const nameInput = document.getElementById('newMedicationName');
            if (nameInput) {
                nameInput.focus();
                console.log('Focused on name input');
            }
        }, 100);
    } else {
        console.error('Modal element not found!');
    }
}

/**
 * Close medication modal
 */
function closeMedicationModal() {
    const modal = document.getElementById('medicationModal');
    if (modal) {
        modal.style.display = 'none';
        // Reset form
        const form = document.getElementById('medicationForm');
        if (form) {
            form.reset();
        }
    }
}

/**
 * Show add medication modal (deprecated - use openMedicationModal)
 */
function showAddMedicationModal() {
    openMedicationModal();
}

/**
 * Handle medication form submission
 */
async function handleMedicationSubmit(event) {
    event.preventDefault();

    const name = document.getElementById('newMedicationName').value.trim();
    const dosage = document.getElementById('newMedicationDosage').value.trim();
    const frequency = document.getElementById('newMedicationFrequency').value.trim();
    const notes = document.getElementById('newMedicationNotes').value.trim();

    if (!name || !dosage) {
        app.showError('Por favor, preencha os campos obrigatórios.');
        return;
    }

    const result = await medicationsManager.createMedication({
        name: name,
        dosage: dosage,
        frequency: frequency || null,
        instructions: notes || null  // Changed from 'notes' to 'instructions'
    });

    if (result.success) {
        app.showSuccess('💊 Medicamento adicionado com sucesso!');
        closeMedicationModal();
        // Update medication select
        await medicationsManager.loadMedications();
        populateMedicationSelect(medicationsManager.getAllMedications());
    } else {
        app.showError('Erro ao adicionar medicamento: ' + result.error);
    }
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

