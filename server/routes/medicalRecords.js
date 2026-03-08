import express from 'express';
import { body, param } from 'express-validator';
import {
    listMedicalRecords,
    getMedicalRecordById,
    createMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord
} from '../controllers/medicalRecordController.js';
import validateRequest from '../middleware/validateRequest.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

const medicalRecordValidation = [
    body('patient').isMongoId().withMessage('Valid patient is required'),
    body('doctor').isMongoId().withMessage('Valid doctor is required'),
    body('appointment').optional({ values: 'falsy' }).isMongoId().withMessage('Appointment must be a valid id'),
    body('diagnosis').trim().notEmpty().withMessage('Diagnosis is required'),
    body('visitDate').optional({ values: 'falsy' }).isISO8601().withMessage('Visit date must be valid'),
    body('followUpDate').optional({ values: 'falsy' }).isISO8601().withMessage('Follow up date must be valid')
];

router.use(protect);
router.get('/', authorize('admin', 'doctor', 'patient'), listMedicalRecords);
router.get('/:id', authorize('admin', 'doctor', 'patient'), param('id').isMongoId().withMessage('Invalid medical record id'), validateRequest, getMedicalRecordById);
router.post('/', authorize('admin', 'doctor'), medicalRecordValidation, validateRequest, createMedicalRecord);
router.put('/:id', authorize('admin', 'doctor'), param('id').isMongoId().withMessage('Invalid medical record id'), medicalRecordValidation, validateRequest, updateMedicalRecord);
router.delete('/:id', authorize('admin'), param('id').isMongoId().withMessage('Invalid medical record id'), validateRequest, deleteMedicalRecord);

export default router;
