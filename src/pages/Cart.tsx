import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems, shippingFee, freeShippingThreshold } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-24 text-center">
        <div className="bg-brand-beige/50 inline-flex p-8 rounded-full mb-8 text-brand-gold">
          <ShoppingBag size={48} />
        </div>
        <h1 className="text-3xl font-serif font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-brand-gray mb-10 max-w-sm mx-auto">Looks like you haven't added anything to your cart yet. Explore our latest collections and find something you love!</p>
        <Link
          to="/shop"
          className="inline-block bg-brand-black text-white px-12 py-4 text-xs font-bold uppercase tracking-widest hover:bg-brand-gold transition-colors rounded-xl"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  const itemsNeededForFreeShipping = freeShippingThreshold - totalItems;

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-12">
      <h1 className="text-3xl md:text-4xl font-serif font-bold mb-12">Your Shopping Bag</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-8">
          {itemsNeededForFreeShipping > 0 ? (
            <div className="bg-brand-beige border border-brand-gold/20 p-4 rounded-xl flex items-center justify-between">
              <p className="text-xs font-medium tracking-wide">
                Add <span className="text-brand-gold font-bold">{itemsNeededForFreeShipping}</span> more {itemsNeededForFreeShipping === 1 ? 'suit' : 'suits'} to get <span className="font-bold">FREE SHIPPING</span>!
              </p>
              <Link to="/shop" className="text-[10px] font-bold uppercase border-b border-brand-black">Add more</Link>
            </div>
          ) : (
            <div className="bg-[#25D366]/10 border border-[#25D366]/20 p-4 rounded-xl">
              <p className="text-xs font-bold text-[#25D366] text-center tracking-widest uppercase">
                Congratulations! You've unlocked FREE SHIPPING
              </p>
            </div>
          )}

          <div className="space-y-6">
            {cart.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col sm:flex-row items-center gap-6 p-4 luxury-card"
              >
                <div className="w-24 h-32 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50">
                  <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-grow text-center sm:text-left">
                  <h3 className="font-serif text-lg mb-1">{item.name}</h3>
                  <p className="text-[10px] text-brand-gray uppercase tracking-widest mb-4">{item.category}</p>
                  <p className="text-brand-gold font-bold">Rs. {item.price.toLocaleString()}</p>
                </div>

                <div className="flex items-center border border-gray-200 rounded-full h-10 px-4">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="hover:text-brand-gold"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center font-bold text-sm">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="hover:text-brand-gold"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className="w-full sm:w-auto flex flex-row sm:flex-col items-center justify-between sm:items-end gap-2">
                  <p className="text-sm font-bold text-brand-black">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-brand-black text-white p-8 rounded-2xl sticky top-24">
            <h2 className="text-xl font-serif mb-8 border-b border-white/10 pb-4">Order Summary</h2>
            <div className="space-y-6 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal ({totalItems} items)</span>
                <span>Rs. {totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shipping Fee</span>
                <span>{shippingFee === 0 ? 'FREE' : `Rs. ${shippingFee.toLocaleString()}`}</span>
              </div>
              <div className="flex justify-between items-center pt-6 border-t border-white/10">
                <span className="text-lg font-serif">Grand Total</span>
                <span className="text-xl font-bold text-brand-gold">Rs. {(totalPrice + shippingFee).toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-10 space-y-4">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-brand-gold">
                   <ArrowRight size={12} />
                   <span>Apply Coupon</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    className="flex-grow bg-white/10 border border-white/10 px-4 py-2 text-xs focus:outline-none"
                  />
                  <button className="bg-brand-gold text-white px-4 py-2 text-[10px] font-bold uppercase hover:opacity-80">Apply</button>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-brand-gold text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-brand-black transition-all rounded-xl"
              >
                Proceed to Checkout
              </button>
              
              <Link
                to="/shop"
                className="w-full inline-block text-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] hover:text-white transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
