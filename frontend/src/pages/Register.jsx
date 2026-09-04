import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  User, 
  Phone, 
  MapPin, 
  Tractor, 
  Sprout, 
  Building, 
  FileText, 
  ArrowLeft,
  Eye,
  EyeOff,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [role, setRole] = useState('CUSTOMER');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    address: '', // Customer
    farm_name: '', farm_location: '', crop_categories: '', farming_type: 'organic', farm_description: '' // Farmer
  });
  const [error, setError] = useState('');
  const [existingUserEmail, setExistingUserEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setExistingUserEmail('');
  };

  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;
  const passwordsMismatch = formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword;

  const parseErrorMessage = (err) => {
    if (!err) return 'Registration failed. Please try again.';
    const detail = err.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail.map(item => {
        const field = item.loc ? item.loc[item.loc.length - 1] : '';
        return field ? `${field}: ${item.msg}` : item.msg;
      }).join(', ');
    }
    if (err.message) return err.message;
    return 'Registration failed. Please check your network connection.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setExistingUserEmail('');
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match. Please verify your password confirmation.');
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }

    setLoading(true);
    try {
      const cleanEmail = formData.email.trim();
      const payload = {
        name: formData.name.trim(),
        email: cleanEmail,
        phone: formData.phone.trim(),
        password: formData.password,
        role: role.toLowerCase()
      };

      if (role === 'FARMER') {
        payload.farm_name = formData.farm_name.trim();
        payload.farm_location = formData.farm_location.trim();
        payload.crop_categories = formData.crop_categories ? formData.crop_categories.split(',').map(s => s.trim()).filter(Boolean) : [];
        payload.farming_type = formData.farming_type;
        payload.farm_description = formData.farm_description.trim();
      } else if (role === 'CUSTOMER') {
        payload.address = formData.address.trim();
      }

      await register(payload);
      navigate(`/login?email=${encodeURIComponent(cleanEmail)}&role=${role.toLowerCase()}&registered=true`);
    } catch (err) {
      console.error(
        "Registration error:",
        err.response?.data || err.message
      );
      if (err.response) {
        if (err.response.status === 409) {
          const cleanEmail = formData.email.trim();
          setError('An account with this email already exists. Please login.');
          setExistingUserEmail(cleanEmail);
        } else if (err.response.status === 422) {
          setError('Please check the information entered in the form.');
        } else if (err.response.status === 500) {
          setError('Server error. Please try again.');
        } else {
          setError(parseErrorMessage(err));
        }
      } else if (err.request) {
        setError('Unable to connect to the server. Please make sure the backend API is running.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center bg-slate-950/5 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Ambient Background Glows */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-400/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-teal-400/15 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-10 right-10 w-80 h-80 bg-amber-300/15 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Top Floating Back to Intro Button */}
      <div className="w-full max-w-2xl mb-4 flex items-center justify-between z-10">
        <Link
          to="/"
          id="register-back-intro-btn"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-emerald-700 bg-white/90 hover:bg-white border border-slate-200/90 hover:border-emerald-500/40 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-300 group backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-emerald-600" />
          <span>Back to Intro Page</span>
        </Link>
        <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/60 rounded-full flex items-center gap-1.5 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Instant Registration
        </span>
      </div>

      {/* Main Glassmorphic Card */}
      <div className="max-w-2xl w-full bg-white/95 backdrop-blur-xl border border-white/80 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-emerald-950/10 z-10 transition-all">
        
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
            Create Your Account
          </h2>
          <p className="mt-1 text-sm text-slate-600 max-w-md mx-auto">
            {role === 'CUSTOMER'
              ? 'Join as a Buyer to order farm-fresh produce with direct transparent pricing.'
              : 'Join as a Farmer to sell harvests directly with guaranteed fair rates and instant payouts.'}
          </p>
        </div>

        {/* Interactive Dual Role Selector */}
        <div className="mt-6">
          <div className="grid grid-cols-2 gap-3 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => { setRole('CUSTOMER'); setError(''); setExistingUserEmail(''); }}
              className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                role === 'CUSTOMER'
                  ? 'bg-white text-slate-900 shadow-md shadow-slate-300/40 border border-slate-200 scale-[1.01]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <ShoppingBag className={`w-4 h-4 ${role === 'CUSTOMER' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>Customer / Buyer</span>
            </button>
            <button
              type="button"
              onClick={() => { setRole('FARMER'); setError(''); setExistingUserEmail(''); }}
              className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                role === 'FARMER'
                  ? 'bg-white text-slate-900 shadow-md shadow-slate-300/40 border border-slate-200 scale-[1.01]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Tractor className={`w-4 h-4 ${role === 'FARMER' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>Farmer / Producer</span>
            </button>
          </div>
        </div>

        {/* Registration Form */}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="text-rose-700 text-xs sm:text-sm font-medium bg-rose-50 border border-rose-200 p-4 rounded-xl space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
              {existingUserEmail && (
                <div className="pt-1">
                  <Link
                    to={`/login?email=${encodeURIComponent(existingUserEmail)}&role=${role}`}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    <span>Log in with {existingUserEmail}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  className="w-full bg-slate-50/80 border border-slate-200 text-slate-900 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium placeholder:text-slate-400"
                  placeholder="e.g. John Doe"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  className="w-full bg-slate-50/80 border border-slate-200 text-slate-900 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium placeholder:text-slate-400"
                  placeholder="name@domain.com"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  className="w-full bg-slate-50/80 border border-slate-200 text-slate-900 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium placeholder:text-slate-400"
                  placeholder="+91 98765 43210"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  className="w-full bg-slate-50/80 border border-slate-200 text-slate-900 text-sm rounded-xl pl-10 pr-10 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium placeholder:text-slate-400"
                  placeholder="At least 6 characters"
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Confirm Password</label>
                {passwordsMatch && (
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Match
                  </span>
                )}
                {passwordsMismatch && (
                  <span className="text-[11px] font-bold text-rose-500 flex items-center gap-1">
                    Mismatch
                  </span>
                )}
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  className={`w-full bg-slate-50/80 border text-slate-900 text-sm rounded-xl pl-10 pr-10 py-2.5 focus:bg-white focus:outline-none focus:ring-2 transition-all font-medium placeholder:text-slate-400 ${
                    passwordsMismatch
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20'
                  }`}
                  placeholder="Re-enter password"
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Role-Specific Details Section */}
          <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 sm:p-5 mt-2 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                {role === 'FARMER' ? <Tractor className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {role === 'FARMER' ? 'Farm & Harvest Specifications' : 'Delivery & Destination Info'}
              </h3>
            </div>
            
            {role === 'CUSTOMER' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Address</label>
                <div className="relative group">
                  <div className="absolute top-3 left-3.5 flex items-start pointer-events-none">
                    <MapPin className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                  </div>
                  <textarea
                    name="address"
                    required
                    rows="2"
                    value={formData.address}
                    className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium placeholder:text-slate-400"
                    placeholder="Enter full street, apartment/house number, city & postal code"
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>
            )}

            {role === 'FARMER' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Farm Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Building className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                    </div>
                    <input
                      type="text"
                      name="farm_name"
                      required
                      value={formData.farm_name}
                      className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium placeholder:text-slate-400"
                      placeholder="e.g. Green Valley Orchards"
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location (City, State)</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <MapPin className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                    </div>
                    <input
                      type="text"
                      name="farm_location"
                      required
                      value={formData.farm_location}
                      className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium placeholder:text-slate-400"
                      placeholder="e.g. Nashik, Maharashtra"
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Crop Categories</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Sprout className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                    </div>
                    <input
                      type="text"
                      name="crop_categories"
                      required
                      value={formData.crop_categories}
                      className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium placeholder:text-slate-400"
                      placeholder="e.g. Organic Tomatoes, Wheat"
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Farming Type</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Tractor className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                    </div>
                    <select
                      name="farming_type"
                      value={formData.farming_type}
                      className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                      onChange={handleChange}
                    >
                      <option value="organic">Organic Farming</option>
                      <option value="conventional">Conventional Farming</option>
                      <option value="mixed">Mixed Farming</option>
                    </select>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Farm Description</label>
                  <div className="relative group">
                    <div className="absolute top-3 left-3.5 flex items-start pointer-events-none">
                      <FileText className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                    </div>
                    <textarea
                      name="farm_description"
                      rows="2"
                      value={formData.farm_description}
                      className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium placeholder:text-slate-400"
                      placeholder="Brief overview of your land, soil quality, or specialties"
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>
              </div>
            )}
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
                  <span>Creating Your Account...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Register as {role === 'CUSTOMER' ? 'Customer' : 'Farmer'}</span>
                </div>
              )}
            </button>
          </div>
        </form>
        
        {/* Footer Redirect */}
        <div className="text-center mt-6 pt-5 border-t border-slate-100">
          <p className="text-sm text-slate-600">
            Already have an account?{' '}
            <Link to={`/login?role=${role}`} className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
              Log in instead
            </Link>
          </p>
        </div>

        {/* Security & Verification Guarantee */}
        <div className="mt-6 flex items-center justify-center gap-4 text-[11px] font-semibold text-slate-600 border-t border-slate-100 pt-4">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Direct Verification
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Transparent Pricing
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Instant Settlement
          </span>
        </div>
      </div>
    </div>
  );
};

export default Register;
