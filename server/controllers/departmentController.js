import Department from '../models/Department.js';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { getPagination, getSort, buildTextSearch } from '../utils/buildQuery.js';
import { sendSuccess } from '../utils/response.js';

export const listDepartments = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};
    const searchFilter = buildTextSearch(req.query.search, ['name', 'code', 'location']);

    if (req.query.isActive !== undefined) {
        filter.isActive = req.query.isActive === 'true';
    }

    if (searchFilter) {
        Object.assign(filter, searchFilter);
    }

    const [items, total] = await Promise.all([
        Department.find(filter).sort(getSort(req.query, 'name')).skip(skip).limit(limit),
        Department.countDocuments(filter)
    ]);

    sendSuccess(res, 200, 'Departments retrieved successfully', items, {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
    });
});

export const getDepartmentById = asyncHandler(async (req, res) => {
    const department = await Department.findById(req.params.id);

    if (!department) {
        throw new ApiError(404, 'Department not found');
    }

    const [doctorCount, appointmentCount] = await Promise.all([
        Doctor.countDocuments({ department: department._id }),
        Appointment.countDocuments({ department: department._id })
    ]);

    sendSuccess(res, 200, 'Department retrieved successfully', {
        ...department.toObject(),
        stats: { doctorCount, appointmentCount }
    });
});

export const createDepartment = asyncHandler(async (req, res) => {
    const department = await Department.create(req.body);
    sendSuccess(res, 201, 'Department created successfully', department);
});

export const updateDepartment = asyncHandler(async (req, res) => {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!department) {
        throw new ApiError(404, 'Department not found');
    }

    sendSuccess(res, 200, 'Department updated successfully', department);
});

export const deleteDepartment = asyncHandler(async (req, res) => {
    const [doctorCount, appointmentCount] = await Promise.all([
        Doctor.countDocuments({ department: req.params.id }),
        Appointment.countDocuments({ department: req.params.id })
    ]);

    if (doctorCount > 0 || appointmentCount > 0) {
        throw new ApiError(409, 'Department cannot be deleted while linked doctors or appointments exist');
    }

    const department = await Department.findByIdAndDelete(req.params.id);

    if (!department) {
        throw new ApiError(404, 'Department not found');
    }

    sendSuccess(res, 200, 'Department deleted successfully');
});
