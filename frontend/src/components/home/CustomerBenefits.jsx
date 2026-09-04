import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ShoppingBag } from 'lucide-react';

const CustomerBenefits = () => {
  const features = [
    "Discover products from local farmers",
    "Transparent pricing",
    "Product source information",
    "Fresh agricultural products",
    "Ratings and reviews",
    "Convenient online ordering"
  ];

  return (
    <div className="py-20 bg-surface-50 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
          <div className="w-full lg:w-1/2">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl mb-4">Better Choices for Customers</h2>
            <div className="h-1 w-20 bg-earth-brown rounded mb-6"></div>
            <p className="text-lg text-slate-600 mb-8">
              Experience the joy of farm-fresh produce with complete peace of mind. Know exactly who grew your food and where your money goes.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-earth-brown mr-3 flex-shrink-0" />
                  <span className="text-slate-700 font-medium">{feature}</span>
                </div>
              ))}
            </div>

            <Link to="/products" className="btn-primary inline-flex items-center">
              Explore Products <ShoppingBag className="ml-2 w-5 h-5" />
            </Link>
          </div>
          
          <div className="w-full lg:w-1/2">
            <div className="relative rounded-3xl overflow-hidden shadow-premium aspect-[4/3] bg-white group">
              <img
                src="/customer-benefit.jpg"
                alt="Fresh farm produce basket"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/80 shadow-md flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-earth-brown/10 text-earth-brown flex items-center justify-center font-bold">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-800">Fresh Harvest to Doorstep</span>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 bg-amber-100 text-earth-dark rounded-full">100% Organic</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerBenefits;
