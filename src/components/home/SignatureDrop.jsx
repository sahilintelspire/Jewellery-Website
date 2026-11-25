import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { PRODUCTS, CATEGORIES } from '../../data/products';
import ProductCard from '../common/ProductCard';

export default function SignatureDrop() {
  const [activeTab, setActiveTab] = useState('all');

  const filteredProducts =
    activeTab === 'all' ? PRODUCTS : PRODUCTS.filter((p) => p.category === activeTab);

  return (
    <section className="py-20 px-6 lg:px-16 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
        <span className="text-xs uppercase tracking-[0.25em] text-gold-600 font-semibold flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Individually Sculpted On Order
        </span>
        <h2 className="font-serif-lux text-4xl sm:text-5xl font-bold text-espresso">
          The Signature Drop
        </h2>
        <p className="text-espresso/60 text-xs sm:text-sm font-light leading-relaxed">
          Each creation is hand-crafted with authentic minerals, organic resin, and tarnish-resistant gold wire. No two handmade creations are ever identical.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-12">
        {CATEGORIES.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-gold-500 text-white shadow-md'
                : 'bg-white/80 text-espresso/70 border border-gold-200 hover:border-gold-400 hover:text-espresso'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </section>
  );
}
