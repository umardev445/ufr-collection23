import React, { useEffect, useState, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Settings, 
  LogOut,
  ChevronRight,
  Bell,
  Search,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, query, orderBy, onSnapshot, limit, where, Timestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

const AdminLayout = () => {
  const { profile, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState<{ id: string; message: string; createdAt: Date }[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const isMounted = useRef(false);
  const startTime = useRef(Timestamp.now());

  useEffect(() => {
    if (!loading && !isAdmin) {
      toast.error('Access Denied. Admins Only.');
      navigate('/login');
    }
  }, [loading, isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) return;

    // Real-time Order Notifications
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef, 
      where('createdAt', '>', startTime.current),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const orderData = change.doc.data();
          const orderId = change.doc.id;
          
          // Show Toast
          toast.success((t) => (
            <div className="flex flex-col">
              <span className="font-bold">New Order Received!</span>
              <span className="text-xs opacity-80">Order #{orderData.trackingId} by {orderData.customer?.name}</span>
              <button 
                onClick={() => {
                  toast.dismiss(t.id);
                  navigate('/admin/orders');
                }}
                className="mt-2 text-[10px] font-bold uppercase tracking-widest bg-brand-black text-white px-3 py-1.5 rounded"
              >
                View Order
              </button>
            </div>
          ), { duration: 6000, icon: '🛍️' });

          // Add to notification list
          setNotifications(prev => [{
            id: orderId,
            message: `New order: ${orderData.trackingId}`,
            createdAt: orderData.createdAt?.toDate() || new Date()
          }, ...prev].slice(0, 10));

          // Play sound (subtle)
          try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.volume = 0.5;
            audio.play().catch(() => {}); // Browser might block if no interaction yet
          } catch (e) {}
        }
      });
    });

    return () => unsubscribe();
  }, [isAdmin, navigate]);

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Products', path: '/admin/products', icon: <Package size={20} /> },
    { name: 'Orders', path: '/admin/orders', icon: <ShoppingBag size={20} /> },
    { name: 'Reviews', path: '/admin/reviews', icon: <MessageSquare size={20} /> },
    { name: 'Customers', path: '/admin/customers', icon: <Users size={20} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 pt-0"> {/* Override main padding */}
      {/* Sidebar */}
      <aside className="w-64 bg-brand-black text-white hidden lg:flex flex-col fixed h-full z-10">
        <div className="p-8 border-b border-white/10">
          <Link to="/" className="text-2xl font-serif font-bold tracking-tighter">
            UFR<span className="text-brand-gold">.</span> ADMIN
          </Link>
        </div>
        
        <nav className="flex-grow p-6 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 p-3 rounded-xl transition-all ${
                location.pathname === item.path ? 'bg-brand-gold text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              <span className="text-xs font-bold uppercase tracking-widest">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-white/10">
          <Link to="/" className="flex items-center space-x-3 text-gray-400 hover:text-white p-3">
            <LogOut size={20} />
            <span className="text-xs font-bold uppercase tracking-widest">Back to Store</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow lg:ml-64 p-8">
        {/* Admin Header */}
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-2xl font-serif font-bold text-brand-black">Admin Dashboard</h1>
            <p className="text-[10px] text-brand-gray uppercase tracking-widest font-bold mt-1">
              Welcome back, {profile?.displayName || 'Admin'}
            </p>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search orders..."
                className="bg-white border border-gray-100 rounded-full py-2 px-10 text-xs focus:outline-none focus:border-brand-gold w-64"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-brand-gray hover:text-brand-gold transition-colors"
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-4 w-80 bg-white shadow-2xl rounded-2xl border border-gray-50 z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="text-xs font-bold uppercase tracking-widest">Recent Activity</h3>
                    <button 
                      onClick={() => setNotifications([])}
                      className="text-[10px] text-brand-gray hover:text-red-500 font-bold uppercase tracking-tighter"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-xs text-brand-gray italic">No new notifications</div>
                    ) : (
                      notifications.map((notif) => (
                        <div key={notif.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <p className="text-xs font-bold text-brand-black">{notif.message}</p>
                          <p className="text-[10px] text-brand-gray mt-1">{notif.createdAt.toLocaleTimeString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <Link 
                      to="/admin/orders" 
                      onClick={() => setShowNotifications(false)}
                      className="block p-4 text-center text-[10px] font-bold uppercase tracking-widest text-brand-gold hover:bg-brand-beige transition-colors"
                    >
                      View All Orders
                    </Link>
                  )}
                </div>
              )}
            </div>

            <div className="w-10 h-10 rounded-full bg-brand-gold flex items-center justify-center text-white font-bold text-sm">
              {profile?.displayName?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
