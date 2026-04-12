/* backend/controllers/reportController.js */
import Transaction from '../models/Transaction.js';
import Invoice from '../models/Invoice.js';
import { sendResponse, sendError } from '../helpers/responseHandler.js';

export const incomeByCategory = async (req, res) => {
  try {
    const data = await Transaction.aggregate([
      { $match: { businessId: req.user.businessId, type: 'income', status: 'completed' } },
      { $group: { _id: '$category', amount: { $sum: '$amount' } } }
    ]);
    sendResponse(res, 200, 'Income by category retrieved', data);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

export const expenseByCategory = async (req, res) => {
  try {
    const data = await Transaction.aggregate([
      { $match: { businessId: req.user.businessId, type: 'expense', status: 'completed' } },
      { $group: { _id: '$category', amount: { $sum: '$amount' } } }
    ]);
    sendResponse(res, 200, 'Expense by category retrieved', data);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

export const invoicesSummary = async (req, res) => {
  try {
    const data = await Invoice.aggregate([
      { $match: { businessId: req.user.businessId } },
      { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$totalAmount' } } }
    ]);
    sendResponse(res, 200, 'Invoice summary retrieved', data);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

export const financialOverview = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const match = { businessId: req.user.businessId, status: 'completed' };
    if (Object.keys(dateFilter).length > 0) match.date = dateFilter;

    const data = await Transaction.aggregate([
      { $match: match },
      { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);
    sendResponse(res, 200, 'Financial overview retrieved', data);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
