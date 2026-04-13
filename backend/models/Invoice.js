import mongoose from 'mongoose';
import { INVOICE_STATUSES, DISCOUNT_TYPES, CLIENT_TYPES } from '../constants/index.js';

const invoiceItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String, required: true },
  hsnCode: { type: String },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  taxRate: { type: Number, required: true },
  taxAmount: { type: Number, required: true },
  total: { type: Number, required: true }
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true },
  date: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  clientType: { type: String, enum: CLIENT_TYPES },
  currency: { type: String, default: 'INR' },
  lutNumber: { type: String },
  isTaxableExport: { type: Boolean, default: false },
  isB2CLarge: { type: Boolean, default: false },
  reverseCharge: { type: Boolean, default: false },
  placeOfSupply: { type: String },
  items: [invoiceItemSchema],
  subtotal: { type: Number, required: true },
  taxTotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  discountType: { type: String, enum: DISCOUNT_TYPES, default: 'percentage' },
  totalAmount: { type: Number, required: true },
  isRounded: { type: Boolean, default: true },
  status: { type: String, enum: INVOICE_STATUSES, default: 'draft' },
  notes: { type: String },
  terms: { type: String },
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

// Compound index for unique invoice number per business
invoiceSchema.index({ invoiceNumber: 1, businessId: 1 }, { unique: true });

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;
