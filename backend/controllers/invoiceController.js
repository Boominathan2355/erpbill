/* backend/controllers/invoiceController.js */
import Invoice from '../models/Invoice.js';
import Transaction from '../models/Transaction.js';
import { sendResponse, sendError } from '../helpers/responseHandler.js';
import { buildPagination } from '../helpers/paginationHelper.js';

export const getAll = async (req, res) => {
  try {
    const { skip, limit, page, sort } = buildPagination(req.query);
    
    const filter = { businessId: req.user.businessId };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.clientId) filter.clientId = req.query.clientId;

    const invoices = await Invoice.find(filter)
      .populate('clientId', 'name email address gstin')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Invoice.countDocuments(filter);

    sendResponse(res, 200, 'Invoices retrieved', invoices, {
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
    const invoice = await Invoice.create({
      ...req.body,
      businessId: req.user.businessId,
      createdBy: req.user._id
    });
    sendResponse(res, 201, 'Invoice created', invoice);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

export const getNextNumber = async (req, res) => {
  try {
    const count = await Invoice.countDocuments({ businessId: req.user.businessId });
    const nextNumber = `INV-${(count + 1).toString().padStart(3, '0')}`;
    sendResponse(res, 200, 'Next invoice number retrieved', { nextNumber });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

export const getById = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, businessId: req.user.businessId })
      .populate('clientId');
    if (!invoice) return sendError(res, 404, 'Invoice not found');
    sendResponse(res, 200, 'Invoice retrieved', invoice);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

export const update = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user.businessId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!invoice) return sendError(res, 404, 'Invoice not found');
    sendResponse(res, 200, 'Invoice updated', invoice);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const invoice = await Invoice.findOne({ _id: req.params.id, businessId: req.user.businessId });
    
    if (!invoice) return sendError(res, 404, 'Invoice not found');

    const oldStatus = invoice.status;
    invoice.status = status;
    await invoice.save();

    // Auto-create transaction if status changed to 'paid'
    if (status === 'paid' && oldStatus !== 'paid') {
      await Transaction.create({
        date: Date.now(),
        type: 'income',
        category: 'Sales',
        amount: invoice.totalAmount,
        description: `Payment for Invoice ${invoice.invoiceNumber}`,
        referenceId: invoice._id,
        paymentMethod: 'Bank', // Default
        status: 'completed',
        businessId: req.user.businessId
      });
    }

    sendResponse(res, 200, 'Status updated', invoice);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({ _id: req.params.id, businessId: req.user.businessId });
    if (!invoice) return sendError(res, 404, 'Invoice not found');
    sendResponse(res, 200, 'Invoice deleted');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
