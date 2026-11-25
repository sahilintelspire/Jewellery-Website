import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  MapPin,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  Gift,
  Truck,
  CreditCard,
  ShieldCheck,
  Tag,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShoppingBag,
  MessageCircle,
  Package,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import AddressForm from '../components/checkout/AddressForm';
import RazorpayMockModal from '../components/checkout/RazorpayMockModal';

const AVAILABLE_COUPONS = {
  AURA10: { code: 'AURA10', type: 'percent', value: 10, minOrder: 0, label: '10% Off Atelier Welcome' },
  WELCOME200: { code: 'WELCOME200', type: 'flat', value: 200, minOrder: 1200, label: '₹200 Off Orders ₹1200+' },
  FREESHIP: { code: 'FREESHIP', type: 'shipping', value: 120, minOrder: 0, label: 'Free Express Priority Delivery' },
};

export default function CheckoutPage() {
  const { user, addresses, addAddress, updateAddress, deleteAddress, setDefaultAddress, placeOrder, showToast } =
    useAuth();
  const { cart, cartSubtotal, clearCart, isFreeGiftUnlocked, freeGiftThreshold, giftNote, setGiftNote } = useCart();

  const [step, setStep] = useState(1); // 1: Address, 2: Packaging & Shipping, 3: Payment, 4: Confirmed
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Step 2: Gift & Delivery
  const [ribbonStyle, setRibbonStyle] = useState('Champagne Gold');
  const [upgradeVelvetBox, setUpgradeVelvetBox] = useState(false);
  const [deliverySpeed, setDeliverySpeed] = useState('standard'); // 'standard' | 'express'

  // Step 3: Coupon & Payment
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' | 'cod'
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);

  // Step 4: Confirmed Order
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Sync selected address cleanly only when address book changes (never close form when clicking addresses)
  useEffect(() => {
    if (addresses.length > 0) {
      setSelectedAddressId((prevId) => {
        if (prevId && addresses.some((a) => a.id === prevId)) return prevId;
        const def = addresses.find((a) => a.isDefault) || addresses[0];
        return def.id;
      });
    } else {
      setShowAddressForm(true);
    }
  }, [addresses]);

  const activeAddress = addresses.find((a) => a.id === selectedAddressId) || null;

  // Pricing Calculations
  const baseShipping =
    deliverySpeed === 'express'
      ? 120
      : cartSubtotal >= freeGiftThreshold
      ? 0
      : 80;

  const velvetUpgradeFee = !isFreeGiftUnlocked && upgradeVelvetBox ? 99 : 0;

  let discount = 0;
  let shippingFee = baseShipping;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percent') {
      discount = Math.round((cartSubtotal * appliedCoupon.value) / 100);
    } else if (appliedCoupon.type === 'flat' && cartSubtotal >= appliedCoupon.minOrder) {
      discount = appliedCoupon.value;
    } else if (appliedCoupon.type === 'shipping') {
      shippingFee = 0;
    }
  }

  const grandTotal = Math.max(0, cartSubtotal - discount + shippingFee + velvetUpgradeFee);

  const handleApplyCoupon = (codeToTry) => {
    const clean = (codeToTry ?? couponInput).trim().toUpperCase();
    setCouponError('');
    if (!clean) return;
    const found = AVAILABLE_COUPONS[clean];
    if (!found) {
      return setCouponError('Invalid coupon code. Try AURA10, WELCOME200, or FREESHIP.');
    }
    if (cartSubtotal < found.minOrder) {
      return setCouponError(`Minimum order of ₹${found.minOrder} required for ${found.code}.`);
    }
    setAppliedCoupon(found);
    setCouponInput(found.code);
    showToast(`Coupon ${found.code} applied! ✨`, 'gold');
  };

  const finalizeOrder = (methodLabel, paymentStatus = 'Paid') => {
    if (!activeAddress) return;
    const order = placeOrder({
      items: cart,
      subtotal: cartSubtotal,
      discount,
      shipping: shippingFee + velvetUpgradeFee,
      total: grandTotal,
      couponCode: appliedCoupon?.code || '',
      giftNote,
      ribbonStyle,
      deliverySpeed:
        deliverySpeed === 'express'
          ? 'Atelier Priority Express (2-3 Days)'
          : 'Standard Insured Courier (3-5 Days)',
      paymentMethod: methodLabel,
      paymentStatus,
      address: activeAddress,
    });

    setConfirmedOrder(order);
    clearCart();
    setIsRazorpayOpen(false);
    setStep(4);

    try {
      confetti({
        particleCount: 110,
        spread: 85,
        origin: { y: 0.55 },
        colors: ['#D4AF37', '#F3E5AB', '#F3DAD5', '#E91E63', '#FFFFFF'],
      });
    } catch {}
  };

  const handlePlaceOrderClick = () => {
    if (!activeAddress) {
      setStep(1);
      return showToast('Please add and select a delivery address first.', 'rose');
    }
    if (paymentMethod === 'razorpay') {
      setIsRazorpayOpen(true);
    } else {
      finalizeOrder('Cash on Delivery (COD)', 'Pending on Delivery');
    }
  };

  // Empty Bag View (if user navigated cleanly before ordering)
  if (cart.length === 0 && step !== 4) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-6 py-16">
        <div className="max-w-md w-full text-center p-10 rounded-3xl bg-white border border-gold-200 shadow-luxury space-y-5">
          <div className="w-20 h-20 rounded-full bg-gold-50 text-gold-600 mx-auto flex items-center justify-center border border-gold-200">
            <ShoppingBag className="w-9 h-9" />
          </div>
          <h1 className="font-serif-lux text-3xl font-bold text-espresso">Your Bag Is Empty</h1>
          <p className="text-xs text-espresso/60 leading-relaxed">
            Add your favorite handcrafted bracelets, resin charms, or bespoke pieces to proceed with checkout.
          </p>
          <Link
            to="/collections"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full glass-gold-btn text-xs uppercase tracking-widest font-bold"
          >
            <span>Explore Collections</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-16 max-w-7xl mx-auto">
      
      {/* Top Breadcrumb & Stepper */}
      {step !== 4 && (
        <div className="mb-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-[0.22em] text-gold-700 font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Encrypted Atelier Checkout</span>
              </span>
              <h1 className="font-serif-lux text-3xl sm:text-5xl font-bold text-espresso mt-1">
                Complete Your Order
              </h1>
            </div>

            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gold-200 shadow-sm text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-espresso/70">Signed in as</span>
              <span className="font-bold text-espresso">{user?.name}</span>
            </div>
          </div>

          {/* 3-Step Horizontal Bar */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 p-2 rounded-2xl bg-white/80 border border-gold-200 shadow-sm">
            {[
              { num: 1, title: 'Delivery Address' },
              { num: 2, title: 'Gift & Shipping' },
              { num: 3, title: 'Payment & Review' },
            ].map((s) => {
              const active = step === s.num;
              const completed = step > s.num;
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => {
                    if (completed || s.num === 1 || (s.num === 2 && activeAddress)) {
                      setStep(s.num);
                    }
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                    active
                      ? 'btn-gold-mockup text-white'
                      : completed
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'text-espresso/50'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                      active
                        ? 'bg-white text-gold-800'
                        : completed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-ivory-200 text-espresso/60'
                    }`}
                  >
                    {completed ? '✓' : s.num}
                  </span>
                  <span className="hidden sm:inline">{s.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 4: ORDER CONFIRMED RECEIPT */}
      {step === 4 && confirmedOrder ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-3xl mx-auto py-8"
        >
          <div className="rounded-[2rem] bg-white border border-gold-300 shadow-luxury p-8 sm:p-12 text-center space-y-6 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-gold-200/35 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-rosequartz-200/35 rounded-full blur-3xl pointer-events-none" />

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white mx-auto flex items-center justify-center shadow-lg"
            >
              <CheckCircle2 className="w-10 h-10" />
            </motion.div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-gold-100 text-gold-800 text-[11px] uppercase tracking-widest font-bold">
                <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                <span>Handcrafting Begins Now</span>
              </span>
              <h1 className="font-serif-lux text-4xl sm:text-5xl font-bold text-espresso">
                Thank You, {user?.name?.split(' ')[0]}!
              </h1>
              <p className="text-xs sm:text-sm text-espresso/70 max-w-md mx-auto">
                Your handcrafted jewellery order <strong className="text-gold-800">{confirmedOrder.id}</strong> is confirmed and assigned to our artisan studio.
              </p>
            </div>

            {/* Order Snapshot Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left bg-ivory-50 p-5 rounded-2xl border border-gold-200">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-espresso/50 font-bold">
                  Order Number
                </span>
                <p className="text-sm font-bold text-espresso mt-0.5">{confirmedOrder.id}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-espresso/50 font-bold">
                  Estimated Delivery
                </span>
                <p className="text-sm font-bold text-emerald-700 mt-0.5">
                  {confirmedOrder.estimatedDelivery}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-espresso/50 font-bold">
                  Payment & Total
                </span>
                <p className="text-sm font-bold text-gold-700 mt-0.5">
                  ₹{confirmedOrder.total.toLocaleString('en-IN')} ({confirmedOrder.paymentStatus})
                </p>
              </div>
            </div>

            {/* Delivered To Box */}
            <div className="text-left p-5 rounded-2xl border border-gold-200 bg-white flex flex-col sm:flex-row justify-between gap-4">
              <div className="space-y-1 text-xs">
                <p className="text-[10px] uppercase tracking-wider font-bold text-gold-700">
                  Shipping To ({confirmedOrder.address.type})
                </p>
                <p className="font-bold text-espresso text-sm">{confirmedOrder.address.fullName}</p>
                <p className="text-espresso/75">
                  {confirmedOrder.address.houseNo}, {confirmedOrder.address.area}
                  {confirmedOrder.address.landmark ? `, Near ${confirmedOrder.address.landmark}` : ''}
                </p>
                <p className="text-espresso/75">
                  {confirmedOrder.address.city}, {confirmedOrder.address.state} - {confirmedOrder.address.pincode}
                </p>
                <p className="text-espresso/70 font-medium">📞 +91 {confirmedOrder.address.phone}</p>
              </div>

              <div className="space-y-1 text-xs sm:text-right">
                <p className="text-[10px] uppercase tracking-wider font-bold text-gold-700">
                  Packaging
                </p>
                <p className="text-espresso font-medium">Velvet Gift Box • {confirmedOrder.ribbonStyle} Ribbon</p>
                {confirmedOrder.giftNote && (
                  <p className="italic text-espresso/60 max-w-xs">"{confirmedOrder.giftNote}"</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                to="/account?tab=orders"
                className="w-full sm:w-auto px-7 py-3.5 rounded-full glass-gold-btn text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 shadow-md"
              >
                <Package className="w-4 h-4" />
                <span>Track Live Order</span>
              </Link>

              <a
                href={`https://wa.me/918780125711?text=${encodeURIComponent(
                  `Hi AURA Jewels! I just placed Order ${confirmedOrder.id} (₹${confirmedOrder.total}) for delivery to ${confirmedOrder.address.city}. Please share crafting updates!`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Studio Updates</span>
              </a>

              <Link
                to="/collections"
                className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-gold-300 text-xs uppercase tracking-wider font-bold text-espresso hover:bg-gold-50 transition"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </motion.div>
      ) : (
        /* MAIN 2-COLUMN CHECKOUT FLOW */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT 7 COLUMNS: STEP FORMS */}
          <div className="lg:col-span-7 space-y-6">
            <AnimatePresence mode="wait">
              {/* STEP 1: ADDRESS SELECTION & CREATION */}
              {step === 1 && (
                <motion.div
                  key="checkout-step-1"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-gold-200 shadow-sm space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-serif-lux text-2xl sm:text-3xl font-bold text-espresso">
                        Select Delivery Address
                      </h2>
                      <p className="text-xs text-espresso/60">
                        Where should our courier deliver your velvet keepsake parcel?
                      </p>
                    </div>
                    {!showAddressForm && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAddress(null);
                          setShowAddressForm(true);
                        }}
                        className="px-4 py-2 rounded-full border border-gold-400 bg-gold-50 hover:bg-gold-100 text-gold-900 text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add New</span>
                      </button>
                    )}
                  </div>

                  {/* Saved Address Cards */}
                  {addresses.length > 0 && !showAddressForm && (
                    <div className="space-y-3">
                      {addresses.map((addr) => {
                        const isSelected = addr.id === selectedAddressId;
                        return (
                          <div
                            key={addr.id}
                            onClick={() => setSelectedAddressId(addr.id)}
                            className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all relative ${
                              isSelected
                                ? 'border-gold-500 bg-gold-50/60 shadow-sm'
                                : 'border-gold-200/70 bg-ivory-50/50 hover:border-gold-300'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div
                                  className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                    isSelected ? 'border-gold-600 bg-gold-600' : 'border-gold-300'
                                  }`}
                                >
                                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>

                                <div className="space-y-1 text-xs">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-bold text-sm text-espresso">
                                      {addr.fullName}
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded-full bg-white border border-gold-300 text-[10px] font-bold uppercase text-gold-800">
                                      {addr.type}
                                    </span>
                                    {addr.isDefault && (
                                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-espresso/75 leading-relaxed">
                                    {addr.houseNo}, {addr.area}
                                    {addr.landmark ? `, Near ${addr.landmark}` : ''}
                                  </p>
                                  <p className="text-espresso/75">
                                    {addr.city}, {addr.state} — <strong>{addr.pincode}</strong>
                                  </p>
                                  <p className="text-espresso/80 font-semibold pt-0.5">
                                    Mobile: +91 {addr.phone}
                                  </p>
                                </div>
                              </div>

                              <div
                                className="flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingAddress(addr);
                                    setShowAddressForm(true);
                                  }}
                                  className="p-2 rounded-full hover:bg-white text-espresso/60 hover:text-gold-700 transition"
                                  title="Edit Address"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteAddress(addr.id)}
                                  className="p-2 rounded-full hover:bg-white text-espresso/50 hover:text-red-500 transition"
                                  title="Delete Address"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add / Edit Inline Address Form */}
                  {showAddressForm && (
                    <AddressForm
                      initialData={editingAddress}
                      defaultName={user?.name}
                      defaultPhone={user?.phone}
                      onCancel={addresses.length > 0 ? () => setShowAddressForm(false) : null}
                      onSave={(data) => {
                        if (editingAddress) {
                          updateAddress(editingAddress.id, data);
                          setSelectedAddressId(editingAddress.id);
                        } else {
                          const created = addAddress(data);
                          setSelectedAddressId(created.id);
                        }
                        setEditingAddress(null);
                        setShowAddressForm(false);
                      }}
                    />
                  )}

                  {/* Continue Button */}
                  {activeAddress && !showAddressForm && (
                    <div className="pt-2 flex items-center justify-between gap-4 border-t border-gold-100">
                      <div className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                        <Truck className="w-4 h-4" />
                        <span>Express courier serviceable to {activeAddress.pincode}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="px-7 py-3.5 rounded-full glass-gold-btn text-xs uppercase tracking-widest font-bold flex items-center gap-2 shadow-md"
                      >
                        <span>Continue to Packaging</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* STEP 2: VELVET GIFT PACKAGING & DELIVERY SPEED */}
              {step === 2 && (
                <motion.div
                  key="checkout-step-2"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-gold-200 shadow-sm space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-serif-lux text-2xl sm:text-3xl font-bold text-espresso">
                        Gift Curation & Shipping
                      </h2>
                      <p className="text-xs text-espresso/60">
                        Customize how we wrap and dispatch your handmade keepsakes.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs font-bold text-gold-700 hover:underline flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Change Address</span>
                    </button>
                  </div>

                  {/* Velvet Box Status */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-rosequartz-50 to-gold-50 border border-gold-300/70 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white border border-gold-300 flex items-center justify-center text-gold-600 shadow-sm">
                        <Gift className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-espresso">
                          {isFreeGiftUnlocked
                            ? 'Complimentary Velvet Keepsake Box Included!'
                            : 'Signature Velvet Keepsake Gift Box'}
                        </p>
                        <p className="text-[11px] text-espresso/65">
                          {isFreeGiftUnlocked
                            ? 'Unlocked free with your order above ₹999 ✨'
                            : 'Add for just ₹99 to elevate gifting with our embossed velvet box.'}
                        </p>
                      </div>
                    </div>

                    {isFreeGiftUnlocked ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                        FREE
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setUpgradeVelvetBox(!upgradeVelvetBox)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition ${
                          upgradeVelvetBox
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border border-gold-400 text-gold-800 hover:bg-gold-50'
                        }`}
                      >
                        {upgradeVelvetBox ? '✓ Added (₹99)' : '+ Add ₹99'}
                      </button>
                    )}
                  </div>

                  {/* Satin Ribbon Color */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider font-bold text-espresso/80 block">
                      Select Satin Gift Ribbon:
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { name: 'Champagne Gold', dot: 'bg-[#D4AF37]' },
                        { name: 'Blush Rose', dot: 'bg-[#DF9F95]' },
                        { name: 'Ivory Pearl', dot: 'bg-[#EDE2D6]' },
                      ].map((rib) => (
                        <button
                          key={rib.name}
                          type="button"
                          onClick={() => setRibbonStyle(rib.name)}
                          className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition ${
                            ribbonStyle === rib.name
                              ? 'border-gold-500 bg-gold-50 text-gold-900 shadow-sm'
                              : 'border-gold-200 bg-ivory-50/50 text-espresso/70 hover:border-gold-300'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full border border-black/10 ${rib.dot}`} />
                          <span>{rib.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Handwritten Note */}
                  <div>
                    <label className="text-xs uppercase tracking-wider font-bold text-espresso/80 block mb-1.5">
                      Handwritten Calligraphy Gift Note (Free):
                    </label>
                    <textarea
                      rows={2}
                      value={giftNote}
                      onChange={(e) => setGiftNote(e.target.value)}
                      placeholder="Write a personal note — we hand-calligraph it on an ivory card..."
                      className="w-full p-3.5 rounded-2xl border border-gold-300 bg-ivory-50 text-xs text-espresso focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  {/* Shipping Speed */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider font-bold text-espresso/80 block">
                      Delivery Speed:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setDeliverySpeed('standard')}
                        className={`p-4 rounded-2xl border-2 text-left transition ${
                          deliverySpeed === 'standard'
                            ? 'border-gold-500 bg-gold-50/70'
                            : 'border-gold-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-xs text-espresso">
                          <span>Standard Insured Courier</span>
                          <span className="text-emerald-700">
                            {cartSubtotal >= freeGiftThreshold ? 'FREE' : '₹80'}
                          </span>
                        </div>
                        <p className="text-[11px] text-espresso/60 mt-1">
                          Delivered in 3–5 business days with tracking
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeliverySpeed('express')}
                        className={`p-4 rounded-2xl border-2 text-left transition ${
                          deliverySpeed === 'express'
                            ? 'border-gold-500 bg-gold-50/70'
                            : 'border-gold-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-xs text-espresso">
                          <span>Atelier Priority Express</span>
                          <span className="text-gold-700">
                            {appliedCoupon?.code === 'FREESHIP' ? 'FREE' : '₹120'}
                          </span>
                        </div>
                        <p className="text-[11px] text-espresso/60 mt-1">
                          Priority studio handcrafting + 2–3 day air dispatch
                        </p>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-8 py-3.5 rounded-full glass-gold-btn text-xs uppercase tracking-widest font-bold flex items-center gap-2 shadow-md"
                    >
                      <span>Proceed to Payment</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: PAYMENT METHOD & CONFIRMATION */}
              {step === 3 && (
                <motion.div
                  key="checkout-step-3"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-gold-200 shadow-sm space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-serif-lux text-2xl sm:text-3xl font-bold text-espresso">
                        Payment & Final Review
                      </h2>
                      <p className="text-xs text-espresso/60">
                        Choose your preferred secure payment method.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="text-xs font-bold text-gold-700 hover:underline flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                  </div>

                  {/* Delivering To Recap */}
                  {activeAddress && (
                    <div className="p-4 rounded-2xl bg-ivory-50 border border-gold-200 flex items-center justify-between gap-4 text-xs">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-gold-700">
                          Delivering To
                        </span>
                        <p className="font-bold text-espresso mt-0.5">
                          {activeAddress.fullName} ({activeAddress.type}) • +91 {activeAddress.phone}
                        </p>
                        <p className="text-espresso/70">
                          {activeAddress.houseNo}, {activeAddress.area}, {activeAddress.city} — {activeAddress.pincode}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-[11px] font-bold text-gold-700 hover:underline flex-shrink-0"
                      >
                        Change
                      </button>
                    </div>
                  )}

                  {/* Payment Options */}
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('razorpay')}
                      className={`w-full p-5 rounded-2xl border-2 text-left transition flex items-start gap-4 ${
                        paymentMethod === 'razorpay'
                          ? 'border-gold-500 bg-gold-50/70 shadow-sm'
                          : 'border-gold-200 bg-white hover:border-gold-300'
                      }`}
                    >
                      <div className="p-2.5 rounded-xl bg-white border border-gold-200 text-gold-700">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-espresso">
                            Pay Online (Razorpay / UPI / GPay / Cards)
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Recommended
                          </span>
                        </div>
                        <p className="text-xs text-espresso/60 mt-1">
                          Instant UPI, PhonePe, Google Pay, Cards & Netbanking with buyer protection.
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`w-full p-5 rounded-2xl border-2 text-left transition flex items-start gap-4 ${
                        paymentMethod === 'cod'
                          ? 'border-gold-500 bg-gold-50/70 shadow-sm'
                          : 'border-gold-200 bg-white hover:border-gold-300'
                      }`}
                    >
                      <div className="p-2.5 rounded-xl bg-white border border-gold-200 text-emerald-700">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-sm text-espresso block">
                          Cash on Delivery (COD)
                        </span>
                        <p className="text-xs text-espresso/60 mt-1">
                          Pay via Cash or UPI scanner at your doorstep when parcel arrives.
                        </p>
                      </div>
                    </button>
                  </div>

                  {/* Final Pay CTA */}
                  <button
                    type="button"
                    onClick={handlePlaceOrderClick}
                    className="w-full py-4 rounded-full glass-gold-btn text-xs uppercase tracking-[0.2em] font-bold shadow-luxury flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>
                      {paymentMethod === 'razorpay'
                        ? `Pay ₹${grandTotal.toLocaleString('en-IN')} Securely`
                        : `Confirm COD Order • ₹${grandTotal.toLocaleString('en-IN')}`}
                    </span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT 5 COLUMNS: ORDER SUMMARY & PROMO CODES */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-gold-300/70 shadow-luxury lg:sticky lg:top-24 space-y-5">
            <div className="flex items-center justify-between border-b border-gold-200 pb-4">
              <h3 className="font-serif-lux text-2xl font-bold text-espresso">Order Summary</h3>
              <span className="text-xs font-bold text-gold-700">{cart.length} Item(s)</span>
            </div>

            {/* Compact Items List */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {cart.map((item, i) => (
                <div key={`${item.id}-${i}`} className="flex items-center gap-3 text-xs">
                  <div className="relative flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover border border-gold-200"
                    />
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-espresso text-white text-[10px] font-bold flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-espresso truncate">{item.name}</p>
                    <p className="text-[11px] text-espresso/60">
                      {item.size} {item.initial ? `• "${item.initial}"` : ''}
                    </p>
                  </div>
                  <span className="font-bold text-gold-800">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Promo / Coupon Input */}
            <div className="pt-4 border-t border-gold-200 space-y-2.5">
              <label className="text-[11px] uppercase tracking-wider font-bold text-espresso/75 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-gold-600" />
                <span>Promo / Gift Code</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Enter AURA10"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-gold-300 bg-ivory-50 text-xs font-bold text-espresso uppercase focus:outline-none focus:border-gold-500"
                />
                {appliedCoupon ? (
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedCoupon(null);
                      setCouponInput('');
                    }}
                    className="px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs font-bold"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon()}
                    className="px-5 py-2 rounded-xl bg-espresso hover:bg-espresso/90 text-white text-xs font-bold transition"
                  >
                    Apply
                  </button>
                )}
              </div>

              {couponError && <p className="text-[11px] text-red-600 font-medium">{couponError}</p>}

              {/* Clickable Available Coupon Pills */}
              {!appliedCoupon && (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {Object.values(AVAILABLE_COUPONS).map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handleApplyCoupon(c.code)}
                      className="text-[10px] px-2.5 py-1 rounded-full bg-gold-50 hover:bg-gold-100 border border-dashed border-gold-400 text-gold-800 font-bold transition"
                      title={c.label}
                    >
                      Tap: {c.code}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Totals Breakdown */}
            <div className="pt-4 border-t border-gold-200 space-y-2 text-xs">
              <div className="flex justify-between text-espresso/75">
                <span>Subtotal</span>
                <span className="font-semibold text-espresso">₹{cartSubtotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-espresso/75">
                <span>Velvet Keepsake Gift Box</span>
                <span className={isFreeGiftUnlocked ? 'text-emerald-700 font-bold' : 'font-semibold'}>
                  {isFreeGiftUnlocked ? 'FREE' : velvetUpgradeFee ? `₹${velvetUpgradeFee}` : 'Optional'}
                </span>
              </div>

              <div className="flex justify-between text-espresso/75">
                <span>Shipping ({deliverySpeed === 'express' ? 'Express' : 'Standard'})</span>
                <span className={shippingFee === 0 ? 'text-emerald-700 font-bold' : 'font-semibold'}>
                  {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span>- ₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="pt-3 border-t border-gold-200 flex items-baseline justify-between">
                <span className="font-bold text-sm text-espresso uppercase tracking-wider">Total</span>
                <span className="font-serif-lux text-3xl font-bold text-gold-800">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Simulated Razorpay Gateway Modal */}
      <RazorpayMockModal
        isOpen={isRazorpayOpen}
        onClose={() => setIsRazorpayOpen(false)}
        amount={grandTotal}
        userEmail={user?.email}
        userPhone={activeAddress?.phone || user?.phone}
        onPaymentSuccess={(methodLabel) => finalizeOrder(methodLabel, 'Paid')}
      />
    </div>
  );
}
