import SystemLog from '../models/SystemLog.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

/**
 * Get all system logs with filtering and pagination
 * @route GET /api/system-logs
 * @access Admin
 */
export const getSystemLogs = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    
    if (req.query.category) {
        query.category = req.query.category;
    }
    
    if (req.query.status) {
        query.status = req.query.status;
    }
    
    if (req.query.action) {
        query.action = new RegExp(req.query.action, 'i');
    }
    
    if (req.query.userId) {
        query.user = req.query.userId;
    }

    if (req.query.startDate && req.query.endDate) {
        query.createdAt = {
            $gte: new Date(req.query.startDate),
            $lte: new Date(req.query.endDate)
        };
    }

    const [logs, total] = await Promise.all([
        SystemLog.find(query)
            .populate('user', 'firstName lastName email role')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        SystemLog.countDocuments(query)
    ]);

    sendSuccess(res, 200, 'System logs retrieved successfully', {
        logs,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

/**
 * Get log statistics
 * @route GET /api/system-logs/stats
 * @access Admin
 */
export const getLogStats = asyncHandler(async (req, res) => {
    const stats = await SystemLog.aggregate([
        {
            $group: {
                _id: '$category',
                count: { $sum: 1 }
            }
        }
    ]);

    const statusStats = await SystemLog.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    sendSuccess(res, 200, 'Log statistics retrieved successfully', {
        categoryStats: stats,
        statusStats: statusStats
    });
});
