export const getPagination = (query = {}) => {
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
    const skip = (page - 1) * limit;

    return { page, limit, skip };
};

export const getSort = (query = {}, fallback = '-createdAt') => {
    return query.sort || fallback;
};

export const buildTextSearch = (search, fields = []) => {
    if (!search || fields.length === 0) {
        return null;
    }

    return {
        $or: fields.map((field) => ({
            [field]: { $regex: search.trim(), $options: 'i' }
        }))
    };
};
