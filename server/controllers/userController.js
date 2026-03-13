import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess } from '../utils/response.js';
import { logUser } from '../services/logService.js';

/**
 * Get all staff users (Admin, Doctor, Receptionist)
 */
export const getAllStaff = asyncHandler(async (req, res) => {
    const users = await User.find({ role: { $ne: 'patient' } })
        .select('-password')
        .populate('department', 'name code')
        .populate('doctorProfile', 'specialization staffId')
        .sort({ createdAt: -1 });

    sendSuccess(res, 200, 'Staff users retrieved successfully', users);
});

/**
 * Update user role and status
 */
export const updateUserAccess = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { role, isActive, department } = req.body;

    const user = await User.findById(id);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // Safety: Prevent admin from deactivating themselves or changing their own role
    if (user._id.toString() === req.user._id.toString()) {
        if (role && role !== user.role) {
            throw new ApiError(400, 'You cannot change your own role. Please ask another administrator.');
        }
        if (isActive === false) {
            throw new ApiError(400, 'You cannot deactivate your own account.');
        }
    }

    const oldData = { role: user.role, isActive: user.isActive, department: user.department };

    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (department !== undefined) user.department = department;

    await user.save();

    await logUser({
        user: req.user._id,
        action: 'UPDATE_USER_ACCESS',
        status: 'SUCCESS',
        description: `Updated access for ${user.email}: Role ${oldData.role}->${user.role}, Active ${oldData.isActive}->${user.isActive}`,
        resourceId: user._id,
        resourceModel: 'User',
        details: { oldData, newData: { role: user.role, isActive: user.isActive, department: user.department } },
        req
    });

    sendSuccess(res, 200, 'User access updated successfully', user.toSafeObject());
});

/**
 * Delete a user (Staff)
 */
export const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (id === req.user._id.toString()) {
        throw new ApiError(400, 'You cannot delete your own account.');
    }

    const user = await User.findById(id);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    await User.findByIdAndDelete(id);

    await logUser({
        user: req.user._id,
        action: 'DELETE_USER',
        status: 'WARNING',
        description: `Deleted user account: ${user.email} (${user.role})`,
        resourceId: id,
        resourceModel: 'User',
        req
    });

    sendSuccess(res, 200, 'User deleted successfully');
});
