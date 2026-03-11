import { getDefaultAvailability } from './defaultAvailability.js';

/**
 * Initialize availability schedule for a newly created doctor
 * This ensures doctors can accept appointments immediately after onboarding
 * 
 * @param {Object} doctor - Doctor document
 * @param {string} scheduleType - Type of schedule ('standard', 'full-week', 'extended')
 * @returns {Promise<Object>} Updated doctor document
 */
export async function initializeDoctorAvailability(doctor, scheduleType = 'standard') {
    // Only initialize if doctor has no availability set
    if (!doctor.availability || doctor.availability.length === 0) {
        doctor.availability = getDefaultAvailability(scheduleType);
        await doctor.save();
    }
    return doctor;
}

/**
 * Validate doctor has proper availability configuration
 * @param {Object} doctor - Doctor document
 * @returns {Object} Validation result with status and message
 */
export function validateDoctorAvailability(doctor) {
    if (!doctor.availability || doctor.availability.length === 0) {
        return {
            valid: false,
            message: 'Doctor has no availability schedule configured. Please set up working hours.',
            action: 'configure_availability'
        };
    }

    if (doctor.status !== 'active') {
        return {
            valid: false,
            message: `Doctor status is '${doctor.status}'. Only active doctors can accept appointments.`,
            action: 'update_status'
        };
    }

    if (doctor.isEmergencyUnavailable) {
        const until = doctor.emergencyUnavailableUntil 
            ? ` until ${new Date(doctor.emergencyUnavailableUntil).toLocaleDateString()}`
            : '';
        return {
            valid: false,
            message: `Doctor is marked as emergency unavailable${until}.`,
            action: 'clear_emergency_status'
        };
    }

    return {
        valid: true,
        message: 'Doctor availability is properly configured'
    };
}
