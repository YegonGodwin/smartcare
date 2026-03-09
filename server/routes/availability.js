import express from 'express';
import { body, param } from 'express-validator';
import {
    getDoctorAvailability,
    updateAvailabilitySchedule,
    addTimeOff,
    updateTimeOff,
    deleteTimeOff,
    toggleEmergencyUnavailability
} from '../controllers/availabilityController.js';
import validateRequest from '../middleware/validateRequest.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

const availabilityScheduleValidation = [
    body('availability').isArray().withMessage('Availability must be an array'),
    body('availability.*.day')
        .isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
        .withMessage('Invalid day'),
    body('availability.*.startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid start time format (HH:MM)'),
    body('availability.*.endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid end time format (HH:MM)')
];

const timeOffValidation = [
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    body('type').optional().isIn(['vacation', 'sick-leave', 'conference', 'personal', 'other']).withMessage('Invalid time-off type'),
    body('reason').optional().isString().withMessage('Reason must be a string'),
    body('isRecurring').optional().isBoolean().withMessage('isRecurring must be boolean'),
    body('recurringPattern.dayOfWeek')
        .optional()
        .isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
        .withMessage('Invalid day of week'),
    body('recurringPattern.startTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid start time'),
    body('recurringPattern.endTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid end time')
];

const emergencyUnavailabilityValidation = [
    body('isUnavailable').isBoolean().withMessage('isUnavailable must be boolean'),
    body('until').optional().isISO8601().withMessage('Valid date is required'),
    body('reason').optional().isString().withMessage('Reason must be a string')
];

router.use(protect);

// Get doctor availability
router.get(
    '/:doctorId',
    authorize('admin', 'doctor', 'receptionist'),
    param('doctorId').isMongoId().withMessage('Invalid doctor ID'),
    validateRequest,
    getDoctorAvailability
);

// Update availability schedule
router.put(
    '/:doctorId/schedule',
    authorize('admin', 'doctor'),
    param('doctorId').isMongoId().withMessage('Invalid doctor ID'),
    availabilityScheduleValidation,
    validateRequest,
    updateAvailabilitySchedule
);

// Add time-off
router.post(
    '/:doctorId/time-off',
    authorize('admin', 'doctor'),
    param('doctorId').isMongoId().withMessage('Invalid doctor ID'),
    timeOffValidation,
    validateRequest,
    addTimeOff
);

// Update time-off
router.put(
    '/:doctorId/time-off/:timeOffId',
    authorize('admin', 'doctor'),
    param('doctorId').isMongoId().withMessage('Invalid doctor ID'),
    param('timeOffId').isMongoId().withMessage('Invalid time-off ID'),
    timeOffValidation,
    validateRequest,
    updateTimeOff
);

// Delete time-off
router.delete(
    '/:doctorId/time-off/:timeOffId',
    authorize('admin', 'doctor'),
    param('doctorId').isMongoId().withMessage('Invalid doctor ID'),
    param('timeOffId').isMongoId().withMessage('Invalid time-off ID'),
    validateRequest,
    deleteTimeOff
);

// Toggle emergency unavailability
router.patch(
    '/:doctorId/emergency',
    authorize('admin', 'doctor'),
    param('doctorId').isMongoId().withMessage('Invalid doctor ID'),
    emergencyUnavailabilityValidation,
    validateRequest,
    toggleEmergencyUnavailability
);

export default router;
