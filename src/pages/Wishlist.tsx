import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';

const Wishlist = () => {
  return (
    <div className="max-w-screen-xl mx-auto px-4 py-24 text-center">
      <div className="bg-brand-pink inline-flex p-8 rounded-full mb-8 text-white">
        <Heart size={48} />
      </div>
      <h1 className="text-3xl font-serif font-bold mb-4">Your Wishlist</h1>
      <p className="text-brand-gray mb-10 max-w-sm mx-auto">Save your favorite premium items here. Revisit them any time and add to your bag for checkout.</p>
      <div className="space-y-4">
        <p className="text-xs text-gray-400 italic">No items in wishlist yet.</p>
        <Link
          to="/shop"
          className="inline-block bg-brand-black text-white px-12 py-4 text-xs font-bold uppercase tracking-widest hover:bg-brand-gold transition-colors rounded-xl"
        >
          Explore Collection
        </Link>
      </div>
    </div>
  );
};

export default Wishlist;
