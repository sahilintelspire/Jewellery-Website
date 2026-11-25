import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Home, ArrowRight, Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[78vh] relative overflow-hidden silk-mesh-bg flex items-center justify-center px-6 py-16">
      {/* Subtle Decorative Radial Halos */}
      <div
        className="absolute top-10 left-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(243, 218, 213, 0.55) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(233, 214, 159, 0.45) 0%, transparent 70%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-xl w-full bg-white/95 rounded-[2rem] p-8 sm:p-14 border border-gold-300/70 shadow-luxury text-center space-y-6"
      >
        {/* Top Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-50 border border-gold-300 text-[11px] uppercase tracking-[0.22em] font-bold text-gold-800">
          <Compass className="w-3.5 h-3.5 text-gold-600" />
          <span>Atelier Page Not Found</span>
        </div>

        {/* Luxury Metallic 404 Headline */}
        <div className="relative py-2">
          <motion.span
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-block font-serif-lux text-7xl sm:text-9xl font-bold gold-metallic-text leading-none tracking-wider select-none"
          >
            404
          </motion.span>
          <Sparkles className="w-6 h-6 text-gold-500 absolute top-2 right-12 sm:right-20 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h1 className="font-serif-lux text-3xl sm:text-4xl font-bold text-espresso">
            This Gem Slipped Out of Sight
          </h1>
          <p className="text-xs sm:text-sm text-espresso/65 font-light max-w-md mx-auto leading-relaxed">
            The link you followed may be mistyped, moved, or this limited-edition handcrafted piece may have found a home. Let's guide you back to our showcase.
          </p>
        </div>

        {/* Dual Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/collections"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full glass-gold-btn text-xs uppercase tracking-[0.18em] font-bold flex items-center justify-center gap-2 shadow-md"
          >
            <span>Explore Collections</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/"
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white hover:bg-ivory-100 border border-gold-300 text-xs uppercase tracking-[0.16em] font-bold text-espresso flex items-center justify-center gap-2 transition"
          >
            <Home className="w-4 h-4 text-gold-600" />
            <span>Back To Home</span>
          </Link>
        </div>

        {/* Quick Links Footer inside 404 */}
        <div className="pt-5 border-t border-gold-200/70 flex flex-wrap items-center justify-center gap-4 text-[11px] font-semibold text-gold-800">
          <Link to="/custom-order" className="hover:underline">
            Custom Atelier
          </Link>
          <span className="text-gold-300">•</span>
          <Link to="/wishlist" className="hover:underline">
            My Wishlist
          </Link>
          <span className="text-gold-300">•</span>
          <Link to="/contact" className="hover:underline">
            Need Help?
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
