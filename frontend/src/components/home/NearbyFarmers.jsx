import React from 'react';
import { Map, MapPin, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NearbyFarmers = () => {
  const navigate = useNavigate();
  
  const farmers = [
    { id: 1, name: "Raju Singh", farm: "Green Valley Farms", location: "Punjab (25km away)", crops: "Wheat, Tomatoes" },
    { id: 2, name: "Amit Kumar", farm: "Sunrise Organics", location: "Haryana (40km away)", crops: "Potatoes, Onions" },
    { id: 3, name: "Suresh Das", farm: "Fresh Fields", location: "UP (60km away)", crops: "Spinach, Cabbage" }
  ];

  return (
    <div className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Discover Farmers Near You</h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Find agricultural products from farmers around your location.
          </p>
          <div className="mt-4 h-1 w-20 bg-agri-green mx-auto rounded"></div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3 h-96 bg-white rounded-3xl shadow-premium overflow-hidden relative">
            {/* Map Placeholder */}
            <div className="absolute inset-0 bg-slate-200 flex flex-col items-center justify-center opacity-80">
              <Map className="w-16 h-16 text-slate-400 mb-4" />
              <p className="text-slate-500 font-medium">Interactive Map (Google Maps API Placeholder)</p>
            </div>
            
            {/* Fake Markers */}
            <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="bg-agri-green text-white p-2 rounded-full shadow-lg animate-bounce"><MapPin className="w-5 h-5"/></div>
            </div>
            <div className="absolute top-1/2 left-2/3 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="bg-agri-green text-white p-2 rounded-full shadow-lg animate-bounce" style={{animationDelay: '200ms'}}><MapPin className="w-5 h-5"/></div>
            </div>
            <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="bg-agri-green text-white p-2 rounded-full shadow-lg animate-bounce" style={{animationDelay: '400ms'}}><MapPin className="w-5 h-5"/></div>
            </div>
          </div>

          <div className="w-full lg:w-1/3 flex flex-col gap-4">
            {farmers.map((farmer) => (
              <div key={farmer.id} className="card p-5 group hover:border-agri-green/50 cursor-pointer transition-colors" onClick={() => navigate('/products')}>
                <h3 className="font-bold text-lg text-slate-800">{farmer.name}</h3>
                <p className="text-agri-green text-sm font-medium mb-2">{farmer.farm}</p>
                <div className="flex items-center text-sm text-slate-500 mb-1">
                  <MapPin className="w-4 h-4 mr-1" /> {farmer.location}
                </div>
                <div className="flex items-center text-sm text-slate-500 mb-4">
                  <span className="bg-slate-100 px-2 py-1 rounded text-xs">{farmer.crops}</span>
                </div>
                <button className="w-full btn-secondary py-1.5 flex items-center justify-center text-sm">
                  View Products <Navigation className="w-4 h-4 ml-1" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NearbyFarmers;
