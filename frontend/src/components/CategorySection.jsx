import React from 'react';
import { 
  Carrot, 
  Apple, 
  Wheat, 
  Milk, 
  Sprout, 
  Layers, 
  Sparkles 
} from 'lucide-react';

const categories = [
  { id: 'All', name: 'All Products', icon: Layers, emoji: '🧺', color: 'from-slate-500/10 to-slate-500/5', activeColor: 'bg-slate-900 text-white' },
  { id: 'Vegetables', name: 'Vegetables', icon: Carrot, emoji: '🥕', color: 'from-orange-500/15 to-amber-500/5', activeColor: 'bg-emerald-600 text-white' },
  { id: 'Fruits', name: 'Fruits', icon: Apple, emoji: '🍎', color: 'from-rose-500/15 to-pink-500/5', activeColor: 'bg-rose-600 text-white' },
  { id: 'Crops & Grains', name: 'Crops & Grains', icon: Wheat, emoji: '🌾', color: 'from-amber-500/15 to-yellow-500/5', activeColor: 'bg-amber-700 text-white' },
  { id: 'Dairy & Milk', name: 'Dairy & Milk', icon: Milk, emoji: '🥛', color: 'from-blue-500/15 to-cyan-500/5', activeColor: 'bg-blue-600 text-white' },
  { id: 'Organic Products', name: 'Organic Products', icon: Sprout, emoji: '🌱', color: 'from-emerald-500/15 to-green-500/5', activeColor: 'bg-emerald-700 text-white' },
  { id: 'Pulses', name: 'Pulses', icon: Sparkles, emoji: '🫘', color: 'from-amber-600/15 to-orange-500/5', activeColor: 'bg-amber-800 text-white' }
];

const CategorySection = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div className="py-8 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Browse Categories</h2>
            <p className="text-xs text-slate-500">Pick farm produce by fresh harvest category</p>
          </div>
          {selectedCategory !== 'All' && (
            <button
              onClick={() => onSelectCategory('All')}
              className="text-xs font-semibold text-agri-green hover:underline"
            >
              Reset to All
            </button>
          )}
        </div>

        {/* Scrollable / Responsive Category Cards */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
          {categories.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.id.toLowerCase() || 
              (cat.id === 'Organic Products' && selectedCategory.toLowerCase().includes('organic'));
            const Icon = cat.icon;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex-shrink-0 flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all duration-200 text-center min-w-[110px] sm:min-w-0 ${
                  isSelected
                    ? `${cat.activeColor} border-transparent shadow-md scale-102`
                    : 'bg-slate-50/80 hover:bg-slate-100 border-slate-200/80 text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="text-2xl mb-1.5 filter drop-shadow-sm">{cat.emoji}</span>
                <span className="text-xs font-bold whitespace-nowrap">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategorySection;
