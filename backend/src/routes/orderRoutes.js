import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createRazorpayOrder,
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrder,
  cancelOrder,
  getAllOrders
} from '../controllers/orderController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// User routes
router.post('/razorpay-order', createRazorpayOrder); // Create Razorpay order for checkout
router.post('/', createOrder);                    // Create a new order
router.get('/', getMyOrders);                     // Get all orders for authenticated user

// Admin routes
router.get('/admin/orders', getAllOrders);        // Get all orders (admin only)
router.get('/:id', getOrderById);                 // Get single order by ID
router.delete('/:id', cancelOrder);               // Cancel an order
router.put('/:id', updateOrder);                  // Update order status (admin only)

export default router;
