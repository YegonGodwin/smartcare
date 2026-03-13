import SystemLog from '../models/SystemLog.js';

/**
 * Utility to log system events
 * @param {Object} options - Log options
 * @param {string} options.user - User ID who performed the action
 * @param {string} options.action - Action performed (e.g. 'LOGIN', 'CREATE_APPOINTMENT')
 * @param {string} options.category - Category (e.g. 'AUTH', 'APPOINTMENT')
 * @param {string} options.status - Status (e.g. 'SUCCESS', 'FAILURE', 'INFO', 'WARNING', 'ERROR')
 * @param {string} options.description - Human readable description
 * @param {Object} options.details - Additional JSON details
 * @param {string} options.resourceId - ID of the resource affected
 * @param {string} options.resourceModel - Model name of the resource affected
 * @param {Object} options.req - Express request object to extract IP and User Agent
 */
export const createLog = async ({
    user = null,
    action,
    category,
    status = 'SUCCESS',
    description,
    details = {},
    resourceId = null,
    resourceModel = null,
    req = null
}) => {
    try {
        const logData = {
            user: user || (req && req.user ? req.user.id : null),
            action,
            category,
            status,
            description,
            details,
            resourceId,
            resourceModel,
            ipAddress: req ? req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress : '',
            userAgent: req ? req.get('User-Agent') : ''
        };

        const log = new SystemLog(logData);
        await log.save();
        return log;
    } catch (error) {
        console.error('Error creating system log:', error);
        // We don't want to throw an error here as logging failure shouldn't crash the app
        return null;
    }
};

/**
 * Predefined log helper for Auth events
 */
export const logAuth = (options) => createLog({ ...options, category: 'AUTH' });

/**
 * Predefined log helper for User events
 */
export const logUser = (options) => createLog({ ...options, category: 'USER' });

/**
 * Predefined log helper for Appointment events
 */
export const logAppointment = (options) => createLog({ ...options, category: 'APPOINTMENT' });

/**
 * Predefined log helper for System events
 */
export const logSystem = (options) => createLog({ ...options, category: 'SYSTEM' });
