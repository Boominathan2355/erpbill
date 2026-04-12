/* backend/controllers/userController.js */
import User from '../models/User.js';
import { sendResponse, sendError } from '../helpers/responseHandler.js';

export const getAll = async (req, res) => {
  try {
    const users = await User.find({ businessId: req.user.businessId }).select('-password -refreshToken');
    sendResponse(res, 200, 'Users retrieved', users);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

export const create = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return sendError(res, 400, 'User with this email already exists');

    const user = await User.create({
      name,
      email,
      password,
      role,
      businessId: req.user.businessId
    });

    sendResponse(res, 201, 'User added successfully', { id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

export const update = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user.businessId },
      req.body,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) return sendError(res, 404, 'User not found');
    sendResponse(res, 200, 'User updated', user);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

export const deleteUser = async (req, res) => {
  try {
    // Prevent self-deletion
    if (req.params.id === req.user._id.toString()) {
      return sendError(res, 400, 'Cannot delete yourself');
    }

    const user = await User.findOneAndDelete({ _id: req.params.id, businessId: req.user.businessId });
    if (!user) return sendError(res, 404, 'User not found');
    sendResponse(res, 200, 'User removed');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
