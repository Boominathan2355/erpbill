import mongoose from 'mongoose';
import { CLIENT_TYPES } from '../constants/index.js';

const clientSchema = new mongoose.Schema({
  type: { type: String, enum: CLIENT_TYPES, required: true },
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  gstin: { type: String },
  stateCode: { type: String },
  country: { type: String },
  currency: { type: String },
  taxId: { type: String },
  lutNumber: { type: String },
  isTaxableExport: { type: Boolean, default: false },
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true }
}, {
  timestamps: true
});

const Client = mongoose.model('Client', clientSchema);
export default Client;
