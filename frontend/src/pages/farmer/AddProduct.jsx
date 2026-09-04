import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import FarmerSidebar from '../../components/farmer/FarmerSidebar';
import { createProduct, updateProduct } from '../../services/farmerService';
import api from '../../services/api';
import {
  PackagePlus, ArrowLeft, Image as ImageIcon,
  CheckCircle2, AlertCircle, Sparkles, Menu,
  DollarSign, Calculator, Leaf, Info
} from 'lucide-react';

const CATEGORIES = ['Vegetables', 'Fruits', 'Grains', 'Pulses', 'Dairy & Milk', 'Other'];
const UNITS = ['kg', 'quintal', 'ton', 'liter', 'dozen', 'bunch', 'piece', 'packet', 'box'];
const FARMING_TYPES = [
  'Organic',
  'Natural / Zero Budget',
  'Hydroponic',
  'Traditional / Conventional',
  'Polyhouse / Greenhouse'
];

const PRESET_IMAGES = [
  { name: 'Fresh Tomatoes', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500' },
  { name: 'Crisp Apples', url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500' },
  { name: 'Organic Wheat', url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500' },
  { name: 'Fresh Spinach', url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500' },
];

const AddProduct = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: 'Vegetables',
    description: '',
    price: '',
    market_price: '',
    production_cost: '',
    quantity: '',
    unit: 'kg',
    image: '',
    location: user?.farm_details?.farm_location || '',
    farm_name: user?.farm_details?.farm_name || '',
    harvest_date: new Date().toISOString().split('T')[0],
    farming_type: 'Organic',
    organic: true,
  });

  // Load existing product if in edit mode
  useEffect(() => {
    if (isEdit) {
      const fetchProduct = async () => {
        try {
          setLoading(true);
          const res = await api.get(`/products/${id}`);
          const p = res.data;
          setFormData({
            name: p.name || '',
            category: p.category || 'Vegetables',
            description: p.description || '',
            price: p.price ?? '',
            market_price: p.market_price ?? '',
            production_cost: p.production_cost ?? '',
            quantity: p.quantity ?? '',
            unit: p.unit || 'kg',
            image: p.image || '',
            location: p.location || user?.farm_details?.farm_location || '',
            farm_name: p.farm_name || user?.farm_details?.farm_name || '',
            harvest_date: p.harvest_date ? p.harvest_date.split('T')[0] : '',
            farming_type: p.farming_type || 'Organic',
            organic: p.organic !== undefined ? p.organic : true,
          });
        } catch (err) {
          console.error('Failed to load product for editing:', err);
          setError('Could not load product details.');
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEdit, user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Profit Margin calculations
  const sellingPrice = parseFloat(formData.price) || 0;
  const prodCost = parseFloat(formData.production_cost) || 0;
  const marketRefPrice = parseFloat(formData.market_price) || 0;
  const profitPerUnit = sellingPrice - prodCost;
  const profitMarginPct = sellingPrice > 0 ? ((profitPerUnit / sellingPrice) * 100).toFixed(1) : 0;
  const savingsVsMarket = marketRefPrice > sellingPrice ? (((marketRefPrice - sellingPrice) / marketRefPrice) * 100).toFixed(1) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }
    if (sellingPrice <= 0) {
      setError('Price must be greater than zero');
      return;
    }
    if (parseFloat(formData.quantity) < 0) {
      setError('Quantity cannot be negative');
      return;
    }

    const payload = {
      ...formData,
      price: sellingPrice,
      market_price: marketRefPrice > 0 ? marketRefPrice : sellingPrice * 1.2,
      production_cost: prodCost > 0 ? prodCost : 0,
      quantity: parseFloat(formData.quantity) || 0,
      image: formData.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500',
    };

    try {
      setSubmitting(true);
      if (isEdit) {
        await updateProduct(id, payload);
        setSuccess('Product listing updated successfully!');
      } else {
        await createProduct(payload);
        setSuccess('Product published successfully!');
      }
      setTimeout(() => {
        navigate('/farmer/products');
      }, 1200);
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err.response?.data?.detail || 'Failed to save product. Please check fields.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-surface-50">
      <FarmerSidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <Link
              to="/farmer/products"
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
              title="Back to products"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">
                {isEdit ? 'Edit Produce Listing' : 'Add New Produce'}
              </h1>
              <p className="text-xs text-slate-400">
                {isEdit ? 'Update details, pricing & inventory' : 'List your fresh harvest on AgriLink'}
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 max-w-4xl w-full mx-auto space-y-6">
          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
              <div className="w-8 h-8 border-2 border-agri-green border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-500">Loading product details...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Alerts */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-sm text-red-700">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-sm text-emerald-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {/* 1. Basic Produce Information */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-50 text-agri-green text-xs flex items-center justify-center font-bold">1</span>
                  Produce Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Crop / Produce Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g., Farm Fresh Roma Tomatoes"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Farming Type</label>
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
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      rows="3"
                      placeholder="Describe the freshness, taste, harvesting method, or soil quality..."
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green"
                    />
                  </div>
                </div>

                {/* Organic Checkbox */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-agri-green" />
                    <span className="text-sm font-semibold text-slate-800">Certified or Grown Organic?</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="organic"
                      checked={formData.organic}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-agri-green"></div>
                  </label>
                </div>
              </div>

              {/* 2. Pricing & Economics Calculator */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-50 text-agri-green text-xs flex items-center justify-center font-bold">2</span>
                  Pricing & Profit Economics
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Your Selling Price (₹) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        name="price"
                        step="any"
                        min="1"
                        required
                        placeholder="50"
                        value={formData.price}
                        onChange={handleChange}
                        className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Production Cost (₹)
                      <span className="text-[10px] text-slate-400 font-normal ml-1">(Optional)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        name="production_cost"
                        step="any"
                        min="0"
                        placeholder="25"
                        value={formData.production_cost}
                        onChange={handleChange}
                        className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mandi / Market Price (₹)
                      <span className="text-[10px] text-slate-400 font-normal ml-1">(Reference)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        name="market_price"
                        step="any"
                        min="0"
                        placeholder="65"
                        value={formData.market_price}
                        onChange={handleChange}
                        className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green"
                      />
                    </div>
                  </div>
                </div>

                {/* Profit Margin Preview Box */}
                {sellingPrice > 0 && (
                  <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                      <Calculator className="w-4 h-4 text-agri-green" />
                      Profit & Transparency Breakdown
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
                      <div>
                        <span className="text-slate-500">Gross Margin:</span>
                        <p className={`font-bold text-sm ${profitPerUnit >= 0 ? 'text-emerald-700' : 'text-red-500'}`}>
                          {profitPerUnit >= 0 ? `+₹${profitPerUnit.toFixed(2)}` : `-₹${Math.abs(profitPerUnit).toFixed(2)}`} / {formData.unit}
                          {prodCost > 0 && <span className="text-xs font-semibold ml-1">({profitMarginPct}%)</span>}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">Platform Fee (2%):</span>
                        <p className="font-semibold text-slate-700">₹{(sellingPrice * 0.02).toFixed(2)} / {formData.unit}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Customer Benefit:</span>
                        <p className="font-semibold text-emerald-700">
                          {savingsVsMarket > 0 ? `${savingsVsMarket}% cheaper than retail` : 'Competitive farm direct'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Inventory & Farm Origin */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-50 text-agri-green text-xs flex items-center justify-center font-bold">3</span>
                  Inventory & Location
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Available Quantity *</label>
                    <input
                      type="number"
                      name="quantity"
                      step="any"
                      min="0"
                      required
                      placeholder="100"
                      value={formData.quantity}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Unit of Measure *</label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green"
                    >
                      {UNITS.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Farm Origin / Location *</label>
                    <input
                      type="text"
                      name="location"
                      required
                      placeholder="e.g., Nashik, Maharashtra"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Harvest Date</label>
                    <input
                      type="date"
                      name="harvest_date"
                      value={formData.harvest_date}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Product Image */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-50 text-agri-green text-xs flex items-center justify-center font-bold">4</span>
                  Product Image
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    name="image"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={formData.image}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green"
                  />
                </div>

                {/* Quick Presets */}
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-2">Or select a quick stock photo:</p>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_IMAGES.map((preset) => (
                      <button
                        type="button"
                        key={preset.name}
                        onClick={() => setFormData({ ...formData, image: preset.url })}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-medium transition-colors"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Preview */}
                {formData.image && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-20 h-20 rounded-xl object-cover border border-slate-200"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500';
                      }}
                    />
                    <div>
                      <p className="text-xs font-semibold text-slate-800">Image Preview</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">This image will appear on the customer marketplace.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/farmer/products')}
                  className="px-6 py-3 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-agri-green hover:bg-agri-dark text-white rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving Produce...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      {isEdit ? 'Update Produce Listing' : 'Publish Produce Listing'}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
};

export default AddProduct;
