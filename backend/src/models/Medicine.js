import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller is required']
    },
    medicineName: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true
    },
    medicineSalt: {
      type: String,
      required: [true, 'Medicine salt is required'],
      trim: true
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      trim: true
    },
    expiryDate: {
      type: String,
      required: [true, 'Expiry date is required']
    },
    medicineType: {
      type: String,
      enum: ['Tablet', 'Capsule', 'Syrup', 'Supplement', 'Other'],
      default: 'Other'
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      default: 1,
      min: [1, 'Quantity must be at least 1']
    },
    pricePerUnit: {
      type: Number,
      required: [true, 'Price per unit is required'],
      default: 0,
      min: [0, 'Price cannot be negative']
    },
    mrp: {
      type: Number,
      required: [true, 'MRP is required'],
      default: 0,
      min: [0, 'MRP cannot be negative']
    },
    imageUrl: {
      type: String,
      required: [true, 'Medicine image is required'],
      trim: true
    },
    imagePublicId: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Medicine = mongoose.model('Medicine', medicineSchema);

export default Medicine;
