import MedicalRecord from '../models/MedicalRecord.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { getPagination, getSort } from '../utils/buildQuery.js';
import { sendSuccess } from '../utils/response.js';

const medicalRecordPopulation = [
    { path: 'patient', select: 'patientNumber firstName lastName' },
    { path: 'doctor', select: 'staffId firstName lastName specialization' },
    { path: 'appointment', select: 'appointmentNumber scheduledFor status' }
];

export const listMedicalRecords = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};

    if (req.user?.role === 'patient') {
        filter.patient = req.user.patientProfile?._id || req.user.patientProfile;
    }

    if (req.user?.role === 'doctor') {
        filter.doctor = req.user.doctorProfile?._id || req.user.doctorProfile;
    }

    if (req.query.patient && req.user?.role !== 'patient') {
        filter.patient = req.query.patient;
    }

    if (req.query.doctor && req.user?.role !== 'doctor') {
        filter.doctor = req.query.doctor;
    }

    if (req.query.from || req.query.to) {
        filter.visitDate = {};
        if (req.query.from) {
            filter.visitDate.$gte = new Date(req.query.from);
        }
        if (req.query.to) {
            filter.visitDate.$lte = new Date(req.query.to);
        }
    }

    const [items, total] = await Promise.all([
        MedicalRecord.find(filter).populate(medicalRecordPopulation).sort(getSort(req.query, '-visitDate')).skip(skip).limit(limit),
        MedicalRecord.countDocuments(filter)
    ]);

    sendSuccess(res, 200, 'Medical records retrieved successfully', items, {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
    });
});

export const getMedicalRecordById = asyncHandler(async (req, res) => {
    const record = await MedicalRecord.findById(req.params.id).populate(medicalRecordPopulation);

    if (!record) {
        throw new ApiError(404, 'Medical record not found');
    }

    if (req.user?.role === 'patient' && String(record.patient?._id || record.patient) !== String(req.user.patientProfile?._id || req.user.patientProfile)) {
        throw new ApiError(403, 'You can only access your own medical records');
    }

    if (req.user?.role === 'doctor' && String(record.doctor?._id || record.doctor) !== String(req.user.doctorProfile?._id || req.user.doctorProfile)) {
        throw new ApiError(403, 'You can only access your own medical records');
    }

    sendSuccess(res, 200, 'Medical record retrieved successfully', record);
});

export const createMedicalRecord = asyncHandler(async (req, res) => {
    const record = await MedicalRecord.create(req.body);
    const populatedRecord = await MedicalRecord.findById(record._id).populate(medicalRecordPopulation);
    sendSuccess(res, 201, 'Medical record created successfully', populatedRecord);
});

export const updateMedicalRecord = asyncHandler(async (req, res) => {
    const record = await MedicalRecord.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    }).populate(medicalRecordPopulation);

    if (!record) {
        throw new ApiError(404, 'Medical record not found');
    }

    sendSuccess(res, 200, 'Medical record updated successfully', record);
});

export const deleteMedicalRecord = asyncHandler(async (req, res) => {
    const record = await MedicalRecord.findByIdAndDelete(req.params.id);

    if (!record) {
        throw new ApiError(404, 'Medical record not found');
    }

    sendSuccess(res, 200, 'Medical record deleted successfully');
});
