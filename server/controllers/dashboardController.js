import Appointment from '../models/Appointment.js';
import Department from '../models/Department.js';
import Doctor from '../models/Doctor.js';
import MedicalRecord from '../models/MedicalRecord.js';
import Patient from '../models/Patient.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const getDashboardSummary = asyncHandler(async (_req, res) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [
        totalPatients,
        activeDoctors,
        totalDepartments,
        totalMedicalRecords,
        todayAppointments,
        upcomingAppointments
    ] = await Promise.all([
        Patient.countDocuments({ status: 'active' }),
        Doctor.countDocuments({ status: 'active' }),
        Department.countDocuments({ isActive: true }),
        MedicalRecord.countDocuments(),
        Appointment.countDocuments({
            scheduledFor: { $gte: startOfDay, $lte: endOfDay }
        }),
        Appointment.find({
            scheduledFor: { $gte: new Date() },
            status: { $in: ['scheduled', 'confirmed'] }
        })
            .sort('scheduledFor')
            .limit(10)
            .populate('patient doctor department', 'firstName lastName patientNumber name')
    ]);

    sendSuccess(res, 200, 'Dashboard summary retrieved successfully', {
        totals: {
            patients: totalPatients,
            doctors: activeDoctors,
            departments: totalDepartments,
            medicalRecords: totalMedicalRecords,
            todayAppointments
        },
        upcomingAppointments
    });
});
