import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';

/**
 * Check if a doctor has a conflicting appointment at the given time
 */
export async function checkAppointmentConflict(doctorId, scheduledFor, durationMinutes = 30, excludeAppointmentId = null) {
    const appointmentStart = new Date(scheduledFor);
    const appointmentEnd = new Date(appointmentStart.getTime() + durationMinutes * 60000);

    const filter = {
        doctor: doctorId,
        status: { $nin: ['cancelled', 'no-show', 'completed'] },
        $or: [
            {
                // Existing appointment starts during new appointment
                scheduledFor: {
                    $gte: appointmentStart,
                    $lt: appointmentEnd
                }
            },
            {
                // Existing appointment ends during new appointment
                $expr: {
                    $and: [
                        { $lte: ['$scheduledFor', appointmentStart] },
                        {
                            $gt: [
                                { $add: ['$scheduledFor', { $multiply: ['$durationMinutes', 60000] }] },
                                appointmentStart
                            ]
                        }
                    ]
                }
            }
        ]
    };

    if (excludeAppointmentId) {
        filter._id = { $ne: excludeAppointmentId };
    }

    const conflictingAppointment = await Appointment.findOne(filter);
    return conflictingAppointment;
}

/**
 * Check if the appointment time falls within doctor's availability schedule
 */
export function isDoctorAvailable(doctor, scheduledFor, durationMinutes = 30) {
    const appointmentDate = new Date(scheduledFor);
    const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    const dayAvailability = doctor.availability.find(a => a.day === dayOfWeek);
    
    if (!dayAvailability) {
        return { available: false, reason: `Doctor is not available on ${dayOfWeek}s` };
    }

    const appointmentTime = appointmentDate.toTimeString().slice(0, 5); // HH:MM format
    const appointmentEnd = new Date(appointmentDate.getTime() + durationMinutes * 60000);
    const appointmentEndTime = appointmentEnd.toTimeString().slice(0, 5);

    if (appointmentTime < dayAvailability.startTime || appointmentEndTime > dayAvailability.endTime) {
        return {
            available: false,
            reason: `Appointment time must be between ${dayAvailability.startTime} and ${dayAvailability.endTime}`
        };
    }

    return { available: true };
}

/**
 * Generate available time slots for a doctor on a specific date
 */
export async function getDoctorAvailableSlots(doctorId, date, slotDuration = 30) {
    const doctor = await Doctor.findById(doctorId);
    
    if (!doctor) {
        throw new Error('Doctor not found');
    }

    if (doctor.status !== 'active') {
        return [];
    }

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const dayAvailability = doctor.availability.find(a => a.day === dayOfWeek);

    if (!dayAvailability) {
        return [];
    }

    // Get existing appointments for this doctor on this date
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const existingAppointments = await Appointment.find({
        doctor: doctorId,
        scheduledFor: {
            $gte: targetDate,
            $lt: nextDay
        },
        status: { $nin: ['cancelled', 'no-show'] }
    }).select('scheduledFor durationMinutes');

    // Generate time slots
    const slots = [];
    const [startHour, startMinute] = dayAvailability.startTime.split(':').map(Number);
    const [endHour, endMinute] = dayAvailability.endTime.split(':').map(Number);

    let currentTime = new Date(targetDate);
    currentTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date(targetDate);
    endTime.setHours(endHour, endMinute, 0, 0);

    while (currentTime < endTime) {
        const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000);
        
        if (slotEnd <= endTime) {
            // Check if this slot conflicts with existing appointments
            const hasConflict = existingAppointments.some(apt => {
                const aptStart = new Date(apt.scheduledFor);
                const aptEnd = new Date(aptStart.getTime() + apt.durationMinutes * 60000);
                
                return (
                    (currentTime >= aptStart && currentTime < aptEnd) ||
                    (slotEnd > aptStart && slotEnd <= aptEnd) ||
                    (currentTime <= aptStart && slotEnd >= aptEnd)
                );
            });

            slots.push({
                time: currentTime.toISOString(),
                available: !hasConflict
            });
        }

        currentTime = new Date(currentTime.getTime() + slotDuration * 60000);
    }

    return slots;
}
