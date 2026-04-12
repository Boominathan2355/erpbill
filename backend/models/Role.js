import mongoose from 'mongoose';
import { PERMISSION_LEVELS, MODULES } from '../constants/index.js';

const rolePermissionSchema = new mongoose.Schema({
  module: { type: String, enum: MODULES, required: true },
  level: { type: String, enum: PERMISSION_LEVELS, required: true }
}, { _id: false });

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  permissions: [rolePermissionSchema],
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' },
  isDefault: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Ensure Role name is unique per business
roleSchema.index({ name: 1, businessId: 1 }, { unique: true });

const Role = mongoose.model('Role', roleSchema);
export default Role;
