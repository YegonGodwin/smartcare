import mongoose from 'mongoose';

const systemLogSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        action: {
            type: String,
            required: true,
            index: true
        },
        category: {
            type: String,
            enum: ['AUTH', 'USER', 'APPOINTMENT', 'MEDICAL_RECORD', 'DEPARTMENT', 'DOCTOR', 'SYSTEM', 'PATIENT'],
            required: true,
            index: true
        },
        status: {
            type: String,
            enum: ['SUCCESS', 'FAILURE', 'INFO', 'WARNING', 'ERROR'],
            default: 'SUCCESS'
        },
        description: {
            type: String,
            required: true
        },
        details: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        resourceId: {
            type: String,
            default: null
        },
        resourceModel: {
            type: String,
            default: null
        },
        ipAddress: {
            type: String,
            default: ''
        },
        userAgent: {
            type: String,
            default: ''
        }
    },
    {
        timestamps: true
    }
);

// Create index for faster queries on common filters
systemLogSchema.index({ createdAt: -1 });
systemLogSchema.index({ user: 1, createdAt: -1 });
systemLogSchema.index({ category: 1, createdAt: -1 });

export default mongoose.model('SystemLog', systemLogSchema);
