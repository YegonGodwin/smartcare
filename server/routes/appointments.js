import express from 'express';
import { body, param, query } from 'express-validator';
import {
    listAppointments,
    getAppointmentById,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    updateAppointmentStatus,
    getDoctorAvailableSlots,
    bookAppointmentAsPatient
} from '../controllers/appointmentController.js';
import validateRequest from '../middleware/validateRequest.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

const appointmentValidation = [
    body('patient').isMongoId().withMessage('Valid patient is required'),
    body('doctor').isMongoId().withMessage('Valid doctor is required'),
    body('department').isMongoId().withMessage('Valid department is required'),
    body('scheduledFor').isISO8601().withMessage('Valid appointment date is required'),
    body('reason').trim().notEmpty().withMessage('Reason is required')
];

const patientBookingValidation = [
    body('doctor').isMongoId().withMessage('Valid doctor is required'),
    body('department').isMongoId().withMessage('Valid department is required'),
    body('scheduledFor').isISO8601().withMessage('Valid appointment date is required'),
    body('reason').trim().notEmpty().withMessage('Reason is required'),
    body('type').optional().isIn(['consultation', 'review', 'emergency', 'lab', 'procedure']).withMessage('Invalid appointment type')
];

const appointmentStatusValidation = [
    body('status')
        .isIn(['scheduled', 'confirmed', 'checked-in', 'in-progress', 'completed', 'cancelled', 'no-show'])
        .withMessage('Invalid appointment status'),
    body('note').optional({ values: 'falsy' }).isString().withMessage('Status note must be a string')
];

const availableSlotsValidation = [
    query('doctorId').isMongoId().withMessage('Valid doctor ID is required'),
    query('date').isISO8601().withMessage('Valid date is required')
];

router.use(protect);
router.get('/', authorize('admin', 'doctor', 'receptionist', 'patient'), listAppointments);
router.get('/available-slots', authorize('admin', 'doctor', 'receptionist', 'patient'), availableSlotsValidation, validateRequest, getDoctorAvailableSlots);
router.get('/:id', authorize('admin', 'doctor', 'receptionist', 'patient'), param('id').isMongoId().withMessage('Invalid appointment id'), validateRequest, getAppointmentById);
router.post('/', authorize('admin', 'doctor', 'receptionist'), appointmentValidation, validateRequest, createAppointment);
router.post('/book', authorize('patient'), patientBookingValidation, validateRequest, bookAppointmentAsPatient);
router.put('/:id', authorize('admin', 'doctor', 'receptionist'), param('id').isMongoId().withMessage('Invalid appointment id'), appointmentValidation, validateRequest, updateAppointment);
router.patch('/:id/status', authorize('admin', 'doctor', 'receptionist', 'patient'), param('id').isMongoId().withMessage('Invalid appointment id'), appointmentStatusValidation, validateRequest, updateAppointmentStatus);
router.delete('/:id', authorize('admin', 'receptionist'), param('id').isMongoId().withMessage('Invalid appointment id'), validateRequest, deleteAppointment);

export default router;
