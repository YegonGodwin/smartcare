import Doctor from '../models/Doctor.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess } from '../utils/response.js';
import { validateDoctorAvailability } from '../utils/doctorOnboarding.js';

// Get doctor's availability and time-off
export const getDoctorAvailability = asyncHandler(async (req, res) => {
    const { doctorId } = req.params;
    
    const doctor = await Doctor.findById(doctorId).select('availability timeOff isEmergencyUnavailable emergencyUnavailableUntil emergencyUnavailableReason status');
    
    if (!doctor) {
        throw new ApiError(404, 'Doctor not found');
    }
    
    // Only allow doctors to view their own availability, or admins
    if (req.user.role === 'doctor' && String(req.user.doctorProfile?._id || req.user.doctorProfile) !== doctorId) {
        throw new ApiError(403, 'You can only view your own availability');
    }
    
    // Add validation status
    const validation = validateDoctorAvailability(doctor);
    
    sendSuccess(res, 200, 'Doctor availability retrieved successfully', {
        ...doctor.toObject(),
        validation
    });
});

// Update doctor's weekly availability schedule
export const updateAvailabilitySchedule = asyncHandler(async (req, res) => {
    const { doctorId } = req.params;
    const { availability } = req.body;
    
    const doctor = await Doctor.findById(doctorId);
    
    if (!doctor) {
        throw new ApiError(404, 'Doctor not found');
    }
    
    // Only allow doctors to update their own availability, or admins
    if (req.user.role === 'doctor' && String(req.user.doctorProfile?._id || req.user.doctorProfile) !== doctorId) {
        throw new ApiError(403, 'You can only update your own availability');
    }
    
    doctor.availability = availability;
    await doctor.save();
    
    sendSuccess(res, 200, 'Availability schedule updated successfully', doctor);
});

// Add time-off block
export const addTimeOff = asyncHandler(async (req, res) => {
    const { doctorId } = req.params;
    const { startDate, endDate, reason, type, isRecurring, recurringPattern } = req.body;
    
    const doctor = await Doctor.findById(doctorId);
    
    if (!doctor) {
        throw new ApiError(404, 'Doctor not found');
    }
    
    // Only allow doctors to add their own time-off, or admins
    if (req.user.role === 'doctor' && String(req.user.doctorProfile?._id || req.user.doctorProfile) !== doctorId) {
        throw new ApiError(403, 'You can only manage your own time-off');
    }
    
    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
        throw new ApiError(400, 'End date must be after start date');
    }
    
    if (start < new Date()) {
        throw new ApiError(400, 'Cannot create time-off in the past');
    }
    
    const timeOff = {
        startDate: start,
        endDate: end,
        reason: reason || '',
        type: type || 'other',
        isRecurring: isRecurring || false,
        recurringPattern: isRecurring ? recurringPattern : undefined,
        createdBy: req.user._id
    };
    
    doctor.timeOff.push(timeOff);
    await doctor.save();
    
    sendSuccess(res, 201, 'Time-off added successfully', doctor.timeOff[doctor.timeOff.length - 1]);
});

// Update time-off block
export const updateTimeOff = asyncHandler(async (req, res) => {
    const { doctorId, timeOffId } = req.params;
    const updates = req.body;
    
    const doctor = await Doctor.findById(doctorId);
    
    if (!doctor) {
        throw new ApiError(404, 'Doctor not found');
    }
    
    // Only allow doctors to update their own time-off, or admins
    if (req.user.role === 'doctor' && String(req.user.doctorProfile?._id || req.user.doctorProfile) !== doctorId) {
        throw new ApiError(403, 'You can only manage your own time-off');
    }
    
    const timeOff = doctor.timeOff.id(timeOffId);
    
    if (!timeOff) {
        throw new ApiError(404, 'Time-off not found');
    }
    
    // Update fields
    if (updates.startDate) {
        const start = new Date(updates.startDate);
        if (start < new Date()) {
            throw new ApiError(400, 'Cannot set time-off start date in the past');
        }
        timeOff.startDate = start;
    }
    
    if (updates.endDate) {
        timeOff.endDate = new Date(updates.endDate);
    }
    
    if (timeOff.startDate >= timeOff.endDate) {
        throw new ApiError(400, 'End date must be after start date');
    }
    
    if (updates.reason !== undefined) timeOff.reason = updates.reason;
    if (updates.type) timeOff.type = updates.type;
    if (updates.isRecurring !== undefined) timeOff.isRecurring = updates.isRecurring;
    if (updates.recurringPattern) timeOff.recurringPattern = updates.recurringPattern;
    
    await doctor.save();
    
    sendSuccess(res, 200, 'Time-off updated successfully', timeOff);
});

// Delete time-off block
export const deleteTimeOff = asyncHandler(async (req, res) => {
    const { doctorId, timeOffId } = req.params;
    
    const doctor = await Doctor.findById(doctorId);
    
    if (!doctor) {
        throw new ApiError(404, 'Doctor not found');
    }
    
    // Only allow doctors to delete their own time-off, or admins
    if (req.user.role === 'doctor' && String(req.user.doctorProfile?._id || req.user.doctorProfile) !== doctorId) {
        throw new ApiError(403, 'You can only manage your own time-off');
    }
    
    const timeOff = doctor.timeOff.id(timeOffId);
    
    if (!timeOff) {
        throw new ApiError(404, 'Time-off not found');
    }
    
    timeOff.deleteOne();
    await doctor.save();
    
    sendSuccess(res, 200, 'Time-off deleted successfully');
});

// Toggle emergency unavailability
export const toggleEmergencyUnavailability = asyncHandler(async (req, res) => {
    const { doctorId } = req.params;
    const { isUnavailable, until, reason } = req.body;
    
    const doctor = await Doctor.findById(doctorId);
    
    if (!doctor) {
        throw new ApiError(404, 'Doctor not found');
    }
    
    // Only allow doctors to toggle their own emergency status, or admins
    if (req.user.role === 'doctor' && String(req.user.doctorProfile?._id || req.user.doctorProfile) !== doctorId) {
        throw new ApiError(403, 'You can only manage your own availability');
    }
    
    doctor.isEmergencyUnavailable = isUnavailable;
    doctor.emergencyUnavailableUntil = isUnavailable && until ? new Date(until) : null;
    doctor.emergencyUnavailableReason = isUnavailable && reason ? reason : '';
    
    await doctor.save();
    
    const message = isUnavailable 
        ? 'Emergency unavailability activated' 
        : 'Emergency unavailability deactivated';
    
    sendSuccess(res, 200, message, {
        isEmergencyUnavailable: doctor.isEmergencyUnavailable,
        emergencyUnavailableUntil: doctor.emergencyUnavailableUntil,
        emergencyUnavailableReason: doctor.emergencyUnavailableReason
    });
});
