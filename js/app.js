// Main App Module for Tracker do Koda
// Coordinates all modules and handles UI interactions

class App {
    constructor() {
        this.isInitialized = false;
        this.currentPage = 1;
        this.itemsPerPage = 10; // Itens por página
    }

    // Initialize the application
    async init() {
        if (this.isInitialized) return;

        try {
            // Initialize auth manager
            await authManager.init();

            // Check if user is authenticated
            if (!authManager.isAuthenticated()) {
                window.location.href = 'login.html';
                return;
            }

            // Initialize modules
            await feedsManager.init(authManager.client);
            await profileManager.init(authManager.client);
            await remindersManager.init(authManager.client);
            await medicationsManager.init(authManager.client);

            // Initialize charts
            chartsManager.init();

            // Setup UI
            this.setupUI();
            this.setupEventListeners();
            this.subscribeToDataChanges();

            // Update UI with initial data
            this.updateAll();

            this.isInitialized = true;
            console.log('App initialized successfully');
        } catch (error) {
            console.error('App initialization error:', error);
            this.showError('Erro ao inicializar o aplicativo. Por favor, recarregue a página.');
        }
    }

    // Setup UI elements
    setupUI() {
        // Update header with baby's name
        this.updateHeader();

        // Set current datetime in form
        this.setCurrentDateTime();

        // Update header nav
        this.setupHeaderNav();
    }

    // Setup event listeners
    setupEventListeners() {
        // Feed form submission
        const feedForm = document.getElementById('feedForm');
        if (feedForm) {
            feedForm.addEventListener('submit', (e) => this.handleFeedSubmit(e));
        }

        // Feed type change
        const feedType = document.getElementById('feedType');
        if (feedType) {
            feedType.addEventListener('change', (e) => {
                handleFeedTypeChange(e.target.value);
            });
        }

        // Period filter buttons
        const filterButtons = document.querySelectorAll('.period-filter button');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const days = parseInt(e.target.dataset.days);
                this.handlePeriodFilter(days, e.target);
            });
        });

        // Clear all data button
        const clearButton = document.querySelector('.btn-clear');
        if (clearButton) {
            clearButton.addEventListener('click', () => this.handleClearAll());
        }

        // Logout button
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => this.handleLogout());
        }
    }

    // Subscribe to data changes
    subscribeToDataChanges() {
        feedsManager.subscribe(() => this.updateAll());
        remindersManager.subscribe(() => this.updateRemindersList());
        medicationsManager.subscribe(() => {
            this.updateMedicationsList();
            this.updateMedicationLogs();
        });
    }

    // Update header with baby's name
    updateHeader() {
        const babyName = profileManager.getBabyName();
        const babyAge = profileManager.formatBabyAge();

        const headerTitle = document.querySelector('header h1');
        if (headerTitle) {
            headerTitle.textContent = `🧸 Tracker do Koda${babyName !== 'Seu Bebê' ? ' - ' + babyName : ''}`;
        }

        const headerSubtitle = document.querySelector('header p');
        if (headerSubtitle) {
            headerSubtitle.textContent = babyAge ?
                `Acompanhe os momentos especiais do seu bebê • ${babyAge}` :
                'Acompanhe os momentos especiais do seu bebê';
        }
    }

    // Setup header navigation
    setupHeaderNav() {
        const header = document.querySelector('header');
        if (!header) return;

        // Create nav if it doesn't exist
        let nav = header.querySelector('.header-nav');
        if (!nav) {
            nav = document.createElement('div');
            nav.className = 'header-nav';
            header.appendChild(nav);
        }

        // Clear existing buttons
        nav.innerHTML = '';

        // Add profile button
        const profileBtn = document.createElement('button');
        profileBtn.textContent = '⚙️ Perfil';
        profileBtn.onclick = () => window.location.href = 'profile.html';
        nav.appendChild(profileBtn);

        // Add logout button
        const logoutBtn = document.createElement('button');
        logoutBtn.id = 'logoutButton';
        logoutBtn.textContent = '🚪 Sair';
        nav.appendChild(logoutBtn);
    }

    // Set current datetime in form
    setCurrentDateTime() {
        const now = new Date();

        // Create a properly formatted local datetime string for datetime-local input
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        const localDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;

        const dateInput = document.getElementById('feedDate');
        if (dateInput) {
            dateInput.value = localDateTime;
        }
    }

    // Handle feed form submission
    async handleFeedSubmit(event) {
        event.preventDefault();

        const type = document.getElementById('feedType').value;
        const feedDateInput = document.getElementById('feedDate').value;

        // Convert local datetime to ISO string with timezone offset
        const localDate = new Date(feedDateInput);
        const feedDate = localDate.toISOString();

        let result;

        if (type === 'fralda') {
            // Handle diaper change
            const notes = document.getElementById('feedNotes')?.value || 'Troca de fralda';

            result = await feedsManager.createFeed({
                type: 'fralda',
                duration: 0,
                feed_date: feedDate,
                notes: notes
            });

            if (result.success) {
                this.showSuccess('👶 Fralda trocada com sucesso!');
                document.getElementById('feedForm').reset();
                this.setCurrentDateTime();
                handleFeedTypeChange('');
                this.updateDiaperStats();
            } else {
                this.showError('Erro ao registrar: ' + result.error);
            }
            return;
        }

        if (type === 'medicamento') {
            // Handle medication
            const medicationId = document.getElementById('medicationSelect').value;
            const dosageGiven = document.getElementById('medicationDosage').value;
            const notes = document.getElementById('feedNotes')?.value || '';

            if (!medicationId) {
                this.showError('Por favor, selecione um medicamento.');
                return;
            }

            // Get medication details
            const medication = medicationsManager.getMedicationById(medicationId);
            const combinedNotes = `${medication.name} - ${dosageGiven}${notes ? ' - ' + notes : ''}`;

            result = await feedsManager.createFeed({
                type: 'medicamento',
                duration: 0, // Medications don't have duration
                feed_date: feedDate,
                notes: combinedNotes
            });

            // Also log in medications
            if (result.success) {
                await medicationsManager.logMedication({
                    medication_id: medicationId,
                    dosage_given: dosageGiven,
                    log_date: feedDate,
                    notes: notes
                });
            }
        } else {
            // Handle regular feeds
            const duration = parseInt(document.getElementById('feedDuration').value);
            const notes = document.getElementById('feedNotes')?.value || '';

            result = await feedsManager.createFeed({
                type,
                duration,
                feed_date: feedDate,
                notes
            });
        }

        if (result.success) {
            const typeLabel = type === 'medicamento' ? 'Medicamento' :
                             type === 'materno' ? 'Momento de Amor' : 'Alimentação';
            this.showSuccess(`✓ ${typeLabel} registrado com sucesso!`);
            document.getElementById('feedForm').reset();
            this.setCurrentDateTime();
            // Reset fields visibility
            handleFeedTypeChange('');
        } else {
            this.showError('Erro ao registrar: ' + result.error);
        }
    }

    // Handle period filter change
    handlePeriodFilter(days, button) {
        // Update active state
        document.querySelectorAll('.period-filter button').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');

        // Update charts period
        chartsManager.setPeriod(days);
        this.updateCharts();
    }

    // Handle logout
    async handleLogout() {
        if (confirm('Tem certeza que deseja sair?')) {
            await authManager.signOut();
            // Cleanup
            remindersManager.destroy();
            window.location.href = 'login.html';
        }
    }

    // Handle clear all data
    async handleClearAll() {
        if (confirm('Tem certeza que deseja limpar TODOS os dados? Esta ação não pode ser desfeita.')) {
            const feeds = feedsManager.getAllFeeds();
            for (const feed of feeds) {
                await feedsManager.deleteFeed(feed.id);
            }
            this.showSuccess('Todos os dados foram limpos!');
        }
    }

    // Update all UI elements
    updateAll() {
        this.updateLastFeed();
        this.updateDashboard();
        this.updateHistory();
        this.updateCharts();
        this.updateRemindersList();
        this.updateDiaperStats();
        this.updateMedicationsList();
        this.updateMedicationLogs();
    }

    // Update last feed info
    updateLastFeed() {
        const container = document.getElementById('lastFeedContainer');
        const infoElement = document.getElementById('lastFeedInfo');

        if (!container || !infoElement) return;

        const lastFeed = feedsManager.getLastFoodFeed();

        console.log('=== UPDATE LAST FEED ===');
        console.log('Last feed:', lastFeed);
        console.log('Last feed date (ISO):', lastFeed?.feed_date);

        if (!lastFeed) {
            container.style.display = 'none';
            return;
        }

        const typeLabel = lastFeed.type === 'materno' ? '🤱 Leite Materno' : '🍼 Fórmula';
        const formattedDate = feedsManager.formatFeedDateCompact(lastFeed.feed_date);

        console.log('Type label:', typeLabel);
        console.log('Formatted date:', formattedDate);

        infoElement.textContent = `${typeLabel} - ${formattedDate}`;
        container.style.display = 'flex';
    }

    // Update dashboard statistics
    updateDashboard() {
        const todayStats = feedsManager.getTodayStatistics();
        const weekStats = feedsManager.getWeekStatistics();
        const monthStats = feedsManager.getMonthStatistics();

        // Update today stats
        const todayCount = document.getElementById('todayCount');
        const todayDuration = document.getElementById('todayDuration');
        const avgDuration = document.getElementById('avgDuration');

        if (todayCount) todayCount.textContent = todayStats.count;
        if (todayDuration) todayDuration.textContent = formatMinutesToHours(todayStats.totalDuration);
        if (avgDuration) avgDuration.textContent = formatMinutesToHours(todayStats.avgDuration);

        // Update distribution chart
        const todayFeeds = feedsManager.getTodayFeeds();
        chartsManager.updateDistributionChart(todayFeeds);

        // Update additional stats if elements exist
        this.updatePeriodStats(weekStats, 'week');
        this.updatePeriodStats(monthStats, 'month');

        // Update medications select
        populateMedicationSelect(medicationsManager.getAllMedications());
    }

    // Update period statistics
    updatePeriodStats(stats, period) {
        const countEl = document.getElementById(`${period}Count`);
        const durationEl = document.getElementById(`${period}Duration`);
        const avgEl = document.getElementById(`${period}Avg`);

        if (countEl) countEl.textContent = stats.count;
        if (durationEl) durationEl.textContent = formatMinutesToHours(stats.totalDuration);
        if (avgEl) avgEl.textContent = formatMinutesToHours(stats.avgDuration);
    }

    // Update history table
    updateHistory() {
        const container = document.getElementById('historyContent');
        if (!container) return;

        const feeds = feedsManager.getAllFeeds();

        if (feeds.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <p>Nenhum momento registrado ainda</p>
                    <p>Comece adicionando no formulário acima!</p>
                </div>
            `;
            this.updatePagination(0);
            return;
        }

        // Calculate pagination
        const totalPages = Math.ceil(feeds.length / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedFeeds = feeds.slice(startIndex, endIndex);

        const tableHTML = `
            <table class="history-table">
                <thead>
                    <tr>
                        <th>Data/Hora</th>
                        <th>Tipo</th>
                        <th>Duração/Dosagem</th>
                        <th>Notas</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${paginatedFeeds.map(feed => `
                        <tr>
                            <td data-label="Data/Hora">${feedsManager.formatFeedDate(feed.feed_date)}</td>
                            <td data-label="Tipo"><span class="type-badge ${
                                feed.type === FEED_TYPES.MATERNO ? 'type-materno' :
                                feed.type === FEED_TYPES.FORMULA ? 'type-formula' :
                                feed.type === 'fralda' ? 'type-fralda' : 'type-medicamento'
                            }">
                                ${getFeedTypeIcon(feed.type)} ${getFeedTypeLabel(feed.type)}
                            </span></td>
                            <td data-label="Duração/Dosagem">${
                                feed.type === 'medicamento' ? feed.notes :
                                feed.type === 'fralda' ? 'Troca registrada' :
                                formatMinutesToHours(feed.duration)
                            }</td>
                            <td data-label="Notas">${
                                feed.type === 'medicamento' ? (feed.dosage_given || '-') :
                                feed.type === 'fralda' ? (feed.notes || '-') :
                                (feed.notes || '-')
                            }</td>
                            <td data-label="Ações"><button class="btn-delete" onclick="app.deleteFeed('${feed.id}')">Excluir</button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        container.innerHTML = tableHTML;
        this.updatePagination(feeds.length);
    }

    // Update pagination controls
    updatePagination(totalItems) {
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const prevBtn = document.getElementById('prevPageBtn');
        const nextBtn = document.getElementById('nextPageBtn');
        const pageInfo = document.getElementById('paginationInfo');

        if (prevBtn) prevBtn.disabled = this.currentPage === 1;
        if (nextBtn) nextBtn.disabled = this.currentPage === totalPages || totalPages === 0;

        if (pageInfo) {
            const currentPageEl = pageInfo.querySelector('.current-page');
            const separatorEl = pageInfo.querySelector('.separator');
            const totalPagesEl = pageInfo.querySelector('.total-pages');

            if (currentPageEl) currentPageEl.textContent = this.currentPage;
            if (totalPagesEl) totalPagesEl.textContent = totalPages > 0 ? totalPages : 1;
        }
    }

    // Next page
    nextPage() {
        const feeds = feedsManager.getAllFeeds();
        const totalPages = Math.ceil(feeds.length / this.itemsPerPage);

        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.updateHistory();
        }
    }

    // Previous page
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updateHistory();
        }
    }

    // Delete feed

    // Update diaper statistics
    updateDiaperStats() {
        const feeds = feedsManager.getAllFeeds();
        const diaperFeeds = feeds.filter(f => f.type === 'fralda');

        // Today's diapers
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayDiapers = diaperFeeds.filter(f => {
            const feedDate = new Date(f.feed_date);
            return feedDate >= today && feedDate < tomorrow;
        });

        // Week diapers (last 7 days)
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);
        weekStart.setHours(0, 0, 0, 0);

        const weekDiapers = diaperFeeds.filter(f => {
            const feedDate = new Date(f.feed_date);
            return feedDate >= weekStart;
        });

        // Month diapers (last 30 days)
        const monthStart = new Date();
        monthStart.setDate(monthStart.getDate() - 30);
        monthStart.setHours(0, 0, 0, 0);

        const monthDiapers = diaperFeeds.filter(f => {
            const feedDate = new Date(f.feed_date);
            return feedDate >= monthStart;
        });

        // Calculate averages and trends
        const todayCountEl = document.getElementById('diaperTodayCount');
        const weekCountEl = document.getElementById('diaperWeekCount');
        const monthCountEl = document.getElementById('diaperMonthCount');
        const avgDayEl = document.getElementById('diaperAvgDay');

        if (todayCountEl) todayCountEl.textContent = todayDiapers.length;
        if (weekCountEl) weekCountEl.textContent = weekDiapers.length;
        if (monthCountEl) monthCountEl.textContent = monthDiapers.length;

        // Average per day (this week)
        const avgPerDay = Math.round(weekDiapers.length / 7);
        if (avgDayEl) avgDayEl.textContent = avgPerDay;

        // Hide trend elements
        const weekTrendEl = document.getElementById('diaperWeekTrend');
        const monthTrendEl = document.getElementById('diaperMonthTrend');
        if (weekTrendEl) weekTrendEl.style.display = 'none';
        if (monthTrendEl) monthTrendEl.style.display = 'none';
    }

    // Update charts
    updateCharts() {
        const period = chartsManager.getPeriod();
        const groupedData = feedsManager.getFeedsGroupedByDay(period);
        chartsManager.updateTemporalCharts(groupedData);
    }

    // Update reminders list
    updateRemindersList() {
        const container = document.getElementById('remindersContent');
        if (!container) return;

        const reminders = remindersManager.getAllReminders();

        if (reminders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Nenhum lembrete configurado</p>
                    <p>Adicione lembretes para ser notificado!</p>
                </div>
            `;
            return;
        }

        const listHTML = `
            <div class="reminders-list">
                ${reminders.map(reminder => `
                    <div class="reminder-item ${reminder.is_completed ? 'completed' : ''}">
                        <div class="reminder-checkbox">
                            <input type="checkbox"
                                   id="reminder-${reminder.id}"
                                   ${reminder.is_completed ? 'checked' : ''}
                                   onchange="app.toggleReminderCompletion('${reminder.id}')">
                            <label for="reminder-${reminder.id}"></label>
                        </div>
                        <div class="reminder-info">
                            <div class="reminder-time">${remindersManager.formatReminderDateTime(reminder.reminder_date, reminder.reminder_time)}</div>
                            <div class="reminder-label">${reminder.label}</div>
                        </div>
                        <div class="reminder-actions">
                            <button class="btn-small btn-toggle" onclick="app.toggleReminder('${reminder.id}')">
                                ${reminder.is_active ? '🔔' : '🔕'}
                            </button>
                            <button class="btn-small btn-delete-small" onclick="app.deleteReminder('${reminder.id}')">🗑️</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        container.innerHTML = listHTML;
    }

    // Update medications list
    updateMedicationsList() {
        const container = document.getElementById('medicationsContent');
        if (!container) return;

        const medications = medicationsManager.getAllMedications();

        if (medications.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Nenhum medicamento cadastrado</p>
                    <p>Use o formulário acima para adicionar medicamentos</p>
                </div>
            `;
            return;
        }

        const listHTML = `
            <div class="medications-grid">
                ${medications.map(med => `
                    <div class="medication-card">
                        <div class="medication-icon">💊</div>
                        <div class="medication-info">
                            <h4 class="medication-name">${med.name}</h4>
                            <div class="medication-details">
                                <span class="medication-dosage">📏 ${med.dosage}</span>
                                ${med.frequency ? `<span class="medication-frequency">⏰ ${med.frequency}</span>` : ''}
                            </div>
                            ${med.instructions ? `<p class="medication-instructions">📝 ${med.instructions}</p>` : ''}
                        </div>
                        <button class="btn-small btn-delete-small" onclick="app.deleteMedication('${med.id}')">🗑️</button>
                    </div>
                `).join('')}
            </div>
        `;

        container.innerHTML = listHTML;
    }

    // Update medication logs
    updateMedicationLogs() {
        const container = document.getElementById('medicationLogsContent');
        if (!container) return;

        const logs = medicationsManager.getAllLogs();

        if (logs.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="padding: 20px;">
                    <p>Nenhum registro de administração</p>
                    <p>Use o formulário acima para registrar administrações</p>
                </div>
            `;
            return;
        }

        const logsHTML = `
            <div class="medication-logs">
                ${logs.map(log => {
                    const medication = medicationsManager.getMedicationById(log.medication_id);
                    const medName = medication ? medication.name : 'Medicamento removido';
                    const medDosage = medication ? medication.dosage : '';

                    return `
                        <div class="log-entry">
                            <div class="log-icon">💊</div>
                            <div class="log-content">
                                <div class="log-medication">${medName}</div>
                                <div class="log-details">
                                    <span class="log-dosage">✅ ${log.dosage_given}</span>
                                    ${medDosage ? `<span class="log-concentration">(${medDosage})</span>` : ''}
                                </div>
                                <div class="log-date">${medicationsManager.formatLogDate(log.log_date)}</div>
                                ${log.notes ? `<div class="log-notes">📝 ${log.notes}</div>` : ''}
                            </div>
                            <button class="btn-small btn-delete-small" onclick="app.deleteMedicationLog('${log.id}')">🗑️</button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        container.innerHTML = logsHTML;
    }

    // Delete medication
    async deleteMedication(medicationId) {
        if (confirm('Tem certeza que deseja excluir este medicamento? Todos os registros de administração também serão excluídos.')) {
            const result = await medicationsManager.deleteMedication(medicationId);
            if (result.success) {
                this.showSuccess('Medicamento excluído com sucesso!');
            } else {
                this.showError('Erro ao excluir medicamento: ' + result.error);
            }
        }
    }

    // Delete medication log
    async deleteMedicationLog(logId) {
        if (confirm('Tem certeza que deseja excluir este registro?')) {
            const result = await medicationsManager.deleteLog(logId);
            if (result.success) {
                this.showSuccess('Registro excluído com sucesso!');
            } else {
                this.showError('Erro ao excluir registro: ' + result.error);
            }
        }
    }

    // Delete feed
    async deleteFeed(feedId) {
        if (confirm('Tem certeza que deseja excluir este registro?')) {
            const result = await feedsManager.deleteFeed(feedId);
            if (result.success) {
                this.showSuccess('Registro excluído com sucesso!');
                // Reset to first page if current page is empty
                const feeds = feedsManager.getAllFeeds();
                const totalPages = Math.ceil(feeds.length / this.itemsPerPage);
                if (this.currentPage > totalPages && this.currentPage > 1) {
                    this.currentPage--;
                }
                this.updateHistory();
            } else {
                this.showError('Erro ao excluir registro: ' + result.error);
            }
        }
    }

    // Toggle reminder
    async toggleReminder(reminderId) {
        await remindersManager.toggleReminder(reminderId);
    }

    // Toggle reminder completion
    async toggleReminderCompletion(reminderId) {
        await remindersManager.toggleReminderCompletion(reminderId);
    }

    // Delete reminder
    async deleteReminder(reminderId) {
        if (confirm('Tem certeza que deseja excluir este lembrete?')) {
            const result = await remindersManager.deleteReminder(reminderId);
            if (result.success) {
                this.showSuccess('Lembrete excluído com sucesso!');
            } else {
                this.showError('Erro ao excluir lembrete: ' + result.error);
            }
        }
    }

    // Show success message
    showSuccess(message) {
        const successMsg = document.getElementById('successMessage');
        if (successMsg) {
            successMsg.textContent = message;
            successMsg.style.display = 'block';
            setTimeout(() => {
                successMsg.style.display = 'none';
            }, 3000);
        }
    }

    // Show error message
    showError(message) {
        const errorEl = document.getElementById('errorMessage') || document.createElement('div');
        errorEl.id = 'errorMessage';
        errorEl.className = 'error-message';
        errorEl.textContent = message;
        errorEl.style.display = 'block';

        const container = document.querySelector('.container');
        if (container) {
            container.insertBefore(errorEl, container.firstChild);
            setTimeout(() => {
                errorEl.style.display = 'none';
            }, 5000);
        }
    }
}

// Create global app instance
const app = new App();

// Initialize app when DOM is ready (will be called from index.html)
function initializeApp() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            app.init();
        });
    } else {
        // DOM is already ready
        app.init();
    }
}
