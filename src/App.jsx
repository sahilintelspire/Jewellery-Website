import React, { useEffect, useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Sparkles, CheckCircle2, X } from 'lucide-react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/cart/CartDrawer';
import ProtectedRoute from './components/auth/ProtectedRoute';
import HomePage from './pages/HomePage';
import CollectionsPage from './pages/CollectionsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CustomOrderPage from './pages/CustomOrderPage';
import OurStoryPage from './pages/OurStoryPage';
import ContactPage from './pages/ContactPage';
import WishlistPage from './pages/WishlistPage';
import AuthPage from './pages/AuthPage';
import CheckoutPage from './pages/CheckoutPage';
import AccountPage from './pages/AccountPage';
import NotFoundPage from './pages/NotFoundPage';
import { ShippingPolicy, ReturnsPolicy, TermsPage, PrivacyPolicy } from './pages/PolicyPages';
import { useAuth } from './context/AuthContext';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Luxury Animated Floating Toast
function ToastBanner() {
  const { toast, dismissToast } = useAuth();

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 360, damping: 28 }}
          className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-[60] max-w-md w-[92%] sm:w-auto"
        >
          <div className="px-5 py-3.5 rounded-full bg-espresso/95 backdrop-blur-md text-white border border-gold-400/50 shadow-2xl flex items-center gap-3 text-xs font-semibold">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-gold-400 flex-shrink-0" />
            )}
            <span className="flex-1">{toast.message}</span>
            <button
              type="button"
              onClick={dismissToast}
              className="p-0.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const cursorRef = useRef(null);

  // Zero-rerender GPU-accelerated spotlight tracking via rAF
  useEffect(() => {
    let rafId = null;
    let mx = -400;
    let my = -400;

    const update = () => {
      rafId = null;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${mx - 190}px, ${my - 190}px, 0)`;
      }
    };

    const handleMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (!rafId) {
        rafId = requestAnimationFrame(update);
      }
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-ivory-100 text-espresso relative selection:bg-gold-500 selection:text-white overflow-x-hidden">
      <ScrollToTop />

      {/* MOTION SITES: AMBIENT LUXURY CURSOR GLOW SPOTLIGHT (Zero Re-renders) */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-30 opacity-45 hidden md:block will-change-transform"
        style={{
          width: '380px',
          height: '380px',
          background:
            'radial-gradient(circle, rgba(212, 175, 55, 0.28) 0%, rgba(247, 218, 213, 0.16) 45%, transparent 72%)',
          transform: 'translate3d(-400px, -400px, 0)',
        }}
      />

      {/* Top Navbar */}
      <Navbar />

      {/* Slide-over Cart Drawer */}
      <CartDrawer />

      {/* Main Pages Router */}
      <main className="flex-1 relative z-10">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/custom-order" element={<CustomOrderPage />} />
          <Route path="/our-story" element={<OurStoryPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* Protected E-Commerce Routes */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute reason="Sign in or create an account to save your delivery address and complete checkout.">
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute reason="Sign in to view your orders, saved addresses, and profile.">
                <AccountPage />
              </ProtectedRoute>
            }
          />

          {/* Policy Pages */}
          <Route path="/shipping" element={<ShippingPolicy />} />
          <Route path="/returns" element={<ReturnsPolicy />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />

          {/* Catch-all 404 Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Toast Notifications */}
      <ToastBanner />

      {/* Floating WhatsApp Action Pill (Bottom Right) */}
      <a
        href="https://wa.me/918780125711?text=Hi!%20I%20have%20a%20question%20about%20your%20handmade%20jewellery!"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-2xl flex items-center gap-2 hover:scale-105 transition-all duration-300 border border-emerald-400/40"
        title="Chat with the Artisan on WhatsApp"
      >
        <MessageCircle className="w-5 h-5 fill-white/10" />
        <span className="hidden sm:inline">WhatsApp Help</span>
      </a>

      {/* Footer */}
      <Footer />
    </div>
  );
}
