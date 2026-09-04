import React from 'react';
import { Sprout, Package, ShoppingCart, Truck, Home } from 'lucide-react';

const Journey = () => {
  const steps = [
    { icon: <Sprout className="w-6 h-6 sm:w-7 sm:h-7" />, label: "FARM" },
    { icon: <Package className="w-6 h-6 sm:w-7 sm:h-7" />, label: "PRODUCT" },
    { icon: <ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7" />, label: "ORDER" },
    { icon: <Truck className="w-6 h-6 sm:w-7 sm:h-7" />, label: "DELIVERY" },
    { icon: <Home className="w-6 h-6 sm:w-7 sm:h-7" />, label: "CUSTOMER" }
  ];

  return (
    <div className="py-16 bg-surface-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            From Farm to Your Doorstep
          </h2>
          <div className="mt-2 h-1 w-20 bg-agri-green mx-auto rounded"></div>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto text-base">
            AgriLink provides complete visibility throughout the purchasing journey. No black boxes, just honest agriculture.
          </p>
        </div>

        {/* Timeline Flow Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 lg:p-12 shadow-card border border-slate-100 relative">
          <div className="relative max-w-4xl mx-auto">
            {/* Desktop Connecting Line */}
            <div className="hidden md:block absolute top-8 left-10 right-10 h-1 bg-emerald-100 -translate-y-1/2 z-0 rounded-full"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-3 relative z-10">
              {steps.map((step, idx) => (
                <div key={idx} className="flex flex-col items-center group cursor-default">
                  {/* Circular Icon Container */}
                  <div className="w-16 h-16 rounded-full bg-agri-green/10 text-agri-green flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-agri-green group-hover:text-white transition-all duration-300 shadow-sm border border-agri-green/20">
                    <div className="transition-transform duration-300">
                      {step.icon}
                    </div>
                  </div>

                  {/* Step Label Pill */}
                  <div className="bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-1 rounded-full text-xs font-bold tracking-wider shadow-sm group-hover:border-agri-green group-hover:text-agri-green transition-colors duration-200">
                    {step.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Journey;
