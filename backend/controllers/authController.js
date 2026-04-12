/* backend/controllers/authController.js */
import User from '../models/User.js';
import Business from '../models/Business.js';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../helpers/tokenHelper.js';
import { sendResponse, sendError } from '../helpers/responseHandler.js';
import dotenv from 'dotenv';

dotenv.config();

export const register = async (req, res) => {
  const { name, email, password, businessName } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return sendError(res, 400, 'User already exists');

    // Create Business first
    const business = await Business.create({
      name: businessName || `${name}'s Business`,
      ownerId: null // Temporarily null
    });

    const user = await User.create({
      name,
      email,
      password,
      role: 'Super Admin',
      businessId: business._id
    });

    // Update business owner
    business.ownerId = user._id;
    await business.save();

    const accessToken = generateAccessToken({ id: user._id });
    const refreshToken = generateRefreshToken({ id: user._id });

    user.refreshToken = refreshToken;
    await user.save();

    sendResponse(res, 201, 'User registered successfully', {
      user: { id: user._id, name: user.name, email: user.email, role: user.role, businessId: user.businessId },
      accessToken,
      refreshToken
    });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      const accessToken = generateAccessToken({ id: user._id });
      const refreshToken = generateRefreshToken({ id: user._id });

      user.refreshToken = refreshToken;
      await user.save();

      sendResponse(res, 200, 'Login successful', {
        user: { id: user._id, name: user.name, email: user.email, role: user.role, businessId: user.businessId },
        accessToken,
        refreshToken
      });
    } else {
      sendError(res, 401, 'Invalid email or password');
    }
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return sendError(res, 401, 'Refresh Token is required');

  try {
    const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
    if (!decoded) return sendError(res, 401, 'Invalid Refresh Token');

    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return sendError(res, 401, 'Refresh Token mismatch');
    }

    const accessToken = generateAccessToken({ id: user._id });
    sendResponse(res, 200, 'Token refreshed', { accessToken });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

export const logout = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.refreshToken = null;
    await user.save();
  }
  sendResponse(res, 200, 'Logged out successfully');
};

export const getProfile = async (req, res) => {
  sendResponse(res, 200, 'Profile retrieved', { user: req.user });
};
