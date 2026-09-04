import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import HomeNavbar from '../components/home/HomeNavbar';
import TrustCards from '../components/home/TrustCards';
import HowItWorks from '../components/home/HowItWorks';
import FarmerBenefits from '../components/home/FarmerBenefits';
import CustomerBenefits from '../components/home/CustomerBenefits';
import Journey from '../components/home/Journey';
import Testimonials from '../components/home/Testimonials';
import CallToAction from '../components/home/CallToAction';
import FAQ from '../components/home/FAQ';
import Footer from '../components/Footer';

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleExploreClick = (e) => {
    if (e) e.preventDefault();
    if (!user) {
      navigate('/login?redirect=/products#products-section');
    } else {
      const userRole = (user.role || '').toUpperCase();
      if (userRole === 'CUSTOMER') {
        navigate('/customer/home#products-section');
      } else {
        navigate('/products#products-section');
      }
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navigation */}
      <HomeNavbar />

      {/* Hero Section */}
      <div className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">From Farm to Customer,</span>{' '}
                  <span className="block text-agri-green xl:inline">With Complete Transparency</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  AgriLink connects farmers directly with customers, eliminating unnecessary middlemen. Experience a trustworthy digital marketplace with fair pricing for everyone.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <button 
                      onClick={handleExploreClick} 
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-agri-green hover:bg-agri-dark md:py-4 md:text-lg md:px-10 transition-colors cursor-pointer"
                    >
                      Explore Products
                    </button>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link to="/register" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-agri-green bg-agri-green bg-opacity-10 hover:bg-opacity-20 md:py-4 md:text-lg md:px-10 transition-colors">
                      Sell on AgriLink
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 flex items-center justify-center p-6 sm:p-8">
          <div className="relative w-full max-w-lg aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-emerald-950/15 border border-slate-100 group">
            <img 
              src="/hero-image.png" 
              alt="Fresh Organic Farm Produce in rustic crates" 
              className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent"></div>
            
            {/* Top-Left Floating Badge */}
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/80 shadow-md flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>100% Farm Direct Harvest</span>
            </div>

            {/* Bottom-Right Floating Badge */}
            <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/80 shadow-lg flex items-center gap-2 text-xs font-bold text-slate-800">
              <div className="w-6 h-6 rounded-full bg-agri-green text-white flex items-center justify-center text-[10px]">
                ✓
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-medium leading-none">Fresh Guarantee</span>
                <span className="text-slate-800 font-bold leading-tight">Zero Middlemen</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TrustCards />
      <HowItWorks />
      <FarmerBenefits />
      <CustomerBenefits />
      <Journey />
      <Testimonials />
      <CallToAction />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Home;
