import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, ShieldCheck } from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: formData.fullName });

      // Create profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: formData.fullName,
        role: 'customer',
        createdAt: serverTimestamp(),
      });

      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center mb-10">
          <Link to="/" className="text-2xl font-serif font-bold tracking-tighter mb-4 inline-block">
            UFR<span className="text-brand-gold">.</span> COLLECTION
          </Link>
          <h2 className="text-xl font-serif font-bold">New Boutique Account</h2>
          <p className="text-brand-gray text-xs uppercase tracking-widest mt-2">Join our luxury community</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full border-b border-gray-200 py-3 pl-10 text-sm focus:outline-none focus:border-brand-gold transition-colors"
                placeholder="Full Name"
              />
              <User className="absolute left-0 top-1/2 -translate-y-1/2 text-brand-gold/50" size={18} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border-b border-gray-200 py-3 pl-10 text-sm focus:outline-none focus:border-brand-gold transition-colors"
                placeholder="email@example.com"
              />
              <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-brand-gold/50" size={18} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full border-b border-gray-200 py-3 pl-10 text-sm focus:outline-none focus:border-brand-gold transition-colors"
                placeholder="••••••••"
              />
              <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-brand-gold/50" size={18} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray">Confirm Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full border-b border-gray-200 py-3 pl-10 text-sm focus:outline-none focus:border-brand-gold transition-colors"
                placeholder="••••••••"
              />
              <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-brand-gold/50" size={18} />
            </div>
          </div>

          <div className="pt-4">
             <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-black text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-brand-gold transition-all rounded-xl flex items-center justify-center space-x-3"
            >
              {loading ? <span>Processing...</span> : <><UserPlus size={16} /> <span>Create Account</span></>}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-xs text-brand-gray">
          Already have an account? <Link to="/login" className="text-brand-gold font-bold hover:underline">Login Instead</Link>
        </p>

        <p className="mt-8 text-[9px] text-center text-gray-400 uppercase tracking-widest leading-loose">
          By joining, you agree to our Terms of Service <br /> and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default Register;
