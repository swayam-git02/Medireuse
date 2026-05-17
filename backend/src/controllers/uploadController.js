import { getConfiguredCloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';

// @desc    Upload medicine image to Cloudinary
// @route   POST /api/uploads/medicine-image
// @access  Private
export const uploadMedicineImage = async (req, res) => {
  try {
    const { image } = req.body;

    if (!isCloudinaryConfigured()) {
      return res.status(500).json({
        success: false,
        message: 'Cloudinary is not configured on the server'
      });
    }

    if (!image || typeof image !== 'string' || !image.startsWith('data:image/')) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid medicine image'
      });
    }

    const cloudinary = getConfiguredCloudinary();

    const uploadedImage = await cloudinary.uploader.upload(image, {
      folder: 'medireuse/medicines',
      resource_type: 'image'
    });

    res.status(201).json({
      success: true,
      imageUrl: uploadedImage.secure_url,
      publicId: uploadedImage.public_id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to upload medicine image',
      error: error.message
    });
  }
};
