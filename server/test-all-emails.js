import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import Patient from './models/Patient.js';
import Doctor from './models/Doctor.js';
import Department from './models/Department.js';
import Appointment from './models/Appointment.js';
import {
    sendAppointmentConfirmation,
    sendAppointmentReminder,
    sendAppointmentCancellation,
    sendPatientApprovalNotification
} from './services/notificationService.js';
import { initializeEmailTransporter } from './config/email.js';

dotenv.config();

const testAllEmails = async () => {
    try {
        console.log('🧪 Testing ALL email notifications...\n');
        
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to database\n');
        
        initializeEmailTransporter();
        
        const patient = await Patient.findOne();
        const doctor = await Doctor.findOne().populate('department');
        
        if (!patient || !doctor) {
            console.log('❌ Missing data. Run: npm run seed');
            process.exit(1);
        }
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);
        
        const appointment = await Appointment.create({
            patient: patient._id,
            doctor: doctor._id,
            department: doctor.department._id,
            scheduledFor: tomorrow,
            durationMinutes: 30,
            type: 'consultation',
            reason: 'Test appointment for email notifications',
            status: 'scheduled'
        });
        
        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate('patient doctor department');
        
        // Test 1: Appointment Confirmation
        console.log('📧 1. Testing Appointment Confirmation Email...');
        await sendAppointmentConfirmation(populatedAppointment, patient, doctor);
        console.log('   ✅ Confirmation email sent\n');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Test 2: Appointment Reminder
        console.log('📧 2. Testing Appointment Reminder Email...');
        await sendAppointmentReminder(populatedAppointment, patient, doctor);
        console.log('   ✅ Reminder email sent\n');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Test 3: Appointment Cancellation
        console.log('📧 3. Testing Appointment Cancellation Email...');
        await sendAppointmentCancellation(populatedAppointment, patient, doctor, 'Doctor unavailable - rescheduling required');
        console.log('   ✅ Cancellation email sent\n');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Test 4: Patient Approval
        console.log('📧 4. Testing Patient Approval Email...');
        const testUser = {
            firstName: 'Test',
            lastName: 'Patient',
            email: patient.email
        };
        await sendPatientApprovalNotification(testUser, true);
        console.log('   ✅ Approval email sent\n');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Test 5: Patient Rejection
        console.log('📧 5. Testing Patient Rejection Email...');
        await sendPatientApprovalNotification(testUser, false);
        console.log('   ✅ Rejection email sent\n');
        
        // Cleanup
        await Appointment.findByIdAndDelete(appointment._id);
        
        console.log('═══════════════════════════════════════════════════════');
        console.log('✅ ALL EMAIL TESTS COMPLETED SUCCESSFULLY!');
        console.log('═══════════════════════════════════════════════════════\n');
        console.log('📬 Check your Mailtrap inbox at: https://mailtrap.io/inboxes');
        console.log('\nYou should see 5 emails:');
        console.log('  1. ✅ Appointment Confirmed');
        console.log('  2. ⏰ Appointment Reminder');
        console.log('  3. ❌ Appointment Cancelled');
        console.log('  4. 🎉 Account Approved');
        console.log('  5. 📋 Registration Update');
        console.log('\nAll emails have beautiful HTML templates with proper styling!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

testAllEmails();
