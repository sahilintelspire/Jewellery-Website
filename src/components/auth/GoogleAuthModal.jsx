import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, ArrowRight, Plus, UserCheck } from 'lucide-react';

const PRESET_GOOGLE_ACCOUNTS = [
  { name: 'Priya Patel', email: 'priya.patel@gmail.com', initials: 'P', color: 'from-rosequartz-400 to-rosequartz-500' },
  { name: 'Sahil Memon', email: 'sahil.memon@gmail.com', initials: 'S', color: 'from-gold-500 to-gold-700' },
];

export default function GoogleAuthModal({ isOpen, onClose, onSelectAccount }) {
  const [customMode, setCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!customEmail.trim().includes('@') || !customEmail.trim().includes('.')) {
      return setError('Please enter a valid Google / Gmail email address.');
    }
    if (customName.trim().length < 2) {
      return setError('Please enter your full name.');
    }
    onSelectAccount({ name: customName.trim(), email: customEmail.trim() });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-espresso/60"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 14 }}
          transition={{ duration: 0.22 }}
          className="relative z-10 w-full max-w-md rounded-3xl bg-white border border-gold-300 shadow-2xl overflow-hidden"
        >
          {/* Google Header */}
          <div className="px-6 py-4 border-b border-gold-200 bg-ivory-50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {/* Official Google Multi-Color G SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              <span className="text-xs font-bold text-espresso tracking-wide">
                Sign in with Google
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gold-100 text-espresso/60 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="text-center space-y-1">
              <h3 className="font-serif-lux text-2xl font-bold text-espresso">
                Choose an Account
              </h3>
              <p className="text-xs text-espresso/60">
                to continue to <strong className="text-gold-800">AURA JEWELS Atelier</strong>
              </p>
            </div>

            {!customMode ? (
              <div className="space-y-2.5 pt-2">
                {PRESET_GOOGLE_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => onSelectAccount(acc)}
                    className="w-full p-3.5 rounded-2xl border border-gold-200 hover:border-gold-500 hover:bg-ivory-50 flex items-center gap-3.5 text-left transition group"
                  >
                    <span
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${acc.color} text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-sm`}
                    >
                      {acc.initials}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-espresso group-hover:text-gold-800 truncate">
                        {acc.name}
                      </p>
                      <p className="text-[11px] text-espresso/60 truncate">{acc.email}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gold-600 opacity-0 group-hover:opacity-100 transition" />
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCustomMode(true)}
                  className="w-full p-3.5 rounded-2xl border border-dashed border-gold-300 hover:border-gold-500 hover:bg-gold-50/50 flex items-center gap-3 text-xs font-bold text-espresso transition"
                >
                  <span className="w-9 h-9 rounded-full bg-ivory-200 flex items-center justify-center text-gold-700">
                    <Plus className="w-4 h-4" />
                  </span>
                  <span>Use another Google / Gmail account</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleCustomSubmit} className="space-y-3.5 pt-1">
                {error && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-xl font-medium">
                    {error}
                  </p>
                )}

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-espresso/75 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g., Riya Verma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gold-300 bg-ivory-50 text-xs text-espresso focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-espresso/75 mb-1">
                    Gmail / Google Email
                  </label>
                  <input
                    type="email"
                    required
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="riya@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gold-300 bg-ivory-50 text-xs text-espresso focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div className="flex gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setCustomMode(false)}
                    className="px-4 py-2.5 rounded-full border border-gold-300 text-xs font-bold text-espresso/70 hover:bg-ivory-100"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-full glass-gold-btn text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Continue with Google</span>
                  </button>
                </div>
              </form>
            )}

            <p className="text-[10px] text-center text-espresso/50 pt-2 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Instant Frontend Sign-In • Connect Google OAuth Client ID for live backend</span>
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
