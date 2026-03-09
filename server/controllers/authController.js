import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess } from '../utils/response.js';
import { sendPatientApprovalNotification } from '../services/notificationService.js';

const signToken = (user) => {
    return jwt.sign(
        {
            sub: user._id.toString(),
            role: user.role,
            email: user.email
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

const buildAuthResponse = (user) => ({
    token: signToken(user),
    user: user.toSafeObject()
});

export const bootstrapAdmin = asyncHandler(async (req, res) => {
    const userCount = await User.countDocuments();

    if (userCount > 0) {
        throw new ApiError(409, 'Bootstrap is disabled because users already exist');
    }

    const admin = await User.create({
        ...req.body,
        role: 'admin'
    });

    sendSuccess(res, 201, 'Initial admin account created successfully', buildAuthResponse(admin));
});

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email })
        .select('+password')
        .populate('department doctorProfile patientProfile', 'name code firstName lastName specialization patientNumber dateOfBirth gender');

    if (!user || !(await user.comparePassword(password))) {
        throw new ApiError(401, 'Invalid email or password');
    }

    if (!user.isActive) {
        throw new ApiError(403, 'This account is inactive');
    }

    // Check approval status for patient users
    if (user.role === 'patient' && !user.isApproved) {
        throw new ApiError(403, 'Your account is pending admin approval. Please contact the administrator.');
    }

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    sendSuccess(res, 200, 'Login successful', buildAuthResponse(user));
});

export const registerUser = asyncHandler(async (req, res) => {
    const user = await User.create(req.body);
    const populatedUser = await User.findById(user._id).populate('department doctorProfile patientProfile', 'name code firstName lastName specialization patientNumber dateOfBirth gender');

    sendSuccess(res, 201, 'User created successfully', {
        user: populatedUser.toSafeObject()
    });
});

export const registerPatient = asyncHandler(async (req, res) => {
    const {
        firstName,
        lastName,
        email,
        phone,
        password,
        dateOfBirth,
        address,
        gender,
        emergencyContact
    } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new ApiError(409, 'An account with this email already exists');
    }

    const existingPatient = await Patient.findOne({ email });

    if (existingPatient) {
        throw new ApiError(409, 'A patient profile with this email already exists');
    }

    const patient = await Patient.create({
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth,
        address,
        gender,
        emergencyContact,
        isVerified: false
    });

    const user = await User.create({
        firstName,
        lastName,
        email,
        phone,
        password,
        role: 'patient',
        patientProfile: patient._id,
        isApproved: false
    });

    const populatedUser = await User.findById(user._id).populate('patientProfile', 'patientNumber firstName lastName dateOfBirth gender phone email address isVerified');

    sendSuccess(res, 201, 'Patient registration submitted successfully. Your account is pending admin approval.', {
        user: populatedUser.toSafeObject(),
        message: 'Registration successful! Please wait for admin approval before accessing the system.'
    });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
    sendSuccess(res, 200, 'Authenticated user retrieved successfully', {
        user: req.user.toSafeObject()
    });
});

export const getPendingPatients = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
        User.find({ role: 'patient', isApproved: false })
            .select('-password')
            .populate('patientProfile', 'firstName lastName email phone dateOfBirth gender patientNumber isVerified')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        User.countDocuments({ role: 'patient', isApproved: false })
    ]);

    sendSuccess(res, 200, 'Pending patients retrieved successfully', {
        users,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

export const approvePatient = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { approvalNote } = req.body;

    const user = await User.findOne({ _id: id, role: 'patient' });

    if (!user) {
        throw new ApiError(404, 'Patient user not found');
    }

    if (user.isApproved) {
        throw new ApiError(400, 'This patient is already approved');
    }

    user.isApproved = true;
    user.approvalNote = approvalNote || '';
    user.approvedAt = new Date();
    user.approvedBy = req.user._id;
    await user.save();

    const populatedUser = await User.findById(user._id)
        .populate('patientProfile', 'firstName lastName email phone patientNumber')
        .populate('approvedBy', 'firstName lastName email');

    // Send approval email
    try {
        await sendPatientApprovalNotification(populatedUser, true);
    } catch (emailError) {
        console.error('Failed to send approval email:', emailError.message);
    }

    sendSuccess(res, 200, 'Patient approved successfully', {
        user: populatedUser.toSafeObject()
    });
});

export const rejectPatient = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findOne({ _id: id, role: 'patient' });

    if (!user) {
        throw new ApiError(404, 'Patient user not found');
    }

    if (user.isApproved) {
        throw new ApiError(400, 'This patient is already approved');
    }

    user.isActive = false;
    user.approvalNote = reason || 'Registration rejected';
    await user.save();

    // Send rejection email
    try {
        await sendPatientApprovalNotification(user, false);
    } catch (emailError) {
        console.error('Failed to send rejection email:', emailError.message);
    }

    sendSuccess(res, 200, 'Patient registration rejected', {
        user: user.toSafeObject()
    });
});
