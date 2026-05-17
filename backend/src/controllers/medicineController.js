import mongoose from 'mongoose';
import Medicine from '../models/Medicine.js';

// @desc    Create a new medicine listing
// @route   POST /api/medicines
// @access  Private
export const createMedicine = async (req, res) => {
  try {
    const {
      medicineName,
      medicineSalt,
      shortDescription,
      expiryDate,
      medicineType,
      quantity,
      pricePerUnit,
      mrp,
      imageUrl,
      imagePublicId
    } = req.body;

    if (!medicineName || !medicineSalt || !shortDescription || !expiryDate || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required medicine details'
      });
    }

    const parsedQuantity =
      quantity === undefined || quantity === null || quantity === '' ? 1 : Number(quantity);
    const hasPricePerUnit = !(pricePerUnit === undefined || pricePerUnit === null || pricePerUnit === '');
    const hasMrp = !(mrp === undefined || mrp === null || mrp === '');
    const parsedMrp = hasMrp ? Number(mrp) : hasPricePerUnit ? Number(pricePerUnit) : NaN;
    // If selling price is not provided, use MRP directly.
    const parsedPricePerUnit = hasPricePerUnit ? Number(pricePerUnit) : parsedMrp;

    if (Number.isNaN(parsedQuantity) || parsedQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    if (Number.isNaN(parsedPricePerUnit) || parsedPricePerUnit < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price cannot be negative'
      });
    }

    if (Number.isNaN(parsedMrp) || parsedMrp < 0) {
      return res.status(400).json({
        success: false,
        message: 'MRP cannot be negative'
      });
    }

    if (parsedPricePerUnit > parsedMrp) {
      return res.status(400).json({
        success: false,
        message: 'Selling price cannot be greater than MRP'
      });
    }

    const allowedTypes = ['Tablet', 'Capsule', 'Syrup', 'Supplement', 'Other'];
    const normalizedType =
      typeof medicineType === 'string' && allowedTypes.includes(medicineType.trim())
        ? medicineType.trim()
        : 'Other';

    const medicine = await Medicine.create({
      seller: req.user.id,
      medicineName: medicineName.trim(),
      medicineSalt: medicineSalt.trim(),
      shortDescription: shortDescription.trim(),
      expiryDate,
      medicineType: normalizedType,
      quantity: parsedQuantity,
      pricePerUnit: parsedPricePerUnit,
      mrp: parsedMrp,
      imageUrl,
      imagePublicId: imagePublicId || ''
    });

    await medicine.populate('seller', 'name email');

    res.status(201).json({
      success: true,
      message: 'Medicine listed successfully',
      medicine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create medicine listing',
      error: error.message
    });
  }
};

// @desc    Get all active medicine listings
// @route   GET /api/medicines
// @access  Public
export const getAllMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find({ isActive: true })
      .sort({ createdAt: -1 })
      .populate('seller', 'name email');

    res.status(200).json({
      success: true,
      count: medicines.length,
      medicines
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medicine listings',
      error: error.message
    });
  }
};

// @desc    Get current user's listed medicines
// @route   GET /api/medicines/mine
// @access  Private
export const getMyMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find({ seller: req.user.id })
      .sort({ createdAt: -1 })
      .populate('seller', 'name email');

    res.status(200).json({
      success: true,
      count: medicines.length,
      medicines
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your medicine listings',
      error: error.message
    });
  }
};

// @desc    Delete current user's listed medicine
// @route   DELETE /api/medicines/:id
// @access  Private
export const deleteMedicine = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid medicine listing id'
      });
    }

    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine listing not found'
      });
    }

    if (medicine.seller.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this medicine listing'
      });
    }

    await medicine.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Medicine listing deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete medicine listing',
      error: error.message
    });
  }
};
