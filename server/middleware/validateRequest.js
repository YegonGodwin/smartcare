import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

const validateRequest = (req, _res, next) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
        return next();
    }

    return next(new ApiError(422, 'Validation failed', errors.array()));
};

export default validateRequest;
