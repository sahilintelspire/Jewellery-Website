import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
  Sparkles,
  User,
  Package,
  MapPin,
  LogOut,
  ChevronDown,
  LogIn,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import SearchModal from './SearchModal';

export default function Navbar() {
  const { cartCount, wishlist, setIsCartOpen } = useCart();
  const { user, isAuthenticated, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const location = useLocation();
  const dropdownRef = useRef(null);

  const navLinks = [
    { name: 'Collections', path: '/collections' },
    { name: 'Custom Studio', path: '/custom-order' },
    { name: 'Our Story', path: '/our-story' },
    { name: 'Contact', path: '/contact' },
  ];

  // Close account dropdown on outside click or route navigation
  useEffect(() => {
    setAccountMenuOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'Account';
  const initials = (user?.name || 'A')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-gradient-to-r from-gold-700 via-gold-500 to-gold-700 text-white text-[10px] sm:text-xs tracking-[0.06em] sm:tracking-[0.2em] uppercase font-semibold py-1.5 sm:py-2 px-3 sm:px-4 text-center relative z-50 shadow-sm flex items-center justify-center gap-1.5 sm:gap-2 leading-snug">
        <Sparkles className="w-3.5 h-3.5 animate-pulse text-gold-200 hidden sm:inline" />
        <span>
          Free Velvet Gift Box Above ₹999 • Code <strong className="underline">AURA10</strong> for 10% Off
        </span>
        <Sparkles className="w-3.5 h-3.5 animate-pulse text-gold-200 hidden sm:inline" />
      </div>

      {/* 2. MAIN LUXURY NAVBAR */}
      <nav className="sticky top-0 z-40 bg-ivory-100/95 backdrop-blur-md border-b border-gold-300/40 px-3 sm:px-6 lg:px-16 py-3 sm:py-3.5 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand Logo: AURA Atelier */}
          <Link to="/" className="flex items-baseline gap-1.5 sm:gap-2 group flex-shrink-0">
            <span className="font-serif-lux text-2xl sm:text-3xl lg:text-4xl font-bold tracking-[0.16em] sm:tracking-[0.25em] gold-metallic-text group-hover:brightness-110 transition uppercase">
              AURA
            </span>
            <span className="text-[9px] sm:text-[10px] tracking-[0.25em] sm:tracking-[0.3em] uppercase text-gold-700 font-semibold hidden sm:inline">
              Atelier
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8 text-[12px] uppercase tracking-[0.18em] font-medium text-espresso/80">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`hover:text-gold-700 transition-colors relative py-1 ${
                    isActive ? 'text-gold-700 font-bold' : ''
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.span
                      layoutId="navUnderline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold-500 rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Actions: Search, Account/Auth, Wishlist, Bag */}
          <div className="flex items-center gap-1 sm:gap-3">
            
            {/* Instant Search Button */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="p-2 sm:p-2.5 rounded-full hover:bg-gold-50 text-espresso hover:text-gold-700 transition"
              title="Search Jewellery"
              aria-label="Search Jewellery"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Auth / Profile Dropdown */}
            {!isAuthenticated ? (
              <Link
                to="/auth"
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/90 hover:bg-gold-50 text-espresso border border-gold-300/70 text-[11px] font-bold uppercase tracking-wider transition shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5 text-gold-600" />
                <span>Sign In</span>
              </Link>
            ) : (
              <div className="relative hidden sm:block" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen((o) => !o)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 hover:bg-gold-50 border border-gold-300/80 shadow-sm transition text-xs font-bold text-espresso"
                >
                  <span className="w-6 h-6 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {initials}
                  </span>
                  <span className="max-w-[85px] truncate">{firstName}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-espresso/60" />
                </button>

                <AnimatePresence>
                  {accountMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-gold-200 shadow-2xl p-2 z-50 text-xs"
                    >
                      <div className="px-3 py-2 border-b border-gold-100 mb-1">
                        <p className="font-bold text-espresso truncate">{user?.name}</p>
                        <p className="text-[10px] text-espresso/55 truncate">{user?.email}</p>
                      </div>

                      <Link
                        to="/account?tab=orders"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-ivory-100 text-espresso font-medium transition"
                      >
                        <Package className="w-3.5 h-3.5 text-gold-600" />
                        <span>My Orders & Tracking</span>
                      </Link>
                      <Link
                        to="/account?tab=addresses"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-ivory-100 text-espresso font-medium transition"
                      >
                        <MapPin className="w-3.5 h-3.5 text-gold-600" />
                        <span>Saved Addresses</span>
                      </Link>
                      <Link
                        to="/account?tab=profile"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-ivory-100 text-espresso font-medium transition"
                      >
                        <User className="w-3.5 h-3.5 text-gold-600" />
                        <span>Profile Settings</span>
                      </Link>
                      <Link
                        to="/wishlist"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-ivory-100 text-espresso font-medium transition"
                      >
                        <Heart className="w-3.5 h-3.5 text-rosequartz-500" />
                        <span>Saved Wishlist ({wishlist.length})</span>
                      </Link>

                      <button
                        type="button"
                        onClick={logout}
                        className="w-full mt-1 pt-2 border-t border-gold-100 flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-50 text-red-600 font-semibold transition"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="p-2 sm:p-2.5 rounded-full hover:bg-gold-50 text-espresso hover:text-rosequartz-500 transition relative"
              title="My Wishlist"
              aria-label="My Wishlist"
            >
              <Heart
                className={`w-5 h-5 ${
                  wishlist.length > 0 ? 'fill-rosequartz-400 text-rosequartz-500' : ''
                }`}
              />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 bg-rosequartz-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-ivory-100 shadow-sm">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Shopping Bag Button (Opens Drawer) */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full btn-gold-mockup text-xs uppercase tracking-wider font-bold transition group"
            >
              <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Bag</span>
              <span className="px-1.5 py-0.2 bg-white text-gold-800 rounded-full text-[10px] font-bold">
                {cartCount}
              </span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full hover:bg-gold-50 text-espresso"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden mt-3 pt-3 border-t border-gold-300/40 flex flex-col gap-2 pb-3 text-xs uppercase tracking-widest font-medium overflow-hidden"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 hover:bg-gold-50 rounded-xl text-espresso"
                >
                  {link.name}
                </Link>
              ))}

              <div className="border-t border-gold-200/70 pt-2 mt-1 flex flex-col gap-2">
                {!isAuthenticated ? (
                  <Link
                    to="/auth"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 px-3 rounded-xl bg-gold-50 text-gold-900 font-bold flex items-center gap-2"
                  >
                    <LogIn className="w-4 h-4 text-gold-600" />
                    <span>Sign In / Register</span>
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/account?tab=orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 px-3 rounded-xl bg-gold-50 text-gold-900 font-bold flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-gold-600" />
                      <span>{firstName}'s Account & Orders</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="py-2 px-3 text-left text-red-600 font-bold flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Instant Global Search Overlay */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
