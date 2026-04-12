/* backend/controllers/productController.js */
import Product from '../models/Product.js';
import { sendResponse, sendError } from '../helpers/responseHandler.js';
import { buildPagination, getSearchQuery } from '../helpers/paginationHelper.js';

export const getAll = async (req, res) => {
  try {
    const { skip, limit, page, sort } = buildPagination(req.query);
    const searchQuery = getSearchQuery(req.query.search, ['name', 'description', 'hsnCode']);
    
    const filter = { ...searchQuery, businessId: req.user.businessId };

    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);

    sendResponse(res, 200, 'Products retrieved', products, {
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
    const product = await Product.create({
      ...req.body,
      businessId: req.user.businessId
    });
    sendResponse(res, 201, 'Product created', product);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

export const getById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, businessId: req.user.businessId });
    if (!product) return sendError(res, 404, 'Product not found');
    sendResponse(res, 200, 'Product retrieved', product);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

export const update = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user.businessId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) return sendError(res, 404, 'Product not found');
    sendResponse(res, 200, 'Product updated', product);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, businessId: req.user.businessId });
    if (!product) return sendError(res, 404, 'Product not found');
    sendResponse(res, 200, 'Product deleted');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
