// Supabase Configuration
// IMPORTANT: Replace these values with your own Supabase project credentials
// To get your credentials:
// 1. Go to https://supabase.com
// 2. Create a new project or select existing one
// 3. Go to Settings → API
// 4. Copy the Project URL and anon public key

const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_PROJECT_URL', // e.g., 'https://xxxxxxxx.supabase.co'
    anonKey: 'YOUR_SUPABASE_ANON_KEY' // e.g., 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
};

// Database table names
const TABLES = {
    PROFILES: 'profiles',
    FEEDS: 'feeds',
    REMINDERS: 'reminders'
};

// Feed types enum
const FEED_TYPES = {
    MATERNO: 'materno',
    FORMULA: 'formula'
};

// Reminder defaults
const REMINDER_DEFAULTS = {
    CHECK_INTERVAL: 60000, // Check every minute
    NOTIFICATION_PERMISSION: 'default'
};
