import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Heart, 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  RefreshCw, 
  MessageCircle,
  Plus,
  Minus,
  Star,
  ChevronRight,
  Share2,
  User as UserIcon,
  Trash2
} from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  deleteDoc,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { DUMMY_PRODUCTS } from '../dummyData';
import { Product, Review } from '../types';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | undefined>(DUMMY_PRODUCTS.find(p => p.id === id));
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'shipping' | 'reviews'>('details');
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { addToCart } = useCart();
  const { user, profile, isAdmin } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Try to fetch product from Firestore first
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
        } else {
          setProduct(DUMMY_PRODUCTS.find(p => p.id === id));
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setProduct(DUMMY_PRODUCTS.find(p => p.id === id));
      }
    };

    fetchProduct();
    setQuantity(1);
  }, [id]);

  useEffect(() => {
    if (!id) return;

    // Fetch approved reviews
    const qApproved = query(
      collection(db, 'reviews'),
      where('productId', '==', id),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );

    const unsubApproved = onSnapshot(qApproved, (snapshot) => {
      const approvedList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
      setReviews(prev => {
        const others = prev.filter(r => r.status !== 'approved');
        return [...approvedList, ...others].sort((a,b) => b.createdAt?.seconds - a.createdAt?.seconds);
      });
    });

    // Fetch user's own pending reviews if logged in
    let unsubUser: (() => void) | undefined;
    if (user) {
      const qUser = query(
        collection(db, 'reviews'),
        where('productId', '==', id),
        where('userId', '==', user.uid),
        where('status', '!=', 'approved')
      );
      unsubUser = onSnapshot(qUser, (snapshot) => {
        const userPending = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
        setReviews(prev => {
          const others = prev.filter(r => r.status === 'approved');
          return [...others, ...userPending].sort((a,b) => b.createdAt?.seconds - a.createdAt?.seconds);
        });
      });
    }

    return () => {
      unsubApproved();
      if (unsubUser) unsubUser();
    };
  }, [id, user]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to submit a review');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        productId: id,
        userId: user.uid,
        userName: profile?.displayName || user.displayName || 'Anonymous User',
        userEmail: user.email,
        rating: newRating,
        comment: newComment,
        status: 'pending', // Requires admin approval
        createdAt: serverTimestamp()
      });
      toast.success('Review submitted successfully!');
      setNewComment('');
      setNewRating(5);
    } catch (error) {
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      toast.success('Review deleted');
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : '5.0';

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <h2 className="text-2xl font-serif mb-4">Product Not Found</h2>
        <Link to="/shop" className="text-brand-gold border-b border-brand-gold pb-1 font-bold uppercase text-xs tracking-widest">
          Return to Shop
        </Link>
      </div>
    );
  }

  const relatedProducts = DUMMY_PRODUCTS.filter(p => p.id !== product.id).slice(0, 4);

  const handleWhatsAppOrder = () => {
    const text = `Hi UFR Collection, I want to order: ${product.name} (Qty: ${quantity}). Price: Rs. ${product.price}. URL: ${window.location.href}`;
    window.open(`https://wa.me/923001234567?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-12">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-[10px] uppercase tracking-[0.2em] text-brand-gray mb-10">
        <Link to="/">Home</Link>
        <ChevronRight size={10} />
        <Link to="/shop">Shop</Link>
        <ChevronRight size={10} />
        <span className="text-brand-black font-bold truncate max-w-[200px]">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Images Component */}
        <div className="space-y-4">
          <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-brand-beige">
            <Swiper
              modules={[Navigation, Pagination, Thumbs]}
              thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
              navigation
              pagination={{ clickable: true }}
              className="h-full w-full"
            >
              {product.images.map((img, idx) => (
                <SwiperSlide key={idx}>
                  <img src={img} alt={product.name} className="w-full h-full object-cover" />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          
          <Swiper
            onSwiper={setThumbsSwiper}
            spaceBetween={10}
            slidesPerView={4}
            modules={[Thumbs]}
            watchSlidesProgress
            className="h-24 md:h-32"
          >
            {product.images.map((img, idx) => (
              <SwiperSlide key={idx} className="cursor-pointer rounded-lg overflow-hidden border-2 border-transparent swiper-slide-thumb-active:border-brand-gold">
                <img src={img} alt={product.name} className="w-full h-full object-cover" />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Info Content */}
        <div className="flex flex-col">
          <div className="border-b border-gray-100 pb-8 mb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-brand-gold text-xs font-bold uppercase tracking-widest mb-2 block">{product.category}</span>
                <h1 className="text-3xl md:text-4xl font-serif font-bold leading-tight">{product.name}</h1>
              </div>
              <button className="p-3 bg-brand-beige rounded-full text-brand-black hover:text-brand-gold transition-colors">
                <Heart size={20} />
              </button>
            </div>

            <div className="flex items-center space-x-2 mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill={i < Math.floor(parseFloat(averageRating)) ? "#C5A059" : "none"} color="#C5A059" />
                ))}
              </div>
              <span className="text-xs text-brand-gray tracking-wide">({averageRating} / {reviews.length} Reviews)</span>
            </div>

            <div className="flex items-baseline space-x-4">
              <span className="text-3xl font-bold text-brand-black">Rs. {product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <span className="text-xl text-brand-gray/60 line-through">Rs. {product.originalPrice.toLocaleString()}</span>
              )}
              {product.discount && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 uppercase">Save {product.discount}%</span>
              )}
            </div>
          </div>

          <div className="space-y-8 flex-grow">
            {/* Description */}
            <p className="text-brand-gray text-sm leading-relaxed">
              {product.description}
            </p>

            {/* Unstitched Note */}
            <div className="bg-brand-beige/50 p-4 rounded-xl border border-brand-gold/10">
              <h5 className="text-[10px] font-bold uppercase tracking-widest mb-1 text-brand-gold">Fabric Detail</h5>
              <p className="text-xs text-brand-black font-medium">{product.fabrics || 'Premium Lawn Collection with Embroidery'}</p>
              <p className="text-[10px] text-brand-gray mt-2">* This is an unstitched 3-piece collection.</p>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center space-x-6">
              <span className="text-sm font-bold uppercase tracking-widest">Quantity</span>
              <div className="flex items-center border border-gray-200 rounded-full h-12">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-5 hover:text-brand-gold transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="w-10 text-center font-bold">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-5 hover:text-brand-gold transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 gap-4 pt-4">
              <button
                onClick={() => addToCart(product, quantity)}
                className="bg-brand-black text-white py-4 px-8 text-xs font-bold uppercase tracking-widest hover:bg-brand-gold transition-all flex items-center justify-center space-x-3 rounded-xl"
              >
                <ShoppingBag size={16} />
                <span>Add to Cart</span>
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="text-center space-y-2">
                <Truck size={20} className="mx-auto text-brand-gold" />
                <p className="text-[9px] uppercase tracking-widest font-bold">Free Delivery on 3 Suits</p>
              </div>
              <div className="text-center space-y-2">
                <ShieldCheck size={20} className="mx-auto text-brand-gold" />
                <p className="text-[9px] uppercase tracking-widest font-bold">100% Authentic Fabric</p>
              </div>
              <div className="text-center space-y-2">
                <RefreshCw size={20} className="mx-auto text-brand-gold" />
                <p className="text-[9px] uppercase tracking-widest font-bold">7 Days Easy Return</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <section className="mt-24 border-t border-gray-100 pt-16">
        <div className="flex justify-center space-x-12 mb-12 border-b border-gray-100">
          {['details', 'shipping', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-4 px-2 text-xs font-bold uppercase tracking-widest transition-all relative ${
                activeTab === tab ? 'text-brand-black' : 'text-brand-gray hover:text-brand-black'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-gold" />
              )}
            </button>
          ))}
        </div>
        
        <div className="max-w-4xl mx-auto text-sm leading-relaxed text-brand-gray">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <p>Elevate your style with the latest addition to the UFR Collection. This premium unstitched 3-piece collection is meticulously crafted for the modern woman who values tradition and elegance. Each set includes a finely printed shirt, a complementary dupatta, and premium trouser material, allowing you to tailor it exactly to your unique fit and style preferences.</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Shirt:</strong> 3.0 Meters Premium Digitally Printed Lawn</li>
                <li><strong>Dupatta:</strong> 2.5 Meters Soft Voile / Chiffon</li>
                <li><strong>Trouser:</strong> 2.5 Meters Dyed Cambric</li>
                <li><strong>Occasion:</strong> Casual, Festive, Semi-Formal</li>
                <li><strong>Care:</strong> Hand wash recommended, avoid direct sunlight for drying</li>
              </ul>
            </div>
          )}
          {activeTab === 'shipping' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-brand-black font-bold uppercase mb-4 tracking-widest">Shipping Rates</h4>
                  <p>We offer nationwide delivery across Pakistan.</p>
                  <ul className="mt-4 space-y-2">
                    <li>Standard Delivery: Rs. 180</li>
                    <li>Free Delivery: On orders of 3 or more suits</li>
                    <li>Delivery Time: 3-5 Working Days</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-brand-black font-bold uppercase mb-4 tracking-widest">Payment Methods</h4>
                  <ul className="space-y-2">
                    <li>Cash on Delivery (COD)</li>
                    <li>Easypaisa / JazzCash (Advance)</li>
                    <li>Direct Bank Transfer</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'reviews' && (
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-brand-beige/30 p-8 rounded-3xl border border-brand-gold/5">
                <div className="text-center md:text-left">
                  <h3 className="text-4xl font-serif font-bold text-brand-black mb-2">{averageRating}</h3>
                  <div className="flex justify-center md:justify-start space-x-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill={i < Math.floor(parseFloat(averageRating)) ? "#C5A059" : "none"} color="#C5A059" />
                    ))}
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-brand-gray">Based on {reviews.length} customer reviews</span>
                </div>
                
                <div className="flex-grow max-w-md">
                   {/* Star Bars */}
                   {[5, 4, 3, 2, 1].map((star) => {
                     const count = reviews.filter(r => r.rating === star).length;
                     const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                     return (
                       <div key={star} className="flex items-center space-x-4 mb-2">
                         <span className="text-[10px] font-bold w-4">{star}</span>
                         <Star size={10} fill="#C5A059" color="#C5A059" />
                         <div className="flex-grow h-1.5 bg-gray-100 rounded-full overflow-hidden">
                           <div className="h-full bg-brand-gold" style={{ width: `${percentage}%` }}></div>
                         </div>
                         <span className="text-[10px] text-brand-gray w-8 text-right">{count}</span>
                       </div>
                     );
                   })}
                </div>
              </div>

              {/* Add Review Form */}
              <div className="border-t border-gray-100 pt-12">
                <h4 className="text-lg font-serif font-bold mb-8">Write a Review</h4>
                {!user ? (
                   <div className="bg-brand-beige/50 p-8 rounded-2xl text-center">
                     <p className="text-xs text-brand-gray mb-4">Please login to share your experience with this product.</p>
                     <Link to="/login" className="inline-block bg-brand-black text-white px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold transition-colors">Login to Review</Link>
                   </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <span className="text-xs font-bold uppercase tracking-widest">Your Rating:</span>
                      <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star size={24} fill={star <= newRating ? "#C5A059" : "none"} color="#C5A059" />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray">Your Comment</label>
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        required
                        rows={4}
                        placeholder="What did you like or dislike about this suit? Share your thoughts on the fabric and color..."
                        className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-brand-gold/20"
                      />
                    </div>
                    <button
                      disabled={isSubmitting}
                      className="bg-brand-black text-white px-10 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? 'Submitting...' : 'Post Review'}
                    </button>
                  </form>
                )}
              </div>

              {/* Review List */}
              <div className="space-y-10 pt-12 border-t border-gray-100">
                {reviews.length === 0 ? (
                  <div className="text-center py-20 text-brand-gray italic bg-gray-50/50 rounded-3xl">
                    No reviews yet. Be the first one to share your feedback!
                  </div>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="flex space-x-6 group">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-brand-beige flex items-center justify-center text-brand-gold">
                          <UserIcon size={24} />
                        </div>
                      </div>
                      <div className="flex-grow space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="text-sm font-bold text-brand-black">{review.userName}</h5>
                            <div className="flex mt-1 items-center space-x-2">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={10} fill={i < review.rating ? "#C5A059" : "none"} color="#C5A059" />
                                  ))}
                                </div>
                                {review.status === 'pending' && (
                                  <span className="text-[8px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Awaiting Approval</span>
                                )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-[10px] text-brand-gray uppercase tracking-widest">
                              {review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString() : 'Just now'}
                            </span>
                            {isAdmin && (
                              <button 
                                onClick={() => handleDeleteReview(review.id)}
                                className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-brand-gray leading-relaxed">{review.comment}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Related Products */}
      <section className="mt-24">
        <h2 className="text-2xl md:text-3xl font-serif font-bold mb-12 text-center underline decoration-brand-gold decoration-2 underline-offset-8">You May Also Like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {relatedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;
