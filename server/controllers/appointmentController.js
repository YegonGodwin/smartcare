import Appointment from '../models/Appointment.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { getPagination, getSort } from '../utils/buildQuery.js';
import { sendSuccess } from '../utils/response.js';

const appointmentPopulation = [
    { path: 'patient', select: 'patientNumber firstName lastName phone' },
    { path: 'doctor', select: 'staffId firstName lastName specialization' },
    { path: 'department', select: 'name code' }
];

export const listAppointments = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};

    if (req.user?.role === 'patient') {
        filter.patient = req.user.patientProfile?._id || req.user.patientProfile;
    }

    if (req.user?.role === 'doctor') {
        filter.doctor = req.user.doctorProfile?._id || req.user.doctorProfile;
    }

    if (req.query.status) {
        filter.status = req.query.status;
    }

    if (req.query.type) {
        filter.type = req.query.type;
    }

    if (req.query.doctor && req.user?.role !== 'doctor') {
        filter.doctor = req.query.doctor;
    }

    if (req.query.patient && req.user?.role !== 'patient') {
        filter.patient = req.query.patient;
    }

    if (req.query.department) {
        filter.department = req.query.department;
    }

    if (req.query.from || req.query.to) {
        filter.scheduledFor = {};
        if (req.query.from) {
            filter.scheduledFor.$gte = new Date(req.query.from);
        }
        if (req.query.to) {
            filter.scheduledFor.$lte = new Date(req.query.to);
        }
    }

    const [items, total] = await Promise.all([
        Appointment.find(filter).populate(appointmentPopulation).sort(getSort(req.query, 'scheduledFor')).skip(skip).limit(limit),
        Appointment.countDocuments(filter)
    ]);

    sendSuccess(res, 200, 'Appointments retrieved successfully', items, {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
    });
});

export const getAppointmentById = asyncHandler(async (req, res) => {
    const appointment = await Appointment.findById(req.params.id).populate(appointmentPopulation);

    if (!appointment) {
        throw new ApiError(404, 'Appointment not found');
    }

    if (req.user?.role === 'patient' && String(appointment.patient?._id || appointment.patient) !== String(req.user.patientProfile?._id || req.user.patientProfile)) {
        throw new ApiError(403, 'You can only access your own appointments');
    }

    if (req.user?.role === 'doctor' && String(appointment.doctor?._id || appointment.doctor) !== String(req.user.doctorProfile?._id || req.user.doctorProfile)) {
        throw new ApiError(403, 'You can only access your own appointments');
    }

    sendSuccess(res, 200, 'Appointment retrieved successfully', appointment);
});

export const createAppointment = asyncHandler(async (req, res) => {
    const appointment = await Appointment.create(req.body);
    const populatedAppointment = await Appointment.findById(appointment._id).populate(appointmentPopulation);
    sendSuccess(res, 201, 'Appointment created successfully', populatedAppointment);
});

export const updateAppointment = asyncHandler(async (req, res) => {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    }).populate(appointmentPopulation);

    if (!appointment) {
        throw new ApiError(404, 'Appointment not found');
    }

    sendSuccess(res, 200, 'Appointment updated successfully', appointment);
});

export const deleteAppointment = asyncHandler(async (req, res) => {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!appointment) {
        throw new ApiError(404, 'Appointment not found');
    }

    sendSuccess(res, 200, 'Appointment deleted successfully');
});
