import React from 'react';
import { Link } from 'react-router-dom';
import { LineChart, BarChart } from 'lucide-react';

const PriceTransparency = () => {
  return (
    <div className="py-24 bg-agri-green/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl mb-4">See Where Your Money Goes</h2>
            <p className="text-lg text-slate-600 mb-6">
              AgriLink makes agricultural pricing easier to understand. Customers can see the farmer's listed price alongside a market reference price, helping them make informed purchasing decisions while improving price visibility for farmers.
            </p>
            
            <div className="card bg-white mb-8">
              <div className="flex items-center justify-between mb-6">
                <span className="font-semibold text-slate-800">Example: 1kg Fresh Tomatoes</span>
              </div>
              
              <div className="space-y-6">
                {/* Farmer Price */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">Farmer Price (AgriLink)</span>
                    <span className="font-bold text-agri-green">₹35</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div className="bg-agri-green h-3 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>

                {/* Market Reference Price */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">Market Reference Price</span>
                    <span className="font-bold text-slate-500">₹45</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div className="bg-slate-400 h-3 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>

                {/* Customer Savings */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center text-earth-brown font-semibold">
                    <LineChart className="w-5 h-5 mr-2" />
                    Customer Savings
                  </div>
                  <span className="text-xl font-bold text-earth-brown">₹10 (22%)</span>
                </div>
              </div>
            </div>

            <Link to="/products" className="btn-primary inline-flex items-center">
              Explore Transparent Pricing <BarChart className="ml-2 w-5 h-5" />
            </Link>
          </div>

          <div className="w-full lg:w-1/2">
            <div className="relative rounded-3xl overflow-hidden shadow-premium aspect-video lg:aspect-square flex items-center justify-center bg-white">
              <div className="absolute inset-0 bg-gradient-to-br from-agri-green/20 to-agri-light/10"></div>
              <div className="relative z-10 text-center p-8">
                <div className="w-24 h-24 bg-white rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                  <BarChart className="w-12 h-12 text-agri-green" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">No Hidden Fees</h3>
                <p className="text-slate-600">The price you see is the price the farmer gets. A completely transparent ecosystem.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceTransparency;
