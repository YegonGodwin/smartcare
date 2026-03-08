import Appointment from '../models/Appointment.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { getPagination, getSort } from '../utils/buildQuery.js';
import { sendSuccess } from '../utils/response.js';

const roleAllowedStatusTargets = {
    admin: ['scheduled', 'confirmed', 'cancelled'],
    receptionist: ['scheduled', 'confirmed', 'cancelled'],
    doctor: ['checked-in', 'in-progress', 'completed', 'no-show']
};

const appointmentStatusTransitions = {
    scheduled: ['confirmed', 'checked-in', 'cancelled', 'no-show'],
    confirmed: ['checked-in', 'cancelled', 'no-show'],
    'checked-in': ['in-progress', 'cancelled', 'no-show'],
    'in-progress': ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
    'no-show': []
};

const appointmentPopulation = [
    { path: 'patient', select: 'patientNumber firstName lastName phone' },
    { path: 'doctor', select: 'staffId firstName lastName specialization' },
    { path: 'department', select: 'name code' }
];

const getDoctorProfileId = (req) => String(req.user?.doctorProfile?._id || req.user?.doctorProfile || '');
const getPatientProfileId = (req) => String(req.user?.patientProfile?._id || req.user?.patientProfile || '');

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
    const payload = { ...req.body };

    if (req.user?.role === 'doctor') {
        payload.doctor = getDoctorProfileId(req);
    }

    payload.status = 'scheduled';
    payload.statusHistory = [
        {
            from: '',
            to: 'scheduled',
            note: 'Appointment created',
            changedBy: {
                userId: req.user._id,
                role: req.user.role
            },
            changedAt: new Date()
        }
    ];

    const appointment = await Appointment.create(payload);
    const populatedAppointment = await Appointment.findById(appointment._id).populate(appointmentPopulation);
    sendSuccess(res, 201, 'Appointment created successfully', populatedAppointment);
});

export const updateAppointment = asyncHandler(async (req, res) => {
    const existingAppointment = await Appointment.findById(req.params.id);

    if (!existingAppointment) {
        throw new ApiError(404, 'Appointment not found');
    }

    if (req.user?.role === 'doctor' && String(existingAppointment.doctor) !== getDoctorProfileId(req)) {
        throw new ApiError(403, 'You can only update your own appointments');
    }

    if (req.user?.role === 'patient' && String(existingAppointment.patient) !== getPatientProfileId(req)) {
        throw new ApiError(403, 'You can only update your own appointments');
    }

    const payload = { ...req.body };

    if (req.user?.role === 'doctor') {
        payload.doctor = getDoctorProfileId(req);
    }

    delete payload.status;
    delete payload.statusHistory;

    const appointment = await Appointment.findByIdAndUpdate(req.params.id, payload, {
        new: true,
        runValidators: true
    }).populate(appointmentPopulation);

    sendSuccess(res, 200, 'Appointment updated successfully', appointment);
});

export const updateAppointmentStatus = asyncHandler(async (req, res) => {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
        throw new ApiError(404, 'Appointment not found');
    }

    if (req.user?.role === 'doctor' && String(appointment.doctor) !== getDoctorProfileId(req)) {
        throw new ApiError(403, 'You can only update your own appointments');
    }

    if (req.user?.role === 'patient' && String(appointment.patient) !== getPatientProfileId(req)) {
        throw new ApiError(403, 'You can only update your own appointments');
    }

    const { status: nextStatus, note } = req.body;
    const allowedTargets = roleAllowedStatusTargets[req.user.role] || [];

    if (!allowedTargets.includes(nextStatus)) {
        throw new ApiError(403, `Role "${req.user.role}" is not allowed to set status "${nextStatus}"`);
    }

    const currentStatus = appointment.status;
    const validTargets = appointmentStatusTransitions[currentStatus] || [];

    if (!validTargets.includes(nextStatus)) {
        throw new ApiError(400, `Invalid status transition from "${currentStatus}" to "${nextStatus}"`);
    }

    if ((nextStatus === 'cancelled' || nextStatus === 'no-show') && !String(note || '').trim()) {
        throw new ApiError(400, `A note is required when marking an appointment as "${nextStatus}"`);
    }

    appointment.status = nextStatus;
    appointment.statusHistory.push({
        from: currentStatus,
        to: nextStatus,
        note: String(note || '').trim(),
        changedBy: {
            userId: req.user._id,
            role: req.user.role
        },
        changedAt: new Date()
    });

    await appointment.save();
    const populatedAppointment = await Appointment.findById(appointment._id).populate(appointmentPopulation);

    sendSuccess(res, 200, 'Appointment status updated successfully', populatedAppointment);
});

export const deleteAppointment = asyncHandler(async (req, res) => {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!appointment) {
        throw new ApiError(404, 'Appointment not found');
    }

    sendSuccess(res, 200, 'Appointment deleted successfully');
});
