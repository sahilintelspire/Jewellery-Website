import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/common/ProductCard';

export default function CollectionsPage() {
  const { products, categories } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'all';

  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    setActiveCategory(categoryParam);
  }, [categoryParam]);

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    if (catId === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catId);
    }
    setSearchParams(searchParams);
  };

  // Filter & Sort Logic
  const filtered = products.filter((p) => {
    const catSlug = p.categorySlug || p.category;
    const matchesCategory = activeCategory === 'all' || catSlug === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.materials || []).some((m) => m.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  if (sortBy === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-16 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
        <span className="text-xs uppercase tracking-[0.25em] text-gold-600 font-semibold flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          The Complete Handcrafted Catalog
        </span>
        <h1 className="font-serif-lux text-4xl sm:text-6xl font-bold text-espresso">
          Artisan Collections
        </h1>
        <p className="text-espresso/60 text-xs sm:text-sm font-light">
          Each item is hand-tied, cast, and sculpted with natural minerals and raw devotion.
        </p>
      </div>

      {/* Search & Sort Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 p-4 rounded-2xl bg-white border border-gold-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gold-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search crystals, flowers, bracelets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-full border border-gold-200 bg-ivory-50 text-espresso focus:outline-none focus:ring-1 focus:ring-gold-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs">
          <SlidersHorizontal className="w-3.5 h-3.5 text-gold-600" />
          <span className="text-espresso/60 font-medium">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-full border border-gold-200 bg-ivory-50 text-espresso font-semibold focus:outline-none"
          >
            <option value="featured">Featured Drop</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-wider font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-gold-500 text-white shadow-md'
                : 'bg-white text-espresso/70 border border-gold-200 hover:border-gold-400'
            }`}
          >
            {cat.label || cat.name} (
            {cat.id === 'all' ? products.length : products.filter((p) => (p.categorySlug || p.category) === cat.id).length}
            )
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gold-200">
          <p className="font-serif-lux text-2xl text-espresso mb-2">
            No matching handmade creations found
          </p>
          <p className="text-xs text-espresso/60 mb-6">
            Try searching for "Rose Quartz", "Resin", or "Pearl"
          </p>
          <button
            onClick={() => {
              setActiveCategory('all');
              setSearchQuery('');
            }}
            className="px-6 py-2.5 rounded-full glass-gold-btn text-xs uppercase font-bold tracking-wider"
          >
            View All Pieces
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filtered.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
