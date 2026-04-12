import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  action: { type: String, required: true },
  module: { type: String, required: true },
  targetId: { type: String },
  changes: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true }
}, {
  timestamps: true
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
