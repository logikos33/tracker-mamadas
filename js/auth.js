// Authentication Module for Tracker de Mamadas
// Handles user authentication: sign up, sign in, sign out, and session management

class AuthManager {
    constructor() {
        this.client = null;
        this.user = null;
        this.session = null;
    }

    // Initialize Supabase client
    async init() {
        if (this.client) return this.client;

        try {
            // Load Supabase from CDN
            if (typeof supabase === 'undefined') {
                await this.loadSupabaseScript();
            }

            this.client = supabase.createClient(
                SUPABASE_CONFIG.url,
                SUPABASE_CONFIG.anonKey
            );

            // Check for existing session
            const { data: { session } } = await this.client.auth.getSession();
            this.session = session;
            this.user = session?.user ?? null;

            // Listen for auth changes
            this.client.auth.onAuthStateChange((event, session) => {
                this.session = session;
                this.user = session?.user ?? null;

                if (event === 'SIGNED_IN') {
                    console.log('User signed in');
                } else if (event === 'SIGNED_OUT') {
                    console.log('User signed out');
                    // Redirect to login page
                    if (window.location.pathname !== '/login.html' && window.location.pathname !== '/register.html') {
                        window.location.href = 'login.html';
                    }
                }
            });

            return this.client;
        } catch (error) {
            console.error('Error initializing auth:', error);
            throw error;
        }
    }

    // Load Supabase SDK from CDN
    loadSupabaseScript() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Sign up new user
    async signUp(email, password) {
        try {
            const { data, error } = await this.client.auth.signUp({
                email,
                password
            });

            if (error) throw error;

            // Create profile entry
            if (data.user) {
                await this.createProfile(data.user.id);
            }

            return { success: true, data };
        } catch (error) {
            console.error('Sign up error:', error);
            return { success: false, error: error.message };
        }
    }

    // Sign in existing user
    async signIn(email, password) {
        try {
            const { data, error } = await this.client.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            this.session = data.session;
            this.user = data.user;

            return { success: true, data };
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, error: error.message };
        }
    }

    // Sign out current user
    async signOut() {
        try {
            const { error } = await this.client.auth.signOut();

            if (error) throw error;

            this.session = null;
            this.user = null;

            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: error.message };
        }
    }

    // Reset password
    async resetPassword(email) {
        try {
            const { error } = await this.client.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password.html`
            });

            if (error) throw error;

            return { success: true };
        } catch (error) {
            console.error('Reset password error:', error);
            return { success: false, error: error.message };
        }
    }

    // Get current user
    getCurrentUser() {
        return this.user;
    }

    // Get current session
    getCurrentSession() {
        return this.session;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.user;
    }

    // Create user profile
    async createProfile(userId) {
        try {
            const { error } = await this.client
                .from(TABLES.PROFILES)
                .insert([{ id: userId }]);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Create profile error:', error);
            return { success: false, error: error.message };
        }
    }

    // Protect route - redirect to login if not authenticated
    protectRoute() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    // Redirect to app if already authenticated
    redirectIfAuthenticated() {
        if (this.isAuthenticated()) {
            window.location.href = 'index.html';
            return true;
        }
        return false;
    }
}

// Create global auth instance
const authManager = new AuthManager();
