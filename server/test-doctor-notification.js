import dotenv from 'dotenv';
import connectMongo from './config/database.js';
import { initializeEmailTransporter } from './config/email.js';
import { sendNewAppointmentRequestNotification } from './services/notificationService.js';
import Doctor from './models/Doctor.js';
import Patient from './models/Patient.js';

dotenv.config();

const testDoctorNotification = async () => {
    console.log('🧪 Testing Doctor Notification for New Appointment Request...\n');
    
    try {
        // Connect to database
        await connectMongo();
        
        // Initialize email
        initializeEmailTransporter();
        
        // Find a doctor and patient
        const doctor = await Doctor.findOne({ status: 'active' });
        const patient = await Patient.findOne();
        
        if (!doctor) {
            console.error('❌ No active doctor found in database');
            process.exit(1);
        }
        
        if (!patient) {
            console.error('❌ No patient found in database');
            process.exit(1);
        }
        
        console.log('✅ Found doctor:', doctor.firstName, doctor.lastName);
        console.log('✅ Found patient:', patient.firstName, patient.lastName);
        console.log('');
        
        // Create mock appointment
        const mockAppointment = {
            appointmentNumber: 'TEST-' + Date.now(),
            scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
            durationMinutes: 30,
            type: 'consultation',
            isFirstVisit: true,
            reason: 'Regular checkup and consultation',
            status: 'pending'
        };
        
        console.log('📧 Sending doctor notification email...');
        console.log('To:', doctor.email);
        console.log('');
        
        await sendNewAppointmentRequestNotification(mockAppointment, patient, doctor);
        
        console.log('✅ Doctor notification sent successfully!');
        console.log('');
        console.log('📬 Check the doctor\'s inbox at:', doctor.email);
        console.log('');
        console.log('The email should contain:');
        console.log('- Patient name and number');
        console.log('- Requested appointment date and time');
        console.log('- Appointment type and reason');
        console.log('- Link to view in dashboard');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
};

testDoctorNotification();
