/* backend/middleware/rbacMiddleware.js */
import Role from '../models/Role.js';
import { sendError } from '../helpers/responseHandler.js';

export const checkPermission = (moduleName, requiredLevel) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) return sendError(res, 401, 'Unauthorized');

      // Find role for this business
      const role = await Role.findOne({ 
        name: user.role, 
        businessId: { $in: [user.businessId, null] } // Check business-specific or default roles
      });

      if (!role) return sendError(res, 403, 'Role not found');

      const permission = role.permissions.find(p => p.module === moduleName);
      
      const levels = { 'None': 0, 'Read': 1, 'Full': 2 };
      const userLevel = levels[permission?.level || 'None'];
      const required = levels[requiredLevel];

      if (userLevel >= required) {
        next();
      } else {
        return sendError(res, 403, `Insufficient permissions for module: ${moduleName}`);
      }
    } catch (error) {
      console.error(error);
      return sendError(res, 500, 'Error checking permissions');
    }
  };
};
