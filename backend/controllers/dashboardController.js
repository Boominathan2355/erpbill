/* backend/controllers/dashboardController.js */
import Transaction from '../models/Transaction.js';
import Invoice from '../models/Invoice.js';
import Client from '../models/Client.js';
import { sendResponse, sendError } from '../helpers/responseHandler.js';

export const getStats = async (req, res) => {
  try {
    const businessId = req.user.businessId;

    const [totalIncome, totalExpense, invoiceCount, clientCount] = await Promise.all([
      Transaction.aggregate([
        { $match: { businessId, type: 'income', status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { businessId, type: 'expense', status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Invoice.countDocuments({ businessId }),
      Client.countDocuments({ businessId })
    ]);

    sendResponse(res, 200, 'Stats retrieved', {
      totalIncome: totalIncome[0]?.total || 0,
      totalExpense: totalExpense[0]?.total || 0,
      netBalance: (totalIncome[0]?.total || 0) - (totalExpense[0]?.total || 0),
      invoiceCount,
      clientCount
    });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

export const getTrend = async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trendData = await Transaction.aggregate([
      {
        $match: {
          businessId,
          date: { $gte: thirtyDaysAgo },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            type: '$type'
          },
          amount: { $sum: '$amount' }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          income: {
            $sum: { $cond: [{ $eq: ['$_id.type', 'income'] }, '$amount', 0] }
          },
          expense: {
            $sum: { $cond: [{ $eq: ['$_id.type', 'expense'] }, '$amount', 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    sendResponse(res, 200, 'Trend data retrieved', trendData);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
