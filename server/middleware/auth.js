import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

export const protect = asyncHandler(async (req, _res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ApiError(401, 'Authentication required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.sub).populate('department doctorProfile patientProfile', 'name code firstName lastName specialization patientNumber dateOfBirth gender');

    if (!user) {
        throw new ApiError(401, 'User associated with this token no longer exists');
    }

    if (!user.isActive) {
        throw new ApiError(403, 'This account is inactive');
    }

    req.user = user;
    next();
});

export const authorize = (...roles) => (req, _res, next) => {
    if (!req.user) {
        return next(new ApiError(401, 'Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
        return next(new ApiError(403, 'You are not authorized to access this resource'));
    }

    return next();
};
