import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Filter, ChevronDown, Search, Grid, List as ListIcon } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { DUMMY_PRODUCTS, CATEGORIES } from '../dummyData';

interface ShopProps {
  isNewArrivals?: boolean;
}

const Shop: React.FC<ShopProps> = ({ isNewArrivals = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState(20000);

  const filteredProducts = useMemo(() => {
    let result = [...DUMMY_PRODUCTS];

    if (isNewArrivals) {
      // Logic for new arrivals (e.g., date-based, for now just show all)
    }

    if (searchQuery) {
      result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category.includes(selectedCategory));
    }

    result = result.filter(p => p.price <= priceRange);

    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    
    return result;
  }, [searchQuery, selectedCategory, sortBy, priceRange, isNewArrivals]);

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-12">
      {/* Page Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
          {isNewArrivals ? 'New Arrivals' : 'Shop All'}
        </h1>
        <div className="flex items-center justify-center space-x-2 text-xs uppercase tracking-widest text-brand-gray">
          <a href="/" className="hover:text-brand-gold transition-colors">Home</a>
          <span>/</span>
          <span className="text-brand-black font-bold">{isNewArrivals ? 'New Arrivals' : 'Shop'}</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 space-y-10">
          {/* Search */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest mb-4">Search</h4>
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-b border-gray-200 py-2 text-sm focus:outline-none focus:border-brand-gold transition-colors"
              />
              <Search size={16} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest mb-4">Categories</h4>
            <div className="space-y-3">
              {['All', ...CATEGORIES.map(c => c.name)].map((cat) => (
                <label key={cat} className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === cat}
                    onChange={() => setSelectedCategory(cat)}
                    className="w-4 h-4 accent-brand-gold"
                  />
                  <span className={`text-sm tracking-wide transition-colors ${selectedCategory === cat ? 'text-brand-gold font-bold' : 'text-brand-gray group-hover:text-brand-black'}`}>
                    {cat}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest mb-6">Price Range</h4>
            <div className="space-y-4">
              <input
                type="range"
                min="0"
                max="20000"
                step="500"
                value={priceRange}
                onChange={(e) => setPriceRange(parseInt(e.target.value))}
                className="w-full accent-brand-gold"
              />
              <div className="flex justify-between items-center text-xs text-brand-gray font-medium uppercase tracking-tighter">
                <span>Rs. 0</span>
                <span className="text-brand-black">Up to Rs. {priceRange.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* New Arrivals Banner in Sidebar */}
          <div className="relative h-64 rounded-xl overflow-hidden group">
            <img
              src="https://images.unsplash.com/photo-1595776613215-fe04b78de7d0?q=80&w=1000"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-center p-4">
              <span className="text-white text-[10px] tracking-widest uppercase mb-2">New Season</span>
              <h5 className="text-white font-serif text-lg mb-4">Premium Fabrics</h5>
              <Link to="/new-arrivals" className="text-white border-b border-white text-[10px] font-bold uppercase tracking-widest hover:text-brand-gold hover:border-brand-gold transition-colors">
                Shop Collection
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-grow">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center border-b border-gray-100 pb-6 mb-8 gap-4">
            <p className="text-xs text-brand-gray uppercase tracking-widest">
              Showing <span className="text-brand-black font-bold">{filteredProducts.length}</span> results
            </p>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-xs uppercase tracking-widest text-brand-gray">
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-brand-black font-bold cursor-pointer"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredProducts.map((p, idx) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-brand-beige/50 rounded-2xl">
              <p className="text-brand-gray uppercase tracking-widest mb-4">No products found</p>
              <button
                onClick={() => { setSelectedCategory('All'); setSearchQuery(''); setPriceRange(20000); }}
                className="text-brand-gold font-bold uppercase text-xs border-b border-brand-gold pb-1"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Pagination (placeholder) */}
          {filteredProducts.length > 0 && (
            <div className="mt-20 flex justify-center space-x-2">
              <button className="w-10 h-10 flex items-center justify-center bg-brand-black text-white text-xs font-bold">1</button>
              <button className="w-10 h-10 flex items-center justify-center border border-gray-100 text-xs font-bold hover:bg-gray-100">2</button>
              <button className="w-10 h-10 flex items-center justify-center border border-gray-100 text-xs font-bold hover:bg-gray-100">3</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
