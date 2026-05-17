import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createMedicine,
  getAllMedicines,
  getMyMedicines,
  deleteMedicine
} from '../controllers/medicineController.js';

const router = express.Router();

router.get('/', getAllMedicines);
router.get('/mine', protect, getMyMedicines);
router.post('/', protect, createMedicine);
router.delete('/:id', protect, deleteMedicine);

export default router;
