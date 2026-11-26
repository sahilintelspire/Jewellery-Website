import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Gift,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import Auth3DCanvas from '../components/auth/Auth3DCanvas';
import GoogleAuthModal from '../components/auth/GoogleAuthModal';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const { login, register, loginWithGoogle, resetPassword, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state?.from || '/account';
  const redirectReason = location.state?.reason || '';

  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [focusedField, setFocusedField] = useState('none');
  const [showPassword, setShowPassword] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [googleOpen, setGoogleOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [shakeKey, setShakeKey] = useState(0);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // If already logged in and visiting /auth directly, redirect cleanly
  useEffect(() => {
    if (isAuthenticated && !authSuccess) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, authSuccess, navigate, redirectTo]);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setErrorMsg('');
    setSuccessMsg('');
    setFocusedField('none');
  };

  const triggerError = (msg) => {
    setErrorMsg(msg);
    setShakeKey((k) => k + 1);
  };

  const fireLuxuryConfetti = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#F3E5AB', '#F3DAD5', '#E91E63', '#FFFFFF'],
      });
    } catch {}
  };

  // Password strength helper
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-gold-200' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd) && /[0-9!@#$%^&*]/.test(pwd)) score++;
    if (score === 1) return { score: 1, label: 'Weak', color: 'bg-red-400' };
    if (score === 2) return { score: 2, label: 'Good', color: 'bg-amber-400' };
    return { score: 3, label: 'Strong Vault', color: 'bg-emerald-500' };
  };

  const pwdStrength = getPasswordStrength(password);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email.trim() || !password) {
      return triggerError('Please enter both your email and password.');
    }

    const res = login({ email, password });
    if (!res.ok) {
      return triggerError(res.error);
    }

    setAuthSuccess(true);
    fireLuxuryConfetti();
    setTimeout(() => {
      navigate(redirectTo, { replace: true });
    }, 950);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (name.trim().length < 2) {
      return triggerError('Please enter your full name.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return triggerError('Please enter a valid email address.');
    }
    if (phone.replace(/\D/g, '').length < 10) {
      return triggerError('Please enter a valid 10-digit Indian mobile number.');
    }
    if (password.length < 6) {
      return triggerError('Password must be at least 6 characters long.');
    }
    if (password !== confirmPassword) {
      return triggerError('Passwords do not match.');
    }

    const res = register({ name, email, phone, password });
    if (!res.ok) {
      return triggerError(res.error);
    }

    setAuthSuccess(true);
    fireLuxuryConfetti();
    setTimeout(() => {
      navigate(redirectTo, { replace: true });
    }, 1050);
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim()) {
      return triggerError('Please enter your registered email.');
    }
    if (password.length < 6) {
      return triggerError('New password must be at least 6 characters.');
    }

    const res = resetPassword({ email, newPassword: password });
    if (!res.ok) {
      return triggerError(res.error);
    }

    setSuccessMsg('Password reset successful! Switching to Sign In...');
    setTimeout(() => {
      setPassword('');
      switchMode('login');
    }, 1300);
  };

  const fillDemoCustomer = () => {
    setEmail('ananya@aurajewels.in');
    setPassword('Aura@2026');
    setErrorMsg('');
  };

  const handleGoogleSelect = (googleAcc) => {
    setGoogleOpen(false);
    const res = loginWithGoogle(googleAcc);
    if (!res.ok) {
      return triggerError(res.error);
    }
    setAuthSuccess(true);
    fireLuxuryConfetti();
    setTimeout(() => {
      navigate(redirectTo, { replace: true });
    }, 900);
  };

  const renderGoogleDividerAndButton = (label) => (
    <div className="space-y-3 pt-1">
      <div className="flex items-center gap-3 text-[11px] text-espresso/45 uppercase tracking-widest font-semibold">
        <div className="flex-1 h-px bg-gold-200/80" />
        <span>or</span>
        <div className="flex-1 h-px bg-gold-200/80" />
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.985 }}
        type="button"
        disabled={authSuccess}
        onClick={() => setGoogleOpen(true)}
        className="w-full py-3 rounded-full bg-white hover:bg-ivory-50 border border-gold-300 shadow-sm text-xs font-bold text-espresso flex items-center justify-center gap-2.5 transition"
      >
        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span>{label}</span>
      </motion.button>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-110px)] relative overflow-hidden silk-mesh-bg py-5 sm:py-12 px-3 sm:px-6 lg:px-16 flex items-center justify-center">
      {/* Lightweight Soft Luxury Background Glows (Zero heavy GPU blur recomposition) */}
      <div
        className="absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(243, 218, 213, 0.55) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute -bottom-24 -right-24 w-[30rem] h-[30rem] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(233, 214, 159, 0.45) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-10 items-center relative z-10">
        
        {/* LEFT COLUMN: 3D CRYSTAL SHOWCASE + MOTION STORYTELLING */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 relative rounded-[1.75rem] sm:rounded-[2rem] p-4 sm:p-8 bg-white/90 border border-gold-300/40 shadow-luxury overflow-hidden flex flex-col justify-between"
        >
          {/* Top Brand Tag */}
          <div className="flex items-center justify-between gap-2 z-20">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:py-1.5 rounded-full bg-white/90 border border-gold-300/60 shadow-sm text-[10px] sm:text-[11px] uppercase tracking-[0.12em] sm:tracking-[0.2em] font-bold text-gold-800">
              <Sparkles className="w-3.5 h-3.5 text-gold-500 animate-pulse" />
              <span>Private Atelier Vault</span>
            </div>

            <Link
              to="/"
              className="text-[11px] sm:text-xs font-semibold text-espresso/60 hover:text-gold-700 flex items-center gap-1 transition flex-shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Boutique</span>
            </Link>
          </div>

          {/* 3D Interactive Crystal Heart & Orbital Gold Rings Canvas */}
          <div className="my-1 sm:my-2 relative">
            <Auth3DCanvas
              mode={mode}
              focusedField={focusedField}
              authSuccess={authSuccess}
            />
          </div>

          {/* Floating Motion Editorial Footer & Feature Chips */}
          <div className="space-y-3 sm:space-y-4 z-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-center space-y-1"
              >
                <h2 className="font-serif-lux text-xl sm:text-3xl font-bold text-espresso">
                  {mode === 'login' && 'Welcome Back To Timeless Elegance'}
                  {mode === 'register' && 'Craft Your Bespoke Atelier Profile'}
                  {mode === 'forgot' && 'Restore Access To Your Vault'}
                </h2>
                <p className="text-[11px] sm:text-xs text-espresso/65 font-light max-w-md mx-auto">
                  {mode === 'login' &&
                    'Access saved delivery addresses, track handcrafted orders live, and enjoy 1-click checkout.'}
                  {mode === 'register' &&
                    'Join AURA Atelier to save multiple addresses, unlock welcome coupon AURA10, and order custom pieces.'}
                  {mode === 'forgot' &&
                    'Set a fresh password in seconds to regain full access to your jewellery orders and wishlist.'}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="hidden sm:grid grid-cols-3 gap-2.5 pt-2">
              {[
                { icon: ShieldCheck, label: 'Verified Buyer Protection' },
                { icon: Gift, label: 'Free Velvet Gift Box' },
                { icon: Sparkles, label: 'Code: AURA10 (10% Off)' },
              ].map((perk, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -2 }}
                  className="p-2.5 rounded-2xl bg-white/85 border border-gold-200/80 text-center shadow-sm"
                >
                  <perk.icon className="w-4 h-4 text-gold-600 mx-auto mb-1" />
                  <p className="text-[10px] font-bold text-espresso/80 leading-tight">
                    {perk.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: ANIMATED GLASSMORPHIC AUTH CARD */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
          className="lg:col-span-6 max-w-xl w-full mx-auto"
        >
          <div className="bg-white/95 rounded-[1.75rem] sm:rounded-[2rem] p-5 sm:p-10 border border-gold-300/70 shadow-luxury relative overflow-hidden">
            
            {/* Redirect Notice Banner if triggered from Buy / Checkout */}
            {redirectReason && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3.5 rounded-2xl bg-gradient-to-r from-rosequartz-50 via-gold-50 to-ivory-100 border border-gold-300/80 flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-gold-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-espresso">Sign In Required To Buy</p>
                  <p className="text-[11px] text-espresso/70">{redirectReason}</p>
                </div>
              </motion.div>
            )}

            {/* Animated Pill Mode Switcher */}
            {mode !== 'forgot' && (
              <div className="grid grid-cols-2 p-1.5 rounded-full bg-ivory-200/80 border border-gold-300/50 mb-7 relative">
                {[
                  { id: 'login', label: 'Sign In' },
                  { id: 'register', label: 'Create Account' },
                ].map((tab) => {
                  const active = mode === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => switchMode(tab.id)}
                      className={`relative py-2.5 rounded-full text-[11px] sm:text-xs uppercase tracking-[0.12em] sm:tracking-[0.18em] font-bold transition-colors z-10 ${
                        active ? 'text-white' : 'text-espresso/70 hover:text-espresso'
                      }`}
                    >
                      {active && (
                        <motion.div
                          layoutId="authModePill"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          className="absolute inset-0 rounded-full btn-gold-mockup -z-10"
                        />
                      )}
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Error & Success Messages */}
            <AnimatePresence mode="wait">
              {errorMsg && (
                <motion.div
                  key={`err-${shakeKey}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: [0, -6, 6, -4, 4, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}

              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Animated Auth Form Switching */}
            <AnimatePresence mode="wait">
              {mode === 'login' && (
                <motion.form
                  key="login-form"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  onSubmit={handleLoginSubmit}
                  className="space-y-4"
                >
                  <div className="space-y-1 mb-4">
                    <h1 className="font-serif-lux text-3xl sm:text-4xl font-bold text-espresso">
                      Sign In
                    </h1>
                    <p className="text-xs text-espresso/60">
                      Enter your credentials to unlock checkout & order tracking.
                    </p>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-espresso/75 mb-1.5">
                      Email Address
                    </label>
                    <div
                      className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border bg-ivory-50 transition-all ${
                        focusedField === 'email'
                          ? 'border-gold-500 ring-2 ring-gold-300/40 bg-white'
                          : 'border-gold-200'
                      }`}
                    >
                      <Mail className="w-4 h-4 text-gold-600 flex-shrink-0" />
                      <input
                        type="email"
                        required
                        value={email}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField('none')}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full text-xs text-espresso bg-transparent focus:outline-none placeholder:text-espresso/35"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] uppercase tracking-wider font-bold text-espresso/75">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => switchMode('forgot')}
                        className="text-[11px] font-semibold text-gold-700 hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div
                      className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border bg-ivory-50 transition-all ${
                        focusedField === 'password'
                          ? 'border-gold-500 ring-2 ring-gold-300/40 bg-white'
                          : 'border-gold-200'
                      }`}
                    >
                      <Lock className="w-4 h-4 text-gold-600 flex-shrink-0" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField('none')}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-xs text-espresso bg-transparent focus:outline-none placeholder:text-espresso/35"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-espresso/45 hover:text-espresso transition"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={authSuccess}
                    className="w-full py-4 px-5 mt-2 rounded-full glass-gold-btn text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold shadow-luxury flex items-center justify-center gap-2"
                  >
                    <span>{authSuccess ? 'Entering Atelier...' : 'Sign In & Continue'}</span>
                    <ArrowRight className="w-4 h-4 flex-shrink-0" />
                  </motion.button>

                  {renderGoogleDividerAndButton('Continue with Google')}

                  {/* Demo Quick Fill Helper */}
                  <div className="pt-4 border-t border-gold-200/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
                    <span className="text-espresso/60">Want to preview right away?</span>
                    <button
                      type="button"
                      onClick={fillDemoCustomer}
                      className="px-3.5 py-1.5 rounded-full bg-gold-50 hover:bg-gold-100 border border-gold-300 text-gold-800 font-bold transition"
                    >
                      ✦ Auto-Fill Demo Account
                    </button>
                  </div>
                </motion.form>
              )}

              {mode === 'register' && (
                <motion.form
                  key="register-form"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  onSubmit={handleRegisterSubmit}
                  className="space-y-3.5"
                >
                  <div className="space-y-1 mb-3">
                    <h1 className="font-serif-lux text-3xl sm:text-4xl font-bold text-espresso">
                      Create Account
                    </h1>
                    <p className="text-xs text-espresso/60">
                      Save your shipping addresses, track artisan crafting & get ₹200 welcome perks.
                    </p>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-espresso/75 mb-1">
                      Full Name
                    </label>
                    <div
                      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border bg-ivory-50 transition-all ${
                        focusedField === 'name'
                          ? 'border-gold-500 ring-2 ring-gold-300/40 bg-white'
                          : 'border-gold-200'
                      }`}
                    >
                      <User className="w-4 h-4 text-gold-600 flex-shrink-0" />
                      <input
                        type="text"
                        required
                        value={name}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField('none')}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Priya Patel"
                        className="w-full text-xs text-espresso bg-transparent focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Email + Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-bold text-espresso/75 mb-1">
                        Email
                      </label>
                      <div
                        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border bg-ivory-50 transition-all ${
                          focusedField === 'email'
                            ? 'border-gold-500 ring-2 ring-gold-300/40 bg-white'
                            : 'border-gold-200'
                        }`}
                      >
                        <Mail className="w-4 h-4 text-gold-600 flex-shrink-0" />
                        <input
                          type="email"
                          required
                          value={email}
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField('none')}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="priya@example.com"
                          className="w-full text-xs text-espresso bg-transparent focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-bold text-espresso/75 mb-1">
                        Mobile (+91)
                      </label>
                      <div
                        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border bg-ivory-50 transition-all ${
                          focusedField === 'phone'
                            ? 'border-gold-500 ring-2 ring-gold-300/40 bg-white'
                            : 'border-gold-200'
                        }`}
                      >
                        <Phone className="w-4 h-4 text-gold-600 flex-shrink-0" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onFocus={() => setFocusedField('phone')}
                          onBlur={() => setFocusedField('none')}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="9876543210"
                          className="w-full text-xs text-espresso bg-transparent focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password + Strength Meter */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-espresso/75 mb-1">
                      Create Password
                    </label>
                    <div
                      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border bg-ivory-50 transition-all ${
                        focusedField === 'password'
                          ? 'border-gold-500 ring-2 ring-gold-300/40 bg-white'
                          : 'border-gold-200'
                      }`}
                    >
                      <Lock className="w-4 h-4 text-gold-600 flex-shrink-0" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField('none')}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        className="w-full text-xs text-espresso bg-transparent focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-espresso/45 hover:text-espresso transition"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {password && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1 flex gap-1">
                          {[1, 2, 3].map((lvl) => (
                            <div
                              key={lvl}
                              className={`h-1 flex-1 rounded-full transition-colors ${
                                pwdStrength.score >= lvl ? pwdStrength.color : 'bg-gold-200/60'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-espresso/60">
                          {pwdStrength.label}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-espresso/75 mb-1">
                      Confirm Password
                    </label>
                    <div
                      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border bg-ivory-50 transition-all ${
                        focusedField === 'password'
                          ? 'border-gold-500 ring-2 ring-gold-300/40 bg-white'
                          : 'border-gold-200'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 text-gold-600 flex-shrink-0" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField('none')}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full text-xs text-espresso bg-transparent focus:outline-none"
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={authSuccess}
                    className="w-full py-4 px-5 mt-2 rounded-full glass-gold-btn text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold shadow-luxury flex items-center justify-center gap-2"
                  >
                    <span>{authSuccess ? 'Creating Vault Profile...' : 'Create Account & Join'}</span>
                    <ArrowRight className="w-4 h-4 flex-shrink-0" />
                  </motion.button>

                  {renderGoogleDividerAndButton('Sign up with Google')}
                </motion.form>
              )}

              {mode === 'forgot' && (
                <motion.form
                  key="forgot-form"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.35 }}
                  onSubmit={handleForgotSubmit}
                  className="space-y-4"
                >
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="text-xs font-bold text-gold-700 hover:underline flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </button>

                  <div className="space-y-1">
                    <h1 className="font-serif-lux text-3xl font-bold text-espresso flex items-center gap-2">
                      <KeyRound className="w-6 h-6 text-gold-600" />
                      <span>Reset Password</span>
                    </h1>
                    <p className="text-xs text-espresso/60">
                      Enter your registered email and choose a fresh password.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-espresso/75 mb-1.5">
                      Registered Email
                    </label>
                    <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl border border-gold-200 bg-ivory-50 focus-within:border-gold-500 focus-within:bg-white">
                      <Mail className="w-4 h-4 text-gold-600 flex-shrink-0" />
                      <input
                        type="email"
                        required
                        value={email}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField('none')}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full text-xs text-espresso bg-transparent focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-espresso/75 mb-1.5">
                      New Password
                    </label>
                    <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl border border-gold-200 bg-ivory-50 focus-within:border-gold-500 focus-within:bg-white">
                      <Lock className="w-4 h-4 text-gold-600 flex-shrink-0" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField('none')}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        className="w-full text-xs text-espresso bg-transparent focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-full glass-gold-btn text-xs uppercase tracking-[0.2em] font-bold shadow-luxury"
                  >
                    Update Password
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

          </div>
        </motion.div>

      </div>

      <GoogleAuthModal
        isOpen={googleOpen}
        onClose={() => setGoogleOpen(false)}
        onSelectAccount={handleGoogleSelect}
      />
    </div>
  );
}
