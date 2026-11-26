import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Truck, RefreshCw, MessageCircle, Instagram } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function Footer() {
  const { settings } = useStore();
  const waNum = (settings.whatsapp_number || '918780125711').replace(/[^0-9]/g, '');

  return (
    <footer className="bg-ivory-200/60 border-t border-gold-300/40 pt-12 sm:pt-16 pb-20 sm:pb-10 px-4 sm:px-6 lg:px-16 text-espresso">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-10 sm:mb-12">
        
        {/* Col 1: Brand Info */}
        <div className="space-y-4">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="font-serif-lux text-3xl font-bold tracking-[0.25em] text-espresso uppercase">
              AURA
            </span>
            <span className="text-[10px] tracking-[0.3em] uppercase text-gold-600 font-medium">
              Atelier
            </span>
          </Link>
          <p className="text-xs text-espresso/70 leading-relaxed font-light">
            Sculpting timeless handmade fashion jewellery, preserved botanical resin souvenirs, and heartfelt personalized gifts. Every piece is hand-tied with devotion and authentic minerals.
          </p>
          <div className="flex items-center gap-3 pt-2 text-gold-700">
            <a
              href={`https://wa.me/${waNum}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white border border-gold-300 hover:bg-gold-50 transition"
              title="Chat on WhatsApp"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
            </a>
            <a
              href={settings.instagram_url || 'https://instagram.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white border border-gold-300 hover:bg-gold-50 transition"
              title="Instagram"
            >
              <Instagram className="w-4 h-4 text-rosequartz-500" />
            </a>
          </div>
        </div>

        {/* Col 2: Handcrafted Collections */}
        <div>
          <h4 className="font-serif-lux text-base font-bold uppercase tracking-wider text-espresso mb-4">
            Collections
          </h4>
          <ul className="space-y-2.5 text-xs text-espresso/70 font-light">
            <li>
              <Link to="/collections?category=bracelets" className="hover:text-gold-700 transition">
                Natural Rose Quartz Beads
              </Link>
            </li>
            <li>
              <Link to="/collections?category=resin" className="hover:text-gold-700 transition">
                Pressed Flower Botanical Resin
              </Link>
            </li>
            <li>
              <Link to="/collections?category=necklaces" className="hover:text-gold-700 transition">
                Baroque Freshwater Pearls
              </Link>
            </li>
            <li>
              <Link to="/collections?category=couple" className="hover:text-gold-700 transition">
                Bespoke Couple & Soulmate Bands
              </Link>
            </li>
            <li>
              <Link to="/custom-order" className="hover:text-gold-700 transition text-gold-700 font-medium">
                ✦ Custom Design Studio
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Customer Care Policies (Essential for Gateway Approval) */}
        <div>
          <h4 className="font-serif-lux text-base font-bold uppercase tracking-wider text-espresso mb-4">
            Customer Care
          </h4>
          <ul className="space-y-2.5 text-xs text-espresso/70 font-light">
            <li>
              <Link to="/account?tab=orders" className="hover:text-gold-700 transition font-medium text-gold-800">
                Track My Orders & Addresses
              </Link>
            </li>
            <li>
              <Link to="/wishlist" className="hover:text-gold-700 transition">
                Saved Wishlist
              </Link>
            </li>
            <li>
              <Link to="/shipping" className="hover:text-gold-700 transition">
                Shipping & Delivery Policy (3-5 Days)
              </Link>
            </li>
            <li>
              <Link to="/returns" className="hover:text-gold-700 transition">
                7-Day Replacement & Refund Guarantee
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-gold-700 transition">
                Handmade Jewellery Care Guide
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-gold-700 transition">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-gold-700 transition">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Artisan Studio Contact */}
        <div>
          <h4 className="font-serif-lux text-base font-bold uppercase tracking-wider text-espresso mb-4">
            Artisan Studio
          </h4>
          <div className="space-y-2 text-xs text-espresso/70 font-light leading-relaxed">
            <p>📍 Hand-sculpted with love in Gujarat, India</p>
            <p>📞 Phone & WhatsApp: +91 8780125711</p>
            <p>✉️ Email: support@aurajewels.in</p>
            <p className="text-[11px] text-espresso/50 pt-1">
              Studio Timings: Mon - Sat, 10:00 AM - 7:00 PM IST
            </p>
          </div>
        </div>

      </div>

      {/* Bottom Copyright & Security Line */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-gold-300/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-espresso/60">
        <p>© 2026 AURA JEWELS. Handcrafted with authentic love.</p>
        <div className="flex items-center gap-4 text-[11px] font-medium text-espresso/70">
          <span>100% Secure Checkout</span>
          <span>•</span>
          <span>Razorpay Verified</span>
          <span>•</span>
          <span>COD Available</span>
        </div>
      </div>
    </footer>
  );
}
