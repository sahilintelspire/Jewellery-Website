import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function SearchModal({ isOpen, onClose }) {
  const { products } = useStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const cleanQuery = query.trim().toLowerCase();
  const matches = cleanQuery
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(cleanQuery) ||
          (p.categoryLabel || p.category || '').toLowerCase().includes(cleanQuery) ||
          p.description.toLowerCase().includes(cleanQuery) ||
          (p.materials || []).some((m) => m.toLowerCase().includes(cleanQuery))
      )
    : products.slice(0, 4);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-espresso/60 backdrop-blur-sm"
          />

          {/* Search Card */}
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 360, damping: 30 }}
            className="relative z-10 w-full max-w-2xl rounded-3xl bg-white border border-gold-300 shadow-2xl overflow-hidden"
          >
            {/* Input Row */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gold-200 bg-ivory-50">
              <Search className="w-5 h-5 text-gold-600 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search rose quartz, sakura charm, pearl necklace, couple bands..."
                className="flex-1 text-sm text-espresso bg-transparent focus:outline-none placeholder:text-espresso/40"
              />
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-gold-100 text-espresso/60 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results */}
            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gold-700 px-1 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                <span>
                  {cleanQuery ? `Results (${matches.length})` : 'Popular Handcrafted Searches'}
                </span>
              </p>

              {matches.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <p className="font-serif-lux text-xl font-bold text-espresso">
                    No matching creations found
                  </p>
                  <p className="text-xs text-espresso/60">
                    Try searching for "Rose Quartz", "Resin", "Amethyst", or "Pearl".
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {matches.map((item) => (
                    <Link
                      key={item.id}
                      to={`/product/${item.id}`}
                      onClick={onClose}
                      className="p-3 rounded-2xl border border-gold-200/80 hover:border-gold-400 hover:bg-ivory-50 flex items-center gap-3 transition group"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover border border-gold-200 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif-lux text-base font-bold text-espresso group-hover:text-gold-700 truncate">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-espresso/55">{item.categoryLabel}</p>
                        <p className="text-xs font-bold text-gold-700 mt-0.5">₹{item.price}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gold-600 opacity-0 group-hover:opacity-100 transition" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
