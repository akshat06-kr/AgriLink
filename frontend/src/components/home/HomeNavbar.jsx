import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, User, Menu, X } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const HomeNavbar = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleExploreClick = (e) => {
    if (e) e.preventDefault();
    setMobileMenuOpen(false);
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

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-250 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-md shadow-slate-900/5 border-b border-slate-200/80' 
          : 'bg-white border-b border-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px] sm:h-20">
          
          {/* LEFT: Premium Brand Logo */}
          <Link 
            to="/" 
            onClick={handleNavClick}
            className="flex items-center gap-2.5 group select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:scale-105 group-hover:shadow-emerald-600/30 transition-all duration-200">
              <Leaf className="w-5 h-5 transition-transform duration-200 group-hover:rotate-6" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900 font-sans">
              Agri<span className="text-agri-green">Link</span>
            </span>
          </Link>

          {/* RIGHT: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-3" aria-label="Main Navigation">
            {user ? (
              <button
                onClick={handleExploreClick}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <User className="w-4 h-4" />
                <span>{(user.role || '').toUpperCase() === 'CUSTOMER' ? 'Marketplace' : 'Dashboard'}</span>
              </button>
            ) : (
              <>
                {/* Login */}
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-agri-green hover:bg-slate-50 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  Login
                </Link>

                {/* Sign Up (Primary CTA) */}
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
              className="p-2.5 rounded-xl text-slate-700 hover:text-agri-green hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-slate-800" />
              ) : (
                <Menu className="w-6 h-6 text-slate-800" />
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Navigation Dropdown Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/98 backdrop-blur-xl border-b border-slate-200/90 shadow-xl rounded-b-2xl px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-1.5">
            {user ? (
              <button
                onClick={handleExploreClick}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 shadow-md shadow-emerald-600/20"
              >
                <User className="w-4 h-4" />
                <span>{(user.role || '').toUpperCase() === 'CUSTOMER' ? 'Go to Marketplace' : 'Go to Dashboard'}</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  to="/login"
                  onClick={handleNavClick}
                  className="flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={handleNavClick}
                  className="flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 shadow-md shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700 transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default HomeNavbar;
