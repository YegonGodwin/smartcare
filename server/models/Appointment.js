import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
    {
        appointmentNumber: {
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
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department',
            required: true
        },
        scheduledFor: {
            type: Date,
            required: true
        },
        durationMinutes: {
            type: Number,
            min: 5,
            default: 30
        },
        type: {
            type: String,
            enum: ['consultation', 'review', 'emergency', 'lab', 'procedure'],
            default: 'consultation'
        },
        status: {
            type: String,
            enum: ['scheduled', 'confirmed', 'checked-in', 'in-progress', 'completed', 'cancelled', 'no-show'],
            default: 'scheduled'
        },
        statusHistory: {
            type: [
                {
                    from: { type: String, trim: true, default: '' },
                    to: { type: String, trim: true, required: true },
                    note: { type: String, trim: true, default: '' },
                    changedBy: {
                        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
                        role: { type: String, trim: true, required: true }
                    },
                    changedAt: { type: Date, default: Date.now }
                }
            ],
            default: []
        },
        reason: {
            type: String,
            trim: true,
            required: true
        },
        notes: {
            type: String,
            trim: true,
            default: ''
        },
        vitals: {
            bloodPressure: { type: String, trim: true, default: '' },
            temperature: { type: String, trim: true, default: '' },
            pulseRate: { type: String, trim: true, default: '' },
            weight: { type: String, trim: true, default: '' }
        }
    },
    {
        timestamps: true
    }
);

appointmentSchema.pre('validate', function populateAppointmentNumber() {
    if (!this.appointmentNumber) {
        this.appointmentNumber = `APT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
});

export default mongoose.model('Appointment', appointmentSchema);
