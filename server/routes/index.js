import express from 'express';
import authRoutes from './auth.js';
import departmentRoutes from './departments.js';
import patientRoutes from './patients.js';
import doctorRoutes from './doctors.js';
import appointmentRoutes from './appointments.js';
import medicalRecordRoutes from './medicalRecords.js';
import { getDashboardSummary } from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'SmartCare API is running',
        version: '1.0.0'
    });
});

router.get('/health', (_req, res) => {
    res.status(200).json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

router.use('/auth', authRoutes);
router.get('/dashboard/summary', protect, authorize('admin', 'doctor', 'receptionist'), getDashboardSummary);
router.use('/departments', departmentRoutes);
router.use('/patients', patientRoutes);
router.use('/doctors', doctorRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/medical-records', medicalRecordRoutes);

export default router;
