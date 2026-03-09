import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import Patient from './models/Patient.js';
import Doctor from './models/Doctor.js';
import Department from './models/Department.js';
import Appointment from './models/Appointment.js';
import { sendAppointmentConfirmation } from './services/notificationService.js';
import { initializeEmailTransporter } from './config/email.js';

dotenv.config();

const testBooking = async () => {
    try {
        console.log('🧪 Testing appointment booking with email notification...\n');
        
        // Connect to database
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to database');
        
        // Initialize email
        initializeEmailTransporter();
        
        // Find a patient
        const patient = await Patient.findOne().limit(1);
        if (!patient) {
            console.log('❌ No patients found. Run seed script first: npm run seed');
            process.exit(1);
        }
        console.log(`✅ Found patient: ${patient.firstName} ${patient.lastName} (${patient.email})`);
        
        // Find a doctor
        const doctor = await Doctor.findOne().populate('department');
        if (!doctor) {
            console.log('❌ No doctors found. Run seed script first: npm run seed');
            process.exit(1);
        }
        console.log(`✅ Found doctor: Dr. ${doctor.firstName} ${doctor.lastName} (${doctor.specialization})`);
        
        // Create appointment for tomorrow at 10:00 AM
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
            reason: 'Test appointment - checking email notifications',
            status: 'scheduled',
            statusHistory: [{
                from: '',
                to: 'scheduled',
                note: 'Test appointment created',
                changedBy: {
                    userId: patient._id,
                    role: 'patient'
                },
                changedAt: new Date()
            }]
        });
        
        console.log(`✅ Created appointment: ${appointment.appointmentNumber}`);
        console.log(`   Date: ${tomorrow.toLocaleDateString()}`);
        console.log(`   Time: ${tomorrow.toLocaleTimeString()}`);
        
        // Populate appointment for email
        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate('patient doctor department');
        
        // Send confirmation email
        console.log('\n📧 Sending confirmation email...');
        await sendAppointmentConfirmation(populatedAppointment, patient, doctor);
        
        console.log('\n✅ Test completed successfully!');
        console.log('\n📬 Check your Mailtrap inbox at: https://mailtrap.io/inboxes');
        console.log('   You should see a beautiful appointment confirmation email!');
        
        // Clean up - delete test appointment
        await Appointment.findByIdAndDelete(appointment._id);
        console.log('\n🧹 Test appointment cleaned up');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

testBooking();
