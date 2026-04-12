/* backend/controllers/businessController.js */
import Business from '../models/Business.js';
import { sendResponse, sendError } from '../helpers/responseHandler.js';

export const getAll = async (req, res) => {
  try {
    const businesses = await Business.find({ ownerId: req.user._id });
    sendResponse(res, 200, 'Businesses retrieved', businesses);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

export const create = async (req, res) => {
  try {
    const count = await Business.countDocuments({ ownerId: req.user._id });
    if (count >= 5) return sendError(res, 400, 'Maximum 5 businesses allowed');

    const business = await Business.create({
      ...req.body,
      ownerId: req.user._id
    });
    sendResponse(res, 201, 'Business created', business);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

export const getById = async (req, res) => {
  try {
    const business = await Business.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!business) return sendError(res, 404, 'Business not found');
    sendResponse(res, 200, 'Business retrieved', business);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

export const update = async (req, res) => {
  try {
    const business = await Business.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!business) return sendError(res, 404, 'Business not found');
    sendResponse(res, 200, 'Business updated', business);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

export const deleteBusiness = async (req, res) => {
  try {
    const business = await Business.findOneAndDelete({ _id: req.params.id, ownerId: req.user._id });
    if (!business) return sendError(res, 404, 'Business not found');
    sendResponse(res, 200, 'Business deleted');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
