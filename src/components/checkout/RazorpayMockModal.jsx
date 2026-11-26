import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Smartphone, CreditCard, Building2, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';

export default function RazorpayMockModal({
  isOpen,
  onClose,
  amount,
  userEmail,
  userPhone,
  onPaymentSuccess,
}) {
  const [tab, setTab] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [upiId, setUpiId] = useState(
    userEmail ? `${userEmail.split('@')[0]}@okaxis` : 'customer@okaxis'
  );
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePayNow = (e) => {
    e.preventDefault();
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      const methodLabel =
        tab === 'upi'
          ? `Razorpay UPI (${upiId || 'Instant UPI'})`
          : tab === 'card'
          ? 'Razorpay Card (Test Visa ••4242)'
          : `Razorpay Netbanking (${selectedBank})`;
      onPaymentSuccess(methodLabel);
    }, 1250);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Dark Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={!processing ? onClose : undefined}
          className="absolute inset-0 bg-espresso/70 backdrop-blur-sm"
        />

        {/* Payment Gateway Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="relative z-10 w-full max-w-md rounded-3xl bg-white border border-gold-300 shadow-2xl overflow-hidden"
        >
          {/* Razorpay-inspired Top Brand Header */}
          <div className="bg-gradient-to-r from-[#2C2724] via-[#3A312C] to-[#2C2724] text-white p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center font-serif-lux font-bold text-xl text-white shadow-md">
                A
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-serif-lux text-lg font-bold tracking-wider">AURA JEWELS</h4>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-[11px] text-ivory-300/80">
                  Razorpay Test Mode • {userPhone || userEmail}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-gold-300 block">Total Payable</span>
              <span className="text-xl font-bold text-white">₹{amount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={processing}
            className="absolute top-3 right-3 text-white/60 hover:text-white p-1"
            title="Close Payment"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Payment Method Tabs */}
          <div className="grid grid-cols-3 border-b border-gold-200 bg-ivory-50 text-xs font-bold">
            {[
              { id: 'upi', label: 'UPI / QR', icon: Smartphone },
              { id: 'card', label: 'Card', icon: CreditCard },
              { id: 'netbanking', label: 'Netbanking', icon: Building2 },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                disabled={processing}
                onClick={() => setTab(t.id)}
                className={`py-3 flex items-center justify-center gap-1.5 border-b-2 transition ${
                  tab === t.id
                    ? 'border-gold-600 text-gold-800 bg-white'
                    : 'border-transparent text-espresso/60 hover:text-espresso'
                }`}
              >
                <t.icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handlePayNow} className="p-6 space-y-5">
            {tab === 'upi' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-[11px] text-espresso/70">
                  <span className="font-bold uppercase tracking-wider">Instant UPI Apps</span>
                  <span className="text-emerald-700 font-semibold">0% Extra Fee</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {['Google Pay', 'PhonePe', 'Paytm'].map((app) => (
                    <button
                      key={app}
                      type="button"
                      onClick={() =>
                        setUpiId(
                          app === 'Google Pay'
                            ? 'ananya@okicici'
                            : app === 'PhonePe'
                            ? 'ananya@ybl'
                            : 'ananya@paytm'
                        )
                      }
                      className="py-2.5 px-2 rounded-xl border border-gold-200 hover:border-gold-500 bg-ivory-50 text-[11px] font-bold text-espresso transition"
                    >
                      {app}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-espresso/75 mb-1">
                    Or Enter UPI ID
                  </label>
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@okaxis"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gold-300 bg-ivory-50 text-xs text-espresso focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>
            )}

            {tab === 'card' && (
              <div className="space-y-3">
                <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl">
                  Sandbox Preview: Do not enter real cards. Test Visa details pre-filled.
                </p>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-espresso/75 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gold-300 bg-ivory-50 text-xs text-espresso focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-espresso/75 mb-1">
                      Expiry
                    </label>
                    <input
                      type="text"
                      defaultValue="12/28"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gold-300 bg-ivory-50 text-xs text-espresso focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-espresso/75 mb-1">
                      CVV
                    </label>
                    <input
                      type="password"
                      defaultValue="123"
                      maxLength={4}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gold-300 bg-ivory-50 text-xs text-espresso focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {tab === 'netbanking' && (
              <div className="space-y-3">
                <label className="block text-[11px] uppercase tracking-wider font-bold text-espresso/75">
                  Select Your Bank
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak Bank', 'Yes Bank'].map(
                    (bank) => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => setSelectedBank(bank)}
                        className={`p-3 rounded-xl border text-xs font-bold text-left flex items-center justify-between transition ${
                          selectedBank === bank
                            ? 'border-gold-500 bg-gold-50 text-gold-900'
                            : 'border-gold-200 bg-ivory-50 text-espresso/75 hover:border-gold-400'
                        }`}
                      >
                        <span>{bank}</span>
                        {selectedBank === bank && <CheckCircle2 className="w-3.5 h-3.5 text-gold-600" />}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={processing}
              className="w-full py-4 px-5 rounded-full glass-gold-btn text-xs uppercase tracking-[0.14em] sm:tracking-[0.18em] font-bold shadow-luxury flex items-center justify-center gap-2 disabled:opacity-75"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                  <span>Verifying Payment...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 flex-shrink-0" />
                  <span>Pay ₹{amount.toLocaleString('en-IN')} Securely</span>
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-espresso/50 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>256-Bit SSL Encrypted • Simulated Test Gateway</span>
            </p>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
