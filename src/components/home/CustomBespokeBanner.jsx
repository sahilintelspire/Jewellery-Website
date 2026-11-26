import React from 'react';
import { Sparkles, MessageCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CustomBespokeBanner() {
  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-16">
      <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-gold-100 via-ivory-100 to-rosequartz-100 p-6 sm:p-14 border border-gold-300 shadow-luxury text-center relative overflow-hidden">
        
        {/* Glow circles */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-gold-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-rosequartz-300/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-gold-300 text-gold-800 text-[11px] uppercase tracking-widest font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-gold-600 animate-bounce" />
            <span>Custom Atelier Studio</span>
          </div>

          <h2 className="font-serif-lux text-3xl sm:text-5xl font-bold text-espresso leading-tight">
            Have A Specific Dream Design In Mind?
          </h2>

          <p className="text-espresso/70 text-xs sm:text-sm font-light leading-relaxed">
            Send us your wrist measurements, favorite gemstone colors, or Pinterest reference photos. We will hand-make your custom piece and share behind-the-scenes progress videos!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/custom-order"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full glass-gold-btn text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 shadow-md"
            >
              <span>Explore Custom Studio</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="https://wa.me/918780125711?text=Hi!%20I%20have%20a%20custom%20jewellery%20design%20reference%20photo%20to%20share!"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white hover:bg-gold-50 text-emerald-700 border border-emerald-400 text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 shadow-sm transition"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
