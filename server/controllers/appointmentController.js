import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { getPagination, getSort } from '../utils/buildQuery.js';
import { sendSuccess } from '../utils/response.js';
import { checkAppointmentConflict, isDoctorAvailable } from '../utils/appointmentHelpers.js';
import { sendAppointmentConfirmation, sendAppointmentCancellation, sendNewAppointmentRequestNotification } from '../services/notificationService.js';
import { logAppointment } from '../services/logService.js';

const roleAllowedStatusTargets = {
    admin: ['pending', 'scheduled', 'confirmed', 'cancelled', 'rejected'],
    receptionist: ['scheduled', 'confirmed', 'cancelled'],
    doctor: ['confirmed', 'checked-in', 'in-progress', 'completed', 'no-show', 'rejected'],
    patient: ['cancelled']
};

const appointmentStatusTransitions = {
    pending: ['confirmed', 'rejected', 'cancelled'],
    scheduled: ['confirmed', 'checked-in', 'cancelled', 'no-show'],
    confirmed: ['checked-in', 'cancelled', 'no-show'],
    'checked-in': ['in-progress', 'cancelled', 'no-show'],
    'in-progress': ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
    'no-show': [],
    rejected: []
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

    // Validate doctor exists and is active
    const doctor = await Doctor.findById(payload.doctor);
    if (!doctor) {
        throw new ApiError(404, 'Doctor not found');
    }

    if (doctor.status !== 'active') {
        throw new ApiError(400, 'Doctor is not currently available for appointments');
    }

    // Check if appointment is in the past
    const scheduledFor = new Date(payload.scheduledFor);
    if (scheduledFor < new Date()) {
        throw new ApiError(400, 'Cannot schedule appointments in the past');
    }

    // Check doctor availability schedule
    const availabilityCheck = isDoctorAvailable(doctor, payload.scheduledFor, payload.durationMinutes || 30);
    if (!availabilityCheck.available) {
        throw new ApiError(400, availabilityCheck.reason);
    }

    // Check for appointment conflicts
    const conflict = await checkAppointmentConflict(
        payload.doctor,
        payload.scheduledFor,
        payload.durationMinutes || 30
    );

    if (conflict) {
        throw new ApiError(409, 'Doctor already has an appointment at this time. Please choose a different time slot.');
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
    
    await logAppointment({
        user: req.user._id,
        action: 'CREATE_APPOINTMENT',
        status: 'SUCCESS',
        description: `Appointment ${appointment.appointmentNumber} created for patient ${payload.patient}`,
        resourceId: appointment._id,
        resourceModel: 'Appointment',
        req
    });

    // Send confirmation email
    try {
        const patient = await Patient.findById(payload.patient);
        await sendAppointmentConfirmation(populatedAppointment, patient, doctor);
    } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError.message);
    }
    
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

    // If updating doctor or scheduledFor, validate conflicts
    if (payload.doctor || payload.scheduledFor) {
        const doctorId = payload.doctor || existingAppointment.doctor;
        const scheduledFor = payload.scheduledFor || existingAppointment.scheduledFor;
        const durationMinutes = payload.durationMinutes || existingAppointment.durationMinutes;

        // Validate doctor exists and is active
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            throw new ApiError(404, 'Doctor not found');
        }

        if (doctor.status !== 'active') {
            throw new ApiError(400, 'Doctor is not currently available for appointments');
        }

        // Check if appointment is in the past
        if (new Date(scheduledFor) < new Date()) {
            throw new ApiError(400, 'Cannot schedule appointments in the past');
        }

        // Check doctor availability schedule
        const availabilityCheck = isDoctorAvailable(doctor, scheduledFor, durationMinutes);
        if (!availabilityCheck.available) {
            throw new ApiError(400, availabilityCheck.reason);
        }

        // Check for conflicts (excluding current appointment)
        const conflict = await checkAppointmentConflict(
            doctorId,
            scheduledFor,
            durationMinutes,
            req.params.id
        );

        if (conflict) {
            throw new ApiError(409, 'Doctor already has an appointment at this time. Please choose a different time slot.');
        }
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

    await logAppointment({
        user: req.user._id,
        action: 'UPDATE_APPOINTMENT_STATUS',
        status: 'SUCCESS',
        description: `Appointment ${appointment.appointmentNumber} status changed from ${currentStatus} to ${nextStatus}`,
        resourceId: appointment._id,
        resourceModel: 'Appointment',
        details: { from: currentStatus, to: nextStatus, note },
        req
    });

    // Send cancellation email if status is cancelled
    if (nextStatus === 'cancelled') {
        try {
            const patient = await Patient.findById(appointment.patient);
            const doctor = await Doctor.findById(appointment.doctor);
            await sendAppointmentCancellation(populatedAppointment, patient, doctor, note);
        } catch (emailError) {
            console.error('Failed to send cancellation email:', emailError.message);
        }
    }

    sendSuccess(res, 200, 'Appointment status updated successfully', populatedAppointment);
});

export const deleteAppointment = asyncHandler(async (req, res) => {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!appointment) {
        throw new ApiError(404, 'Appointment not found');
    }

    sendSuccess(res, 200, 'Appointment deleted successfully');
});

export const getDoctorAvailableSlots = asyncHandler(async (req, res) => {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
        throw new ApiError(400, 'Doctor ID and date are required');
    }

    const { getDoctorAvailableSlots: getSlots } = await import('../utils/appointmentHelpers.js');
    const slots = await getSlots(doctorId, date, 30);

    sendSuccess(res, 200, 'Available slots retrieved successfully', slots);
});

export const bookAppointmentAsPatient = asyncHandler(async (req, res) => {
    if (req.user?.role !== 'patient') {
        throw new ApiError(403, 'Only patients can use this endpoint');
    }

    const patientProfileId = getPatientProfileId(req);
    if (!patientProfileId) {
        throw new ApiError(400, 'Patient profile not found');
    }

    const payload = {
        ...req.body,
        patient: patientProfileId
    };

    // Validate doctor exists and is active
    const doctor = await Doctor.findById(payload.doctor);
    if (!doctor) {
        throw new ApiError(404, 'Doctor not found');
    }

    if (doctor.status !== 'active') {
        throw new ApiError(400, 'Doctor is not currently available for appointments');
    }

    // Check if appointment is in the past
    const scheduledFor = new Date(payload.scheduledFor);
    if (scheduledFor < new Date()) {
        throw new ApiError(400, 'Cannot schedule appointments in the past');
    }

    // Check doctor availability schedule
    const availabilityCheck = isDoctorAvailable(doctor, payload.scheduledFor, payload.durationMinutes || 30);
    if (!availabilityCheck.available) {
        throw new ApiError(400, availabilityCheck.reason);
    }

    // Check for appointment conflicts
    const conflict = await checkAppointmentConflict(
        payload.doctor,
        payload.scheduledFor,
        payload.durationMinutes || 30
    );

    if (conflict) {
        throw new ApiError(409, 'Doctor already has an appointment at this time. Please choose a different time slot.');
    }

    payload.status = 'pending';
    payload.requiresApproval = true;
    payload.statusHistory = [
        {
            from: '',
            to: 'pending',
            note: 'Appointment booked by patient - awaiting doctor approval',
            changedBy: {
                userId: req.user._id,
                role: req.user.role
            },
            changedAt: new Date()
        }
    ];

    const appointment = await Appointment.create(payload);
    const populatedAppointment = await Appointment.findById(appointment._id).populate(appointmentPopulation);
    
    await logAppointment({
        user: req.user._id,
        action: 'BOOK_APPOINTMENT_PATIENT',
        status: 'SUCCESS',
        description: `New appointment request ${appointment.appointmentNumber} submitted by patient`,
        resourceId: appointment._id,
        resourceModel: 'Appointment',
        req
    });

    // Send notification to doctor about new appointment request
    try {
        const patient = await Patient.findById(patientProfileId);
        await sendNewAppointmentRequestNotification(populatedAppointment, patient, doctor);
    } catch (emailError) {
        console.error('Failed to send doctor notification:', emailError.message);
    }
    
    sendSuccess(res, 201, 'Appointment request submitted successfully. Awaiting doctor approval.', populatedAppointment);
});
