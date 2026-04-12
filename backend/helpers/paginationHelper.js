/* backend/helpers/paginationHelper.js */

export const buildPagination = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  const sort = query.sortBy 
    ? { [query.sortBy]: query.order === 'desc' ? -1 : 1 } 
    : { createdAt: -1 };

  return { skip, limit, page, sort };
};

export const getSearchQuery = (search, fields) => {
  if (!search) return {};
  
  const searchConditions = fields.map(field => ({
    [field]: { $regex: search, $options: 'i' }
  }));

  return { $or: searchConditions };
};
