import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Package, CheckCircle2, Clock, Truck, Home, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Order } from '../types';

const OrderTracking = () => {
  const [searchParams] = useSearchParams();
  const [trackingId, setTrackingId] = useState(searchParams.get('id') || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!trackingId) return;

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const q = query(collection(db, 'orders'), where('trackingId', '==', trackingId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Order not found. Please check your Tracking ID.');
      } else {
        const orderData = querySnapshot.docs[0].data() as Order;
        orderData.id = querySnapshot.docs[0].id;
        setOrder(orderData);
      }
    } catch (err) {
      console.error('Tracking error:', err);
      setError('An error occurred while tracking your order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get('id')) {
      handleTrack();
    }
  }, []);

  const statuses = [
    { name: 'Order Received', icon: <Package size={20} /> },
    { name: 'Confirmed', icon: <CheckCircle2 size={20} /> },
    { name: 'Processing', icon: <Clock size={20} /> },
    { name: 'Shipped', icon: <Truck size={20} /> },
    { name: 'Out for Delivery', icon: <MapPin size={20} /> },
    { name: 'Delivered', icon: <Home size={20} /> },
  ];

  const currentStatusIndex = statuses.findIndex(s => s.name === order?.orderStatus);

  return (
    <div className="max-w-4xl mx-auto px-4 py-24">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-serif font-bold mb-4">Track Your Order</h1>
        <p className="text-brand-gray text-sm md:text-base tracking-wide max-w-lg mx-auto">Enter your tracking number (e.g. UFR-XXXXXXX) to see your order status and delivery progress.</p>
      </div>

      <div className="bg-brand-beige/50 p-8 rounded-2xl border border-brand-gold/10 mb-12 shadow-sm">
        <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4">
          <div className="grow relative">
            <input
              type="text"
              placeholder="Order ID / Tracking ID"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
              className="w-full bg-white border border-gray-200 px-6 py-4 rounded-xl text-sm focus:outline-none focus:border-brand-gold transition-colors pl-12 uppercase"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold" size={20} />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-black text-white px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-brand-gold transition-colors rounded-xl flex items-center justify-center space-x-2"
          >
            {loading ? 'Tracking...' : 'Track Now'}
          </button>
        </form>
        {error && <p className="text-red-500 text-xs mt-4 text-center font-bold tracking-widest uppercase">{error}</p>}
      </div>

      {order && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* Summary Card */}
          <div className="bg-white p-8 rounded-2xl luxury-card border-none shadow-xl border-t-4 border-brand-gold">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              <div>
                <span className="text-[10px] text-brand-gray uppercase tracking-widest block mb-1">Status</span>
                <span className="text-sm font-bold text-brand-gold uppercase">{order.orderStatus}</span>
              </div>
              <div>
                <span className="text-[10px] text-brand-gray uppercase tracking-widest block mb-1">Tracking ID</span>
                <span className="text-sm font-bold uppercase">{order.trackingId}</span>
              </div>
              <div>
                <span className="text-[10px] text-brand-gray uppercase tracking-widest block mb-1">Payment</span>
                <span className="text-sm font-bold">{order.paymentMethod}</span>
              </div>
              <div>
                <span className="text-[10px] text-brand-gray uppercase tracking-widest block mb-1">Delivery For</span>
                <span className="text-sm font-bold truncate block">{order.customer.name}</span>
              </div>
            </div>
            
            {/* Horizontal Timeline (Desktop) */}
            <div className="hidden md:flex justify-between items-center relative mt-16 px-4">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
              <div 
                className="absolute top-1/2 left-0 h-0.5 bg-brand-gold -translate-y-1/2 z-0 transition-all duration-1000" 
                style={{ width: `${(currentStatusIndex / (statuses.length - 1)) * 100}%` }}
              />
              
              {statuses.map((status, index) => {
                const isActive = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                
                return (
                  <div key={status.name} className="relative z-10 flex flex-col items-center group">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                      isCurrent ? 'bg-brand-gold text-white scale-110 shadow-lg shadow-brand-gold/40' : 
                      isActive ? 'bg-brand-gold text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {status.icon}
                    </div>
                    <span className={`absolute -bottom-8 text-[9px] font-bold uppercase tracking-widest whitespace-nowrap text-center transition-colors ${
                      isActive ? 'text-brand-black' : 'text-gray-400'
                    }`}>
                      {status.name}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Vertical Timeline (Mobile) */}
            <div className="md:hidden flex flex-col space-y-8 mt-8">
              {statuses.map((status, index) => {
                const isActive = index <= currentStatusIndex;
                return (
                  <div key={status.name} className="flex items-center space-x-6">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isActive ? 'bg-brand-gold text-white shadow-md' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {status.icon}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${
                      isActive ? 'text-brand-black' : 'text-gray-400'
                    }`}>
                      {status.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-center">
             <Link to="/contact" className="text-brand-gold text-xs font-bold border-b border-brand-gold pb-1 uppercase tracking-widest hover:opacity-80 transition-opacity">
                Need Help with your order?
             </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default OrderTracking;
