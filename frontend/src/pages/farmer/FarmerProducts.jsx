import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import FarmerSidebar from '../../components/farmer/FarmerSidebar';
import { fetchMyProducts, deleteProduct, updateStock, formatCurrency } from '../../services/farmerService';
import {
  Package, Plus, Search, Filter, Edit3, Trash2,
  AlertCircle, CheckCircle2, ChevronRight, Menu,
  Layers, ArrowUpDown, RefreshCw, X, Eye
} from 'lucide-react';

const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Grains', 'Pulses', 'Dairy & Milk', 'Other'];

const FarmerProducts = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Stock edit modal
  const [stockModal, setStockModal] = useState({ open: false, product: null, quantity: '' });
  const [updatingStock, setUpdatingStock] = useState(false);

  // Delete confirmation
  const [deleteModal, setDeleteModal] = useState({ open: false, product: null });
  const [deleting, setDeleting] = useState(false);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetchMyProducts();
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load products:', err);
      setError('Could not load products. Please check connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    if (!stockModal.product) return;
    try {
      setUpdatingStock(true);
      const newQty = parseFloat(stockModal.quantity);
      if (isNaN(newQty) || newQty < 0) {
        alert('Please enter a valid non-negative quantity');
        return;
      }
      await updateStock(stockModal.product._id, newQty);
      setStockModal({ open: false, product: null, quantity: '' });
      loadProducts();
    } catch (err) {
      alert('Failed to update stock. Please try again.');
    } finally {
      setUpdatingStock(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteModal.product) return;
    try {
      setDeleting(true);
      await deleteProduct(deleteModal.product._id);
      setDeleteModal({ open: false, product: null });
      loadProducts();
    } catch (err) {
      alert('Failed to delete product. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // Filter & Sort
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' ||
      p.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'price_asc') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0);
    if (sortBy === 'stock_asc') return (a.quantity || 0) - (b.quantity || 0);
    if (sortBy === 'stock_desc') return (b.quantity || 0) - (a.quantity || 0);
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  const totalStockCount = products.reduce((acc, p) => acc + (p.quantity || 0), 0);
  const outOfStockCount = products.filter((p) => (p.quantity || 0) <= 0).length;
  const lowStockCount = products.filter((p) => (p.quantity || 0) > 0 && (p.quantity || 0) <= 10).length;

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
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">My Products</h1>
              <p className="text-xs text-slate-400">Manage crop listings, inventory & pricing</p>
            </div>
          </div>
          <Link
            to="/farmer/products/add"
            className="flex items-center gap-1.5 px-4 py-2 bg-agri-green hover:bg-agri-dark text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Product</span>
          </Link>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 space-y-6 max-w-[1400px] w-full mx-auto">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-xs text-slate-400 font-medium">Total Listings</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{products.length}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-xs text-slate-400 font-medium">Total In-Stock Units</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{totalStockCount.toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-xs text-slate-400 font-medium">Low Stock (≤10)</p>
              <p className="text-2xl font-black text-amber-500 mt-1">{lowStockCount}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-xs text-slate-400 font-medium">Out of Stock</p>
              <p className="text-2xl font-black text-red-500 mt-1">{outOfStockCount}</p>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search products by name, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none w-full md:w-auto">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? 'bg-agri-green text-white shadow-sm'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 focus:outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="stock_desc">Stock: High to Low</option>
                <option value="stock_asc">Stock: Low to High</option>
              </select>
            </div>
          </div>

          {/* Product Listings Table */}
          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
              <RefreshCw className="w-8 h-8 text-agri-green animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-500 font-medium">Loading your inventory...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-red-800">{error}</p>
              <button
                onClick={loadProducts}
                className="mt-3 px-4 py-1.5 bg-white border border-red-200 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-50"
              >
                Try Again
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No products found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                {searchTerm || selectedCategory !== 'All'
                  ? 'No crops match your current search or category filter.'
                  : "You haven't listed any farm produce yet. Add your first harvest to start selling directly to customers!"}
              </p>
              <Link
                to="/farmer/products/add"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-agri-green hover:bg-agri-dark text-white rounded-xl text-sm font-semibold transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Your First Crop
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Produce</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Your Price</th>
                      <th className="py-3 px-4">Production Cost</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredProducts.map((p) => {
                      const isLowStock = (p.quantity || 0) > 0 && (p.quantity || 0) <= 10;
                      const isOutOfStock = (p.quantity || 0) <= 0;
                      const profitUnit = (p.price || 0) - (p.production_cost || 0);

                      return (
                        <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100'}
                                alt={p.name}
                                className="w-10 h-10 rounded-xl object-cover border border-slate-100 shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-900 truncate">{p.name}</p>
                                <p className="text-xs text-slate-400 truncate">{p.location || 'Local Farm'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium">
                              {p.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {formatCurrency(p.price)}
                            <span className="text-xs font-normal text-slate-400">/{p.unit || 'kg'}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-xs">
                            {p.production_cost ? (
                              <div>
                                <span>{formatCurrency(p.production_cost)}</span>
                                <span className={`block font-semibold ${profitUnit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                  {profitUnit >= 0 ? `+${formatCurrency(profitUnit)}` : formatCurrency(profitUnit)} margin
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400">Not set</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-semibold ${
                                  isOutOfStock
                                    ? 'text-red-500'
                                    : isLowStock
                                    ? 'text-amber-600'
                                    : 'text-slate-800'
                                }`}
                              >
                                {p.quantity || 0} {p.unit || 'kg'}
                              </span>
                              <button
                                onClick={() =>
                                  setStockModal({
                                    open: true,
                                    product: p,
                                    quantity: p.quantity || 0,
                                  })
                                }
                                className="text-[11px] text-agri-green hover:underline font-semibold"
                              >
                                Edit
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {isOutOfStock ? (
                              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium bg-red-50 text-red-600 border border-red-200">
                                Out of Stock
                              </span>
                            ) : isLowStock ? (
                              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                Low Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Active
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                to={`/product/${p._id}`}
                                target="_blank"
                                title="View Customer Page"
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <Link
                                to={`/farmer/products/${p._id}/edit`}
                                title="Edit Produce Details"
                                className="p-1.5 text-slate-400 hover:text-agri-green hover:bg-emerald-50 rounded-lg transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => setDeleteModal({ open: true, product: p })}
                                title="Delete Listing"
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-slate-100">
                {filteredProducts.map((p) => {
                  const isLowStock = (p.quantity || 0) > 0 && (p.quantity || 0) <= 10;
                  const isOutOfStock = (p.quantity || 0) <= 0;

                  return (
                    <div key={p._id} className="p-4 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100'}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0"
                          />
                          <div>
                            <p className="font-semibold text-slate-900">{p.name}</p>
                            <p className="text-xs text-slate-400">{p.category} • {p.location || 'Local'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">{formatCurrency(p.price)}</p>
                          <p className="text-[11px] text-slate-400">/{p.unit || 'kg'}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-50 text-xs">
                        <div>
                          <span className="text-slate-400">Stock: </span>
                          <span className={`font-semibold ${isOutOfStock ? 'text-red-500' : isLowStock ? 'text-amber-600' : 'text-slate-800'}`}>
                            {p.quantity || 0} {p.unit || 'kg'}
                          </span>
                        </div>
                        {isOutOfStock ? (
                          <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-red-50 text-red-600">Out of Stock</span>
                        ) : isLowStock ? (
                          <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-amber-50 text-amber-600">Low Stock</span>
                        ) : (
                          <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-600">Active</span>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-50">
                        <button
                          onClick={() => setStockModal({ open: true, product: p, quantity: p.quantity || 0 })}
                          className="px-3 py-1.5 text-xs font-semibold text-agri-green bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                        >
                          Quick Stock
                        </button>
                        <Link
                          to={`/farmer/products/${p._id}/edit`}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => setDeleteModal({ open: true, product: p })}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Quick Stock Modal */}
      {stockModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Update Stock Quantity</h3>
              <button
                onClick={() => setStockModal({ open: false, product: null, quantity: '' })}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Update current available inventory for <strong className="text-slate-800">{stockModal.product?.name}</strong>.
            </p>
            <form onSubmit={handleUpdateStock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Quantity ({stockModal.product?.unit || 'kg'})
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={stockModal.quantity}
                  onChange={(e) => setStockModal({ ...stockModal, quantity: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStockModal({ open: false, product: null, quantity: '' })}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStock}
                  className="flex-1 py-2.5 bg-agri-green hover:bg-agri-dark text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {updatingStock ? 'Saving...' : 'Save Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Delete Product?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove <strong className="text-slate-800">{deleteModal.product?.name}</strong> from your listings? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal({ open: false, product: null })}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerProducts;
