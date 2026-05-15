import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowRight, ShieldCheck } from 'lucide-react';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase/config';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error('Google Sign In failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center mb-10">
          <Link to="/" className="text-2xl font-serif font-bold tracking-tighter mb-4 inline-block">
            UFR<span className="text-brand-gold">.</span> COLLECTION
          </Link>
          <h2 className="text-xl font-serif font-bold">Welcome Back</h2>
          <p className="text-brand-gray text-xs uppercase tracking-widest mt-2">Login to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-b border-gray-200 py-3 pl-10 text-sm focus:outline-none focus:border-brand-gold transition-colors"
                placeholder="email@example.com"
              />
              <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-brand-gold/50" size={18} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray">Password</label>
              <Link to="/forgot-password" className="text-[10px] font-bold text-brand-gold hover:underline">Forgot?</Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-b border-gray-200 py-3 pl-10 text-sm focus:outline-none focus:border-brand-gold transition-colors"
                placeholder="••••••••"
              />
              <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-brand-gold/50" size={18} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-black text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-brand-gold transition-all rounded-xl flex items-center justify-center space-x-3"
          >
            {loading ? <span>Processing...</span> : <><LogIn size={16} /> <span>Sign In</span></>}
          </button>
        </form>

        <div className="mt-8 relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold text-brand-gray"><span className="bg-white px-4">Or sign in with</span></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full mt-8 border border-gray-100 py-4 px-6 rounded-xl flex items-center justify-center space-x-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
        >
          <img src="https://www.google.com/favicon.ico" className="w-4 h-4" />
          <span>Continue with Google</span>
        </button>

        <p className="mt-10 text-center text-xs text-brand-gray">
          Don't have an account? <Link to="/register" className="text-brand-gold font-bold hover:underline">Create One</Link>
        </p>

        <div className="mt-12 flex items-center justify-center space-x-2 text-gray-300">
           <ShieldCheck size={14} />
           <span className="text-[9px] uppercase tracking-widest">Encrypted and Secure Login</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
