import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Lock,
  MessageCircle,
  Gift,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  MapPin,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    cartSubtotal,
    isFreeGiftUnlocked,
    giftProgress,
    freeGiftThreshold,
    giftNote,
    setGiftNote,
  } = useCart();

  const { isAuthenticated, user, addresses, showToast } = useAuth();
  const navigate = useNavigate();

  const [showNote, setShowNote] = useState(false);

  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0] || null;

  const handleProtectedCheckout = () => {
    setIsCartOpen(false);
    if (!isAuthenticated) {
      showToast('Please sign in or create an account to complete your purchase.', 'gold');
      navigate('/auth', {
        state: {
          from: '/checkout',
          reason: 'Sign in or register to add your delivery address & complete checkout.',
        },
      });
      return;
    }
    navigate('/checkout');
  };

  const handleWhatsAppCheckout = () => {
    // Enforce Login + Address before purchasing!
    if (!isAuthenticated) {
      setIsCartOpen(false);
      showToast('Please sign in first to buy or place a WhatsApp order.', 'gold');
      navigate('/auth', {
        state: {
          from: '/checkout',
          reason: 'Sign in or register so we can attach your verified delivery address.',
        },
      });
      return;
    }

    if (!defaultAddress) {
      setIsCartOpen(false);
      showToast('Please add a delivery address before placing your order.', 'rose');
      navigate('/checkout');
      return;
    }

    let orderText = `*Hi AURA Jewels! I would like to place an order:*%0A%0A`;
    orderText += `*Customer:* ${user.name} (${user.email})%0A`;
    orderText += `*Delivery Address (${defaultAddress.type}):* ${defaultAddress.houseNo}, ${defaultAddress.area}, ${defaultAddress.city}, ${defaultAddress.state} - ${defaultAddress.pincode}%0A`;
    orderText += `*Mobile:* +91 ${defaultAddress.phone}%0A%0A`;
    cart.forEach((item, index) => {
      orderText += `${index + 1}. *${item.name}* (Qty: ${item.quantity}) - ₹${item.price * item.quantity}%0A`;
      if (item.size) orderText += `   Size: ${item.size}%0A`;
      if (item.initial) orderText += `   Custom Initial: "${item.initial}"%0A`;
    });
    orderText += `%0A*Estimated Total:* ₹${cartSubtotal}%0A`;
    if (isFreeGiftUnlocked) {
      orderText += `*Special:* Free Luxury Velvet Gift Box Unlocked! ✨%0A`;
    }
    if (giftNote.trim()) {
      orderText += `*Gift Note:* "${encodeURIComponent(giftNote)}"%0A`;
    }
    orderText += `%0APlease confirm my dispatch timeline!`;

    window.open(`https://wa.me/918780125711?text=${orderText}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-espresso/60 backdrop-blur-sm"
          />

          {/* Slide-in Drawer Panel */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 34 }}
              className="w-screen max-w-md bg-ivory-50 border-l border-gold-300/40 shadow-2xl flex flex-col justify-between"
            >
              
              {/* Header */}
              <div className="p-6 border-b border-gold-200/60 bg-white/80 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-gold-600" />
                    <h3 className="font-serif-lux text-2xl font-bold text-espresso tracking-wide">
                      Your Treasure Bag
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="p-2 rounded-full hover:bg-gold-50 text-espresso/60 hover:text-espresso transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Free Gift Box Progress Bar */}
                <div className="mt-4 p-3 rounded-xl bg-gold-50/80 border border-gold-300/50">
                  <div className="flex items-center justify-between text-xs font-semibold text-gold-900 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-gold-600" />
                      {isFreeGiftUnlocked ? (
                        <span className="text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Complimentary Velvet Gift Box Unlocked!
                        </span>
                      ) : (
                        <span>Add ₹{freeGiftThreshold - cartSubtotal} more for Free Velvet Gift Box</span>
                      )}
                    </span>
                    <span className="text-[11px] font-bold text-gold-700">
                      {Math.round(giftProgress)}%
                    </span>
                  </div>
                  <div className="w-full bg-gold-200/50 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-gold-500 to-gold-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${giftProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-20 h-20 rounded-full bg-gold-100 flex items-center justify-center text-gold-600 mb-4">
                      <ShoppingBag className="w-9 h-9" />
                    </div>
                    <h4 className="font-serif-lux text-xl font-bold text-espresso mb-1">
                      Your bag is currently empty
                    </h4>
                    <p className="text-xs text-espresso/60 max-w-xs mb-6">
                      Every piece is hand-sculpted in small batches. Discover our signature drop today.
                    </p>
                    <Link
                      to="/collections"
                      onClick={() => setIsCartOpen(false)}
                      className="px-6 py-3 rounded-full glass-gold-btn text-xs uppercase font-bold tracking-widest shadow-md"
                    >
                      Explore Creations
                    </Link>
                  </div>
                ) : (
                  cart.map((item, index) => (
                    <div
                      key={`${item.id}-${index}`}
                      className="p-4 rounded-2xl bg-white border border-gold-200/70 shadow-sm flex gap-4 items-center"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 rounded-xl object-cover border border-gold-200 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-serif-lux text-base font-bold text-espresso truncate">
                          {item.name}
                        </h5>
                        <div className="text-[11px] text-espresso/60 space-y-0.5 mt-0.5">
                          {item.size && <p>Size: {item.size}</p>}
                          {item.initial && (
                            <p className="font-semibold text-gold-700">Initial: "{item.initial}"</p>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-bold text-gold-700 text-sm">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                          {/* Stepper */}
                          <div className="flex items-center border border-gold-300 rounded-lg overflow-hidden bg-ivory-50 text-xs">
                            <button
                              onClick={() => updateQuantity(index, -1)}
                              className="px-2 py-1 hover:bg-gold-100 text-espresso"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2.5 font-bold text-espresso">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(index, 1)}
                              className="px-2 py-1 hover:bg-gold-100 text-espresso"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(index)}
                        className="p-1.5 rounded-full hover:bg-red-50 text-espresso/40 hover:text-red-500 transition"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}

                {/* Handwritten Note Accordion */}
                {cart.length > 0 && (
                  <div className="pt-2">
                    <button
                      onClick={() => setShowNote(!showNote)}
                      className="text-xs text-gold-700 hover:text-gold-800 font-semibold flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{showNote ? 'Hide gift message' : '+ Add handwritten gift note (Free)'}</span>
                    </button>
                    {showNote && (
                      <textarea
                        rows={2}
                        value={giftNote}
                        onChange={(e) => setGiftNote(e.target.value)}
                        placeholder="E.g., Happy Birthday! With love."
                        className="w-full mt-2 p-3 rounded-xl border border-gold-300 text-xs bg-white text-espresso focus:outline-none focus:ring-1 focus:ring-gold-500"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Footer Checkout Buttons */}
              {cart.length > 0 && (
                <div className="p-6 border-t border-gold-200/80 bg-white/90 backdrop-blur-md space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-espresso/60 font-semibold">
                      Subtotal
                    </span>
                    <span className="font-serif-lux text-2xl font-bold text-espresso">
                      ₹{cartSubtotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Login & Address Reminder Pill */}
                  <div className="px-3 py-2 rounded-xl bg-ivory-100 border border-gold-200 text-[11px] text-espresso/75 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gold-600 flex-shrink-0" />
                    <span>
                      {!isAuthenticated
                        ? 'Sign in at next step to save your delivery address.'
                        : defaultAddress
                        ? `Shipping to: ${defaultAddress.city} (${defaultAddress.pincode})`
                        : 'Select or add delivery address at checkout.'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {/* Primary Checkout Button */}
                    <button
                      onClick={handleProtectedCheckout}
                      className="w-full py-4 rounded-full glass-gold-btn text-xs uppercase tracking-[0.18em] font-bold shadow-luxury flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      <span>
                        {isAuthenticated
                          ? 'Proceed to Address & Checkout'
                          : 'Sign In to Checkout'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    {/* WhatsApp Direct Order Button (Also enforces Login + Address!) */}
                    <button
                      onClick={handleWhatsAppCheckout}
                      className="w-full py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs uppercase tracking-[0.16em] font-bold shadow-md flex items-center justify-center gap-2 transition"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Order via WhatsApp (COD Available)</span>
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
