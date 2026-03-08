import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectMongo from '../config/database.js';
import Department from '../models/Department.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import MedicalRecord from '../models/MedicalRecord.js';
import User from '../models/User.js';

dotenv.config();

const departmentSeed = [
    {
        name: 'Outpatient Services',
        code: 'OPS',
        description: 'Primary triage, consultation, and follow-up care.',
        location: 'Ground Floor',
        phoneExtension: '101'
    },
    {
        name: 'Pediatrics',
        code: 'PED',
        description: 'Child health, immunization, and pediatric reviews.',
        location: 'First Floor',
        phoneExtension: '102'
    },
    {
        name: 'Radiology',
        code: 'RAD',
        description: 'Diagnostic imaging and scan interpretation.',
        location: 'Basement Wing B',
        phoneExtension: '103'
    },
    {
        name: 'Laboratory',
        code: 'LAB',
        description: 'Sample collection, diagnostics, and reporting.',
        location: 'Ground Floor Wing A',
        phoneExtension: '104'
    }
];

const patientSeed = [
    {
        firstName: 'Grace',
        lastName: 'Wanjiku',
        gender: 'female',
        dateOfBirth: new Date('1992-04-16'),
        phone: '+254700111111',
        email: 'grace.wanjiku@example.com',
        address: 'Westlands, Nairobi',
        bloodGroup: 'A+',
        maritalStatus: 'married',
        insuranceProvider: 'NHIF',
        insuranceNumber: 'NHIF-00124',
        allergies: ['Penicillin'],
        chronicConditions: ['Asthma'],
        emergencyContact: {
            name: 'David Wanjiku',
            relationship: 'Spouse',
            phone: '+254700111112'
        }
    },
    {
        firstName: 'Peter',
        lastName: 'Mwangi',
        gender: 'male',
        dateOfBirth: new Date('1987-09-09'),
        phone: '+254700222221',
        email: 'peter.mwangi@example.com',
        address: 'Kilimani, Nairobi',
        bloodGroup: 'O+',
        maritalStatus: 'single',
        insuranceProvider: 'AAR',
        insuranceNumber: 'AAR-09812',
        allergies: [],
        chronicConditions: ['Hypertension'],
        emergencyContact: {
            name: 'Jane Mwangi',
            relationship: 'Sister',
            phone: '+254700222222'
        }
    },
    {
        firstName: 'Faith',
        lastName: 'Achieng',
        gender: 'female',
        dateOfBirth: new Date('2001-01-25'),
        phone: '+254700333331',
        email: 'faith.achieng@example.com',
        address: 'Kisumu Central',
        bloodGroup: 'B+',
        maritalStatus: 'single',
        insuranceProvider: 'SHA',
        insuranceNumber: 'SHA-22118',
        allergies: ['Dust'],
        chronicConditions: [],
        emergencyContact: {
            name: 'Rose Achieng',
            relationship: 'Mother',
            phone: '+254700333332'
        }
    },
    {
        firstName: 'Brian',
        lastName: 'Otieno',
        gender: 'male',
        dateOfBirth: new Date('2016-07-13'),
        phone: '+254700444441',
        email: 'guardian.brian@example.com',
        address: 'Kasarani, Nairobi',
        bloodGroup: 'AB+',
        maritalStatus: 'single',
        insuranceProvider: 'NHIF',
        insuranceNumber: 'NHIF-77881',
        allergies: ['Peanuts'],
        chronicConditions: [],
        emergencyContact: {
            name: 'Caroline Otieno',
            relationship: 'Mother',
            phone: '+254700444442'
        }
    },
    {
        firstName: 'Mercy',
        lastName: 'Chebet',
        gender: 'female',
        dateOfBirth: new Date('1979-12-03'),
        phone: '+254700555551',
        email: 'mercy.chebet@example.com',
        address: 'Eldoret Town',
        bloodGroup: 'O-',
        maritalStatus: 'widowed',
        insuranceProvider: 'Britam',
        insuranceNumber: 'BRI-31881',
        allergies: [],
        chronicConditions: ['Diabetes'],
        emergencyContact: {
            name: 'Linet Chebet',
            relationship: 'Daughter',
            phone: '+254700555552'
        }
    },
    {
        firstName: 'Samuel',
        lastName: 'Mutiso',
        gender: 'male',
        dateOfBirth: new Date('1995-06-20'),
        phone: '+254700666661',
        email: 'samuel.mutiso@example.com',
        address: 'Machakos Town',
        bloodGroup: 'A-',
        maritalStatus: 'married',
        insuranceProvider: 'CIC',
        insuranceNumber: 'CIC-19003',
        allergies: ['Seafood'],
        chronicConditions: [],
        emergencyContact: {
            name: 'Irene Mutiso',
            relationship: 'Spouse',
            phone: '+254700666662'
        }
    }
];

const main = async () => {
    await connectMongo();

    await Promise.all([
        Appointment.deleteMany({}),
        MedicalRecord.deleteMany({}),
        Doctor.deleteMany({}),
        Patient.deleteMany({}),
        Department.deleteMany({}),
        User.deleteMany({})
    ]);

    const departments = await Department.insertMany(departmentSeed);
    const departmentMap = Object.fromEntries(departments.map((department) => [department.code, department]));

    const doctors = await Doctor.insertMany([
        {
            firstName: 'Anne',
            lastName: 'Njeri',
            email: 'anne.njeri@smartcare.local',
            phone: '+254711000001',
            specialization: 'Family Medicine',
            department: departmentMap.OPS._id,
            licenseNumber: 'KMPDC-OPS-001',
            yearsOfExperience: 8,
            consultationFee: 2500,
            availability: [
                { day: 'monday', startTime: '08:00', endTime: '16:00' },
                { day: 'wednesday', startTime: '08:00', endTime: '16:00' },
                { day: 'friday', startTime: '08:00', endTime: '16:00' }
            ]
        },
        {
            firstName: 'Kevin',
            lastName: 'Kamau',
            email: 'kevin.kamau@smartcare.local',
            phone: '+254711000002',
            specialization: 'Pediatrics',
            department: departmentMap.PED._id,
            licenseNumber: 'KMPDC-PED-002',
            yearsOfExperience: 11,
            consultationFee: 3000,
            availability: [
                { day: 'tuesday', startTime: '09:00', endTime: '17:00' },
                { day: 'thursday', startTime: '09:00', endTime: '17:00' },
                { day: 'saturday', startTime: '09:00', endTime: '13:00' }
            ]
        },
        {
            firstName: 'Lucy',
            lastName: 'Wafula',
            email: 'lucy.wafula@smartcare.local',
            phone: '+254711000003',
            specialization: 'Radiology',
            department: departmentMap.RAD._id,
            licenseNumber: 'KMPDC-RAD-003',
            yearsOfExperience: 6,
            consultationFee: 4500,
            availability: [
                { day: 'monday', startTime: '10:00', endTime: '18:00' },
                { day: 'thursday', startTime: '10:00', endTime: '18:00' }
            ]
        },
        {
            firstName: 'Michael',
            lastName: 'Korir',
            email: 'michael.korir@smartcare.local',
            phone: '+254711000004',
            specialization: 'Pathology',
            department: departmentMap.LAB._id,
            licenseNumber: 'KMPDC-LAB-004',
            yearsOfExperience: 9,
            consultationFee: 2800,
            availability: [
                { day: 'monday', startTime: '08:00', endTime: '15:00' },
                { day: 'tuesday', startTime: '08:00', endTime: '15:00' },
                { day: 'wednesday', startTime: '08:00', endTime: '15:00' }
            ]
        }
    ]);

    const doctorMap = Object.fromEntries(doctors.map((doctor) => [doctor.email, doctor]));
    const patients = await Patient.insertMany(patientSeed);

    const appointments = await Appointment.insertMany([
        {
            patient: patients[0]._id,
            doctor: doctors[0]._id,
            department: departmentMap.OPS._id,
            scheduledFor: new Date('2026-03-08T08:30:00.000Z'),
            durationMinutes: 30,
            type: 'review',
            status: 'confirmed',
            reason: 'Asthma review and inhaler refill',
            notes: 'Patient reports mild wheezing at night.'
        },
        {
            patient: patients[1]._id,
            doctor: doctors[0]._id,
            department: departmentMap.OPS._id,
            scheduledFor: new Date('2026-03-08T10:00:00.000Z'),
            durationMinutes: 30,
            type: 'consultation',
            status: 'scheduled',
            reason: 'Blood pressure follow-up'
        },
        {
            patient: patients[2]._id,
            doctor: doctors[2]._id,
            department: departmentMap.RAD._id,
            scheduledFor: new Date('2026-03-08T11:00:00.000Z'),
            durationMinutes: 45,
            type: 'lab',
            status: 'scheduled',
            reason: 'Pelvic ultrasound referral'
        },
        {
            patient: patients[3]._id,
            doctor: doctors[1]._id,
            department: departmentMap.PED._id,
            scheduledFor: new Date('2026-03-09T09:00:00.000Z'),
            durationMinutes: 25,
            type: 'consultation',
            status: 'confirmed',
            reason: 'Child allergy assessment'
        },
        {
            patient: patients[4]._id,
            doctor: doctors[3]._id,
            department: departmentMap.LAB._id,
            scheduledFor: new Date('2026-03-09T07:45:00.000Z'),
            durationMinutes: 20,
            type: 'lab',
            status: 'completed',
            reason: 'HbA1c and fasting sugar tests',
            notes: 'Results ready same day.'
        },
        {
            patient: patients[5]._id,
            doctor: doctors[0]._id,
            department: departmentMap.OPS._id,
            scheduledFor: new Date('2026-03-10T12:00:00.000Z'),
            durationMinutes: 30,
            type: 'consultation',
            status: 'scheduled',
            reason: 'Skin rash review'
        }
    ]);

    await MedicalRecord.insertMany([
        {
            patient: patients[0]._id,
            doctor: doctors[0]._id,
            appointment: appointments[0]._id,
            symptoms: ['Shortness of breath', 'Night cough'],
            diagnosis: 'Mild persistent asthma',
            treatmentPlan: 'Continue controller inhaler and review trigger avoidance.',
            prescriptions: [
                {
                    name: 'Budesonide inhaler',
                    dosage: '200mcg',
                    frequency: 'Twice daily',
                    duration: '30 days'
                }
            ],
            labResults: [],
            notes: 'Condition stable with intermittent symptoms.',
            visitDate: new Date('2026-03-08T08:30:00.000Z'),
            followUpDate: new Date('2026-04-08T08:30:00.000Z')
        },
        {
            patient: patients[4]._id,
            doctor: doctors[3]._id,
            appointment: appointments[4]._id,
            symptoms: ['Increased thirst', 'Fatigue'],
            diagnosis: 'Type 2 diabetes follow-up',
            treatmentPlan: 'Maintain oral hypoglycemics and review diet adherence.',
            prescriptions: [
                {
                    name: 'Metformin',
                    dosage: '500mg',
                    frequency: 'Twice daily',
                    duration: '60 days'
                }
            ],
            labResults: [
                {
                    testName: 'HbA1c',
                    result: '7.4',
                    unit: '%',
                    referenceRange: '4.0 - 5.6'
                },
                {
                    testName: 'Fasting Blood Sugar',
                    result: '8.1',
                    unit: 'mmol/L',
                    referenceRange: '3.9 - 5.5'
                }
            ],
            notes: 'Moderate control, reinforce compliance.',
            visitDate: new Date('2026-03-09T07:45:00.000Z'),
            followUpDate: new Date('2026-03-30T07:45:00.000Z')
        },
        {
            patient: patients[3]._id,
            doctor: doctors[1]._id,
            appointment: appointments[3]._id,
            symptoms: ['Sneezing', 'Skin rash'],
            diagnosis: 'Peanut allergy',
            treatmentPlan: 'Avoid peanut products and carry emergency antihistamines.',
            prescriptions: [
                {
                    name: 'Cetirizine syrup',
                    dosage: '5ml',
                    frequency: 'Once daily',
                    duration: '14 days'
                }
            ],
            labResults: [],
            notes: 'Guardian educated on food triggers.',
            visitDate: new Date('2026-03-09T09:00:00.000Z'),
            followUpDate: new Date('2026-03-23T09:00:00.000Z')
        }
    ]);

    const users = await User.create([
        {
            firstName: 'System',
            lastName: 'Admin',
            email: 'admin@smartcare.local',
            phone: '+254700000001',
            password: 'Admin123!',
            role: 'admin',
            isApproved: true
        },
        {
            firstName: 'Rachel',
            lastName: 'Frontdesk',
            email: 'reception@smartcare.local',
            phone: '+254700000002',
            password: 'Reception123!',
            role: 'receptionist',
            department: departmentMap.OPS._id,
            isApproved: true
        },
        {
            firstName: 'Anne',
            lastName: 'Njeri',
            email: 'doctor.anne@smartcare.local',
            phone: '+254700000003',
            password: 'Doctor123!',
            role: 'doctor',
            department: departmentMap.OPS._id,
            doctorProfile: doctorMap['anne.njeri@smartcare.local']._id,
            isApproved: true
        },
        {
            firstName: 'Kevin',
            lastName: 'Kamau',
            email: 'doctor.kevin@smartcare.local',
            phone: '+254700000004',
            password: 'Doctor123!',
            role: 'doctor',
            department: departmentMap.PED._id,
            doctorProfile: doctorMap['kevin.kamau@smartcare.local']._id,
            isApproved: true
        },
        {
            firstName: patients[0].firstName,
            lastName: patients[0].lastName,
            email: patients[0].email,
            phone: patients[0].phone,
            password: 'Patient123!',
            role: 'patient',
            patientProfile: patients[0]._id,
            isApproved: true
        }
    ]);

    // Update patient profile to verified
    await Patient.findByIdAndUpdate(patients[0]._id, { isVerified: true, verifiedAt: new Date() });

    console.log('Seed completed successfully.');
    console.log(`Departments: ${departments.length}`);
    console.log(`Doctors: ${doctors.length}`);
    console.log(`Patients: ${patients.length}`);
    console.log(`Appointments: ${appointments.length}`);
    console.log('Medical Records: 3');
    console.log(`Users: ${users.length}`);
    console.log('Test credentials:');
    console.log('admin@smartcare.local / Admin123!');
    console.log('reception@smartcare.local / Reception123!');
    console.log('doctor.anne@smartcare.local / Doctor123!');
    console.log('doctor.kevin@smartcare.local / Doctor123!');
    console.log('grace.wanjiku@example.com / Patient123!');
};

main()
    .catch((error) => {
        console.error('Seed failed:', error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
