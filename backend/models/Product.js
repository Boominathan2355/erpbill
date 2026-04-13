import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  unit: { type: String, required: true },
  taxRate: { type: Number, required: true },
  hsnCode: { type: String },
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);
export default Product;
