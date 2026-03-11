import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess } from '../utils/response.js';
import { checkAppointmentConflict, isDoctorAvailable } from '../utils/appointmentHelpers.js';
import { sendAppointmentApprovalNotification, sendAppointmentRejectionNotification, sendAppointmentRescheduleNotification } from '../services/notificationService.js';

const appointmentPopulation = 'patient doctor department';

/**
 * Get pending appointment requests for a doctor
 */
export const getPendingAppointments = asyncHandler(async (req, res) => {
    const { doctorId } = req.params;
    
    // Authorization check
    if (req.user.role === 'doctor' && String(req.user.doctorProfile?._id || req.user.doctorProfile) !== doctorId) {
        throw new ApiError(403, 'You can only view your own pending appointments');
    }
    
    const pendingAppointments = await Appointment.find({
        doctor: doctorId,
        status: 'pending',
        scheduledFor: { $gte: new Date() } // Only future appointments
    })
        .populate(appointmentPopulation)
        .sort('scheduledFor');
    
    sendSuccess(res, 200, 'Pending appointments retrieved successfully', pendingAppointments);
});

/**
 * Approve an appointment request
 */
export const approveAppointment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { note } = req.body;
    
    const appointment = await Appointment.findById(id).populate(appointmentPopulation);
    
    if (!appointment) {
        throw new ApiError(404, 'Appointment not found');
    }
    
    // Authorization check
    if (req.user.role === 'doctor' && String(appointment.doctor._id) !== String(req.user.doctorProfile?._id || req.user.doctorProfile)) {
        throw new ApiError(403, 'You can only approve your own appointments');
    }
    
    if (appointment.status !== 'pending') {
        throw new ApiError(400, `Cannot approve appointment with status "${appointment.status}"`);
    }
    
    // Check if appointment time is still available
    const conflict = await checkAppointmentConflict(
        appointment.doctor._id,
        appointment.scheduledFor,
        appointment.durationMinutes,
        appointment._id
    );
    
    if (conflict) {
        throw new ApiError(409, 'This time slot is no longer available. Please reschedule the appointment.');
    }
    
    // Update appointment
    appointment.status = 'confirmed';
    appointment.approvedBy = req.user._id;
    appointment.approvedAt = new Date();
    
    // Add to status history
    appointment.statusHistory.push({
        from: 'pending',
        to: 'confirmed',
        note: note || 'Appointment approved by doctor',
        changedBy: {
            userId: req.user._id,
            role: req.user.role
        }
    });
    
    await appointment.save();
    
    // Send notification to patient
    try {
        await sendAppointmentApprovalNotification(appointment);
    } catch (notifError) {
        console.error('Failed to send approval notification:', notifError);
    }
    
    sendSuccess(res, 200, 'Appointment approved successfully', appointment);
});

/**
 * Reject an appointment request
 */
export const rejectAppointment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    
    if (!reason || !reason.trim()) {
        throw new ApiError(400, 'Rejection reason is required');
    }
    
    const appointment = await Appointment.findById(id).populate(appointmentPopulation);
    
    if (!appointment) {
        throw new ApiError(404, 'Appointment not found');
    }
    
    // Authorization check
    if (req.user.role === 'doctor' && String(appointment.doctor._id) !== String(req.user.doctorProfile?._id || req.user.doctorProfile)) {
        throw new ApiError(403, 'You can only reject your own appointments');
    }
    
    if (appointment.status !== 'pending') {
        throw new ApiError(400, `Cannot reject appointment with status "${appointment.status}"`);
    }
    
    // Update appointment
    appointment.status = 'rejected';
    appointment.rejectedBy = req.user._id;
    appointment.rejectedAt = new Date();
    appointment.rejectionReason = reason.trim();
    
    // Add to status history
    appointment.statusHistory.push({
        from: 'pending',
        to: 'rejected',
        note: reason.trim(),
        changedBy: {
            userId: req.user._id,
            role: req.user.role
        }
    });
    
    await appointment.save();
    
    // Send notification to patient
    try {
        await sendAppointmentRejectionNotification(appointment);
    } catch (notifError) {
        console.error('Failed to send rejection notification:', notifError);
    }
    
    sendSuccess(res, 200, 'Appointment rejected successfully', appointment);
});

/**
 * Reschedule an appointment
 */
export const rescheduleAppointment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { newDate, reason } = req.body;
    
    if (!newDate) {
        throw new ApiError(400, 'New date is required');
    }
    
    const appointment = await Appointment.findById(id).populate(appointmentPopulation);
    
    if (!appointment) {
        throw new ApiError(404, 'Appointment not found');
    }
    
    // Authorization check
    if (req.user.role === 'doctor' && String(appointment.doctor._id) !== String(req.user.doctorProfile?._id || req.user.doctorProfile)) {
        throw new ApiError(403, 'You can only reschedule your own appointments');
    }
    
    if (['completed', 'cancelled', 'no-show', 'rejected'].includes(appointment.status)) {
        throw new ApiError(400, `Cannot reschedule appointment with status "${appointment.status}"`);
    }
    
    const newScheduledFor = new Date(newDate);
    
    // Validate new date is in the future
    if (newScheduledFor < new Date()) {
        throw new ApiError(400, 'Cannot reschedule to a past date');
    }
    
    // Get doctor details
    const doctor = await Doctor.findById(appointment.doctor._id);
    if (!doctor) {
        throw new ApiError(404, 'Doctor not found');
    }
    
    // Check doctor availability
    const availabilityCheck = isDoctorAvailable(doctor, newScheduledFor, appointment.durationMinutes);
    if (!availabilityCheck.available) {
        throw new ApiError(400, availabilityCheck.reason);
    }
    
    // Check for conflicts
    const conflict = await checkAppointmentConflict(
        appointment.doctor._id,
        newScheduledFor,
        appointment.durationMinutes,
        appointment._id
    );
    
    if (conflict) {
        throw new ApiError(409, 'Doctor already has an appointment at this time. Please choose a different time slot.');
    }
    
    // Save reschedule history
    appointment.rescheduleHistory.push({
        previousDate: appointment.scheduledFor,
        newDate: newScheduledFor,
        reason: reason || 'Rescheduled by doctor',
        rescheduledBy: {
            userId: req.user._id,
            role: req.user.role
        }
    });
    
    // Update appointment
    const previousDate = appointment.scheduledFor;
    appointment.scheduledFor = newScheduledFor;
    
    // Add to status history
    appointment.statusHistory.push({
        from: appointment.status,
        to: appointment.status,
        note: `Rescheduled from ${previousDate.toISOString()} to ${newScheduledFor.toISOString()}. Reason: ${reason || 'Rescheduled by doctor'}`,
        changedBy: {
            userId: req.user._id,
            role: req.user.role
        }
    });
    
    await appointment.save();
    
    // Send notification to patient
    try {
        await sendAppointmentRescheduleNotification(appointment, previousDate);
    } catch (notifError) {
        console.error('Failed to send reschedule notification:', notifError);
    }
    
    sendSuccess(res, 200, 'Appointment rescheduled successfully', appointment);
});

/**
 * Bulk approve appointments
 */
export const bulkApproveAppointments = asyncHandler(async (req, res) => {
    const { appointmentIds } = req.body;
    
    if (!Array.isArray(appointmentIds) || appointmentIds.length === 0) {
        throw new ApiError(400, 'appointmentIds array is required');
    }
    
    if (appointmentIds.length > 50) {
        throw new ApiError(400, 'Cannot approve more than 50 appointments at once');
    }
    
    const doctorId = String(req.user.doctorProfile?._id || req.user.doctorProfile);
    
    // Fetch all appointments
    const appointments = await Appointment.find({
        _id: { $in: appointmentIds },
        doctor: doctorId,
        status: 'pending'
    }).populate(appointmentPopulation);
    
    if (appointments.length === 0) {
        throw new ApiError(404, 'No pending appointments found to approve');
    }
    
    const results = {
        approved: [],
        failed: []
    };
    
    // Process each appointment
    for (const appointment of appointments) {
        try {
            // Check for conflicts
            const conflict = await checkAppointmentConflict(
                appointment.doctor._id,
                appointment.scheduledFor,
                appointment.durationMinutes,
                appointment._id
            );
            
            if (conflict) {
                results.failed.push({
                    appointmentId: appointment._id,
                    reason: 'Time slot conflict'
                });
                continue;
            }
            
            // Approve appointment
            appointment.status = 'confirmed';
            appointment.approvedBy = req.user._id;
            appointment.approvedAt = new Date();
            
            appointment.statusHistory.push({
                from: 'pending',
                to: 'confirmed',
                note: 'Bulk approved by doctor',
                changedBy: {
                    userId: req.user._id,
                    role: req.user.role
                }
            });
            
            await appointment.save();
            
            results.approved.push(appointment._id);
            
            // Send notification (async, don't wait)
            sendAppointmentApprovalNotification(appointment).catch(err => 
                console.error('Failed to send approval notification:', err)
            );
            
        } catch (error) {
            results.failed.push({
                appointmentId: appointment._id,
                reason: error.message
            });
        }
    }
    
    sendSuccess(res, 200, `Bulk approval completed: ${results.approved.length} approved, ${results.failed.length} failed`, results);
});

/**
 * Get doctor's workload metrics
 */
export const getDoctorWorkload = asyncHandler(async (req, res) => {
    const { doctorId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Authorization check
    if (req.user.role === 'doctor' && String(req.user.doctorProfile?._id || req.user.doctorProfile) !== doctorId) {
        throw new ApiError(403, 'You can only view your own workload');
    }
    
    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);
    
    const end = endDate ? new Date(endDate) : new Date(start);
    end.setDate(end.getDate() + 7); // Default to 7 days
    end.setHours(23, 59, 59, 999);
    
    // Get appointments in date range
    const appointments = await Appointment.find({
        doctor: doctorId,
        scheduledFor: { $gte: start, $lte: end },
        status: { $nin: ['cancelled', 'no-show', 'rejected'] }
    }).populate('patient');
    
    // Get doctor's availability
    const doctor = await Doctor.findById(doctorId).select('availability');
    
    // Calculate metrics
    const totalAppointments = appointments.length;
    const totalMinutes = appointments.reduce((sum, apt) => sum + apt.durationMinutes, 0);
    const totalHours = (totalMinutes / 60).toFixed(1);
    
    const pendingCount = appointments.filter(apt => apt.status === 'pending').length;
    const confirmedCount = appointments.filter(apt => apt.status === 'confirmed').length;
    const completedCount = appointments.filter(apt => apt.status === 'completed').length;
    
    const firstVisits = appointments.filter(apt => apt.isFirstVisit).length;
    const followUps = totalAppointments - firstVisits;
    
    // Calculate available hours based on doctor's schedule
    const daysInRange = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const availableMinutesPerDay = doctor?.availability?.reduce((sum, slot) => {
        const [startHour, startMin] = slot.startTime.split(':').map(Number);
        const [endHour, endMin] = slot.endTime.split(':').map(Number);
        const minutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
        return sum + minutes;
    }, 0) || 0;
    
    const totalAvailableMinutes = availableMinutesPerDay * daysInRange;
    const utilizationRate = totalAvailableMinutes > 0 
        ? ((totalMinutes / totalAvailableMinutes) * 100).toFixed(1)
        : 0;
    
    // Group by day
    const appointmentsByDay = {};
    appointments.forEach(apt => {
        const day = apt.scheduledFor.toISOString().split('T')[0];
        if (!appointmentsByDay[day]) {
            appointmentsByDay[day] = [];
        }
        appointmentsByDay[day].push(apt);
    });
    
    const dailyWorkload = Object.entries(appointmentsByDay).map(([date, apts]) => ({
        date,
        count: apts.length,
        totalMinutes: apts.reduce((sum, apt) => sum + apt.durationMinutes, 0),
        pending: apts.filter(apt => apt.status === 'pending').length,
        confirmed: apts.filter(apt => apt.status === 'confirmed').length
    }));
    
    const workloadData = {
        summary: {
            totalAppointments,
            totalHours,
            utilizationRate: parseFloat(utilizationRate),
            pendingCount,
            confirmedCount,
            completedCount
        },
        distribution: {
            firstVisits,
            followUps
        },
        dailyWorkload,
        dateRange: {
            start: start.toISOString(),
            end: end.toISOString()
        }
    };
    
    sendSuccess(res, 200, 'Workload metrics retrieved successfully', workloadData);
});

/**
 * Get doctor's schedule overview for calendar
 */
export const getScheduleOverview = asyncHandler(async (req, res) => {
    const { doctorId } = req.params;
    const { month, year } = req.query;
    
    // Authorization check
    if (req.user.role === 'doctor' && String(req.user.doctorProfile?._id || req.user.doctorProfile) !== doctorId) {
        throw new ApiError(403, 'You can only view your own schedule');
    }
    
    const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    
    // Get first and last day of month
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);
    
    // Get all appointments for the month
    const appointments = await Appointment.find({
        doctor: doctorId,
        scheduledFor: { $gte: startDate, $lte: endDate }
    })
        .populate('patient', 'firstName lastName patientNumber')
        .sort('scheduledFor');
    
    // Get doctor's availability and time-off
    const doctor = await Doctor.findById(doctorId).select('availability timeOff');
    
    const scheduleData = {
        month: targetMonth,
        year: targetYear,
        appointments: appointments.map(apt => ({
            id: apt._id,
            patientName: `${apt.patient.firstName} ${apt.patient.lastName}`,
            patientNumber: apt.patient.patientNumber,
            scheduledFor: apt.scheduledFor,
            durationMinutes: apt.durationMinutes,
            type: apt.type,
            status: apt.status,
            reason: apt.reason,
            priority: apt.priority,
            isFirstVisit: apt.isFirstVisit
        })),
        availability: doctor?.availability || [],
        timeOff: doctor?.timeOff || []
    };
    
    sendSuccess(res, 200, 'Schedule overview retrieved successfully', scheduleData);
});
