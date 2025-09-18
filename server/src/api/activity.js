const express = require('express');
const activityLogService = require('../services/activityLogService');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// @route   GET /api/activity/session/:sessionId
// @desc    Get activity logs for a specific session
// @access  Private
router.get('/session/:sessionId', async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    
    if (isNaN(sessionId)) {
      return res.status(400).json({
        error: 'Invalid session ID.'
      });
    }

    const logs = await activityLogService.getSessionActivityLogs(
      sessionId, 
      req.user.id, 
      limit, 
      offset
    );

    res.json({
      success: true,
      logs: logs,
      pagination: {
        limit,
        offset,
        count: logs.length
      }
    });
  } catch (error) {
    console.error('Get session activity logs error:', error.message);
    res.status(500).json({
      error: 'Internal server error while fetching activity logs.'
    });
  }
});

// @route   GET /api/activity/user
// @desc    Get activity logs for the authenticated user across all sessions
// @access  Private
router.get('/user', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    const activityType = req.query.type || null;

    const logs = await activityLogService.getUserActivityLogs(
      req.user.id,
      limit,
      offset,
      activityType
    );

    res.json({
      success: true,
      logs: logs,
      pagination: {
        limit,
        offset,
        count: logs.length,
        type: activityType
      }
    });
  } catch (error) {
    console.error('Get user activity logs error:', error.message);
    res.status(500).json({
      error: 'Internal server error while fetching activity logs.'
    });
  }
});

// @route   GET /api/activity/stats
// @desc    Get activity statistics for the authenticated user
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;

    const stats = await activityLogService.getActivityStats(req.user.id, days);

    res.json({
      success: true,
      stats: stats,
      period_days: days
    });
  } catch (error) {
    console.error('Get activity stats error:', error.message);
    res.status(500).json({
      error: 'Internal server error while fetching activity statistics.'
    });
  }
});

module.exports = router;