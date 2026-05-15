import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Package,
  Eye,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Order } from '../types';

const AdminDashboard = () => {
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState([
    { title: 'Total Revenue', value: 'Rs. 0', trend: '+0%', isUp: true, icon: <DollarSign size={20} />, color: 'bg-emerald-50 text-emerald-600', key: 'revenue' },
    { title: 'Total Orders', value: '0', trend: '+0%', isUp: true, icon: <ShoppingBag size={20} />, color: 'bg-blue-50 text-blue-600', key: 'orders' },
    { title: 'Products', value: '0', trend: '+0%', isUp: true, icon: <Package size={20} />, color: 'bg-amber-50 text-amber-600', key: 'products' },
    { title: 'Customers', value: '0', trend: '+0%', isUp: true, icon: <Users size={20} />, color: 'bg-purple-50 text-purple-600', key: 'customers' },
  ]);

  useEffect(() => {
    // Listen to recent orders
    const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5));
    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setRecentOrders(orders);
    });

    // Simple aggregation (in a real app, use cloud functions or aggregation docs)
    const unsubscribeAllOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const allOrders = snapshot.docs.map(doc => doc.data() as Order);
      const totalRevenue = allOrders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
      const uniqueCustomers = new Set(allOrders.map(o => o.userId)).size;

      setStats(prev => prev.map(s => {
        if (s.key === 'revenue') return { ...s, value: `Rs. ${totalRevenue.toLocaleString()}` };
        if (s.key === 'orders') return { ...s, value: allOrders.length.toString() };
        if (s.key === 'customers') return { ...s, value: uniqueCustomers.toString() };
        return s;
      }));
    });

    const unsubscribeProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      setStats(prev => prev.map(s => {
        if (s.key === 'products') return { ...s, value: snapshot.size.toString() };
        return s;
      }));
    });

    return () => {
      unsubscribeOrders();
      unsubscribeAllOrders();
      unsubscribeProducts();
    };
  }, []);

  return (
    <div className="space-y-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between"
          >
            <div>
              <div className={`p-3 rounded-xl mb-4 inline-block ${stat.color}`}>
                {stat.icon}
              </div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{stat.title}</h4>
              <p className="text-2xl font-bold text-brand-black">{stat.value}</p>
              <div className="flex items-center space-x-1 mt-2">
                {stat.isUp ? <TrendingUp size={14} className="text-emerald-500" /> : <TrendingUp size={14} className="text-red-500 rotate-180" />}
                <span className={`text-xs font-bold ${stat.isUp ? 'text-emerald-500' : 'text-red-500'}`}>{stat.trend}</span>
                <span className="text-[10px] text-gray-400 font-medium">vs last month</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Clock size={18} className="text-brand-gold" />
              <h3 className="text-lg font-serif font-bold">Recent Orders</h3>
            </div>
            <Link to="/admin/orders" className="text-[10px] font-bold uppercase tracking-widest text-brand-gold underline underline-offset-4">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-[10px] uppercase font-bold tracking-widest text-gray-400">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold">{order.trackingId}</td>
                    <td className="px-6 py-4">{order.customer?.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                        order.orderStatus === 'Shipped' ? 'bg-emerald-50 text-emerald-600' : 
                        order.orderStatus === 'Order Received' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold">Rs. {order.totalAmount?.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <Link to="/admin/orders" className="text-brand-gray hover:text-brand-gold transition-colors p-1 flex">
                        <Eye size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">No orders yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-serif font-bold mb-8">Quick Actions</h3>
          <div className="space-y-4">
            <Link to="/admin/products" className="w-full bg-brand-black text-white p-4 rounded-xl flex items-center justify-between group hover:bg-brand-gold transition-all">
              <div className="flex items-center space-x-3">
                <Package size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">Add New Product</span>
              </div>
              <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
            <div className="p-5 bg-brand-beige rounded-2xl border border-brand-gold/10">
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-2">Support Message</h5>
              <p className="text-xs text-brand-gray leading-relaxed mb-4">You have {recentOrders.filter(o => o.orderStatus === 'Order Received').length} unread messages from customers waiting for response.</p>
              <button className="text-[10px] font-bold uppercase underline underline-offset-4 text-brand-black">Open WhatsApp Chat</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-xl text-center">
                <h6 className="text-[9px] font-bold uppercase tracking-widest text-blue-600 mb-1">New Orders</h6>
                <span className="text-xl font-bold text-blue-800">{recentOrders.filter(o => o.orderStatus === 'Order Received').length}</span>
              </div>
              <div className="bg-emerald-50 p-4 rounded-xl text-center">
                <h6 className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 mb-1">Delivered</h6>
                <span className="text-xl font-bold text-emerald-800">{recentOrders.filter(o => o.orderStatus === 'Delivered').length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
