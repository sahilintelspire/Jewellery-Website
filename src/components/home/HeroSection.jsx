import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle, Sparkles, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import Hero3DCanvas from './Hero3DCanvas';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';

export default function HeroSection() {
  const { addToCart } = useCart();
  const { products, settings } = useStore();
  const featuredCards = products.filter((p) => p.featuredInMockup || p.isFeatured);

  // Motion Sites: View Mode Switcher ('showcase' vs 'process') - Exact match to demo video!
  const [viewMode, setViewMode] = useState('showcase'); // 'showcase' | 'process'
  const [activeStep, setActiveStep] = useState(0);

  const craftSteps = [
    {
      num: "01",
      title: "Hand-Graded Healing Crystals",
      desc: "Authentic Rose Quartz & Raw Amethyst stones are individually inspected under magnifying loupes for natural crystalline purity, rosy tint, and vibrational harmony.",
      tag: "Mineral Sourcing",
    },
    {
      num: "02",
      title: "Artisanal Silk Knotting",
      desc: "Each 8mm crystal sphere is hand-threaded onto quadruple-ply Japanese tensile cord with 18K gold-plated engraved separator rondelles, ensuring lifetime durability.",
      tag: "Hand Assembly",
    },
    {
      num: "03",
      title: "Botanical Resin Flower Cast",
      desc: "Real miniature daisy and baby's breath blooms are carefully dried petal-by-petal, then suspended in crystal-clarity UV-cured domed resin medallion charms.",
      tag: "Preserved Art",
    },
    {
      num: "04",
      title: "Velvet Keepsake Curation",
      desc: "Every finished heirloom is polished with microfiber, blessed with artisanal love, and cushioned inside a custom gold-embossed velvet keepsake box.",
      tag: "Ready To Gift",
    },
  ];

  return (
    <section className="relative min-h-[calc(100vh-80px)] lg:min-h-[94vh] flex flex-col justify-between pt-4 sm:pt-6 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-16 overflow-hidden silk-mesh-bg transition-colors duration-700">
      
      {/* 1. TOP MOTION SITES PILL SWITCHER (Matching the Demo Video from Instagram!) */}
      <div className="flex items-center justify-center pt-1 z-30">
        <div className="inline-flex p-1 sm:p-1.5 rounded-full bg-white/85 backdrop-blur-xl border border-gold-400/50 shadow-md max-w-full">
          <button
            onClick={() => setViewMode('showcase')}
            className={`px-3.5 sm:px-6 py-2 rounded-full text-[10px] sm:text-xs uppercase tracking-[0.1em] sm:tracking-[0.2em] font-bold transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
              viewMode === 'showcase'
                ? 'btn-gold-mockup'
                : 'text-espresso/70 hover:text-espresso'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
            <span>3D Atelier</span>
          </button>

          <button
            onClick={() => setViewMode('process')}
            className={`px-3.5 sm:px-6 py-2 rounded-full text-[10px] sm:text-xs uppercase tracking-[0.1em] sm:tracking-[0.2em] font-bold transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
              viewMode === 'process'
                ? 'bg-espresso text-white shadow-md'
                : 'text-espresso/70 hover:text-espresso'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <span>The Craft Process</span>
          </button>
        </div>
      </div>

      {/* 2. DYNAMIC CONTENT: SHOWCASE MODE vs PROCESS STORY MODE */}
      {viewMode === 'showcase' ? (
        /* MODE A: 3D ATELIER SHOWCASE */
        <div className="max-w-4xl mx-auto text-center space-y-3 sm:space-y-4 pt-3 sm:pt-4 z-20 transition-all duration-500">
          <h1 className="font-serif-lux text-4xl sm:text-6xl lg:text-[76px] font-bold tracking-tight text-espresso leading-[1.08]">
            {settings.hero_title || 'Elegance Handcrafted For You'}
          </h1>

          <p className="text-espresso/75 text-xs sm:text-base max-w-2xl mx-auto font-light leading-relaxed px-2 sm:px-0">
            {settings.hero_subtitle ||
              'Each piece thoughtfully sculpted by hand with authentic crystals, pearls, and artisanal love.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-1">
            <Link
              to="/collections"
              className="w-full sm:w-auto px-9 py-3.5 rounded-full btn-gold-mockup text-xs uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-2"
            >
              <span>{settings.hero_cta_text || 'Explore Collection'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href={`https://wa.me/${(settings.whatsapp_number || '918780125711').replace(/[^0-9]/g, '')}?text=Hi!%20I%20saw%20your%20gorgeous%20handmade%20jewellery%20and%20want%20to%20place%20a%20custom%20order!`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-7 py-3 rounded-full btn-whatsapp-mockup text-xs uppercase tracking-[0.16em] font-bold flex items-center justify-center gap-2.5"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                <MessageCircle className="w-3.5 h-3.5" />
              </div>
              <span>Custom Order on WhatsApp</span>
            </a>
          </div>
        </div>
      ) : (
        /* MODE B: INTERACTIVE CRAFT PROCESS STORY (Like the Video "From seed to bottle" -> "From raw crystal to heirloom") */
        <div className="max-w-3xl mx-auto text-center space-y-3 pt-3 z-20 transition-all duration-500">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-900 text-[11px] uppercase tracking-widest font-bold">
            <span>Step {craftSteps[activeStep].num} of 04</span>
            <span>•</span>
            <span>{craftSteps[activeStep].tag}</span>
          </div>

          <h2 className="font-serif-lux text-3xl sm:text-5xl font-bold text-espresso">
            {craftSteps[activeStep].title}
          </h2>

          <p className="text-espresso/80 text-xs sm:text-sm font-light max-w-xl mx-auto leading-relaxed">
            {craftSteps[activeStep].desc}
          </p>

          {/* Step Navigators */}
          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
              disabled={activeStep === 0}
              className={`p-2 rounded-full border border-gold-300 text-espresso transition ${
                activeStep === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-serif-lux font-bold text-gold-700 tracking-widest">
              {activeStep + 1} / {craftSteps.length}
            </span>

            <button
              onClick={() => setActiveStep(Math.min(craftSteps.length - 1, activeStep + 1))}
              disabled={activeStep === craftSteps.length - 1}
              className={`p-2 rounded-full border border-gold-300 text-espresso transition ${
                activeStep === craftSteps.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. CENTERPIECE: 100% REAL 3D INTERACTIVE THREE.JS BRACELET */}
      <div className="relative my-2 z-10 flex items-center justify-center">
        <Hero3DCanvas activeStep={activeStep} currentView={viewMode} />
      </div>

      {/* 4. BOTTOM INTERACTION SECTION: (Preview Cards OR Craft Timeline Slider) */}
      <div className="max-w-5xl mx-auto w-full z-20">
        {viewMode === 'showcase' ? (
          /* Preview Cards in Showcase Mode */
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {featuredCards.map((item) => (
              <div
                key={item.id}
                className="glass-card-mockup p-3.5 rounded-2xl flex items-center gap-3.5 transition-all duration-300 hover:-translate-y-1 group"
              >
                <Link
                  to={`/product/${item.id}`}
                  className="w-16 h-16 rounded-xl overflow-hidden bg-ivory-200 flex-shrink-0 border border-gold-300/50 block"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.id}`}>
                    <h4 className="font-serif-lux text-sm font-bold text-espresso truncate group-hover:text-gold-700 transition">
                      {item.shortName}
                    </h4>
                  </Link>
                  <p className="text-xs font-bold text-gold-700 mt-0.5">
                    ₹{item.price.toLocaleString('en-IN')}
                  </p>
                </div>

                <button
                  onClick={() => addToCart(item)}
                  className="px-3.5 py-1.5 rounded-full btn-quick-add text-[10px] uppercase tracking-wider shadow-sm flex-shrink-0"
                  title="Quick Add to Bag"
                >
                  Quick Add
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* Interactive Timeline Slider in Process Mode (Exact match to video timeline!) */
          <div className="p-4 sm:p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-gold-300 shadow-luxury">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {craftSteps.map((step, idx) => (
                <button
                  key={step.num}
                  onClick={() => setActiveStep(idx)}
                  className={`p-3 rounded-2xl text-left border transition-all ${
                    activeStep === idx
                      ? 'border-gold-500 bg-gold-50 shadow-sm'
                      : 'border-gold-200/60 bg-white/60 hover:bg-white text-espresso/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-serif-lux text-base font-bold text-gold-700">{step.num}</span>
                    {activeStep === idx && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                  <h5 className="font-serif-lux text-xs font-bold text-espresso truncate">
                    {step.title}
                  </h5>
                  <p className="text-[10px] text-espresso/50 uppercase tracking-wider mt-0.5 font-medium">
                    {step.tag}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

    </section>
  );
}
