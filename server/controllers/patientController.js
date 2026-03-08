import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import MedicalRecord from '../models/MedicalRecord.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { getPagination, getSort, buildTextSearch } from '../utils/buildQuery.js';
import { sendSuccess } from '../utils/response.js';

export const listPatients = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};
    const searchFilter = buildTextSearch(req.query.search, ['patientNumber', 'firstName', 'lastName', 'phone', 'email']);

    if (req.user?.role === 'patient') {
        filter._id = req.user.patientProfile?._id || req.user.patientProfile;
    }

    if (req.query.status) {
        filter.status = req.query.status;
    }

    if (req.query.gender) {
        filter.gender = req.query.gender;
    }

    if (searchFilter) {
        Object.assign(filter, searchFilter);
    }

    const [items, total] = await Promise.all([
        Patient.find(filter).sort(getSort(req.query, '-createdAt')).skip(skip).limit(limit),
        Patient.countDocuments(filter)
    ]);

    sendSuccess(res, 200, 'Patients retrieved successfully', items, {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
    });
});

export const getPatientById = asyncHandler(async (req, res) => {
    if (req.user?.role === 'patient' && String(req.user.patientProfile?._id || req.user.patientProfile) !== req.params.id) {
        throw new ApiError(403, 'You can only access your own patient profile');
    }

    const patient = await Patient.findById(req.params.id);

    if (!patient) {
        throw new ApiError(404, 'Patient not found');
    }

    const [appointments, records] = await Promise.all([
        Appointment.find({ patient: patient._id }).sort('-scheduledFor').limit(5).populate('doctor department', 'firstName lastName name'),
        MedicalRecord.find({ patient: patient._id }).sort('-visitDate').limit(5).populate('doctor appointment', 'firstName lastName appointmentNumber scheduledFor')
    ]);

    sendSuccess(res, 200, 'Patient retrieved successfully', {
        ...patient.toObject(),
        recentAppointments: appointments,
        recentMedicalRecords: records
    });
});

export const createPatient = asyncHandler(async (req, res) => {
    const patient = await Patient.create(req.body);
    sendSuccess(res, 201, 'Patient created successfully', patient);
});

export const updatePatient = asyncHandler(async (req, res) => {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!patient) {
        throw new ApiError(404, 'Patient not found');
    }

    sendSuccess(res, 200, 'Patient updated successfully', patient);
});

export const deletePatient = asyncHandler(async (req, res) => {
    const [appointmentCount, recordCount] = await Promise.all([
        Appointment.countDocuments({ patient: req.params.id }),
        MedicalRecord.countDocuments({ patient: req.params.id })
    ]);

    if (appointmentCount > 0 || recordCount > 0) {
        throw new ApiError(409, 'Patient cannot be deleted while linked appointments or records exist');
    }

    const patient = await Patient.findByIdAndDelete(req.params.id);

    if (!patient) {
        throw new ApiError(404, 'Patient not found');
    }

    sendSuccess(res, 200, 'Patient deleted successfully');
});
