import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-8xl font-serif font-bold text-brand-gold mb-6">404</h1>
      <h2 className="text-2xl font-serif font-bold mb-4">Out of Fashion?</h2>
      <p className="text-brand-gray text-sm mb-10 max-w-md">The page you are looking for doesn't exist or has been moved to another collection. Let's get you back to the style!</p>
      <Link
        to="/"
        className="bg-brand-black text-white px-12 py-4 text-xs font-bold uppercase tracking-widest hover:bg-brand-gold transition-colors rounded-xl shadow-lg"
      >
        Go to Homepage
      </Link>
    </div>
  );
};

export default NotFound;
