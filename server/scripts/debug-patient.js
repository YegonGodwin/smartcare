import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectMongo from '../config/database.js';
import User from '../models/User.js';
import Patient from '../models/Patient.js';

dotenv.config();

const main = async () => {
    await connectMongo();

    console.log('=== Checking Patient User ===\n');

    // Check if patient user exists
    const patientUser = await User.findOne({ email: 'grace.wanjiku@example.com' }).select('+password');
    
    if (!patientUser) {
        console.log('❌ Patient user NOT found in database');
        
        // Check if patient profile exists
        const patientProfile = await Patient.findOne({ email: 'grace.wanjiku@example.com' });
        if (patientProfile) {
            console.log('✓ Patient profile exists:', patientProfile._id);
        } else {
            console.log('❌ Patient profile also NOT found');
        }
    } else {
        console.log('✓ Patient user found:');
        console.log('  - ID:', patientUser._id);
        console.log('  - Name:', patientUser.firstName, patientUser.lastName);
        console.log('  - Email:', patientUser.email);
        console.log('  - Role:', patientUser.role);
        console.log('  - isActive:', patientUser.isActive);
        console.log('  - patientProfile:', patientUser.patientProfile);
        console.log('  - Password hash:', patientUser.password);
        console.log('  - Password starts with $2a$/$2b$:', patientUser.password.startsWith('$2'));
        
        // Test password comparison
        const testPassword = 'Patient123!';
        const bcrypt = await import('bcryptjs');
        const match = await bcrypt.default.compare(testPassword, patientUser.password);
        console.log('\n  - Password "Patient123!" matches:', match);
    }

    // Also check all users
    console.log('\n=== All Users ===\n');
    const allUsers = await User.find().select('+password');
    allUsers.forEach(u => {
        console.log(`${u.email} (${u.role}) - Password hashed: ${u.password.startsWith('$2')}`);
    });
};

main()
    .catch((error) => {
        console.error('Debug failed:', error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
