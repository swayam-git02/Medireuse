import express from 'express';
import { protect } from '../middleware/auth.js';
import { uploadMedicineImage } from '../controllers/uploadController.js';

const router = express.Router();

router.post('/medicine-image', protect, uploadMedicineImage);

export default router;
