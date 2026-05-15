import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="luxury-card group overflow-hidden"
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-brand-beige">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col space-y-2">
          {product.discount && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-tighter">
              -{product.discount}%
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-brand-black/80 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-tighter">
              Bestseller
            </span>
          )}
        </div>

        {/* Action Buttons (Hover) */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex flex-col space-y-2">
          <div className="flex space-x-2">
            <button
              onClick={() => addToCart(product)}
              className="flex-grow bg-brand-black text-white py-3 px-4 text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold transition-colors flex items-center justify-center space-x-2"
            >
              <ShoppingBag size={14} />
              <span>Add to Cart</span>
            </button>
            <button className="bg-white/90 backdrop-blur-sm text-brand-black p-3 hover:text-brand-gold transition-colors">
              <Heart size={16} />
            </button>
          </div>
          <Link
            to="/checkout"
            onClick={() => addToCart(product)}
            className="w-full bg-brand-gold text-white py-3 px-4 text-[10px] font-bold uppercase tracking-widest hover:bg-brand-black transition-colors flex items-center justify-center"
          >
            Buy Now
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 text-center">
        <span className="text-[10px] text-brand-gray uppercase tracking-widest mb-2 block">
          {product.category}
        </span>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-serif text-base mb-2 group-hover:text-brand-gold transition-colors truncate">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-center space-x-3">
          <span className="text-brand-gold font-bold">Rs. {product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="text-brand-gray/60 text-sm line-through">Rs. {product.originalPrice.toLocaleString()}</span>
          )}
        </div>
        
        {/* Stars */}
        <div className="flex items-center justify-center space-x-1 mt-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={10} fill={i < 4 ? "#C5A059" : "none"} color="#C5A059" />
          ))}
          <span className="text-[10px] text-brand-gray ml-1">(12)</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
