import React from 'react';
import { Sparkles, Heart, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function OurStoryPage() {
  return (
    <div className="min-h-screen py-10 sm:py-16 px-4 sm:px-6 lg:px-16 max-w-5xl mx-auto space-y-12 sm:space-y-16">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-100 text-gold-800 text-xs uppercase tracking-widest font-semibold">
          <Heart className="w-3.5 h-3.5 text-rosequartz-500 fill-rosequartz-400" />
          <span>The Soul Behind The Art</span>
        </div>

        <h1 className="font-serif-lux text-4xl sm:text-6xl font-bold text-espresso">
          Crafted One Knot At A Time
        </h1>

        <p className="text-espresso/70 text-xs sm:text-sm font-light leading-relaxed">
          In a world of mass-manufactured plastic clones, we believe in the quiet power of human hands, authentic minerals, and endless devotion.
        </p>
      </div>

      {/* Narrative & Visual Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-gold-300">
          <img
            src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80"
            alt="Handmaking jewellery"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-6 text-espresso/80 font-light text-sm sm:text-base leading-relaxed">
          <h2 className="font-serif-lux text-3xl font-bold text-espresso leading-tight">
            How It All Began
          </h2>
          <p>
            AURA began not in an industrial factory, but at a modest desk covered in trays of natural gemstones, threads, and delicate botanical flowers. It started as a personal quest to create jewellery that carried emotional warmth rather than corporate detachment.
          </p>
          <p>
            Each morning starts with carefully sorting raw amethyst, rose quartz, and lustrous freshwater pearls. When you wear our pieces, you wear something that someone sat with for hours, adjusting every bead until the balance was poetic.
          </p>
          <div className="p-4 rounded-2xl bg-white border border-gold-200 shadow-sm space-y-2 text-xs">
            <div className="flex items-center gap-2 text-gold-800 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Ethically Sourced Natural Gemstones & Pearls</span>
            </div>
            <div className="flex items-center gap-2 text-gold-800 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Preserved Botanicals in Non-Yellowing Crystal Resin</span>
            </div>
            <div className="flex items-center gap-2 text-gold-800 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Skin-Friendly, Nickel-Free & Tarnish-Resistant Findings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center py-12 px-6 rounded-3xl bg-ivory-200/70 border border-gold-300 text-espresso space-y-4">
        <h3 className="font-serif-lux text-3xl font-bold">Experience The Craft In Person</h3>
        <p className="text-xs sm:text-sm text-espresso/70 max-w-md mx-auto">
          Explore our signature drop or request a bespoke creation tailored to your exact heart's desire.
        </p>
        <div className="pt-2">
          <Link
            to="/collections"
            className="inline-block px-8 py-3.5 rounded-full glass-gold-btn text-xs uppercase tracking-widest font-bold shadow-luxury"
          >
            Explore Creations
          </Link>
        </div>
      </div>

    </div>
  );
}
