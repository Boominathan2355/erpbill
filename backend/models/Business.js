import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  profile: {
    address: { type: String },
    email: { type: String },
    phone: { type: String },
    gstin: { type: String },
    stateCode: { type: String },
    logo: { type: String },
    bankName: { type: String },
    bankAccountNo: { type: String },
    bankIFSC: { type: String }
  },
  taxInclusive: { type: Boolean, default: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

const Business = mongoose.model('Business', businessSchema);
export default Business;
