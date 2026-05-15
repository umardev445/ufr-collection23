import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Search,
  MessageSquare,
  Clock,
  User as UserIcon,
  ExternalLink
} from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  doc, 
  deleteDoc,
  where
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Review } from '../types';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const ReviewManagement = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    let q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    
    if (filterStatus !== 'all') {
      q = query(collection(db, 'reviews'), where('status', '==', filterStatus), orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
      setReviews(reviewList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [filterStatus]);

  const updateStatus = async (reviewId: string, status: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'reviews', reviewId), { status });
      toast.success(`Review ${status}`);
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!window.confirm('Delete this review permanently?')) return;
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      toast.success("Review deleted");
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-serif font-bold">Product Reviews Moderation</h2>
        <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-1">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                filterStatus === status ? 'bg-brand-black text-white' : 'text-brand-gray hover:text-brand-black'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="p-12 text-center text-brand-gray italic">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 text-brand-gray italic">
            No reviews found for this filter.
          </div>
        ) : (
          <AnimatePresence>
            {reviews.map((review) => (
              <motion.div
                key={review.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* User Info */}
                  <div className="md:w-48 flex-shrink-0 space-y-3">
                    <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 rounded-full bg-brand-beige flex items-center justify-center text-brand-gold">
                         <UserIcon size={20} />
                       </div>
                       <div>
                         <h4 className="text-xs font-bold text-brand-black truncate max-w-[120px]">{review.userName}</h4>
                         <p className="text-[10px] text-brand-gray truncate max-w-[120px]">{review.userEmail}</p>
                       </div>
                    </div>
                    <div className="flex items-center space-x-1 text-brand-gold">
                       {[...Array(5)].map((_, i) => (
                         <Star key={i} size={12} fill={i < review.rating ? "#C5A059" : "none"} color="#C5A059" />
                       ))}
                    </div>
                    <div className="flex items-center space-x-2 text-[9px] text-brand-gray uppercase tracking-widest">
                       <Clock size={12} />
                       <span>{review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString() : 'Recent'}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-grow space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-brand-gold bg-brand-beige/30 py-1 px-3 rounded-full">
                        <MessageSquare size={12} />
                        <span>Product ID: {review.productId}</span>
                        <Link to={`/product/${review.productId}`} target="_blank" className="hover:text-brand-black">
                          <ExternalLink size={12} />
                        </Link>
                      </div>
                      <span className={`text-[9px] font-bold uppercase px-3 py-1 rounded-full ${
                        review.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                        review.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {review.status}
                      </span>
                    </div>
                    <p className="text-xs text-brand-gray leading-relaxed italic">"{review.comment}"</p>
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col items-center justify-center md:items-end gap-3">
                    {review.status !== 'approved' && (
                      <button 
                        onClick={() => updateStatus(review.id, 'approved')}
                        className="bg-emerald-500 text-white p-2 rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
                        title="Approve"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                    )}
                    {review.status !== 'rejected' && (
                      <button 
                        onClick={() => updateStatus(review.id, 'rejected')}
                        className="bg-amber-500 text-white p-2 rounded-lg hover:bg-amber-600 transition-colors shadow-sm"
                        title="Reject"
                      >
                        <XCircle size={18} />
                      </button>
                    )}
                    <button 
                      onClick={() => deleteReview(review.id)}
                      className="bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      title="Delete Permanently"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default ReviewManagement;
