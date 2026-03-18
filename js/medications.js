// Medications Module for Tracker do Koda
// Manages medications, logs, and reminders

class MedicationsManager {
    constructor() {
        this.client = null;
        this.medications = [];
        this.logs = [];
        this.listeners = [];
    }

    // Initialize with Supabase client
    async init(supabaseClient) {
        this.client = supabaseClient;
        await this.loadMedications();
        await this.loadLogs();
    }

    // Subscribe to data changes
    subscribe(callback) {
        this.listeners.push(callback);
    }

    // Notify all listeners
    notifyListeners() {
        this.listeners.forEach(callback => callback({ medications: this.medications, logs: this.logs }));
    }

    // Load all medications for current user
    async loadMedications() {
        try {
            const { data: { user: currentUser }, error: userError } = await this.client.auth.getUser();

            if (userError || !currentUser) {
                throw new Error('User not authenticated');
            }

            const { data, error } = await this.client
                .from(TABLES.MEDICATIONS)
                .select('*')
                .eq('user_id', currentUser.id)
                .order('name', { ascending: true });

            if (error) throw error;

            this.medications = data || [];
            this.notifyListeners();
            return { success: true, data: this.medications };
        } catch (error) {
            console.error('Load medications error:', error);
            return { success: false, error: error.message };
        }
    }

    // Create a new medication
    async createMedication(medicationData) {
        try {
            const { data: { user: currentUser }, error: userError } = await this.client.auth.getUser();

            if (userError || !currentUser) {
                throw new Error('User not authenticated');
            }

            const newMedication = {
                user_id: currentUser.id,
                name: medicationData.name,
                dosage: medicationData.dosage,
                frequency: medicationData.frequency || null,
                instructions: medicationData.instructions || null
            };

            const { data, error } = await this.client
                .from(TABLES.MEDICATIONS)
                .insert([newMedication])
                .select()
                .single();

            if (error) throw error;

            this.medications.push(data);
            this.medications.sort((a, b) => a.name.localeCompare(b.name));
            this.notifyListeners();

            return { success: true, data };
        } catch (error) {
            console.error('Create medication error:', error);
            return { success: false, error: error.message };
        }
    }

    // Update a medication
    async updateMedication(medicationId, medicationData) {
        try {
            const { data: { user: currentUser }, error: userError } = await this.client.auth.getUser();

            if (userError || !currentUser) {
                throw new Error('User not authenticated');
            }

            const updates = {};
            if (medicationData.name !== undefined) updates.name = medicationData.name;
            if (medicationData.dosage !== undefined) updates.dosage = medicationData.dosage;
            if (medicationData.frequency !== undefined) updates.frequency = medicationData.frequency;
            if (medicationData.instructions !== undefined) updates.instructions = medicationData.instructions;

            const { data, error } = await this.client
                .from(TABLES.MEDICATIONS)
                .update(updates)
                .eq('id', medicationId)
                .eq('user_id', currentUser.id)
                .select()
                .single();

            if (error) throw error;

            const index = this.medications.findIndex(m => m.id === medicationId);
            if (index !== -1) {
                this.medications[index] = data;
                this.medications.sort((a, b) => a.name.localeCompare(b.name));
                this.notifyListeners();
            }

            return { success: true, data };
        } catch (error) {
            console.error('Update medication error:', error);
            return { success: false, error: error.message };
        }
    }

    // Delete a medication
    async deleteMedication(medicationId) {
        try {
            const { data: { user: currentUser }, error: userError } = await this.client.auth.getUser();

            if (userError || !currentUser) {
                throw new Error('User not authenticated');
            }

            const { error } = await this.client
                .from(TABLES.MEDICATIONS)
                .delete()
                .eq('id', medicationId)
                .eq('user_id', currentUser.id);

            if (error) throw error;

            this.medications = this.medications.filter(m => m.id !== medicationId);
            this.notifyListeners();

            return { success: true };
        } catch (error) {
            console.error('Delete medication error:', error);
            return { success: false, error: error.message };
        }
    }

    // Load medication logs
    async loadLogs() {
        try {
            const { data: { user: currentUser }, error: userError } = await this.client.auth.getUser();

            if (userError || !currentUser) {
                throw new Error('User not authenticated');
            }

            const { data, error } = await this.client
                .from(TABLES.MEDICATION_LOGS)
                .select('*')
                .eq('user_id', currentUser.id)
                .order('log_date', { ascending: false });

            if (error) throw error;

            this.logs = data || [];
            this.notifyListeners();
            return { success: true, data: this.logs };
        } catch (error) {
            console.error('Load logs error:', error);
            return { success: false, error: error.message };
        }
    }

    // Log medication usage
    async logMedication(logData) {
        try {
            const { data: { user: currentUser }, error: userError } = await this.client.auth.getUser();

            if (userError || !currentUser) {
                throw new Error('User not authenticated');
            }

            const newLog = {
                user_id: currentUser.id,
                medication_id: logData.medication_id,
                dosage_given: logData.dosage_given,
                log_date: logData.log_date,
                notes: logData.notes || null
            };

            const { data, error } = await this.client
                .from(TABLES.MEDICATION_LOGS)
                .insert([newLog])
                .select()
                .single();

            if (error) throw error;

            this.logs.unshift(data);
            this.notifyListeners();

            return { success: true, data };
        } catch (error) {
            console.error('Log medication error:', error);
            return { success: false, error: error.message };
        }
    }

    // Delete a log
    async deleteLog(logId) {
        try {
            const { data: { user: currentUser }, error: userError } = await this.client.auth.getUser();

            if (userError || !currentUser) {
                throw new Error('User not authenticated');
            }

            const { error } = await this.client
                .from(TABLES.MEDICATION_LOGS)
                .delete()
                .eq('id', logId)
                .eq('user_id', currentUser.id);

            if (error) throw error;

            this.logs = this.logs.filter(l => l.id !== logId);
            this.notifyListeners();

            return { success: true };
        } catch (error) {
            console.error('Delete log error:', error);
            return { success: false, error: error.message };
        }
    }

    // Get all medications
    getAllMedications() {
        return this.medications;
    }

    // Get all logs
    getAllLogs() {
        return this.logs;
    }

    // Get medication by ID
    getMedicationById(id) {
        return this.medications.find(m => m.id === id);
    }

    // Get today's logs
    getTodayLogs() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return this.logs.filter(log => {
            const logDate = new Date(log.log_date);
            return logDate >= today && logDate < tomorrow;
        });
    }

    // Format log date
    formatLogDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Create global medications instance
const medicationsManager = new MedicationsManager();
