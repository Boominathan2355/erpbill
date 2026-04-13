/* backend/controllers/settingsController.js */
import Business from '../models/Business.js';
import { sendResponse, sendError } from '../helpers/responseHandler.js';

export const getSettings = async (req, res) => {
  try {
    const business = await Business.findById(req.user.businessId);
    if (!business) return sendError(res, 404, 'Business not found');
    sendResponse(res, 200, 'Settings retrieved', {
      profile: business.profile,
      taxInclusive: business.taxInclusive
    });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const business = await Business.findById(req.user.businessId);
    if (!business) return sendError(res, 404, 'Business not found');

    business.profile = { ...business.profile, ...req.body };
    await business.save();

    sendResponse(res, 200, 'Profile updated', business.profile);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

export const updateTax = async (req, res) => {
  try {
    const { taxInclusive } = req.body;
    const business = await Business.findByIdAndUpdate(
      req.user.businessId,
      { taxInclusive },
      { new: true }
    );
    sendResponse(res, 200, 'Tax preference updated', { taxInclusive: business.taxInclusive });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
