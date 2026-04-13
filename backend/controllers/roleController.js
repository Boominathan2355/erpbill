/* backend/controllers/roleController.js */
import Role from '../models/Role.js';
import { sendResponse, sendError } from '../helpers/responseHandler.js';

export const getAll = async (req, res) => {
  try {
    // Return system default roles OR business specific roles
    const roles = await Role.find({ 
      $or: [
        { isDefault: true },
        { businessId: req.user.businessId }
      ]
    });
    sendResponse(res, 200, 'Roles retrieved', roles);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

export const create = async (req, res) => {
  try {
    const role = await Role.create({
      ...req.body,
      businessId: req.user.businessId,
      isDefault: false
    });
    sendResponse(res, 201, 'Role created', role);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

export const update = async (req, res) => {
  try {
    const role = await Role.findOne({ _id: req.params.id, businessId: req.user.businessId });
    if (!role) return sendError(res, 404, 'Role not found or is a system default role');

    if (role.isDefault) return sendError(res, 400, 'Cannot update system default roles');

    const updatedRole = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true });
    sendResponse(res, 200, 'Role updated', updatedRole);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

export const deleteRole = async (req, res) => {
  try {
    const role = await Role.findOne({ _id: req.params.id, businessId: req.user.businessId });
    if (!role) return sendError(res, 404, 'Role not found');
    
    if (role.isDefault) return sendError(res, 400, 'Cannot delete system default roles');

    await Role.findByIdAndDelete(req.params.id);
    sendResponse(res, 200, 'Role deleted');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
