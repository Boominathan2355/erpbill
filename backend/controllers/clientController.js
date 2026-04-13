/* backend/controllers/clientController.js */
import Client from '../models/Client.js';
import { sendResponse, sendError } from '../helpers/responseHandler.js';
import { buildPagination, getSearchQuery } from '../helpers/paginationHelper.js';

export const getAll = async (req, res) => {
  try {
    const { skip, limit, page, sort } = buildPagination(req.query);
    const searchQuery = getSearchQuery(req.query.search, ['name', 'email', 'gstin']);
    
    const filter = { ...searchQuery, businessId: req.user.businessId };

    const clients = await Client.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Client.countDocuments(filter);

    sendResponse(res, 200, 'Clients retrieved', clients, {
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

export const create = async (req, res) => {
  try {
    const client = await Client.create({
      ...req.body,
      businessId: req.user.businessId
    });
    sendResponse(res, 201, 'Client created', client);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

export const getById = async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, businessId: req.user.businessId });
    if (!client) return sendError(res, 404, 'Client not found');
    sendResponse(res, 200, 'Client retrieved', client);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

export const update = async (req, res) => {
  try {
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user.businessId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!client) return sendError(res, 404, 'Client not found');
    sendResponse(res, 200, 'Client updated', client);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findOneAndDelete({ _id: req.params.id, businessId: req.user.businessId });
    if (!client) return sendError(res, 404, 'Client not found');
    sendResponse(res, 200, 'Client deleted');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
