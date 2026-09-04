import React from 'react';
import { DollarSign, ShieldCheck, MapPin, Handshake } from 'lucide-react';

const TrustCards = () => {
  return (
    <div className="py-16 bg-surface-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Why Choose AgriLink?</h2>
          <div className="mt-2 h-1 w-20 bg-agri-green mx-auto rounded"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="card text-center group">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-agri-green/10 text-agri-green mb-4 group-hover:scale-110 transition-transform">
              <DollarSign className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Fair Pricing</h3>
            <p className="text-slate-600">Farmers get better value by connecting directly with customers.</p>
          </div>

          <div className="card text-center group">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-agri-green/10 text-agri-green mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Complete Transparency</h3>
            <p className="text-slate-600">See farmer pricing, market reference prices and product information.</p>
          </div>

          <div className="card text-center group">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-agri-green/10 text-agri-green mb-4 group-hover:scale-110 transition-transform">
              <MapPin className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Verified Source</h3>
            <p className="text-slate-600">Know where your products come from and who grows them.</p>
          </div>

          <div className="card text-center group">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-agri-green/10 text-agri-green mb-4 group-hover:scale-110 transition-transform">
              <Handshake className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Direct Connection</h3>
            <p className="text-slate-600">Connect farmers and customers through a simple digital marketplace.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustCards;
