import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ShoppingBag, 
  Search, 
  Eye, 
  ChevronRight, 
  Printer,
  X,
  Truck,
  CheckCircle2,
  Clock,
  CircleDashed,
  AlertCircle
} from 'lucide-react';
import { collection, query, onSnapshot, updateDoc, doc, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Order } from '../types';
import toast from 'react-hot-toast';

const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Real-time Orders Listener
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    
    setLoading(true);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orderList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(orderList);
      setLoading(false);
    }, (error) => {
      console.error('Error listening to orders:', error);
      toast.error('Failed to listen to orders');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        orderStatus: newStatus,
        updatedAt: serverTimestamp()
      });
      toast.success(`Order status updated to: ${newStatus}`);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, orderStatus: newStatus as any });
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Order Received': return 'bg-blue-50 text-blue-600';
      case 'Confirmed': return 'bg-indigo-50 text-indigo-600';
      case 'Processing': return 'bg-amber-50 text-amber-600';
      case 'Shipped': return 'bg-emerald-50 text-emerald-600';
      case 'Delivered': return 'bg-green-50 text-green-600';
      case 'Cancelled': return 'bg-red-50 text-red-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-serif font-bold">Customer Orders</h2>
        <div className="flex space-x-2">
          <button className="bg-white border border-gray-100 p-2 rounded-lg text-brand-gray hover:text-brand-black"><Printer size={20} /></button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex items-center space-x-4">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by ID, name, or city..."
              className="w-full bg-gray-50 border-none rounded-xl py-3 pl-12 text-sm"
            />
          </div>
          <select className="bg-gray-50 border-none rounded-xl py-3 px-6 text-xs font-bold uppercase tracking-widest text-brand-gray">
            <option>All Status</option>
            <option>Order Received</option>
            <option>Shipped</option>
            <option>Delivered</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] uppercase font-bold tracking-widest text-gray-400">
              <tr>
                <th className="px-6 py-4">Order Details</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold mb-1">{order.trackingId}</p>
                    <p className="text-[10px] text-gray-400">{new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold mb-1">{order.customer.name}</p>
                    <p className="text-[10px] text-gray-400">{order.customer.city}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium bg-gray-100 px-2 py-1 rounded">{order.items.length} Suits</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-brand-black">Rs. {order.totalAmount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}
                      className="text-brand-gray hover:text-brand-gold transition-colors"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && !loading && (
             <div className="p-20 text-center text-gray-400 uppercase tracking-widest text-sm">No orders found</div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative z-10 p-8 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
              <div className="flex items-center space-x-4">
                <h3 className="text-xl font-serif font-bold">Order Details</h3>
                <span className="text-xs font-bold text-brand-gold bg-brand-beige px-3 py-1 rounded-lg uppercase tracking-widest">{selectedOrder.trackingId}</span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-8">
                {/* Items */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-brand-gray">Ordered Items</h4>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex space-x-6 p-4 bg-gray-50 rounded-2xl">
                        <div className="w-16 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0">
                          <img src={item.images[0]} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-grow">
                          <h5 className="font-bold text-sm mb-1">{item.name}</h5>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">{item.category}</p>
                          <div className="flex justify-between items-end">
                            <span className="text-xs font-bold">Qty: {item.quantity}</span>
                            <span className="text-xs font-bold text-brand-gold">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Update */}
                <div className="bg-brand-beige rounded-2xl p-6">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-brand-gold mb-6 flex items-center">
                    <CircleDashed size={14} className="mr-2" /> Update Order Status
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {['Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].map((status) => (
                      <button
                        key={status}
                        onClick={() => updateOrderStatus(selectedOrder.id, status)}
                        className={`py-3 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                          selectedOrder.orderStatus === status 
                          ? 'bg-brand-black text-white shadow-lg' 
                          : 'bg-white text-brand-black hover:bg-white/50 border border-brand-gold/10'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                {/* Customer Details */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-brand-gray">Customer Information</h4>
                  <div className="p-6 bg-white border border-gray-100 rounded-2xl space-y-4">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase block mb-1">Name</span>
                      <p className="text-sm font-bold">{selectedOrder.customer.name}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase block mb-1">Phone</span>
                      <p className="text-sm font-bold">{selectedOrder.customer.phone}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase block mb-1">City</span>
                      <p className="text-sm font-bold">{selectedOrder.customer.city}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase block mb-1">Shipping Address</span>
                      <p className="text-xs leading-relaxed font-medium">{selectedOrder.customer.address}</p>
                    </div>
                  </div>
                </div>

                {/* Payment */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-brand-gray">Payment Summary</h4>
                  <div className="p-6 bg-brand-black text-white rounded-2xl">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] uppercase tracking-widest">Method</span>
                      <span className="text-xs font-bold text-brand-gold uppercase">{selectedOrder.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-white/10">
                      <span className="text-[10px] uppercase tracking-widest">Grand Total</span>
                      <span className="text-lg font-bold text-brand-gold">Rs. {selectedOrder.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                {selectedOrder.paymentMethod !== 'COD' && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3">
                    <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest mb-1">Advance Payment</p>
                      <p className="text-[10px] text-amber-700 leading-relaxed">Verify the payment screenshot on WhatsApp before shipping this order.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
