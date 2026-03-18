// Feeds Module for Tracker de Mamadas
// Handles CRUD operations for feed records using Supabase

class FeedsManager {
    constructor() {
        this.client = null;
        this.feeds = [];
        this.listeners = [];
    }

    // Initialize with Supabase client
    async init(supabaseClient) {
        this.client = supabaseClient;
        await this.loadFeeds();
    }

    // Subscribe to feed changes
    subscribe(callback) {
        this.listeners.push(callback);
    }

    // Notify all listeners
    notifyListeners() {
        this.listeners.forEach(callback => callback(this.feeds));
    }

    // Load all feeds for current user
    async loadFeeds() {
        try {
            const user = this.client.auth.getUser();
            const { data: { user: currentUser } } = await user;

            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            const { data, error } = await this.client
                .from(TABLES.FEEDS)
                .select('*')
                .eq('user_id', currentUser.id)
                .order('feed_date', { ascending: false });

            if (error) throw error;

            this.feeds = data || [];
            this.notifyListeners();
            return { success: true, data: this.feeds };
        } catch (error) {
            console.error('Load feeds error:', error);
            return { success: false, error: error.message };
        }
    }

    // Create a new feed
    async createFeed(feedData) {
        try {
            const user = this.client.auth.getUser();
            const { data: { user: currentUser } } = await user;

            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            const newFeed = {
                user_id: currentUser.id,
                type: feedData.type,
                duration: feedData.duration,
                feed_date: feedData.feed_date,
                notes: feedData.notes || null
            };

            const { data, error } = await this.client
                .from(TABLES.FEEDS)
                .insert([newFeed])
                .select()
                .single();

            if (error) throw error;

            // Add to local cache
            this.feeds.unshift(data);
            this.notifyListeners();

            return { success: true, data };
        } catch (error) {
            console.error('Create feed error:', error);
            return { success: false, error: error.message };
        }
    }

    // Update an existing feed
    async updateFeed(feedId, feedData) {
        try {
            const user = this.client.auth.getUser();
            const { data: { user: currentUser } } = await user;

            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            const updates = {};
            if (feedData.type !== undefined) updates.type = feedData.type;
            if (feedData.duration !== undefined) updates.duration = feedData.duration;
            if (feedData.feed_date !== undefined) updates.feed_date = feedData.feed_date;
            if (feedData.notes !== undefined) updates.notes = feedData.notes;

            const { data, error } = await this.client
                .from(TABLES.FEEDS)
                .update(updates)
                .eq('id', feedId)
                .eq('user_id', currentUser.id)
                .select()
                .single();

            if (error) throw error;

            // Update local cache
            const index = this.feeds.findIndex(f => f.id === feedId);
            if (index !== -1) {
                this.feeds[index] = data;
                this.notifyListeners();
            }

            return { success: true, data };
        } catch (error) {
            console.error('Update feed error:', error);
            return { success: false, error: error.message };
        }
    }

    // Delete a feed
    async deleteFeed(feedId) {
        try {
            const user = this.client.auth.getUser();
            const { data: { user: currentUser } } = await user;

            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            const { error } = await this.client
                .from(TABLES.FEEDS)
                .delete()
                .eq('id', feedId)
                .eq('user_id', currentUser.id);

            if (error) throw error;

            // Remove from local cache
            this.feeds = this.feeds.filter(f => f.id !== feedId);
            this.notifyListeners();

            return { success: true };
        } catch (error) {
            console.error('Delete feed error:', error);
            return { success: false, error: error.message };
        }
    }

    // Get feeds filtered by date range
    getFeedsByDateRange(startDate, endDate) {
        return this.feeds.filter(feed => {
            const feedDate = new Date(feed.feed_date);
            return feedDate >= startDate && feedDate <= endDate;
        });
    }

    // Get feeds for today
    getTodayFeeds() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return this.feeds.filter(feed => {
            const feedDate = new Date(feed.feed_date);
            return feedDate >= today && feedDate < tomorrow;
        });
    }

    // Get feeds for the last N days
    getFeedsLastDays(days) {
        const endDate = new Date();
        endDate.setHours(23, 59, 59, 999);

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days + 1);
        startDate.setHours(0, 0, 0, 0);

        return this.getFeedsByDateRange(startDate, endDate);
    }

    // Get feeds grouped by day
    getFeedsGroupedByDay(days = 7) {
        const feeds = this.getFeedsLastDays(days);
        const grouped = {};

        feeds.forEach(feed => {
            const date = new Date(feed.feed_date);
            const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

            if (!grouped[dateKey]) {
                grouped[dateKey] = {
                    date: dateKey,
                    count: 0,
                    totalDuration: 0,
                    maternoCount: 0,
                    formulaCount: 0
                };
            }

            grouped[dateKey].count++;
            grouped[dateKey].totalDuration += feed.duration;

            if (feed.type === FEED_TYPES.MATERNO) {
                grouped[dateKey].maternoCount++;
            } else if (feed.type === FEED_TYPES.FORMULA) {
                grouped[dateKey].formulaCount++;
            }
        });

        // Convert to array and sort by date
        return Object.values(grouped).sort((a, b) =>
            new Date(a.date) - new Date(b.date)
        );
    }

    // Get statistics for a date range
    getStatistics(startDate, endDate) {
        const feeds = this.getFeedsByDateRange(startDate, endDate);

        if (feeds.length === 0) {
            return {
                count: 0,
                totalDuration: 0,
                avgDuration: 0,
                maternoCount: 0,
                formulaCount: 0
            };
        }

        const count = feeds.length;
        const totalDuration = feeds.reduce((sum, feed) => sum + feed.duration, 0);
        const avgDuration = Math.round(totalDuration / count);
        const maternoCount = feeds.filter(f => f.type === FEED_TYPES.MATERNO).length;
        const formulaCount = feeds.filter(f => f.type === FEED_TYPES.FORMULA).length;

        return {
            count,
            totalDuration,
            avgDuration,
            maternoCount,
            formulaCount
        };
    }

    // Get today's statistics
    getTodayStatistics() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return this.getStatistics(today, tomorrow);
    }

    // Get week statistics
    getWeekStatistics() {
        const endDate = new Date();
        endDate.setHours(23, 59, 59, 999);

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);

        return this.getStatistics(startDate, endDate);
    }

    // Get month statistics
    getMonthStatistics() {
        const endDate = new Date();
        endDate.setHours(23, 59, 59, 999);

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);

        return this.getStatistics(startDate, endDate);
    }

    // Get all feeds
    getAllFeeds() {
        return this.feeds;
    }

    // Format feed date for display
    formatFeedDate(dateString) {
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

// Create global feeds instance
const feedsManager = new FeedsManager();
