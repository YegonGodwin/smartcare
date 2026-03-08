import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import MedicalRecord from '../models/MedicalRecord.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { getPagination, getSort, buildTextSearch } from '../utils/buildQuery.js';
import { sendSuccess } from '../utils/response.js';

export const listDoctors = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};
    const searchFilter = buildTextSearch(req.query.search, ['staffId', 'firstName', 'lastName', 'email', 'specialization']);

    if (req.query.status) {
        filter.status = req.query.status;
    }

    if (req.query.department) {
        filter.department = req.query.department;
    }

    if (searchFilter) {
        Object.assign(filter, searchFilter);
    }

    const [items, total] = await Promise.all([
        Doctor.find(filter).populate('department', 'name code').sort(getSort(req.query, 'firstName')).skip(skip).limit(limit),
        Doctor.countDocuments(filter)
    ]);

    sendSuccess(res, 200, 'Doctors retrieved successfully', items, {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
    });
});

export const getDoctorById = asyncHandler(async (req, res) => {
    const doctor = await Doctor.findById(req.params.id).populate('department', 'name code');

    if (!doctor) {
        throw new ApiError(404, 'Doctor not found');
    }

    const [upcomingAppointments, medicalRecordCount] = await Promise.all([
        Appointment.find({
            doctor: doctor._id,
            scheduledFor: { $gte: new Date() },
            status: { $in: ['scheduled', 'confirmed'] }
        })
            .sort('scheduledFor')
            .limit(5)
            .populate('patient department', 'firstName lastName patientNumber name'),
        MedicalRecord.countDocuments({ doctor: doctor._id })
    ]);

    sendSuccess(res, 200, 'Doctor retrieved successfully', {
        ...doctor.toObject(),
        stats: { medicalRecordCount },
        upcomingAppointments
    });
});

export const createDoctor = asyncHandler(async (req, res) => {
    const doctor = await Doctor.create(req.body);
    const populatedDoctor = await Doctor.findById(doctor._id).populate('department', 'name code');
    sendSuccess(res, 201, 'Doctor created successfully', populatedDoctor);
});

export const updateDoctor = asyncHandler(async (req, res) => {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    }).populate('department', 'name code');

    if (!doctor) {
        throw new ApiError(404, 'Doctor not found');
    }

    sendSuccess(res, 200, 'Doctor updated successfully', doctor);
});

export const deleteDoctor = asyncHandler(async (req, res) => {
    const [appointmentCount, recordCount] = await Promise.all([
        Appointment.countDocuments({ doctor: req.params.id }),
        MedicalRecord.countDocuments({ doctor: req.params.id })
    ]);

    if (appointmentCount > 0 || recordCount > 0) {
        throw new ApiError(409, 'Doctor cannot be deleted while linked appointments or records exist');
    }

    const doctor = await Doctor.findByIdAndDelete(req.params.id);

    if (!doctor) {
        throw new ApiError(404, 'Doctor not found');
    }

    sendSuccess(res, 200, 'Doctor deleted successfully');
});
