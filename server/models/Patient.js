import mongoose from 'mongoose';

const emergencyContactSchema = new mongoose.Schema(
    {
        name: { type: String, trim: true, required: true },
        relationship: { type: String, trim: true, required: true },
        phone: { type: String, trim: true, required: true }
    },
    { _id: false }
);

const patientSchema = new mongoose.Schema(
    {
        patientNumber: {
            type: String,
            unique: true,
            trim: true
        },
        firstName: {
            type: String,
            required: true,
            trim: true
        },
        lastName: {
            type: String,
            required: true,
            trim: true
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other'],
            required: true
        },
        dateOfBirth: {
            type: Date,
            required: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: ''
        },
        address: {
            type: String,
            trim: true,
            default: ''
        },
        bloodGroup: {
            type: String,
            enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'],
            default: 'unknown'
        },
        maritalStatus: {
            type: String,
            enum: ['single', 'married', 'divorced', 'widowed', 'other'],
            default: 'single'
        },
        insuranceProvider: {
            type: String,
            trim: true,
            default: ''
        },
        insuranceNumber: {
            type: String,
            trim: true,
            default: ''
        },
        allergies: {
            type: [String],
            default: []
        },
        chronicConditions: {
            type: [String],
            default: []
        },
        emergencyContact: {
            type: emergencyContactSchema,
            required: true
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'deceased'],
            default: 'active'
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        verifiedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

patientSchema.pre('validate', function populatePatientNumber() {
    if (!this.patientNumber) {
        this.patientNumber = `PAT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
});

patientSchema.virtual('fullName').get(function fullName() {
    return `${this.firstName} ${this.lastName}`;
});

patientSchema.set('toJSON', { virtuals: true });
patientSchema.set('toObject', { virtuals: true });

export default mongoose.model('Patient', patientSchema);
