/* backend/controllers/transactionController.js */
import Transaction from '../models/Transaction.js';
import { sendResponse, sendError } from '../helpers/responseHandler.js';
import { buildPagination } from '../helpers/paginationHelper.js';

export const getAll = async (req, res) => {
  try {
    const { skip, limit, page, sort } = buildPagination(req.query);
    
    const filter = { businessId: req.user.businessId };
    if (req.query.type) filter.type = req.query.type;
    if (req.query.category) filter.category = req.query.category;

    const transactions = await Transaction.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments(filter);

    sendResponse(res, 200, 'Transactions retrieved', transactions, {
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
    const transaction = await Transaction.create({
      ...req.body,
      businessId: req.user.businessId
    });
    sendResponse(res, 201, 'Transaction created', transaction);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

export const getById = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, businessId: req.user.businessId });
    if (!transaction) return sendError(res, 404, 'Transaction not found');
    sendResponse(res, 200, 'Transaction retrieved', transaction);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

export const update = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user.businessId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!transaction) return sendError(res, 404, 'Transaction not found');
    sendResponse(res, 200, 'Transaction updated', transaction);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, businessId: req.user.businessId });
    if (!transaction) return sendError(res, 404, 'Transaction not found');
    sendResponse(res, 200, 'Transaction deleted');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
