/* backend/controllers/auditLogController.js */
import AuditLog from '../models/AuditLog.js';
import { sendResponse, sendError } from '../helpers/responseHandler.js';
import { buildPagination } from '../helpers/paginationHelper.js';

export const getAll = async (req, res) => {
  try {
    const { skip, limit, page, sort } = buildPagination(req.query);
    
    const filter = { businessId: req.user.businessId };
    if (req.query.module) filter.module = req.query.module;
    if (req.query.action) filter.action = req.query.action;

    const logs = await AuditLog.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await AuditLog.countDocuments(filter);

    sendResponse(res, 200, 'Audit logs retrieved', logs, {
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
