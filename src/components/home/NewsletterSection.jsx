import React, { useState } from 'react';
import { Mail, Sparkles, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'subscribed' | 'error'

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@') || !email.includes('.')) {
      setStatus('error');
      return;
    }

    try {
      const existing = JSON.parse(localStorage.getItem('aura_subscribers') || '[]');
      if (!existing.includes(email)) {
        existing.push({ email, subscribedAt: new Date().toISOString() });
        localStorage.setItem('aura_subscribers', JSON.stringify(existing));
      }
    } catch (err) {}

    setStatus('subscribed');
  };

  return (
    <section className="py-20 px-6 lg:px-16 max-w-7xl mx-auto">
      <div className="relative rounded-3xl overflow-hidden p-8 sm:p-14 border border-gold-300/80 shadow-luxury bg-gradient-to-br from-white via-ivory-100 to-[#F5E8E4]/70">
        
        {/* Ambient Decorative Blurs */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-gold-200/30 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-rosequartz-200/35 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-4">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-gold-300 shadow-sm text-gold-700 text-xs uppercase tracking-[0.22em] font-bold">
            <Sparkles className="w-3.5 h-3.5 text-gold-500" />
            <span>Join The Atelier Inner Circle</span>
          </div>

          <h2 className="font-serif-lux text-3xl sm:text-5xl font-bold text-espresso leading-tight">
            Stay Connected With Our Craft
          </h2>

          <p className="text-espresso/70 text-xs sm:text-sm font-light leading-relaxed max-w-xl mx-auto">
            Be the very first to receive private drops of rare healing crystals, behind-the-scenes studio stories, and automatic notifications whenever a new handcrafted heirloom is released.
          </p>

          {status === 'subscribed' ? (
            <div className="pt-6 pb-2 animate-fadeIn">
              <div className="inline-flex items-center gap-3 p-4 px-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-bold uppercase tracking-wider">Welcome to the Inner Circle!</p>
                  <p className="text-[11px] text-emerald-700 font-light">
                    You are subscribed! Enjoy <strong className="font-bold">10% OFF</strong> at checkout with code <strong className="font-bold text-gold-800">AURA10</strong>.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="pt-4 max-w-lg mx-auto">
              <div className="flex flex-col sm:flex-row items-center gap-2 p-1.5 rounded-full bg-white border border-gold-300 shadow-md">
                <div className="flex items-center gap-2.5 px-4 py-2 w-full flex-1">
                  <Mail className="w-4 h-4 text-gold-600 flex-shrink-0" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === 'error') setStatus('idle');
                    }}
                    placeholder="Enter your email address..."
                    required
                    className="w-full text-xs text-espresso bg-transparent focus:outline-none placeholder:text-espresso/40"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-7 py-3 rounded-full btn-gold-mockup text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 whitespace-nowrap shadow-sm"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {status === 'error' && (
                <p className="text-[11px] text-red-500 mt-2 font-medium">
                  Please enter a valid email address.
                </p>
              )}
            </form>
          )}

          {/* Trust Guarantees */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-[11px] text-espresso/60 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-gold-600" />
              <span>Zero spam, ever</span>
            </span>
            <span>•</span>
            <span>Instant notification on new drops</span>
            <span>•</span>
            <span>Unsubscribe anytime</span>
          </div>

        </div>

      </div>
    </section>
  );
}
