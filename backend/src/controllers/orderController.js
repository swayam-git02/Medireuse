import crypto from 'crypto';
import {
  createOrderRecord,
  getOrderById as getOrderRecordById,
  getOrdersByBuyer,
  isValidEntityId,
  listAllOrders,
  ORDER_STATUSES,
  updateOrderStatus,
} from '../data/store.js';

export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    const parsedAmount = Number(amount);

    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid amount is required to create a Razorpay order',
      });
    }

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpaySecret = process.env.RAZORPAY_SECRET_KEY;

    if (!razorpayKeyId || !razorpaySecret) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay keys are not configured on the server',
      });
    }

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${razorpayKeyId}:${razorpaySecret}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(parsedAmount * 100),
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data?.error?.description || 'Failed to create Razorpay order',
        error: data?.error,
      });
    }

    res.status(201).json({
      success: true,
      order: data,
      keyId: razorpayKeyId,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create Razorpay order',
      error: error.message,
    });
  }
};

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
      paymentSignature,
    } = req.body;

    const parsedQuantity = Number(quantity);
    const parsedPricePerUnit = Number(pricePerUnit);
    const parsedMrp = mrp === undefined || mrp === null || mrp === '' ? parsedPricePerUnit : Number(mrp);

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
        message: 'Missing required fields',
      });
    }

    if (paymentMethod === 'card' || paymentMethod === 'upi') {
      if (!paymentId || !paymentSignature || !razorpayOrderId) {
        return res.status(400).json({
          success: false,
          message: 'Razorpay payment details are incomplete. Please try again.',
        });
      }

      const razorpaySecret = process.env.RAZORPAY_SECRET_KEY;
      if (!razorpaySecret) {
        return res.status(500).json({
          success: false,
          message: 'Razorpay secret key is not configured on the server',
        });
      }

      const generatedSignature = crypto
        .createHmac('sha256', razorpaySecret)
        .update(`${razorpayOrderId}|${paymentId}`)
        .digest('hex');

      if (generatedSignature !== paymentSignature) {
        return res.status(400).json({
          success: false,
          message: 'Payment verification failed. Please try again.',
        });
      }
    }

    if (parsedQuantity < 1 || parsedQuantity > 100) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be between 1 and 100',
      });
    }

    if (parsedPricePerUnit < 0) {
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

    const totalPrice = parsedQuantity * parsedPricePerUnit;
    const order = createOrderRecord({
      buyerId: req.user.id,
      medicineName,
      medicineType,
      quantity: parsedQuantity,
      pricePerUnit: parsedPricePerUnit,
      mrp: parsedMrp,
      totalPrice,
      expiryDate,
      paymentMethod,
      shippingAddress,
      notes,
      paymentId,
      razorpayOrderId,
      paymentSignature,
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message,
    });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = getOrdersByBuyer(req.user.id);

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message,
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    if (!isValidEntityId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order id',
      });
    }

    const order = getOrderRecordById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.buyer?._id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order',
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message,
    });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const { status } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can update orders',
      });
    }

    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status',
      });
    }

    if (!isValidEntityId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order id',
      });
    }

    const order = updateOrderStatus(req.params.id, status);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating order',
      error: error.message,
    });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    if (!isValidEntityId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order id',
      });
    }

    const order = getOrderRecordById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.buyer?._id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order',
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending orders can be cancelled',
      });
    }

    const cancelledOrder = updateOrderStatus(req.params.id, 'cancelled');

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order: cancelledOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling order',
      error: error.message,
    });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can view all orders',
      });
    }

    const orders = listAllOrders();

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message,
    });
  }
};
