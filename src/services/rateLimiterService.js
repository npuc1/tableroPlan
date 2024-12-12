class RateLimiterService {
    constructor(maxRequests = 60, timeWindowMs = 60000) {
        // Store timestamps of requests within our sliding window
        this.requestTimestamps = [];
        // Maximum number of requests allowed in the time window
        this.maxRequests = maxRequests;
        // Time window in milliseconds (default: 1 minute)
        this.timeWindowMs = timeWindowMs;
    }

    async checkRateLimit() {
        const now = Date.now();

        // Remove timestamps outside our time window
        this.requestTimestamps = this.requestTimestamps.filter(
            timestamp => now - timestamp < this.timeWindowMs
        );

        // Check if we're at the limit
        if (this.requestTimestamps.length >= this.maxRequests) {
            // Calculate time until next available slot
            const oldestTimestamp = this.requestTimestamps[0];
            const timeToWaitMs = oldestTimestamp + this.timeWindowMs - now;

            // Return waiting time in seconds (rounded up)
            return Math.ceil(timeToWaitMs / 1000);
        }

        // Add current timestamp to our tracking array
        this.requestTimestamps.push(now);
        return 0; // No need to wait
    }

    // Helper method to get current request count
    getCurrentRequestCount() {
        const now = Date.now();
        this.requestTimestamps = this.requestTimestamps.filter(
            timestamp => now - timestamp < this.timeWindowMs
        );
        return this.requestTimestamps.length;
    }
}

const rateLimiter = new RateLimiterService();
export default rateLimiter;