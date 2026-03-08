import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema(
    {
        name: { type: String, trim: true, required: true },
        dosage: { type: String, trim: true, required: true },
        frequency: { type: String, trim: true, required: true },
        duration: { type: String, trim: true, default: '' }
    },
    { _id: false }
);

const labResultSchema = new mongoose.Schema(
    {
        testName: { type: String, trim: true, required: true },
        result: { type: String, trim: true, required: true },
        unit: { type: String, trim: true, default: '' },
        referenceRange: { type: String, trim: true, default: '' }
    },
    { _id: false }
);

const medicalRecordSchema = new mongoose.Schema(
    {
        recordNumber: {
            type: String,
            unique: true,
            trim: true
        },
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Patient',
            required: true
        },
        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Doctor',
            required: true
        },
        appointment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Appointment',
            default: null
        },
        symptoms: {
            type: [String],
            default: []
        },
        diagnosis: {
            type: String,
            trim: true,
            required: true
        },
        treatmentPlan: {
            type: String,
            trim: true,
            default: ''
        },
        prescriptions: {
            type: [medicationSchema],
            default: []
        },
        labResults: {
            type: [labResultSchema],
            default: []
        },
        notes: {
            type: String,
            trim: true,
            default: ''
        },
        visitDate: {
            type: Date,
            default: Date.now
        },
        followUpDate: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

medicalRecordSchema.pre('validate', function populateRecordNumber() {
    if (!this.recordNumber) {
        this.recordNumber = `MR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
});

export default mongoose.model('MedicalRecord', medicalRecordSchema);
