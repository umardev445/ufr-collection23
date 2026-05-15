import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Package, Heart, MapPin, User, LogOut, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { auth } from '../firebase/config';

const Dashboard = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return <div className="py-24 text-center">Loading...</div>;
  if (!user) { navigate('/login'); return null; }

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  const menuItems = [
    { name: 'My Orders', icon: <Package size={20} />, path: '/order-tracking' },
    { name: 'Wishlist', icon: <Heart size={20} />, path: '/wishlist' },
    { name: 'Shipping Address', icon: <MapPin size={20} />, path: '#' },
    { name: 'Account Details', icon: <User size={20} />, path: '#' },
  ];

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-8">
          <div className="text-center p-8 luxury-card bg-brand-black text-white">
            <div className="w-20 h-20 bg-brand-gold rounded-full flex items-center justify-center text-3xl font-serif font-bold text-white mx-auto mb-4 border-4 border-white/20">
              {profile?.displayName?.charAt(0) || 'U'}
            </div>
            <h2 className="text-xl font-serif font-bold">{profile?.displayName}</h2>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">{profile?.email}</p>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => item.path !== '#' && navigate(item.path)}
                className="w-full flex items-center justify-between p-4 luxury-card hover:border-brand-gold transition-all group"
              >
                <div className="flex items-center space-x-3 text-brand-black/80">
                  <span className="text-brand-gold">{item.icon}</span>
                  <span className="text-xs font-bold uppercase tracking-widest">{item.name}</span>
                </div>
                <ChevronRight size={14} className="text-gray-300 group-hover:text-brand-gold" />
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 p-4 text-red-500 hover:bg-red-50 rounded-xl transition-all"
            >
              <LogOut size={20} />
              <span className="text-xs font-bold uppercase tracking-widest">Sign Out</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-12">
          <section>
            <div className="flex justify-between items-end mb-8">
              <h3 className="text-2xl font-serif font-bold">Recent Activity</h3>
              <p className="text-[10px] text-brand-gray uppercase tracking-widest">Updated just now</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Total Orders', value: '0', sub: 'Last 30 days' },
                { label: 'Active Wishlist', value: '0', sub: 'Saved items' },
                { label: 'Member Since', value: 'May 2026', sub: 'Gold Member' }
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-6 luxury-card text-center"
                >
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-gray mb-2">{stat.label}</h4>
                  <p className="text-2xl font-bold text-brand-black mb-1">{stat.value}</p>
                  <p className="text-[9px] text-brand-gold uppercase tracking-tighter font-medium">{stat.sub}</p>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="p-12 bg-brand-beige/50 rounded-3xl border-2 border-dashed border-brand-gold/10 text-center">
            <div className="max-w-md mx-auto">
              <Package size={48} className="text-brand-gold/30 mx-auto mb-4" />
              <h4 className="text-lg font-serif font-bold mb-2">No Active Orders</h4>
              <p className="text-xs text-brand-gray mb-8">You haven't placed any orders yet. Our new collection is waitng for you!</p>
              <button
                onClick={() => navigate('/shop')}
                className="bg-brand-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold transition-colors rounded-xl"
              >
                Go to Shop
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
