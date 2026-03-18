// Supabase Configuration
// IMPORTANT: Replace these values with your own Supabase project credentials
// To get your credentials:
// 1. Go to https://supabase.com
// 2. Create a new project or select existing one
// 3. Go to Settings → API
// 4. Copy the Project URL and anon public key

const SUPABASE_CONFIG = {
    url: 'https://kjchwkftkdiuhqisifbm.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqY2h3a2Z0a2RpdWhxaXNpZmJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4Mzk2NjcsImV4cCI6MjA4OTQxNTY2N30.9ZS8hu1WXnQ6kIQAf6zzLJpbfEk1-xkxq94AM3x7gPY'
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
