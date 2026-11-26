import React, { useState } from 'react';
import { Sparkles, MessageCircle, Upload, CheckCircle2, Heart } from 'lucide-react';

export default function CustomOrderPage() {
  const [jewelleryType, setJewelleryType] = useState('Bracelet');
  const [crystalType, setCrystalType] = useState('Rose Quartz');
  const [budget, setBudget] = useState('₹1,000 - ₹2,000');
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);

    const message = `*Hi AURA Jewels! I want to submit a Bespoke Custom Jewellery Request:*%0A%0A` +
      `- *Name:* ${customerName || 'A customer'}%0A` +
      `- *Type:* ${jewelleryType}%0A` +
      `- *Preferred Crystal / Gem:* ${crystalType}%0A` +
      `- *Budget Range:* ${budget}%0A` +
      `- *Custom Details & Sizing:* ${notes || 'Standard'}%0A%0A` +
      `Please let me know how to share my reference photos and proceed!`;

    window.open(`https://wa.me/918780125711?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen py-10 sm:py-16 px-4 sm:px-6 lg:px-16 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-100 text-gold-800 text-[11px] sm:text-xs uppercase tracking-widest font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-gold-600 animate-spin" />
          <span>Bespoke Atelier Commission</span>
        </div>

        <h1 className="font-serif-lux text-3xl sm:text-6xl font-bold text-espresso">
          Design Your Dream Piece
        </h1>

        <p className="text-espresso/70 text-xs sm:text-sm font-light max-w-xl mx-auto leading-relaxed">
          Have a Pinterest vision or a special anniversary gift in mind? Fill in your preferences below, and we will sculpt a 1-of-1 creation with progress video updates!
        </p>
      </div>

      {/* Form Card */}
      <div className="p-5 sm:p-12 rounded-3xl bg-white border border-gold-300 shadow-luxury">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 1. Name */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-bold text-espresso/80 mb-2">
              Your Name:
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g., Sahil Memon"
              className="w-full p-3.5 rounded-2xl border border-gold-300 bg-ivory-50 text-xs text-espresso focus:outline-none focus:ring-1 focus:ring-gold-500"
            />
          </div>

          {/* 2. Jewellery Category */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-bold text-espresso/80 mb-2">
              Type of Jewellery:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {['Bracelet', 'Resin Pendant', 'Couple Bands', 'Pearl Choker'].map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setJewelleryType(type)}
                  className={`py-3 px-3 rounded-xl text-xs font-semibold border transition text-center ${
                    jewelleryType === type
                      ? 'border-gold-500 bg-gold-50 text-gold-900 shadow-sm'
                      : 'border-gold-200 bg-white text-espresso/70 hover:border-gold-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Preferred Crystal or Mineral */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-bold text-espresso/80 mb-2">
              Preferred Gemstone / Crystal:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {['Rose Quartz (Love & Healing)', 'Raw Amethyst (Peace)', 'Freshwater Baroque Pearl', 'Botanical Real Flower', 'Custom Initials'].map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCrystalType(c)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition text-left ${
                    crystalType === c
                      ? 'border-gold-500 bg-gold-50 text-gold-900 shadow-sm'
                      : 'border-gold-200 bg-white text-espresso/70 hover:border-gold-300'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Budget Range */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-bold text-espresso/80 mb-2">
              Approximate Budget:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {['Under ₹999', '₹1,000 - ₹2,000', '₹2,000+ Luxury'].map((b) => (
                <button
                  type="button"
                  key={b}
                  onClick={() => setBudget(b)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition text-center ${
                    budget === b
                      ? 'border-gold-500 bg-gold-50 text-gold-900 shadow-sm'
                      : 'border-gold-200 bg-white text-espresso/70 hover:border-gold-300'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Custom Notes & Sizing */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-bold text-espresso/80 mb-2">
              Describe your idea / wrist measurements / special requests:
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g., I want a dual-layered bracelet with initial 'S' and light pink rose quartz beads for wrist size 6.5 inches..."
              className="w-full p-3.5 rounded-2xl border border-gold-300 bg-ivory-50 text-xs text-espresso focus:outline-none focus:ring-1 focus:ring-gold-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-4 px-5 sm:px-6 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] sm:text-xs uppercase tracking-[0.12em] sm:tracking-widest font-bold shadow-md flex items-center justify-center gap-2 text-center transition"
          >
            <MessageCircle className="w-4 h-4 flex-shrink-0" />
            <span>Send Custom Request on WhatsApp</span>
          </button>

          <p className="text-[11px] text-espresso/50 text-center">
            You will be redirected to WhatsApp where you can also send reference photos directly to the artisan.
          </p>
        </form>
      </div>

    </div>
  );
}
