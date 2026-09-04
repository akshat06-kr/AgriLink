import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Column 1 */}
          <div>
            <div className="flex items-center mb-4">
              <Leaf className="h-8 w-8 text-agri-green" />
              <span className="ml-2 text-2xl font-bold text-white">AgriLink</span>
            </div>
            <p className="text-slate-400">
              From Farm to Customer, With Complete Transparency. Connecting the agricultural ecosystem directly.
            </p>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4">Platform</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-agri-light transition-colors">Home</Link></li>
              <li><Link to="/products" className="hover:text-agri-light transition-colors">Products</Link></li>
              <li><Link to="/" className="hover:text-agri-light transition-colors">How It Works</Link></li>
              <li><Link to="/" className="hover:text-agri-light transition-colors">About</Link></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4">For Farmers</h4>
            <ul className="space-y-2">
              <li><Link to="/register" className="hover:text-agri-light transition-colors">Sell on AgriLink</Link></li>
              <li><Link to="/farmer/dashboard" className="hover:text-agri-light transition-colors">Farmer Dashboard</Link></li>
              <li><Link to="/farmer/dashboard" className="hover:text-agri-light transition-colors">Earnings</Link></li>
              <li><Link to="/farmer/dashboard" className="hover:text-agri-light transition-colors">Orders</Link></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4">Support</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-agri-light transition-colors">Contact</Link></li>
              <li><Link to="/" className="hover:text-agri-light transition-colors">FAQ</Link></li>
              <li><Link to="/" className="hover:text-agri-light transition-colors">Privacy Policy</Link></li>
              <li><Link to="/" className="hover:text-agri-light transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-slate-500">
            &copy; 2026 AgriLink. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
             {/* Social placeholders */}
             <div className="w-8 h-8 rounded-full bg-slate-800 hover:bg-agri-green transition-colors cursor-pointer"></div>
             <div className="w-8 h-8 rounded-full bg-slate-800 hover:bg-agri-green transition-colors cursor-pointer"></div>
             <div className="w-8 h-8 rounded-full bg-slate-800 hover:bg-agri-green transition-colors cursor-pointer"></div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
