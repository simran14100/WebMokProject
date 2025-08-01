const User = require('../models/User');
const Course = require('../models/Course');

class MonitoringService {
  constructor() {
    this.suspiciousPatterns = new Map();
    this.accessLogs = new Map();
  }

  // Log video access
  logVideoAccess(userId, courseId, subsectionId, action, metadata = {}) {
    const key = `${userId}:${courseId}:${subsectionId}`;
    const timestamp = new Date();
    
    if (!this.accessLogs.has(key)) {
      this.accessLogs.set(key, []);
    }
    
    const logEntry = {
      timestamp,
      action,
      metadata,
      userAgent: metadata.userAgent,
      ipAddress: metadata.ipAddress
    };
    
    this.accessLogs.get(key).push(logEntry);
    
    // Keep only last 100 entries per video
    if (this.accessLogs.get(key).length > 100) {
      this.accessLogs.get(key).shift();
    }
    
    // Check for suspicious patterns
    this.detectSuspiciousActivity(userId, courseId, subsectionId);
  }

  // Detect suspicious activity patterns
  detectSuspiciousActivity(userId, courseId, subsectionId) {
    const key = `${userId}:${courseId}:${subsectionId}`;
    const logs = this.accessLogs.get(key) || [];
    
    if (logs.length < 5) return; // Need minimum data
    
    const recentLogs = logs.slice(-20); // Last 20 actions
    const timeWindow = 5 * 60 * 1000; // 5 minutes
    
    // Pattern 1: Too many rapid seeks
    const seekCount = recentLogs.filter(log => 
      log.action === 'seek' && 
      log.timestamp > new Date(Date.now() - timeWindow)
    ).length;
    
    if (seekCount > 10) {
      this.flagSuspiciousActivity(userId, courseId, subsectionId, 'excessive_seeking', {
        seekCount,
        timeWindow: '5 minutes'
      });
    }
    
    // Pattern 2: Too many pauses
    const pauseCount = recentLogs.filter(log => 
      log.action === 'pause' && 
      log.timestamp > new Date(Date.now() - timeWindow)
    ).length;
    
    if (pauseCount > 20) {
      this.flagSuspiciousActivity(userId, courseId, subsectionId, 'excessive_pausing', {
        pauseCount,
        timeWindow: '5 minutes'
      });
    }
    
    // Pattern 3: Fast forwarding through content
    const fastForwardCount = recentLogs.filter(log => 
      log.action === 'fast_forward' && 
      log.timestamp > new Date(Date.now() - timeWindow)
    ).length;
    
    if (fastForwardCount > 5) {
      this.flagSuspiciousActivity(userId, courseId, subsectionId, 'fast_forwarding', {
        fastForwardCount,
        timeWindow: '5 minutes'
      });
    }
    
    // Pattern 4: Multiple simultaneous sessions
    this.detectMultipleSessions(userId, courseId, subsectionId);
  }

  // Detect multiple simultaneous sessions
  async detectMultipleSessions(userId, courseId, subsectionId) {
    const key = `${userId}:${courseId}:${subsectionId}`;
    const logs = this.accessLogs.get(key) || [];
    
    if (logs.length < 2) return;
    
    const recentLogs = logs.slice(-10);
    const uniqueIPs = new Set(recentLogs.map(log => log.ipAddress));
    const uniqueUserAgents = new Set(recentLogs.map(log => log.userAgent));
    
    if (uniqueIPs.size > 2 || uniqueUserAgents.size > 2) {
      this.flagSuspiciousActivity(userId, courseId, subsectionId, 'multiple_sessions', {
        uniqueIPs: uniqueIPs.size,
        uniqueUserAgents: uniqueUserAgents.size,
        ips: Array.from(uniqueIPs),
        userAgents: Array.from(uniqueUserAgents)
      });
    }
  }

  // Flag suspicious activity
  async flagSuspiciousActivity(userId, courseId, subsectionId, pattern, details) {
    const flag = {
      userId,
      courseId,
      subsectionId,
      pattern,
      details,
      timestamp: new Date(),
      severity: this.getSeverityLevel(pattern)
    };
    
    // Store in database or send alert
    console.warn('🚨 SUSPICIOUS ACTIVITY DETECTED:', flag);
    
    // You can implement:
    // 1. Store in database
    // 2. Send email alert to admin
    // 3. Temporarily block user access
    // 4. Log for investigation
    
    await this.storeSuspiciousActivity(flag);
  }

  // Get severity level for different patterns
  getSeverityLevel(pattern) {
    const severityLevels = {
      'excessive_seeking': 'medium',
      'excessive_pausing': 'low',
      'fast_forwarding': 'medium',
      'multiple_sessions': 'high',
      'screenshot_attempt': 'high',
      'developer_tools': 'high'
    };
    
    return severityLevels[pattern] || 'low';
  }

  // Store suspicious activity in database
  async storeSuspiciousActivity(flag) {
    try {
      // You can create a new model for this
      // For now, we'll just log it
      console.log('Storing suspicious activity:', flag);
      
      // Example: Send to admin dashboard
      // await SuspiciousActivity.create(flag);
      
    } catch (error) {
      console.error('Error storing suspicious activity:', error);
    }
  }

  // Get user's video access analytics
  async getUserAnalytics(userId, courseId) {
    const userLogs = [];
    
    // Collect all logs for this user and course
    for (const [key, logs] of this.accessLogs.entries()) {
      if (key.startsWith(`${userId}:${courseId}`)) {
        userLogs.push(...logs);
      }
    }
    
    const analytics = {
      totalAccesses: userLogs.length,
      uniqueVideos: new Set(userLogs.map(log => log.action)).size,
      lastAccess: userLogs.length > 0 ? Math.max(...userLogs.map(log => log.timestamp)) : null,
      suspiciousFlags: 0, // You can implement this
      averageSessionDuration: this.calculateAverageSessionDuration(userLogs)
    };
    
    return analytics;
  }

  // Calculate average session duration
  calculateAverageSessionDuration(logs) {
    if (logs.length < 2) return 0;
    
    const sessions = [];
    let sessionStart = null;
    
    for (const log of logs) {
      if (log.action === 'play' && !sessionStart) {
        sessionStart = log.timestamp;
      } else if (log.action === 'pause' && sessionStart) {
        const duration = log.timestamp - sessionStart;
        sessions.push(duration);
        sessionStart = null;
      }
    }
    
    if (sessions.length === 0) return 0;
    
    const totalDuration = sessions.reduce((sum, duration) => sum + duration, 0);
    return totalDuration / sessions.length;
  }

  // Clean up old logs
  cleanupOldLogs(maxAge = 24 * 60 * 60 * 1000) { // 24 hours
    const cutoff = new Date(Date.now() - maxAge);
    
    for (const [key, logs] of this.accessLogs.entries()) {
      const filteredLogs = logs.filter(log => log.timestamp > cutoff);
      
      if (filteredLogs.length === 0) {
        this.accessLogs.delete(key);
      } else {
        this.accessLogs.set(key, filteredLogs);
      }
    }
  }
}

// Create singleton instance
const monitoringService = new MonitoringService();

// Clean up old logs every hour
setInterval(() => {
  monitoringService.cleanupOldLogs();
}, 60 * 60 * 1000);

module.exports = monitoringService;