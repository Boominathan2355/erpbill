/* backend/middleware/auditMiddleware.js */
import AuditLog from '../models/AuditLog.js';

export const auditLogger = (moduleName) => {
  return async (req, res, next) => {
    // Only log mutations
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      const originalSend = res.send;
      
      res.send = function (body) {
        const user = req.user;
        if (user) {
          const actionMap = {
            'POST': 'CREATE',
            'PUT': 'UPDATE',
            'PATCH': 'UPDATE',
            'DELETE': 'DELETE'
          };

          const logEntry = {
            userId: user._id,
            userName: user.name,
            action: actionMap[req.method],
            module: moduleName,
            targetId: req.params.id || null,
            changes: req.method === 'DELETE' ? null : req.body,
            ipAddress: req.ip,
            businessId: user.businessId
          };

          // Background save to not block response
          AuditLog.create(logEntry).catch(err => console.error('Audit Log Error:', err));
        }
        return originalSend.apply(res, arguments);
      };
    }
    next();
  };
};
