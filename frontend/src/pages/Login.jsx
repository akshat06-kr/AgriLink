import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  LogIn, 
  ArrowLeft, 
  Sprout, 
  Eye, 
  EyeOff, 
  ShoppingBag, 
  Tractor, 
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const urlRole = searchParams.get('role')?.toUpperCase();
  const urlEmail = searchParams.get('email') || '';
  const isJustRegistered = searchParams.get('registered') === 'true';
  const initialRole = urlRole === 'FARMER' ? 'FARMER' : 'CUSTOMER';

  const [formData, setFormData] = useState({ email: urlEmail, password: '', role: initialRole });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(isJustRegistered ? 'Account created successfully! Please login.' : '');
  const [loading, setLoading] = useState(false);
  const [suggestedRole, setSuggestedRole] = useState(null);

  const redirectTarget = searchParams.get('redirect');

  const navigateAfterAuth = (userObj) => {
    const userRole = (userObj?.role || '').toLowerCase();
    if (userRole === 'admin') {
      setError('Admin accounts are not available through this login.');
      return;
    }
    if (redirectTarget) {
      navigate(redirectTarget);
    } else if (userRole === 'farmer') {
      navigate('/farmer/dashboard');
    } else if (userRole === 'customer') {
      navigate('/customer/home');
    } else {
      navigate('/customer/home');
    }
  };

  useEffect(() => {
    if (urlRole && ['CUSTOMER', 'FARMER'].includes(urlRole)) {
      setFormData(prev => ({ ...prev, role: urlRole }));
    }
    if (urlEmail) {
      setFormData(prev => ({ ...prev, email: urlEmail }));
    }
  }, [urlRole, urlEmail]);

  const roleDetails = {
    CUSTOMER: {
      title: 'Customer',
      icon: ShoppingBag,
      tagline: 'Access fresh, farm-direct produce with zero middleman markups',
      color: 'from-emerald-500 to-teal-600',
      badge: 'Buyer Portal'
    },
    FARMER: {
      title: 'Farmer',
      icon: Tractor,
      tagline: 'Manage crop listings, monitor live fair prices, and direct payouts',
      color: 'from-amber-500 to-emerald-600',
      badge: 'Producer Portal'
    }
  };

  const handleRoleSelect = (selectedRole) => {
    if (!roleDetails[selectedRole]) return;
    setFormData({ ...formData, role: selectedRole });
    setError('');
    setSuccessMsg('');
    setSuggestedRole(null);
  };

  const parseErrorMessage = (err) => {
    if (!err) return 'An error occurred during login.';
    const detail = err.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail.map(item => item.msg || JSON.stringify(item)).join(', ');
    }
    if (err.message) return err.message;
    return 'Login failed. Please verify your credentials and network connection.';
  };

  const handleSwitchAndLogin = async (newRole) => {
    const updatedRole = newRole.toUpperCase();
    if (!roleDetails[updatedRole]) return;
    setFormData(prev => ({ ...prev, role: updatedRole }));
    setError('');
    setSuggestedRole(null);
    setLoading(true);
    try {
      const cleanEmail = formData.email.trim();
      const user = await login(cleanEmail, formData.password, updatedRole);
      navigateAfterAuth(user);
    } catch (err) {
      setError(parseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoRole) => {
    let email = 'customer@agrichain.com';
    let password = 'password123';
    let role = 'CUSTOMER';

    if (demoRole === 'FARMER') {
      email = 'farmer@agrichain.com';
      role = 'FARMER';
    }

    setFormData({ email, password, role });
    setError('');
    setSuccessMsg('');
    setSuggestedRole(null);
    setLoading(true);

    try {
      const user = await login(email, password, role);
      navigateAfterAuth(user);
    } catch (err) {
      setError(parseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.email || !formData.password) {
      return setError('Please enter both your email address and password.');
    }
    setLoading(true);
    setError('');
    setSuccessMsg('');
    setSuggestedRole(null);
    try {
      const cleanEmail = formData.email.trim();
      const user = await login(cleanEmail, formData.password, formData.role);
      navigateAfterAuth(user);
    } catch (err) {
      const errorText = parseErrorMessage(err);
      setError(errorText);
      const roleMatch = errorText.match(/registered as a (FARMER|CUSTOMER)/i);
      if (roleMatch) {
        setSuggestedRole(roleMatch[1].toUpperCase());
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center bg-slate-950/5 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-emerald-400/20 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-400/15 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-10 left-10 w-80 h-80 bg-amber-300/15 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Top Floating Header & Back Button */}
      <div className="w-full max-w-lg mb-4 flex items-center justify-between z-10">
        <Link
          to="/"
          id="login-back-intro-btn"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-emerald-700 bg-white/90 hover:bg-white border border-slate-200/90 hover:border-emerald-500/40 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-300 group backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-emerald-600" />
          <span>Back to Intro Page</span>
        </Link>
        <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/60 rounded-full flex items-center gap-1.5 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Secure AgriLink Access
        </span>
      </div>

      {/* Main Glassmorphic Login Card */}
      <div className="max-w-lg w-full bg-white/90 backdrop-blur-xl border border-white/80 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-emerald-950/10 z-10 transition-all">
        
        {/* Brand Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center justify-center gap-2.5 mb-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-all duration-300">
              <Sprout className="w-7 h-7" />
            </div>
            <span className="text-3xl font-black tracking-tight text-slate-900 font-outfit">
              Agri<span className="text-emerald-600">Link</span>
            </span>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-1 text-sm text-slate-600 max-w-sm mx-auto">
            {roleDetails[formData.role]?.tagline}
          </p>
        </div>

        {/* Interactive Role Switcher Tabs */}
        <div className="mt-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Select Your Role
          </label>
          <div className="grid grid-cols-2 gap-3 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80">
            {Object.keys(roleDetails).map((rKey) => {
              const r = roleDetails[rKey];
              const Icon = r.icon;
              const isSelected = formData.role === rKey;
              return (
                <button
                  key={rKey}
                  type="button"
                  onClick={() => handleRoleSelect(rKey)}
                  className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-md shadow-slate-300/40 border border-slate-200 scale-[1.02]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 mb-1 transition-colors ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{r.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Demo Pill Helper */}
        <div className="mt-4 flex flex-wrap items-center justify-between px-3 py-2 bg-emerald-50/70 border border-emerald-200/60 rounded-xl text-xs gap-2">
          <span className="text-emerald-900 font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> One-Click Demo Logins:
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('CUSTOMER')}
              className={`px-3 py-1 rounded-lg font-semibold text-xs border transition-all cursor-pointer ${
                formData.role === 'CUSTOMER' && formData.email === 'customer@agrichain.com'
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                  : 'bg-white text-emerald-800 hover:bg-emerald-600 hover:text-white border-emerald-200'
              }`}
            >
              Buyer
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('FARMER')}
              className={`px-3 py-1 rounded-lg font-semibold text-xs border transition-all cursor-pointer ${
                formData.role === 'FARMER' && formData.email === 'farmer@agrichain.com'
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                  : 'bg-white text-emerald-800 hover:bg-emerald-600 hover:text-white border-emerald-200'
              }`}
            >
              Farmer
            </button>
          </div>
        </div>

        {/* Form */}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {successMsg && (
            <div className="text-emerald-800 text-xs sm:text-sm font-medium bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="text-rose-700 text-xs sm:text-sm font-medium bg-rose-50 border border-rose-200 p-4 rounded-xl space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
              {suggestedRole && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => handleSwitchAndLogin(suggestedRole)}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    <span>Switch Role to {roleDetails[suggestedRole]?.title || suggestedRole} Tab & Log In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  className="w-full bg-slate-50/80 border border-slate-200 text-slate-900 text-sm rounded-xl pl-10 pr-4 py-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium placeholder:text-slate-400"
                  placeholder="name@domain.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full bg-slate-50/80 border border-slate-200 text-slate-900 text-sm rounded-xl pl-10 pr-11 py-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium placeholder:text-slate-400"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="relative w-full overflow-hidden flex items-center justify-center py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/45 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  <span>Log In as {roleDetails[formData.role].title}</span>
                </div>
              )}
            </button>
          </div>
        </form>

        {/* Footer Redirect */}
        <div className="text-center mt-6 pt-5 border-t border-slate-100">
          <p className="text-sm text-slate-600">
            Don't have an account?{' '}
            <Link to={`/register?role=${formData.role}`} className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
              Create an account
            </Link>
          </p>
        </div>

        {/* Trust Badges */}
        <div className="mt-6 flex items-center justify-center gap-4 text-[11px] font-semibold text-slate-600 border-t border-slate-100 pt-4">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 256-Bit Encrypted
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Direct Farm P2P
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
