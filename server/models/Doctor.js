import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema(
    {
        day: {
            type: String,
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
            required: true
        },
        startTime: {
            type: String,
            required: true
        },
        endTime: {
            type: String,
            required: true
        }
    },
    { _id: false }
);

const timeOffSchema = new mongoose.Schema(
    {
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        reason: {
            type: String,
            trim: true,
            default: ''
        },
        type: {
            type: String,
            enum: ['vacation', 'sick-leave', 'conference', 'personal', 'other'],
            default: 'other'
        },
        isRecurring: {
            type: Boolean,
            default: false
        },
        recurringPattern: {
            dayOfWeek: {
                type: String,
                enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
                default: null
            },
            startTime: {
                type: String,
                default: null
            },
            endTime: {
                type: String,
                default: null
            }
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        }
    },
    { timestamps: true }
);

const doctorSchema = new mongoose.Schema(
    {
        staffId: {
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
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique: true
        },
        phone: {
            type: String,
            trim: true,
            required: true
        },
        specialization: {
            type: String,
            trim: true,
            required: true
        },
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department',
            required: true
        },
        licenseNumber: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        yearsOfExperience: {
            type: Number,
            min: 0,
            default: 0
        },
        consultationFee: {
            type: Number,
            min: 0,
            default: 0
        },
        availability: {
            type: [availabilitySchema],
            default: []
        },
        timeOff: {
            type: [timeOffSchema],
            default: []
        },
        isEmergencyUnavailable: {
            type: Boolean,
            default: false
        },
        emergencyUnavailableUntil: {
            type: Date,
            default: null
        },
        emergencyUnavailableReason: {
            type: String,
            trim: true,
            default: ''
        },
        status: {
            type: String,
            enum: ['active', 'on-leave', 'inactive'],
            default: 'active'
        }
    },
    {
        timestamps: true
    }
);

doctorSchema.pre('validate', function populateStaffId() {
    if (!this.staffId) {
        this.staffId = `DOC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
});

doctorSchema.virtual('fullName').get(function fullName() {
    return `${this.firstName} ${this.lastName}`;
});

doctorSchema.set('toJSON', { virtuals: true });
doctorSchema.set('toObject', { virtuals: true });

export default mongoose.model('Doctor', doctorSchema);
