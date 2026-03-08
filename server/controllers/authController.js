import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess } from '../utils/response.js';

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
        emergencyContact
    });

    const user = await User.create({
        firstName,
        lastName,
        email,
        phone,
        password,
        role: 'patient',
        patientProfile: patient._id
    });

    const populatedUser = await User.findById(user._id).populate('patientProfile', 'patientNumber firstName lastName dateOfBirth gender phone email address');

    sendSuccess(res, 201, 'Patient account created successfully', buildAuthResponse(populatedUser));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
    sendSuccess(res, 200, 'Authenticated user retrieved successfully', {
        user: req.user.toSafeObject()
    });
});
