import Order from '../models/Order.js';
import crypto from 'crypto';

// @desc    Create a Razorpay order
// @route   POST /api/orders/razorpay-order
// @access  Private
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    const parsedAmount = Number(amount);

    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid amount is required to create a Razorpay order'
      });
    }

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpaySecret = process.env.RAZORPAY_SECRET_KEY;

    if (!razorpayKeyId || !razorpaySecret) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay keys are not configured on the server'
      });
    }

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${razorpayKeyId}:${razorpaySecret}`).toString('base64')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: Math.round(parsedAmount * 100),
        currency,
        receipt: receipt || `receipt_${Date.now()}`
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data?.error?.description || 'Failed to create Razorpay order',
        error: data?.error
      });
    }

    res.status(201).json({
      success: true,
      order: data,
      keyId: razorpayKeyId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create Razorpay order',
      error: error.message
    });
  }
};

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const {
      medicineName,
      medicineType,
      quantity,
      pricePerUnit,
      mrp,
      expiryDate,
      paymentMethod,
      shippingAddress,
      notes,
      paymentId,
      razorpayOrderId,
      paymentSignature
    } = req.body;

    const parsedQuantity = Number(quantity);
    const parsedPricePerUnit = Number(pricePerUnit);
    const parsedMrp = mrp === undefined || mrp === null || mrp === '' ? parsedPricePerUnit : Number(mrp);

    // Validate required fields
    if (
      !medicineName ||
      !medicineType ||
      !parsedQuantity ||
      Number.isNaN(parsedPricePerUnit) ||
      !expiryDate ||
      !paymentMethod ||
      !shippingAddress
    ) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Verify Razorpay payment signature if payment method is card/upi
    if (paymentMethod === 'card' || paymentMethod === 'upi') {
      if (!paymentId || !paymentSignature || !razorpayOrderId) {
        return res.status(400).json({
          success: false,
          message: 'Razorpay payment details are incomplete. Please try again.'
        });
      }

      const razorpaySecret = process.env.RAZORPAY_SECRET_KEY;
      if (!razorpaySecret) {
        return res.status(500).json({
          success: false,
          message: 'Razorpay secret key is not configured on the server'
        });
      }

      const generatedSignature = crypto
        .createHmac('sha256', razorpaySecret)
        .update(`${razorpayOrderId}|${paymentId}`)
        .digest('hex');

      if (generatedSignature !== paymentSignature) {
        return res.status(400).json({
          success: false,
          message: 'Payment verification failed. Please try again.'
        });
      }
    }

    // Validate quantity
    if (parsedQuantity < 1 || parsedQuantity > 100) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be between 1 and 100'
      });
    }

    // Validate price
    if (parsedPricePerUnit < 0) {
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

    // Calculate total price
    const totalPrice = parsedQuantity * parsedPricePerUnit;

    // Create order
    const order = await Order.create({
      buyer: req.user.id,
      medicineName,
      medicineType,
      quantity: parsedQuantity,
      pricePerUnit: parsedPricePerUnit,
      mrp: parsedMrp,
      totalPrice,
      expiryDate,
      paymentMethod,
      shippingAddress,
      notes: notes || '',
      paymentId: paymentId || '',
      razorpayOrderId: razorpayOrderId || '',
      paymentSignature: paymentSignature || ''
    });

    // Populate buyer details
    await order.populate('buyer', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
};

// @desc    Get all orders for authenticated user
// @route   GET /api/orders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id })
      .sort({ createdAt: -1 })
      .populate('buyer', 'name email phone');

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('buyer', 'name email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is the buyer or admin
    if (order.buyer._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private/Admin
export const updateOrder = async (req, res) => {
  try {
    const { status } = req.body;

    // Only admin can update order status
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can update orders'
      });
    }

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('buyer', 'name email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating order',
      error: error.message
    });
  }
};

// @desc    Cancel order
// @route   DELETE /api/orders/:id
// @access  Private
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    if (order.buyer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Only pending orders can be cancelled
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending orders can be cancelled'
      });
    }

    order.status = 'cancelled';
    order.updatedAt = Date.now();
    await order.save();

    await order.populate('buyer', 'name email phone');

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling order',
      error: error.message
    });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    // Admin check is handled by middleware
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can view all orders'
      });
    }

    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('buyer', 'name email phone address');

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};
