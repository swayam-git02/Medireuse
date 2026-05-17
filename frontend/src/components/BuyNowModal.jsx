import { useState, useEffect } from 'react';
import { X, AlertCircle, Check } from 'lucide-react';
import { orderAPI } from '../services/api.js';

export default function BuyNowModal({ medicine, isOpen, onClose, onOrderSuccess }) {
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Guard against null medicine - MUST be after hooks
  if (!isOpen || !medicine) return null;

  const unitMrp = medicine.mrp ?? medicine.price;
  const totalPrice = quantity * medicine.price;
  const totalMrp = quantity * unitMrp;
  const totalSavings = Math.max(totalMrp - totalPrice, 0);

  const handleClose = () => {
    setQuantity(1);
    setPaymentMethod('card');
    setShippingAddress('');
    setNotes('');
    setIsLoading(false);
    setError('');
    setSuccess(false);
    onClose?.();
  };

  const handleRazorpayPayment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!shippingAddress.trim()) {
      setError('Shipping address is required');
      return;
    }

    if (quantity < 1 || quantity > medicine.qty) {
      setError(`Quantity must be between 1 and ${medicine.qty}`);
      return;
    }

    setIsLoading(true);

    try {
      const orderData = {
        medicineName: medicine.name,
        medicineType: medicine.type,
        quantity: parseInt(quantity, 10),
        pricePerUnit: medicine.price,
        mrp: unitMrp,
        expiryDate: medicine.expiry,
        paymentMethod,
        shippingAddress: shippingAddress.trim(),
        notes: notes.trim()
      };

      // For Razorpay, we'll process payment first
      if (paymentMethod === 'card' || paymentMethod === 'upi') {
        if (!window.Razorpay) {
          setError('Payment gateway is loading. Please try again.');
          setIsLoading(false);
          return;
        }

        const razorpayOrder = await orderAPI.createRazorpayOrder({
          amount: totalPrice,
          currency: 'INR',
          receipt: `medireuse_${Date.now()}`
        });

        // Initialize Razorpay payment
        const options = {
          key: razorpayOrder.keyId,
          amount: razorpayOrder.order.amount,
          currency: razorpayOrder.order.currency,
          name: 'Medireuse',
          description: `${medicine.name} - ${quantity} unit(s)`,
          order_id: razorpayOrder.order.id,
          prefill: {
            name: localStorage.getItem('userName') || 'Customer',
            email: localStorage.getItem('userEmail') || '',
            contact: localStorage.getItem('userPhone') || ''
          },
          handler: async (response) => {
            try {
              orderData.paymentId = response.razorpay_payment_id;
              orderData.paymentSignature = response.razorpay_signature;
              orderData.razorpayOrderId = response.razorpay_order_id || razorpayOrder.order.id;

              const result = await orderAPI.createOrder(orderData);
              if (result.success) {
                setSuccess(true);
                setTimeout(() => {
                  onOrderSuccess?.();
                  handleClose();
                }, 1500);
              } else {
                setError(result.error || 'Order creation failed. Please try again.');
                setIsLoading(false);
              }
            } catch {
              setError('Payment successful but order creation failed. Please contact support.');
              setIsLoading(false);
            }
          },
          modal: {
            ondismiss: () => {
              setIsLoading(false);
              setError('Payment cancelled. Please try again.');
            }
          }
        };

        try {
          const razorpay = new window.Razorpay(options);
          razorpay.open();
        } catch (err) {
          console.error('Razorpay error:', err);
          setError(
            `Payment initialization error: ${err.message || 'Please check your internet connection and try again.'}`
          );
          setIsLoading(false);
        }
      } else {
        // For COD and Bank Transfer, create order directly
        const result = await orderAPI.createOrder(orderData);
        if (result.success) {
          setSuccess(true);
          setTimeout(() => {
            onOrderSuccess?.();
            handleClose();
          }, 1500);
        } else {
          setError(result.error || 'Order creation failed. Please try again.');
          setIsLoading(false);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to process order. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between rounded-t-2xl border-b border-[#d6ebe4] bg-white p-6">
          <h2 className="text-2xl font-semibold text-[#1f3d3a]">Purchase Medicine</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-[#6b8781] transition-colors hover:text-[#1f3d3a] disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Medicine Summary */}
          <div className="mb-6 rounded-xl border border-[#d6ebe4] bg-[#f0f8f5] p-4">
            <h3 className="text-lg font-semibold text-[#223f3a]">{medicine.name}</h3>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[#6b8781]">Type</p>
                <p className="font-medium text-[#1f3d3a]">{medicine.type}</p>
              </div>
              <div>
                <p className="text-[#6b8781]">Price/Unit</p>
                <p className="font-medium text-[#1f3d3a]">Rs {medicine.price}</p>
              </div>
              <div>
                <p className="text-[#6b8781]">MRP/Unit</p>
                <p className="font-medium text-[#1f3d3a]">Rs {unitMrp}</p>
              </div>
              <div>
                <p className="text-[#6b8781]">Available</p>
                <p className="font-medium text-[#1f3d3a]">{medicine.qty} units</p>
              </div>
              <div className="col-span-2">
                <p className="text-[#6b8781]">Expiry</p>
                <p className="font-medium text-[#1f3d3a]">{medicine.expiry}</p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
              <AlertCircle size={20} className="mt-0.5 flex-shrink-0 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 flex gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
              <Check size={20} className="flex-shrink-0 text-green-600" />
              <p className="text-sm font-medium text-green-700">Order placed successfully!</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRazorpayPayment} className="space-y-4">
            {/* Quantity */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#1f3d3a]">
                Quantity <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                min="1"
                max={medicine.qty}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                disabled={isLoading}
                className="w-full rounded-lg border border-[#d3e7e0] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#37aa82] disabled:bg-gray-100"
              />
              <p className="mt-1 text-xs text-[#6b8781]">Max: {medicine.qty} units</p>
            </div>

            {/* Total Price */}
            <div className="rounded-lg border border-[#d6ebe4] bg-[#f0f8f5] p-4">
              <p className="mb-1 text-sm text-[#6b8781]">Total Amount</p>
              <p className="text-3xl font-bold text-[#1f3d3a]">Rs {totalPrice}</p>
              <p className="mt-2 text-xs text-[#6b8781]">
                {quantity} x Rs {medicine.price}
              </p>
              {totalSavings > 0 && (
                <p className="mt-1 text-xs text-[#2f7f68]">You save Rs {totalSavings} vs MRP</p>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#1f3d3a]">
                Payment Method <span className="text-red-600">*</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                disabled={isLoading}
                className="w-full rounded-lg border border-[#d3e7e0] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#37aa82] disabled:bg-gray-100"
              >
                <option value="card">Credit/Debit Card</option>
                <option value="upi">UPI</option>
                <option value="cod">Cash on Delivery</option>
                <option value="bank">Bank Transfer</option>
              </select>
              {(paymentMethod === 'card' || paymentMethod === 'upi') && (
                <p className="mt-1 text-xs text-[#6b8781]">Secure payment via Razorpay</p>
              )}
            </div>

            {/* Shipping Address */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#1f3d3a]">
                Shipping Address <span className="text-red-600">*</span>
              </label>
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Enter complete shipping address (Street, City, State, ZIP)..."
                rows={3}
                disabled={isLoading}
                className="w-full resize-none rounded-lg border border-[#d3e7e0] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#37aa82] disabled:bg-gray-100"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#1f3d3a]">Special Instructions</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests? (e.g., 'Deliver before 2 PM') - Optional"
                rows={2}
                disabled={isLoading}
                className="w-full resize-none rounded-lg border border-[#d3e7e0] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#37aa82] disabled:bg-gray-100"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 border-t border-[#d6ebe4] pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading || success}
                className="flex-1 rounded-xl border border-[#d3e7e0] px-4 py-2.5 font-medium text-[#3d5f57] transition-colors hover:bg-[#ecf7f3] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || success}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#37aa82] to-[#2e9d79] px-4 py-2.5 font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Processing...
                  </>
                ) : success ? (
                  <>
                    <Check size={18} />
                    Order Placed
                  </>
                ) : (
                  `Pay Rs ${totalPrice}`
                )}
              </button>
            </div>

            {/* Payment Info */}
            <div className="mt-4 rounded-lg bg-[#f0f8f5] p-3 text-center text-xs text-[#6b8781]">
              Secure payment processing | Instant confirmation
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
