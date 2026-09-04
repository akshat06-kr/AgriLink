import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import FarmerSidebar from '../../components/farmer/FarmerSidebar';
import { fetchProfile, updateProfile } from '../../services/farmerService';
import {
  User, MapPin, Phone, Mail, CheckCircle2,
  AlertCircle, Menu, RefreshCw, Save, Sprout
} from 'lucide-react';

const FARMING_TYPES = [
  'Organic Farming',
  'Natural / Zero Budget',
  'Traditional / Conventional',
  'Hydroponics & Aeroponics',
  'Greenhouse / Polyhouse'
];

const FarmerProfile = () => {
  const { user } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    farm_name: '',
    farm_location: '',
    farm_size_acres: '',
    farming_type: 'Organic Farming',
    farm_description: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const res = await fetchProfile();
        const p = res.data;
        const fd = p.farm_details || {};
        setFormData({
          name: p.name || '',
          phone: p.phone || '',
          farm_name: fd.farm_name || '',
          farm_location: fd.farm_location || '',
          farm_size_acres: fd.farm_size_acres || '',
          farming_type: fd.farming_type || 'Organic Farming',
          farm_description: fd.farm_description || '',
        });
      } catch (err) {
        console.error('Failed to load profile:', err);
        // Fallback to AuthContext user
        if (user) {
          const fd = user.farm_details || {};
          setFormData({
            name: user.name || '',
            phone: user.phone || '',
            farm_name: fd.farm_name || '',
            farm_location: fd.farm_location || '',
            farm_size_acres: fd.farm_size_acres || '',
            farming_type: fd.farming_type || 'Organic Farming',
            farm_description: fd.farm_description || '',
          });
        }
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      setSaving(true);
      await updateProfile({
        name: formData.name,
        phone: formData.phone,
        farm_details: {
          farm_name: formData.farm_name,
          farm_location: formData.farm_location,
          farm_size_acres: formData.farm_size_acres,
          farming_type: formData.farming_type,
          farm_description: formData.farm_description,
        },
      });
      setSuccess('Farm profile updated successfully!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error('Profile update failed:', err);
      setError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-surface-50">
      <FarmerSidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">Farm Profile & Settings</h1>
              <p className="text-xs text-slate-400">Manage your farm brand identity & credentials</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 max-w-3xl w-full mx-auto space-y-6">
          {/* Banner Card */}
          <div className="bg-gradient-to-r from-agri-dark to-agri-green text-white p-6 rounded-3xl shadow-sm relative overflow-hidden">
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-black text-2xl text-white border border-white/20">
                {(formData.name || 'F').charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-black">{formData.farm_name || 'My Agricultural Farm'}</h2>
                <p className="text-xs text-emerald-100 mt-0.5">
                  Managed by {formData.name || 'Farmer'} • {formData.farm_location || 'Local Region'}
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/20 text-white backdrop-blur-sm">
                  <Sprout className="w-3.5 h-3.5" />
                  {formData.farming_type}
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
              <RefreshCw className="w-8 h-8 text-agri-green animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Loading farmer profile...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-2 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{success}</span>
                </div>
              )}

              {/* Personal Details */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-agri-green" />
                  Farmer Credentials
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green"
                    />
                  </div>
                </div>
              </div>

              {/* Farm Details */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-agri-green" />
                  Farm & Land Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Farm / Enterprise Name</label>
                    <input
                      type="text"
                      name="farm_name"
                      placeholder="e.g. Green Valley Organics"
                      value={formData.farm_name}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Farm Location / Region</label>
                    <input
                      type="text"
                      name="farm_location"
                      placeholder="e.g. Nashik, Maharashtra"
                      value={formData.farm_location}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Total Land Area (Acres)</label>
                    <input
                      type="text"
                      name="farm_size_acres"
                      placeholder="e.g. 5.5"
                      value={formData.farm_size_acres}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Farming Practice</label>
                    <select
                      name="farming_type"
                      value={formData.farming_type}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green"
                    >
                      {FARMING_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Farm Story & Agricultural Philosophy</label>
                    <textarea
                      name="farm_description"
                      rows="3"
                      placeholder="Tell customers about your soil preservation methods, natural manures, harvesting practices..."
                      value={formData.farm_description}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-agri-green hover:bg-agri-dark text-white rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
};

export default FarmerProfile;
