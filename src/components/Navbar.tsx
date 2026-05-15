import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, User, Heart, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase/config';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-brand-black" onClick={() => setIsMenuOpen(true)}>
          <Menu size={24} />
        </button>

        {/* Logo */}
        <Link to="/" className="text-2xl md:text-3xl font-serif font-bold tracking-tighter text-brand-black">
          UFR<span className="text-brand-gold">.</span> COLLECTION
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8 uppercase text-xs font-medium tracking-widest text-brand-black/80">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'text-brand-gold' : 'hover:text-brand-gold')}>
            Home
          </NavLink>
          <NavLink to="/shop" className={({ isActive }) => (isActive ? 'text-brand-gold' : 'hover:text-brand-gold')}>
            Shop
          </NavLink>
          <NavLink to="/new-arrivals" className={({ isActive }) => (isActive ? 'text-brand-gold' : 'hover:text-brand-gold')}>
            New Arrivals
          </NavLink>
          <NavLink to="/order-tracking" className={({ isActive }) => (isActive ? 'text-brand-gold' : 'hover:text-brand-gold')}>
            Track Order
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className="text-brand-gold font-bold">
              Admin
            </NavLink>
          )}
        </div>

        {/* Icons */}
        <div className="flex items-center space-x-4 md:space-x-6 text-brand-black">
          <button className="hover:text-brand-gold transition-colors">
            <Search size={20} />
          </button>
          <Link to="/wishlist" className="hover:text-brand-gold transition-colors relative">
            <Heart size={20} />
          </Link>
          <Link to="/cart" className="hover:text-brand-gold transition-colors relative">
            <ShoppingBag size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-gold text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                {totalItems}
              </span>
            )}
          </Link>
          <div className="relative group">
            <Link to={user ? "/dashboard" : "/login"} className="hover:text-brand-gold transition-colors">
              <User size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu Sidebar */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-[60]"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 w-4/5 h-full bg-white z-[70] p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <span className="text-xl font-serif font-bold">UFR COLLECTION</span>
                <button onClick={() => setIsMenuOpen(false)}>
                  <X size={24} />
                </button>
              </div>
              <div className="flex flex-col space-y-6 text-sm font-medium uppercase tracking-widest">
                <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
                <Link to="/shop" onClick={() => setIsMenuOpen(false)}>Shop</Link>
                <Link to="/new-arrivals" onClick={() => setIsMenuOpen(false)}>New Arrivals</Link>
                <Link to="/order-tracking" onClick={() => setIsMenuOpen(false)}>Track Order</Link>
                {isAdmin && <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="text-brand-gold">Admin Panel</Link>}
                <hr className="border-gray-100" />
                {user ? (
                  <>
                    <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>My Account</Link>
                    <button onClick={handleLogout} className="text-left">Logout</button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login / Register</Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
