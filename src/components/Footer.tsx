import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-brand-black text-white pt-16 pb-8">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand Info */}
        <div className="space-y-6">
          <Link to="/" className="text-2xl font-serif font-bold tracking-tighter">
            UFR<span className="text-brand-gold">.</span> COLLECTION
          </Link>
          <p className="text-gray-400 text-sm leading-relaxed">
            Premium Pakistani women's boutique offering the finest unstitched clothing with elegant designs and high-quality fabrics. Experience luxury fashion with UFR Collection.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-brand-gold transition-colors"><Instagram size={20} /></a>
            <a href="#" className="hover:text-brand-gold transition-colors"><Facebook size={20} /></a>
            <a href="#" className="hover:text-brand-gold transition-colors"><Twitter size={20} /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-serif mb-6">Quick Links</h4>
          <ul className="space-y-4 text-gray-400 text-sm">
            <li><Link to="/shop" className="hover:text-white transition-colors">Shop All</Link></li>
            <li><Link to="/new-arrivals" className="hover:text-white transition-colors">New Arrivals</Link></li>
            <li><Link to="/order-tracking" className="hover:text-white transition-colors">Track Order</Link></li>
            <li><Link to="/wishlist" className="hover:text-white transition-colors">Wishlist</Link></li>
            <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
          </ul>
        </div>

        {/* Help & Policies */}
        <div>
          <h4 className="text-lg font-serif mb-6">Customer Care</h4>
          <ul className="space-y-4 text-gray-400 text-sm">
            <li><Link to="/faq" className="hover:text-white transition-colors">FAQs</Link></li>
            <li><Link to="/shipping-policy" className="hover:text-white transition-colors">Shipping Policy</Link></li>
            <li><Link to="/returns" className="hover:text-white transition-colors">Returns & Exchange</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            <li><Link to="/size-guide" className="hover:text-white transition-colors">Size Guide</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-lg font-serif mb-6">Contact Info</h4>
          <ul className="space-y-4 text-gray-400 text-sm">
            <li className="flex items-start space-x-3">
              <MapPin size={18} className="text-brand-gold mt-1 flex-shrink-0" />
              <span>Gulberg III, Lahore, Pakistan</span>
            </li>
            <li className="flex items-center space-x-3">
              <Phone size={18} className="text-brand-gold flex-shrink-0" />
              <span>+92 300 1234567</span>
            </li>
            <li className="flex items-center space-x-3">
              <Mail size={18} className="text-brand-gold flex-shrink-0" />
              <span>info@ufrcollection.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 md:px-8 mt-16 pt-8 border-t border-white/10 text-center text-gray-500 text-xs tracking-widest uppercase">
        <p>&copy; {new Date().getFullYear()} UFR COLLECTION. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
