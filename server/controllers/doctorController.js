import mongoose from 'mongoose';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import MedicalRecord from '../models/MedicalRecord.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { getPagination, getSort, buildTextSearch } from '../utils/buildQuery.js';
import { sendSuccess } from '../utils/response.js';

export const listDoctors = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};
    const searchFilter = buildTextSearch(req.query.search, ['staffId', 'firstName', 'lastName', 'email', 'specialization']);

    if (req.query.status) {
        filter.status = req.query.status;
    }

    if (req.query.department) {
        filter.department = req.query.department;
    }

    if (searchFilter) {
        Object.assign(filter, searchFilter);
    }

    const [items, total] = await Promise.all([
        Doctor.find(filter).populate('department', 'name code').sort(getSort(req.query, 'firstName')).skip(skip).limit(limit),
        Doctor.countDocuments(filter)
    ]);

    sendSuccess(res, 200, 'Doctors retrieved successfully', items, {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
    });
});

export const getDoctorById = asyncHandler(async (req, res) => {
    const doctor = await Doctor.findById(req.params.id).populate('department', 'name code');

    if (!doctor) {
        throw new ApiError(404, 'Doctor not found');
    }

    const [upcomingAppointments, medicalRecordCount] = await Promise.all([
        Appointment.find({
            doctor: doctor._id,
            scheduledFor: { $gte: new Date() },
            status: { $in: ['scheduled', 'confirmed'] }
        })
            .sort('scheduledFor')
            .limit(5)
            .populate('patient department', 'firstName lastName patientNumber name'),
        MedicalRecord.countDocuments({ doctor: doctor._id })
    ]);

    sendSuccess(res, 200, 'Doctor retrieved successfully', {
        ...doctor.toObject(),
        stats: { medicalRecordCount },
        upcomingAppointments
    });
});

export const createDoctor = asyncHandler(async (req, res) => {
    const doctor = await Doctor.create(req.body);
    const populatedDoctor = await Doctor.findById(doctor._id).populate('department', 'name code');
    sendSuccess(res, 201, 'Doctor created successfully', populatedDoctor);
});

export const onboardDoctor = asyncHandler(async (req, res) => {
    const { password, ...doctorPayload } = req.body;
    const normalizedEmail = String(doctorPayload.email || '').trim().toLowerCase();

    if (!password) {
        throw new ApiError(400, 'Password is required');
    }

    if (!normalizedEmail) {
        throw new ApiError(400, 'Valid email is required');
    }

    const [existingDoctor, existingUser, existingLicense] = await Promise.all([
        Doctor.findOne({ email: normalizedEmail }).select('_id').lean(),
        User.findOne({ email: normalizedEmail }).select('_id').lean(),
        Doctor.findOne({ licenseNumber: doctorPayload.licenseNumber }).select('_id').lean()
    ]);

    if (existingDoctor || existingUser) {
        throw new ApiError(409, 'Email already exists');
    }

    if (existingLicense) {
        throw new ApiError(409, 'License number already exists');
    }

    const createWithoutTransaction = async () => {
        const doctorDoc = await Doctor.create({
            ...doctorPayload,
            email: normalizedEmail
        });

        try {
            const userDoc = await User.create({
                firstName: doctorDoc.firstName,
                lastName: doctorDoc.lastName,
                email: normalizedEmail,
                phone: doctorDoc.phone,
                password,
                role: 'doctor',
                department: doctorDoc.department,
                doctorProfile: doctorDoc._id,
                isApproved: true
            });

            return { doctorDoc, userDoc };
        } catch (error) {
            await Doctor.findByIdAndDelete(doctorDoc._id).catch(() => null);
            throw error;
        }
    };

    const createWithTransaction = async () => {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();

            const [doctorDoc] = await Doctor.create(
                [
                    {
                        ...doctorPayload,
                        email: normalizedEmail
                    }
                ],
                { session }
            );

            const [userDoc] = await User.create(
                [
                    {
                        firstName: doctorDoc.firstName,
                        lastName: doctorDoc.lastName,
                        email: normalizedEmail,
                        phone: doctorDoc.phone,
                        password,
                        role: 'doctor',
                        department: doctorDoc.department,
                        doctorProfile: doctorDoc._id,
                        isApproved: true
                    }
                ],
                { session }
            );

            await session.commitTransaction();
            return { doctorDoc, userDoc };
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    };

    let createdDoctor;
    let createdUser;

    try {
        const result = await createWithTransaction();
        createdDoctor = result.doctorDoc;
        createdUser = result.userDoc;
    } catch (error) {
        const message = String(error?.message || '');
        const isTransactionUnsupported =
            message.includes('Transaction numbers are only allowed') ||
            message.includes('replica set') ||
            message.includes('mongos') ||
            message.includes('Transaction is not supported');

        if (!isTransactionUnsupported) {
            throw error;
        }

        const result = await createWithoutTransaction();
        createdDoctor = result.doctorDoc;
        createdUser = result.userDoc;
    }

    const [populatedDoctor, populatedUser] = await Promise.all([
        Doctor.findById(createdDoctor._id).populate('department', 'name code'),
        User.findById(createdUser._id).populate('department doctorProfile', 'name code firstName lastName specialization')
    ]);

    sendSuccess(res, 201, 'Doctor onboarded successfully', {
        doctor: populatedDoctor,
        user: populatedUser.toSafeObject()
    });
});

export const updateDoctor = asyncHandler(async (req, res) => {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    }).populate('department', 'name code');

    if (!doctor) {
        throw new ApiError(404, 'Doctor not found');
    }

    sendSuccess(res, 200, 'Doctor updated successfully', doctor);
});

export const deleteDoctor = asyncHandler(async (req, res) => {
    const [appointmentCount, recordCount] = await Promise.all([
        Appointment.countDocuments({ doctor: req.params.id }),
        MedicalRecord.countDocuments({ doctor: req.params.id })
    ]);

    if (appointmentCount > 0 || recordCount > 0) {
        throw new ApiError(409, 'Doctor cannot be deleted while linked appointments or records exist');
    }

    const doctor = await Doctor.findByIdAndDelete(req.params.id);

    if (!doctor) {
        throw new ApiError(404, 'Doctor not found');
    }

    sendSuccess(res, 200, 'Doctor deleted successfully');
});
