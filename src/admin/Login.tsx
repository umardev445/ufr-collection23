import React from 'react';
import { Link } from 'react-router-dom';
import Login from '../pages/Login';

const AdminLogin = () => {
  return (
    <div className="bg-brand-beige/30 min-h-screen">
       <div className="pt-20">
         <div className="text-center space-y-2 mb-8">
           <span className="bg-brand-gold text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">Authorized Personal Only</span>
           <h1 className="text-2xl font-serif font-bold">UFR Administration</h1>
         </div>
         <Login />
       </div>
    </div>
  );
};

export default AdminLogin;
