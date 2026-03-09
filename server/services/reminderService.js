import cron from 'node-cron';
import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import { sendAppointmentReminder } from './notificationService.js';

export const startReminderService = () => {
    // Run every day at 9:00 AM
    cron.schedule('0 9 * * *', async () => {
        console.log('🔔 Running appointment reminder job...');
        
        try {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            
            const dayAfterTomorrow = new Date(tomorrow);
            dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
            
            // Find appointments scheduled for tomorrow
            const appointments = await Appointment.find({
                scheduledFor: {
                    $gte: tomorrow,
                    $lt: dayAfterTomorrow
                },
                status: { $in: ['scheduled', 'confirmed'] }
            }).populate('patient doctor');
            
            console.log(`Found ${appointments.length} appointments for tomorrow`);
            
            for (const appointment of appointments) {
                try {
                    const patient = await Patient.findById(appointment.patient);
                    const doctor = await Doctor.findById(appointment.doctor);
                    
                    if (patient && doctor) {
                        await sendAppointmentReminder(appointment, patient, doctor);
                        console.log(`✅ Reminder sent for appointment ${appointment.appointmentNumber}`);
                    }
                } catch (error) {
                    console.error(`Failed to send reminder for appointment ${appointment.appointmentNumber}:`, error.message);
                }
            }
            
            console.log('✅ Reminder job completed');
        } catch (error) {
            console.error('❌ Reminder job failed:', error.message);
        }
    });
    
    console.log('✅ Reminder service started (runs daily at 9:00 AM)');
};
