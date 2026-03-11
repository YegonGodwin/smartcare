import express from 'express';
import { body, param, query } from 'express-validator';
import {
    getPendingAppointments,
    approveAppointment,
    rejectAppointment,
    rescheduleAppointment,
    bulkApproveAppointments,
    getDoctorWorkload,
    getScheduleOverview
} from '../controllers/doctorScheduleController.js';
import validateRequest from '../middleware/validateRequest.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get pending appointments for a doctor
router.get(
    '/:doctorId/pending',
    authorize('admin', 'doctor'),
    param('doctorId').isMongoId().withMessage('Invalid doctor ID'),
    validateRequest,
    getPendingAppointments
);

// Approve an appointment
router.post(
    '/appointments/:id/approve',
    authorize('admin', 'doctor'),
    param('id').isMongoId().withMessage('Invalid appointment ID'),
    body('note').optional().isString().withMessage('Note must be a string'),
    validateRequest,
    approveAppointment
);

// Reject an appointment
router.post(
    '/appointments/:id/reject',
    authorize('admin', 'doctor'),
    param('id').isMongoId().withMessage('Invalid appointment ID'),
    body('reason').notEmpty().withMessage('Rejection reason is required'),
    validateRequest,
    rejectAppointment
);

// Reschedule an appointment
router.post(
    '/appointments/:id/reschedule',
    authorize('admin', 'doctor'),
    param('id').isMongoId().withMessage('Invalid appointment ID'),
    body('newDate').isISO8601().withMessage('Valid new date is required'),
    body('reason').optional().isString().withMessage('Reason must be a string'),
    validateRequest,
    rescheduleAppointment
);

// Bulk approve appointments
router.post(
    '/appointments/bulk-approve',
    authorize('admin', 'doctor'),
    body('appointmentIds').isArray({ min: 1, max: 50 }).withMessage('appointmentIds must be an array with 1-50 items'),
    body('appointmentIds.*').isMongoId().withMessage('Each appointment ID must be valid'),
    validateRequest,
    bulkApproveAppointments
);

// Get doctor's workload metrics
router.get(
    '/:doctorId/workload',
    authorize('admin', 'doctor'),
    param('doctorId').isMongoId().withMessage('Invalid doctor ID'),
    query('startDate').optional().isISO8601().withMessage('Valid start date required'),
    query('endDate').optional().isISO8601().withMessage('Valid end date required'),
    validateRequest,
    getDoctorWorkload
);

// Get doctor's schedule overview
router.get(
    '/:doctorId/schedule-overview',
    authorize('admin', 'doctor'),
    param('doctorId').isMongoId().withMessage('Invalid doctor ID'),
    query('month').optional().isInt({ min: 1, max: 12 }).withMessage('Month must be 1-12'),
    query('year').optional().isInt({ min: 2020, max: 2100 }).withMessage('Year must be valid'),
    validateRequest,
    getScheduleOverview
);

export default router;
