// Profile Module for Tracker de Mamadas
// Handles user profile and baby information management

class ProfileManager {
    constructor() {
        this.client = null;
        this.profile = null;
    }

    // Initialize with Supabase client
    async init(supabaseClient) {
        this.client = supabaseClient;
        await this.loadProfile();
    }

    // Load user profile
    async loadProfile() {
        try {
            const user = this.client.auth.getUser();
            const { data: { user: currentUser } } = await user;

            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            const { data, error } = await this.client
                .from(TABLES.PROFILES)
                .select('*')
                .eq('id', currentUser.id)
                .single();

            if (error) {
                // If profile doesn't exist, create it
                if (error.code === 'PGRST116') {
                    return await this.createProfile();
                }
                throw error;
            }

            this.profile = data;
            return { success: true, data: this.profile };
        } catch (error) {
            console.error('Load profile error:', error);
            return { success: false, error: error.message };
        }
    }

    // Create user profile
    async createProfile(profileData = {}) {
        try {
            const user = this.client.auth.getUser();
            const { data: { user: currentUser } } = await user;

            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            const newProfile = {
                id: currentUser.id,
                baby_name: profileData.baby_name || null,
                birth_date: profileData.birth_date || null
            };

            const { data, error } = await this.client
                .from(TABLES.PROFILES)
                .insert([newProfile])
                .select()
                .single();

            if (error) throw error;

            this.profile = data;
            return { success: true, data: this.profile };
        } catch (error) {
            console.error('Create profile error:', error);
            return { success: false, error: error.message };
        }
    }

    // Update user profile
    async updateProfile(profileData) {
        try {
            const user = this.client.auth.getUser();
            const { data: { user: currentUser } } = await user;

            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            const updates = {};
            if (profileData.baby_name !== undefined) updates.baby_name = profileData.baby_name;
            if (profileData.birth_date !== undefined) updates.birth_date = profileData.birth_date;

            const { data, error } = await this.client
                .from(TABLES.PROFILES)
                .update(updates)
                .eq('id', currentUser.id)
                .select()
                .single();

            if (error) throw error;

            this.profile = data;
            return { success: true, data: this.profile };
        } catch (error) {
            console.error('Update profile error:', error);
            return { success: false, error: error.message };
        }
    }

    // Get baby name
    getBabyName() {
        return this.profile?.baby_name || 'Seu Bebê';
    }

    // Get birth date
    getBirthDate() {
        return this.profile?.birth_date || null;
    }

    // Get profile
    getProfile() {
        return this.profile;
    }

    // Calculate baby's age in days
    getBabyAge() {
        if (!this.profile?.birth_date) {
            return null;
        }

        const birthDate = new Date(this.profile.birth_date);
        const today = new Date();
        const diffTime = Math.abs(today - birthDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    }

    // Format baby's age for display
    formatBabyAge() {
        const days = this.getBabyAge();
        if (days === null) {
            return '';
        }

        if (days < 30) {
            return `${days} dia${days !== 1 ? 's' : ''}`;
        } else if (days < 365) {
            const months = Math.floor(days / 30);
            const remainingDays = days % 30;
            return `${months} mês${months !== 1 ? 'es' : ''}${remainingDays > 0 ? ` e ${remainingDays} dias` : ''}`;
        } else {
            const years = Math.floor(days / 365);
            const remainingMonths = Math.floor((days % 365) / 30);
            return `${years} ano${years !== 1 ? 's' : ''}${remainingMonths > 0 ? ` e ${remainingMonths} mês${remainingMonths !== 1 ? 'es' : ''}` : ''}`;
        }
    }

    // Format birth date for display
    formatBirthDate() {
        if (!this.profile?.birth_date) {
            return '';
        }

        const date = new Date(this.profile.birth_date + 'T00:00:00');
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
}

// Create global profile instance
const profileManager = new ProfileManager();
