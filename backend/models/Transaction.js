import mongoose from 'mongoose';
import { TRANSACTION_TYPES, PAYMENT_METHODS, TRANSACTION_STATUSES } from '../constants/index.js';

const transactionSchema = new mongoose.Schema({
  date: { type: Date, required: true, default: Date.now },
  type: { type: String, enum: TRANSACTION_TYPES, required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  referenceId: { type: String }, // Links to Invoice or other ref
  paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
  status: { type: String, enum: TRANSACTION_STATUSES, default: 'completed' },
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true }
}, {
  timestamps: true
});

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
