import { useEffect, useState } from 'react';
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { orderAPI } from '../services/api.js';

// Har order status ke liye icon + color + label ka mapping yaha defined hai.
const statusConfig = {
  pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Pending' },
  confirmed: { icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Confirmed' },
  shipped: { icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Shipped' },
  delivered: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Delivered' },
  cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Cancelled' },
};

export default function OrderHistory() {
  // orders array me user ke saare orders store hote hain.
  const [orders, setOrders] = useState([]);
  // isLoading true hone par loading spinner dikhaya jata hai.
  const [isLoading, setIsLoading] = useState(true);
  // error message API failure me yaha store hota hai.
  const [error, setError] = useState('');
  // selectedOrder me jis order pe click hua ho uski details store hoti hain.
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    // Page open hote hi orders fetch karte hain.
    fetchOrders();
  }, []);

  // fetchOrders function backend se current user ke orders laata hai.
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await orderAPI.getMyOrders();
      if (response.success) {
        setOrders(response.orders);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  // handleCancelOrder function pending order ko cancel karne ke liye use hota hai.
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      const response = await orderAPI.cancelOrder(orderId);
      if (response.success) {
        // map function se list me sirf wahi order update karte hain jo cancel hua hai.
        setOrders(orders.map((o) => (o._id === orderId ? response.order : o)));
        setSelectedOrder(null);
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel order');
    }
  };

  // formatDate function date ko readable format me convert karta hai.
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <main className="min-h-screen bg-[url('/sell-page-bg.png')] bg-cover bg-center px-4 pb-14 pt-4 md:px-8">
      <section className="mx-auto max-w-6xl rounded-[30px] border border-[#c9e2dc] bg-[#eaf8f4]/90 p-6 shadow-[0_22px_44px_rgba(37,84,73,0.12)] md:p-8">
        {/* Header section */}
        <div className="mb-8 grid gap-5 rounded-3xl border border-[#d6ebe4] bg-white/70 p-5 md:grid-cols-[auto_1fr] md:items-center">
          <button
            // Back button previous page pe le jata hai.
            onClick={() => window.history.back()}
            // transition-colors = hover pe text color smooth change hota hai.
            className="text-[#3d5f57] transition-colors hover:text-[#1f3d3a] md:hidden"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="md:col-span-2">
            <h1 className="text-2xl font-semibold text-[#1f3d3a] md:text-3xl">My Orders</h1>
            <p className="mt-2 text-sm text-[#5b7570] md:text-base">
              Track and manage your medicine purchases
            </p>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="py-12 text-center">
            {/* animate-spin = round loader continuously ghoomta hai */}
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-[#37aa82]"></div>
            <p className="mt-4 text-[#5b7570]">Loading your orders...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-red-700">{error}</p>
            <button
              // Try Again button same fetchOrders function ko dobara call karta hai.
              onClick={fetchOrders}
              // transition-colors = hover pe button ka color smooth badalta hai.
              className="mt-3 rounded-lg bg-red-100 px-4 py-2 text-red-700 transition-colors hover:bg-red-200"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && orders.length === 0 && !error && (
          <div className="py-12 text-center">
            <Package size={48} className="mx-auto mb-4 text-[#c9e2dc]" />
            <h3 className="text-xl font-semibold text-[#1f3d3a]">No Orders Yet</h3>
            <p className="mt-2 text-[#5b7570]">
              You haven't placed any orders yet. Start shopping now!
            </p>
          </div>
        )}

        {/* Orders list */}
        {!isLoading && orders.length > 0 && (
          <div className="space-y-4">
            {/* map function har order ko ek clickable card me convert karta hai */}
            {orders.map((order) => {
              const statusInfo = statusConfig[order.status];
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={order._id}
                  // transition-colors = hover pe card background smooth change hota hai.
                  className="cursor-pointer rounded-xl border border-[#d6ebe4] bg-white p-4 transition-colors hover:bg-[#f8fcfb]"
                  // Card click se detail modal open hota hai.
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex items-start justify-between gap-4 md:items-center">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-[#223f3a]">
                          {order.medicineName}
                        </h3>
                        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                          <StatusIcon size={14} />
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-sm text-[#6b8781]">
                        Order ID: {order._id}
                      </p>
                      <p className="mt-1 text-sm text-[#6b8781]">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#1f3d3a]">
                        Rs {order.totalPrice}
                      </p>
                      <p className="text-sm text-[#6b8781]">
                        Qty: {order.quantity}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Order details modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-xl">
            {/* Modal header */}
            <div className="sticky top-0 flex items-center justify-between rounded-t-2xl border-b border-[#d6ebe4] bg-white p-6">
              <h2 className="text-xl font-semibold text-[#1f3d3a]">Order Details</h2>
              <button
                // Is button se modal band hota hai.
                onClick={() => setSelectedOrder(null)}
                className="text-[#6b8781] hover:text-[#1f3d3a]"
              >
                X
              </button>
            </div>

            {/* Modal content */}
            <div className="space-y-4 p-6">
              {/* Status block */}
              <div className="rounded-xl border border-[#d6ebe4] bg-[#f0f8f5] p-4">
                <p className="mb-2 text-sm text-[#6b8781]">Status</p>
                <div className="flex items-center gap-2">
                  {(() => {
                    // Selected order ke current status ke hisab se icon/text nikalte hain.
                    const statusInfo = statusConfig[selectedOrder.status];
                    const StatusIcon = statusInfo.icon;
                    return (
                      <>
                        <StatusIcon size={20} className={statusInfo.color} />
                        <span className="font-semibold text-[#1f3d3a]">
                          {statusInfo.label}
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Medicine details */}
              <div className="space-y-3">
                <h3 className="font-semibold text-[#223f3a]">Medicine Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#6b8781]">Medicine</span>
                    <span className="font-medium text-[#1f3d3a]">{selectedOrder.medicineName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6b8781]">Type</span>
                    <span className="font-medium text-[#1f3d3a]">{selectedOrder.medicineType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6b8781]">Quantity</span>
                    <span className="font-medium text-[#1f3d3a]">{selectedOrder.quantity} unit(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6b8781]">Price per Unit</span>
                    <span className="font-medium text-[#1f3d3a]">Rs {selectedOrder.pricePerUnit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6b8781]">Expiry Date</span>
                    <span className="font-medium text-[#1f3d3a]">{selectedOrder.expiryDate}</span>
                  </div>
                </div>
              </div>

              {/* Order summary */}
              <div className="rounded-lg border border-[#d6ebe4] bg-[#f0f8f5] p-3">
                <p className="text-sm text-[#6b8781]">Total Amount</p>
                <p className="text-2xl font-bold text-[#1f3d3a]">Rs {selectedOrder.totalPrice}</p>
              </div>

              {/* Delivery details */}
              <div className="space-y-3">
                <h3 className="font-semibold text-[#223f3a]">Delivery Details</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="mb-1 text-[#6b8781]">Shipping Address</p>
                    <p className="font-medium text-[#1f3d3a]">{selectedOrder.shippingAddress}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-[#6b8781]">Payment Method</p>
                    <p className="font-medium capitalize text-[#1f3d3a]">{selectedOrder.paymentMethod}</p>
                  </div>
                </div>
              </div>

              {/* Optional notes */}
              {selectedOrder.notes && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-[#223f3a]">Notes</h3>
                  <p className="rounded-lg bg-[#f0f8f5] p-3 text-sm text-[#1f3d3a]">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}

              {/* Order dates */}
              <div className="space-y-1 border-t border-[#d6ebe4] pt-3 text-xs text-[#6b8781]">
                <p>Ordered: {formatDate(selectedOrder.createdAt)}</p>
                <p>Last Updated: {formatDate(selectedOrder.updatedAt)}</p>
              </div>

              {/* Cancel button sirf pending order par dikhata hai */}
              {selectedOrder.status === 'pending' && (
                <button
                  onClick={() => handleCancelOrder(selectedOrder._id)}
                  // transition-colors = hover pe red shade smooth change hota hai.
                  className="mt-4 w-full rounded-xl border border-red-300 px-4 py-2.5 font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  Cancel Order
                </button>
              )}

              <button
                // Close button modal ko band karta hai.
                onClick={() => setSelectedOrder(null)}
                // transition-opacity = hover pe opacity smoothly change hoti hai.
                className="w-full rounded-xl bg-gradient-to-r from-[#37aa82] to-[#2e9d79] px-4 py-2.5 font-medium text-white transition-opacity hover:opacity-90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
