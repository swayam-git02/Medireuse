import {
  createMedicineRecord,
  deleteMedicineRecord,
  getMedicineById,
  isValidEntityId,
  listActiveMedicines,
  listMedicinesBySeller,
  MEDICINE_TYPES,
} from '../data/store.js';

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
      imagePublicId,
    } = req.body;

    if (!medicineName || !medicineSalt || !shortDescription || !expiryDate || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required medicine details',
      });
    }

    const parsedQuantity =
      quantity === undefined || quantity === null || quantity === '' ? 1 : Number(quantity);
    const hasPricePerUnit = !(pricePerUnit === undefined || pricePerUnit === null || pricePerUnit === '');
    const hasMrp = !(mrp === undefined || mrp === null || mrp === '');
    const parsedMrp = hasMrp ? Number(mrp) : hasPricePerUnit ? Number(pricePerUnit) : NaN;
    const parsedPricePerUnit = hasPricePerUnit ? Number(pricePerUnit) : parsedMrp;

    if (Number.isNaN(parsedQuantity) || parsedQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1',
      });
    }

    if (Number.isNaN(parsedPricePerUnit) || parsedPricePerUnit < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price cannot be negative',
      });
    }

    if (Number.isNaN(parsedMrp) || parsedMrp < 0) {
      return res.status(400).json({
        success: false,
        message: 'MRP cannot be negative',
      });
    }

    if (parsedPricePerUnit > parsedMrp) {
      return res.status(400).json({
        success: false,
        message: 'Selling price cannot be greater than MRP',
      });
    }

    const normalizedType =
      typeof medicineType === 'string' && MEDICINE_TYPES.includes(medicineType.trim())
        ? medicineType.trim()
        : 'Other';

    const medicine = createMedicineRecord({
      sellerId: req.user.id,
      medicineName,
      medicineSalt,
      shortDescription,
      expiryDate,
      medicineType: normalizedType,
      quantity: parsedQuantity,
      pricePerUnit: parsedPricePerUnit,
      mrp: parsedMrp,
      imageUrl,
      imagePublicId,
    });

    res.status(201).json({
      success: true,
      message: 'Medicine listed successfully',
      medicine,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create medicine listing',
      error: error.message,
    });
  }
};

export const getAllMedicines = async (req, res) => {
  try {
    const medicines = listActiveMedicines();

    res.status(200).json({
      success: true,
      count: medicines.length,
      medicines,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medicine listings',
      error: error.message,
    });
  }
};

export const getMyMedicines = async (req, res) => {
  try {
    const medicines = listMedicinesBySeller(req.user.id);

    res.status(200).json({
      success: true,
      count: medicines.length,
      medicines,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your medicine listings',
      error: error.message,
    });
  }
};

export const deleteMedicine = async (req, res) => {
  try {
    if (!isValidEntityId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid medicine listing id',
      });
    }

    const medicine = getMedicineById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine listing not found',
      });
    }

    if (medicine.seller?._id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this medicine listing',
      });
    }

    deleteMedicineRecord(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Medicine listing deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete medicine listing',
      error: error.message,
    });
  }
};
