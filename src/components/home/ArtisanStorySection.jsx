import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

export default function ArtisanStorySection() {
  return (
    <section className="py-14 sm:py-24 px-4 sm:px-6 lg:px-16 bg-white/60 border-y border-gold-200/60 relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Visual Collage */}
        <div className="lg:col-span-5 relative">
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-gold-300/60 p-2 bg-white">
            <img
              src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80"
              alt="Artisan handcrafting jewellery"
              className="w-full h-full object-cover rounded-2xl"
            />
            {/* Floating Quote Badge */}
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-gold-300 shadow-lg text-center">
              <p className="font-serif-lux italic text-xs sm:text-sm text-espresso font-medium leading-relaxed">
                "Every knot, every crystal, every drop of resin is shaped by hand with infinite patience and love."
              </p>
            </div>
          </div>
          {/* Subtle gold decorative ring */}
          <div className="absolute -top-4 -left-4 w-24 h-24 border border-gold-400/40 rounded-full pointer-events-none" />
        </div>

        {/* Right Story Narrative */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-100 text-gold-800 text-[11px] uppercase tracking-widest font-semibold">
            <Heart className="w-3.5 h-3.5 fill-gold-600 text-gold-600" />
            <span>The Soul Behind The Art</span>
          </div>

          <h2 className="font-serif-lux text-4xl sm:text-5xl font-bold text-espresso leading-[1.15]">
            Handmade Isn't Just A Product. <br />
            <span className="shimmer-gold-text">It's A Piece Of Someone's Heart.</span>
          </h2>

          <p className="text-espresso/70 text-sm sm:text-base font-light leading-relaxed">
            What started as a quiet passion on a bedroom study table has blossomed into a bespoke atelier. While commercial factories produce thousands of identical plastic copies, we sit with beads, wire, and resin to craft one singular creation at a time.
          </p>

          <p className="text-espresso/70 text-sm sm:text-base font-light leading-relaxed">
            When you wear our jewellery, you wear mindful meditation, genuine natural healing crystals, and a story meant exclusively for you.
          </p>

          <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-6 border-t border-gold-200 text-center">
            <div>
              <p className="font-serif-lux text-2xl sm:text-4xl font-bold text-gold-700">100%</p>
              <p className="text-[10px] sm:text-xs uppercase tracking-wider text-espresso/60 mt-1">
                Hand Sculpted
              </p>
            </div>
            <div>
              <p className="font-serif-lux text-2xl sm:text-4xl font-bold text-gold-700">500+</p>
              <p className="text-[10px] sm:text-xs uppercase tracking-wider text-espresso/60 mt-1">
                Smiles Delivered
              </p>
            </div>
            <div>
              <p className="font-serif-lux text-2xl sm:text-4xl font-bold text-gold-700">Zero</p>
              <p className="text-[10px] sm:text-xs uppercase tracking-wider text-espresso/60 mt-1">
                Factory Clones
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
