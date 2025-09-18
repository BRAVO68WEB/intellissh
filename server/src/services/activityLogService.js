const db = require('../db/database');

class ActivityLogService {
  constructor() {
    this.ACTIVITY_TYPES = {
      CONNECT: 'connect',
      DISCONNECT: 'disconnect', 
      COMMAND: 'command',
      ERROR: 'error',
      FILE_TRANSFER: 'file_transfer',
      AUTH_SUCCESS: 'auth_success',
      AUTH_FAILURE: 'auth_failure'
    };
  }

  /**
   * Log an SSH activity event
   * @param {number} sessionId - The session ID
   * @param {number} userId - The user ID
   * @param {string} activityType - Type of activity (from ACTIVITY_TYPES)
   * @param {Object} eventData - Additional event data
   * @param {string} connectionId - SSH connection ID
   * @param {string} ipAddress - Client IP address
   * @param {string} userAgent - Client user agent
   */
  async logActivity(sessionId, userId, activityType, eventData = {}, connectionId = null, ipAddress = null, userAgent = null) {
    try {
      const result = await db.run(
        `INSERT INTO ssh_activity_logs 
         (session_id, user_id, connection_id, activity_type, event_data, ip_address, user_agent, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          sessionId,
          userId, 
          connectionId,
          activityType,
          JSON.stringify(eventData),
          ipAddress,
          userAgent
        ]
      );
      
      console.log(`Activity logged: ${activityType} for session ${sessionId} by user ${userId}`);
      return result.id;
    } catch (error) {
      console.error('Failed to log activity:', error.message);
      // Don't throw error to prevent breaking main flow
    }
  }

  /**
   * Get activity logs for a specific session
   * @param {number} sessionId - The session ID
   * @param {number} userId - The user ID (for authorization)
   * @param {number} limit - Maximum number of logs to retrieve
   * @param {number} offset - Number of logs to skip
   */
  async getSessionActivityLogs(sessionId, userId, limit = 100, offset = 0) {
    try {
      const logs = await db.all(
        `SELECT sal.*, s.name as session_name, s.hostname, s.username as ssh_username
         FROM ssh_activity_logs sal
         JOIN sessions s ON sal.session_id = s.id
         WHERE sal.session_id = ? AND sal.user_id = ?
         ORDER BY sal.created_at DESC
         LIMIT ? OFFSET ?`,
        [sessionId, userId, limit, offset]
      );

      // Parse event_data JSON for each log
      return logs.map(log => ({
        ...log,
        event_data: log.event_data ? JSON.parse(log.event_data) : {}
      }));
    } catch (error) {
      console.error('Failed to get session activity logs:', error.message);
      throw error;
    }
  }

  /**
   * Get activity logs for a specific user across all sessions
   * @param {number} userId - The user ID
   * @param {number} limit - Maximum number of logs to retrieve
   * @param {number} offset - Number of logs to skip
   * @param {string} activityType - Filter by activity type (optional)
   */
  async getUserActivityLogs(userId, limit = 100, offset = 0, activityType = null) {
    try {
      let query = `SELECT sal.*, s.name as session_name, s.hostname, s.username as ssh_username
                   FROM ssh_activity_logs sal
                   JOIN sessions s ON sal.session_id = s.id
                   WHERE sal.user_id = ?`;
      
      const params = [userId];
      
      if (activityType) {
        query += ` AND sal.activity_type = ?`;
        params.push(activityType);
      }
      
      query += ` ORDER BY sal.created_at DESC LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const logs = await db.all(query, params);

      // Parse event_data JSON for each log
      return logs.map(log => ({
        ...log,
        event_data: log.event_data ? JSON.parse(log.event_data) : {}
      }));
    } catch (error) {
      console.error('Failed to get user activity logs:', error.message);
      throw error;
    }
  }

  /**
   * Get activity statistics for a user
   * @param {number} userId - The user ID
   * @param {number} days - Number of days to look back (default 30)
   */
  async getActivityStats(userId, days = 30) {
    try {
      const stats = await db.all(
        `SELECT 
           activity_type,
           COUNT(*) as count,
           DATE(created_at) as date
         FROM ssh_activity_logs 
         WHERE user_id = ? AND created_at >= datetime('now', '-' || ? || ' days')
         GROUP BY activity_type, DATE(created_at)
         ORDER BY date DESC`,
        [userId, days]
      );

      // Get total counts by activity type
      const totals = await db.all(
        `SELECT activity_type, COUNT(*) as total
         FROM ssh_activity_logs 
         WHERE user_id = ? AND created_at >= datetime('now', '-' || ? || ' days')
         GROUP BY activity_type`,
        [userId, days]
      );

      return {
        daily_stats: stats,
        totals: totals.reduce((acc, stat) => {
          acc[stat.activity_type] = stat.total;
          return acc;
        }, {})
      };
    } catch (error) {
      console.error('Failed to get activity stats:', error.message);
      throw error;
    }
  }

  /**
   * Clean up old activity logs (older than specified days)
   * @param {number} days - Keep logs newer than this many days
   */
  async cleanupOldLogs(days = 90) {
    try {
      const result = await db.run(
        `DELETE FROM ssh_activity_logs 
         WHERE created_at < datetime('now', '-' || ? || ' days')`,
        [days]
      );
      
      console.log(`Cleaned up ${result.changes} old activity log entries`);
      return result.changes;
    } catch (error) {
      console.error('Failed to cleanup old logs:', error.message);
      throw error;
    }
  }
}

module.exports = new ActivityLogService();