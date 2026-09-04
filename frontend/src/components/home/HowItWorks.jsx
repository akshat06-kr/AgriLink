import React from 'react';
import { UserPlus, Search, ShoppingBag, Star } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      id: '01',
      title: 'Farmer Lists Product',
      desc: 'Farmers add their products, prices, quantity and farm details.',
      icon: <UserPlus className="h-6 w-6 text-white" />
    },
    {
      id: '02',
      title: 'Customer Discovers',
      desc: 'Customers search and explore fresh products from nearby farmers.',
      icon: <Search className="h-6 w-6 text-white" />
    },
    {
      id: '03',
      title: 'Direct Order',
      desc: 'Customers place orders directly through the platform.',
      icon: <ShoppingBag className="h-6 w-6 text-white" />
    },
    {
      id: '04',
      title: 'Delivered & Reviewed',
      desc: 'Products are delivered and customers can provide ratings and feedback.',
      icon: <Star className="h-6 w-6 text-white" />
    }
  ];

  return (
    <div className="py-20 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">How AgriLink Works</h2>
          <p className="mt-4 text-lg text-slate-600">From the farm to your doorstep, every step is simple and transparent.</p>
          <div className="mt-4 h-1 w-20 bg-agri-green mx-auto rounded"></div>
        </div>

        <div className="relative">
          {/* Connecting Line for Desktop */}
          <div className="hidden md:block absolute top-12 left-10 right-10 h-0.5 bg-slate-200 z-0"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-white rounded-full border-4 border-slate-100 shadow-sm flex items-center justify-center mb-6 relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-agri-green to-agri-light rounded-full flex items-center justify-center shadow-premium">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 bg-earth-brown text-white text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    {step.id}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{step.title}</h3>
                <p className="text-slate-600 px-4">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
