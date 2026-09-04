import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye, Star } from 'lucide-react';
import api from '../../services/api';

const demoProducts = [
  { _id: '1', name: 'Fresh Tomatoes', category: 'Vegetables', farmer_name: 'Raju Singh', location: 'Punjab', price: 35, market_price: 45, quantity: 100, unit: 'kg', rating: 4.8, image: '🍅' },
  { _id: '2', name: 'Organic Potatoes', category: 'Vegetables', farmer_name: 'Amit Kumar', location: 'Haryana', price: 30, market_price: 40, quantity: 200, unit: 'kg', rating: 4.5, image: '🥔' },
  { _id: '3', name: 'Fresh Spinach', category: 'Vegetables', farmer_name: 'Suresh Das', location: 'UP', price: 25, market_price: 35, quantity: 50, unit: 'bunch', rating: 4.9, image: '🥬' },
  { _id: '4', name: 'Organic Apples', category: 'Fruits', farmer_name: 'Vikas Sharma', location: 'Himachal', price: 120, market_price: 150, quantity: 30, unit: 'kg', rating: 4.7, image: '🍎' }
];

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        if (response.data && response.data.length > 0) {
          setProducts(response.data.slice(0, 4));
        } else {
          setProducts(demoProducts);
        }
      } catch (error) {
        setProducts(demoProducts);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = filter === 'All' 
    ? products 
    : products.filter(p => p.category === filter || (filter === 'Organic' && p.organic));

  return (
    <div className="py-20 bg-surface-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Fresh From Local Farms</h2>
            <p className="mt-2 text-lg text-slate-600">Discover fresh products directly from farmers.</p>
            <div className="mt-4 h-1 w-20 bg-agri-green rounded"></div>
          </div>
          
          <div className="mt-6 md:mt-0 flex space-x-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
            {['All', 'Vegetables', 'Fruits', 'Grains', 'Organic'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                  filter === cat 
                    ? 'bg-agri-green text-white shadow-md' 
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <div key={product._id} className="card group p-0 overflow-hidden flex flex-col h-full">
              <div className="h-48 bg-slate-100 flex items-center justify-center text-6xl relative overflow-hidden">
                {product.image && product.image.length > 2 ? (
                   <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <span className="group-hover:scale-125 transition-transform duration-500">{product.image || '🌾'}</span>
                )}
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-agri-green shadow-sm">
                  Save ₹{product.market_price - product.price}
                </div>
              </div>
              <div className="p-5 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-slate-800 line-clamp-1">{product.name}</h3>
                  <div className="flex items-center text-earth-brown text-sm font-medium">
                    <Star className="w-4 h-4 mr-1 fill-current" />
                    {product.rating || 4.5}
                  </div>
                </div>
                <p className="text-sm text-slate-500 mb-4">{product.farmer_name} • {product.location}</p>
                
                <div className="mt-auto">
                  <div className="flex items-end gap-2 mb-1">
                    <span className="text-2xl font-bold text-agri-green">₹{product.price}</span>
                    <span className="text-sm text-slate-500 mb-1">/{product.unit}</span>
                  </div>
                  <p className="text-xs text-slate-400 line-through mb-4">Market Ref: ₹{product.market_price}/{product.unit}</p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => navigate('/products')} 
                      className="btn-secondary py-2 px-0 flex items-center justify-center text-sm"
                    >
                      <Eye className="w-4 h-4 mr-1" /> Details
                    </button>
                    <button 
                      onClick={() => alert(`Added ${product.name} to cart!`)}
                      className="btn-primary py-2 px-0 flex items-center justify-center text-sm shadow-none"
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" /> Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedProducts;
