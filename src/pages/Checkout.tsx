import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { CreditCard, Truck, ShieldCheck, CheckCircle2, ChevronLeft, Wallet, Smartphone } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { cart, totalPrice, totalItems, shippingFee, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    paymentMethod: 'COD' as 'COD' | 'Easypaisa' | 'JazzCash'
  });

  React.useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email || '' }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setLoading(true);
    try {
      const trackingId = `UFR-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      const orderData = {
        userId: user?.uid || 'guest',
        customer: {
          name: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
        },
        items: cart,
        totalAmount: totalPrice + shippingFee,
        shippingFee,
        paymentMethod: formData.paymentMethod,
        paymentStatus: 'Pending',
        orderStatus: 'Order Received',
        trackingId,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'orders'), orderData);
      
      // Send Order Confirmation Email
      try {
        await fetch('/api/send-order-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderData: {
              ...orderData,
              customer: {
                ...orderData.customer,
                email: formData.email
              }
            },
            customerEmail: formData.email
          }),
        });
      } catch (emailError) {
        console.error('Failed to send order email:', emailError);
        // We don't block the UI if email fails, as the order is already in DB
      }

      toast.success('Order placed successfully!');
      clearCart();
      navigate(`/order-tracking?id=${trackingId}`);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-12">
      <Link to="/cart" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-brand-gray hover:text-brand-black mb-8">
        <ChevronLeft size={16} className="mr-1" /> Back to Cart
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Checkout Form */}
        <div className="order-2 lg:order-1">
          <h1 className="text-3xl font-serif font-bold mb-8">Shipping Information</h1>
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray">First Name</label>
                <input
                  required
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full border-b border-gray-200 py-3 text-sm focus:outline-none focus:border-brand-gold transition-colors"
                  placeholder="Aisha"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray">Last Name</label>
                <input
                  required
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full border-b border-gray-200 py-3 text-sm focus:outline-none focus:border-brand-gold transition-colors"
                  placeholder="Khan"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray">Email Address</label>
              <input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border-b border-gray-200 py-3 text-sm focus:outline-none focus:border-brand-gold transition-colors"
                placeholder="aisha@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray">Phone Number</label>
              <input
                required
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border-b border-gray-200 py-3 text-sm focus:outline-none focus:border-brand-gold transition-colors"
                placeholder="03xx xxxxxxx"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray">Delivery Address</label>
              <input
                required
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full border-b border-gray-200 py-3 text-sm focus:outline-none focus:border-brand-gold transition-colors"
                placeholder="Street name, House number"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray">City</label>
              <input
                required
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full border-b border-gray-200 py-3 text-sm focus:outline-none focus:border-brand-gold transition-colors"
                placeholder="Lahore, Karachi, Islamabad..."
              />
            </div>

            <div className="pt-8">
              <h2 className="text-xl font-serif font-bold mb-6">Payment Method</h2>
              <div className="space-y-4">
                {[
                  { id: 'COD', label: 'Cash on Delivery', icon: <Truck size={18} /> },
                  { id: 'Easypaisa', label: 'Easypaisa (Advance)', icon: <Wallet size={18} /> },
                  { id: 'JazzCash', label: 'JazzCash (Advance)', icon: <Smartphone size={18} /> }, // Error in import fix in thought
                ].map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center justify-between p-5 luxury-card cursor-pointer border-2 transition-all ${
                      formData.paymentMethod === method.id ? 'border-brand-gold bg-brand-beige/50' : 'border-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={formData.paymentMethod === method.id}
                        onChange={handleChange}
                        className="w-4 h-4 accent-brand-gold"
                      />
                      <div className="text-brand-gold">{method.icon}</div>
                      <div>
                        <p className="text-sm font-bold uppercase tracking-tight">{method.label}</p>
                        <p className="text-[10px] text-brand-gray">
                          {method.id === 'COD' ? 'Pay when you receive your order' : 'Pay in advance and get priority order processing'}
                        </p>
                      </div>
                    </div>
                    {formData.paymentMethod === method.id && <CheckCircle2 size={18} className="text-brand-gold" />}
                  </label>
                ))}
              </div>
            </div>

            {/* Payment Instructions */}
            {formData.paymentMethod !== 'COD' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-brand-gold text-white p-6 rounded-xl space-y-4"
              >
                <h4 className="text-sm font-bold uppercase tracking-widest flex items-center">
                  <ShieldCheck size={18} className="mr-2" /> Advance Payment Instructions
                </h4>
                <div className="text-xs space-y-2 opacity-90 leading-loose">
                  <p>1. Send the total amount to: <span className="font-bold underline text-white">0300 1234567</span></p>
                  <p>2. Account Name: <span className="font-bold uppercase tracking-wider">UFR COLLECTION LTD</span></p>
                  <p>3. Please send the payment screenshot with your Order ID on WhatsApp after placing the order.</p>
                </div>
              </motion.div>
            )}
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="order-1 lg:order-2">
          <div className="bg-brand-beige p-8 rounded-2xl sticky top-24">
            <h2 className="text-xl font-serif font-bold mb-8 border-b border-brand-gold/10 pb-4">Order Items ({totalItems})</h2>
            <div className="max-h-[300px] overflow-y-auto space-y-6 pr-2 mb-8 custom-scrollbar">
              {cart.map((item) => (
                <div key={item.id} className="flex space-x-4">
                  <div className="w-16 h-20 bg-gray-50 rounded flex-shrink-0">
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover rounded" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-relaxed">{item.name}</h4>
                    <p className="text-[10px] text-brand-gray">Qty: {item.quantity}</p>
                    <p className="text-xs font-bold text-brand-gold mt-1">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-6 border-t border-brand-gold/10">
              <div className="flex justify-between text-xs uppercase tracking-widest text-brand-gray">
                <span>Subtotal</span>
                <span>Rs. {totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs uppercase tracking-widest text-brand-gray">
                <span>Shipping</span>
                <span>{shippingFee === 0 ? 'FREE' : `Rs. ${shippingFee.toLocaleString()}`}</span>
              </div>
              <div className="flex justify-between items-center pt-6 border-t border-brand-gold/20">
                <span className="text-base font-serif font-bold">Total to Pay</span>
                <span className="text-2xl font-bold text-brand-gold">Rs. {(totalPrice + shippingFee).toLocaleString()}</span>
              </div>
            </div>

            <button
              form="checkout-form"
              disabled={loading}
              className={`w-full mt-10 bg-brand-black text-white py-5 text-sm font-bold uppercase tracking-widest hover:bg-brand-gold transition-all rounded-xl flex items-center justify-center space-x-3 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <CreditCard size={18} />
                  <span>Place Order Now</span>
                </>
              )}
            </button>

            <div className="mt-8 flex flex-col items-center justify-center space-y-4">
               <div className="flex items-center space-x-2 text-[10px] text-brand-gray uppercase tracking-widest">
                  <ShieldCheck size={14} className="text-brand-gold" />
                  <span>100% Safe and Secure Checkout</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
