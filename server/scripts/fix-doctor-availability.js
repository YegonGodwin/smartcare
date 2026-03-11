/**
 * Migration script to fix doctors without availability schedules
 * Run this to initialize availability for existing doctors
 * 
 * Usage: node server/scripts/fix-doctor-availability.js
 */

import mongoose from 'mongoose';
import Doctor from '../models/Doctor.js';
import { initializeDoctorAvailability } from '../utils/doctorOnboarding.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function fixDoctorAvailability() {
    try {
        console.log('🔌 Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to database\n');

        // Find all doctors without availability schedules
        const doctorsWithoutAvailability = await Doctor.find({
            $or: [
                { availability: { $exists: false } },
                { availability: { $size: 0 } }
            ]
        });

        console.log(`📋 Found ${doctorsWithoutAvailability.length} doctors without availability schedules\n`);

        if (doctorsWithoutAvailability.length === 0) {
            console.log('✅ All doctors have availability schedules configured!');
            return;
        }

        let successCount = 0;
        let errorCount = 0;

        for (const doctor of doctorsWithoutAvailability) {
            try {
                console.log(`⚙️  Processing: Dr. ${doctor.firstName} ${doctor.lastName} (${doctor.email})`);
                
                await initializeDoctorAvailability(doctor, 'standard');
                
                console.log(`   ✅ Initialized with standard weekday schedule (Mon-Fri, 9 AM - 5 PM)`);
                successCount++;
            } catch (error) {
                console.error(`   ❌ Error: ${error.message}`);
                errorCount++;
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 Summary:');
        console.log(`   Total processed: ${doctorsWithoutAvailability.length}`);
        console.log(`   ✅ Successful: ${successCount}`);
        console.log(`   ❌ Failed: ${errorCount}`);
        console.log('='.repeat(60));

        if (successCount > 0) {
            console.log('\n💡 Tip: Doctors can now customize their schedules via the availability management page');
        }

    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
}

// Run the script
fixDoctorAvailability()
    .then(() => {
        console.log('\n✅ Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script failed:', error);
        process.exit(1);
    });
