// Reminders Module for Tracker de Mamadas
// Handles reminder management and browser notifications

class RemindersManager {
    constructor() {
        this.client = null;
        this.reminders = [];
        this.checkInterval = null;
        this.listeners = [];
    }

    // Initialize with Supabase client
    async init(supabaseClient) {
        this.client = supabaseClient;
        await this.loadReminders();
        this.startChecking();
        await this.requestNotificationPermission();
    }

    // Subscribe to reminder changes
    subscribe(callback) {
        this.listeners.push(callback);
    }

    // Notify all listeners
    notifyListeners() {
        this.listeners.forEach(callback => callback(this.reminders));
    }

    // Request notification permission
    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            console.log('Notification permission:', permission);
            return permission === 'granted';
        }
        return false;
    }

    // Check if notifications are enabled
    areNotificationsEnabled() {
        return 'Notification' in window && Notification.permission === 'granted';
    }

    // Load all reminders for current user
    async loadReminders() {
        try {
            const user = this.client.auth.getUser();
            const { data: { user: currentUser } } = await user;

            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            const { data, error } = await this.client
                .from(TABLES.REMINDERS)
                .select('*')
                .eq('user_id', currentUser.id)
                .eq('is_active', true)
                .order('reminder_time', { ascending: true });

            if (error) throw error;

            this.reminders = data || [];
            this.notifyListeners();
            return { success: true, data: this.reminders };
        } catch (error) {
            console.error('Load reminders error:', error);
            return { success: false, error: error.message };
        }
    }

    // Create a new reminder
    async createReminder(reminderData) {
        try {
            const user = this.client.auth.getUser();
            const { data: { user: currentUser } } = await user;

            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            const newReminder = {
                user_id: currentUser.id,
                reminder_time: reminderData.time,
                label: reminderData.label,
                is_active: true
            };

            const { data, error } = await this.client
                .from(TABLES.REMINDERS)
                .insert([newReminder])
                .select()
                .single();

            if (error) throw error;

            // Add to local cache
            this.reminders.push(data);
            this.reminders.sort((a, b) => a.reminder_time.localeCompare(b.reminder_time));
            this.notifyListeners();

            return { success: true, data };
        } catch (error) {
            console.error('Create reminder error:', error);
            return { success: false, error: error.message };
        }
    }

    // Update an existing reminder
    async updateReminder(reminderId, reminderData) {
        try {
            const user = this.client.auth.getUser();
            const { data: { user: currentUser } } = await user;

            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            const updates = {};
            if (reminderData.time !== undefined) updates.reminder_time = reminderData.time;
            if (reminderData.label !== undefined) updates.label = reminderData.label;
            if (reminderData.is_active !== undefined) updates.is_active = reminderData.is_active;

            const { data, error } = await this.client
                .from(TABLES.REMINDERS)
                .update(updates)
                .eq('id', reminderId)
                .eq('user_id', currentUser.id)
                .select()
                .single();

            if (error) throw error;

            // Update local cache
            const index = this.reminders.findIndex(r => r.id === reminderId);
            if (index !== -1) {
                this.reminders[index] = data;
                this.reminders.sort((a, b) => a.reminder_time.localeCompare(b.reminder_time));
                this.notifyListeners();
            }

            return { success: true, data };
        } catch (error) {
            console.error('Update reminder error:', error);
            return { success: false, error: error.message };
        }
    }

    // Delete a reminder
    async deleteReminder(reminderId) {
        try {
            const user = this.client.auth.getUser();
            const { data: { user: currentUser } } = await user;

            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            const { error } = await this.client
                .from(TABLES.REMINDERS)
                .delete()
                .eq('id', reminderId)
                .eq('user_id', currentUser.id);

            if (error) throw error;

            // Remove from local cache
            this.reminders = this.reminders.filter(r => r.id !== reminderId);
            this.notifyListeners();

            return { success: true };
        } catch (error) {
            console.error('Delete reminder error:', error);
            return { success: false, error: error.message };
        }
    }

    // Toggle reminder active state
    async toggleReminder(reminderId) {
        const reminder = this.reminders.find(r => r.id === reminderId);
        if (reminder) {
            return await this.updateReminder(reminderId, {
                is_active: !reminder.is_active
            });
        }
        return { success: false, error: 'Reminder not found' };
    }

    // Start checking for reminders
    startChecking() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }

        this.checkInterval = setInterval(() => {
            this.checkReminders();
        }, REMINDER_DEFAULTS.CHECK_INTERVAL);
    }

    // Stop checking for reminders
    stopChecking() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    // Check if any reminders should trigger
    checkReminders() {
        if (!this.areNotificationsEnabled()) {
            return;
        }

        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
        const currentSeconds = now.getSeconds();

        // Only check at the start of each minute to avoid duplicate notifications
        if (currentSeconds !== 0) {
            return;
        }

        this.reminders.forEach(reminder => {
            if (reminder.is_active && reminder.reminder_time === currentTime) {
                this.showNotification(reminder);
            }
        });
    }

    // Show notification for reminder
    showNotification(reminder) {
        if (!this.areNotificationsEnabled()) {
            return;
        }

        const notification = new Notification('🍼 Lembrete de Mamada', {
            body: reminder.label,
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🍼</text></svg>',
            tag: reminder.id,
            requireInteraction: true
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
        };

        console.log('Notification shown for reminder:', reminder.label);
    }

    // Get all reminders
    getAllReminders() {
        return this.reminders;
    }

    // Get active reminders
    getActiveReminders() {
        return this.reminders.filter(r => r.is_active);
    }

    // Format reminder time for display
    formatReminderTime(timeString) {
        const [hours, minutes] = timeString.split(':');
        return `${hours}:${minutes}`;
    }

    // Cleanup
    destroy() {
        this.stopChecking();
    }
}

// Create global reminders instance
const remindersManager = new RemindersManager();
