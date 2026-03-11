/**
 * Default availability schedules for newly onboarded doctors
 * These can be customized based on hospital/clinic policies
 */

/**
 * Standard weekday schedule (Monday-Friday, 9 AM - 5 PM)
 */
export const STANDARD_WEEKDAY_SCHEDULE = [
    { day: 'monday', startTime: '09:00', endTime: '17:00' },
    { day: 'tuesday', startTime: '09:00', endTime: '17:00' },
    { day: 'wednesday', startTime: '09:00', endTime: '17:00' },
    { day: 'thursday', startTime: '09:00', endTime: '17:00' },
    { day: 'friday', startTime: '09:00', endTime: '17:00' }
];

/**
 * Full week schedule including weekends (Monday-Saturday, 9 AM - 5 PM)
 */
export const FULL_WEEK_SCHEDULE = [
    { day: 'monday', startTime: '09:00', endTime: '17:00' },
    { day: 'tuesday', startTime: '09:00', endTime: '17:00' },
    { day: 'wednesday', startTime: '09:00', endTime: '17:00' },
    { day: 'thursday', startTime: '09:00', endTime: '17:00' },
    { day: 'friday', startTime: '09:00', endTime: '17:00' },
    { day: 'saturday', startTime: '09:00', endTime: '13:00' }
];

/**
 * Extended hours schedule (Monday-Friday, 8 AM - 6 PM)
 */
export const EXTENDED_HOURS_SCHEDULE = [
    { day: 'monday', startTime: '08:00', endTime: '18:00' },
    { day: 'tuesday', startTime: '08:00', endTime: '18:00' },
    { day: 'wednesday', startTime: '08:00', endTime: '18:00' },
    { day: 'thursday', startTime: '08:00', endTime: '18:00' },
    { day: 'friday', startTime: '08:00', endTime: '18:00' }
];

/**
 * Get default availability schedule based on configuration
 * @param {string} scheduleType - Type of schedule ('standard', 'full-week', 'extended')
 * @returns {Array} Availability schedule array
 */
export function getDefaultAvailability(scheduleType = 'standard') {
    switch (scheduleType) {
        case 'full-week':
            return FULL_WEEK_SCHEDULE;
        case 'extended':
            return EXTENDED_HOURS_SCHEDULE;
        case 'standard':
        default:
            return STANDARD_WEEKDAY_SCHEDULE;
    }
}
