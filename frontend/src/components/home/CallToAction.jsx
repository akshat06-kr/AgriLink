import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ArrowRight } from 'lucide-react';

const CallToAction = () => {
  return (
    <div className="py-16 bg-surface-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-10 sm:p-14 lg:p-16 text-center shadow-card border border-slate-100 relative overflow-hidden">
          {/* Decorative ambient elements */}
          <Leaf className="absolute -top-8 -left-8 w-44 h-44 text-agri-green/10 transform -rotate-45 pointer-events-none" />
          <Leaf className="absolute -bottom-8 -right-8 w-44 h-44 text-agri-green/10 transform rotate-45 pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Join the AgriLink Community
            </h2>
            <div className="mt-2 h-1 w-20 bg-agri-green mx-auto rounded"></div>
            <p className="mt-4 text-base sm:text-lg text-slate-600 font-medium mb-10 leading-relaxed">
              Whether you're a farmer or a customer, be part of a more transparent agricultural marketplace.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-5">
              <Link 
                to="/register" 
                className="w-full sm:w-auto bg-agri-green text-white font-bold py-3.5 px-8 rounded-xl shadow-md hover:bg-agri-dark hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-center text-sm sm:text-base"
              >
                Join as Farmer <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link 
                to="/products" 
                className="w-full sm:w-auto bg-white border-2 border-agri-green text-agri-green font-bold py-3.5 px-8 rounded-xl hover:bg-agri-green/10 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center text-sm sm:text-base"
              >
                Shop Fresh Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallToAction;
