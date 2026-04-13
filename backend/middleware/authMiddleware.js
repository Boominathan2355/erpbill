/* backend/middleware/authMiddleware.js */
import { verifyToken } from '../helpers/tokenHelper.js';
import { sendError } from '../helpers/responseHandler.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = verifyToken(token, process.env.JWT_SECRET);

      if (!decoded) {
        return sendError(res, 401, 'Not authorized, token failed');
      }

      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      console.error(error);
      return sendError(res, 401, 'Not authorized, token failed');
    }
  }

  if (!token) {
    return sendError(res, 401, 'Not authorized, no token');
  }
};
