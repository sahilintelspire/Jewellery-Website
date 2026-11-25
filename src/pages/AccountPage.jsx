import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Package,
  MapPin,
  LogOut,
  Heart,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  Truck,
  Sparkles,
  RefreshCw,
  XCircle,
  ArrowRight,
  Home,
  Briefcase,
  Gift,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import AddressForm from '../components/checkout/AddressForm';

const ORDER_STAGES = [
  'Order Placed',
  'Crafting in Studio',
  'Quality & Polish',
  'Dispatched',
  'Delivered',
];

export default function AccountPage() {
  const {
    user,
    addresses,
    orders,
    logout,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    cancelOrder,
    advanceOrderStatus,
    showToast,
  } = useAuth();
  const { wishlist, addToCart, setIsCartOpen } = useCart();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'orders';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Profile form state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');

  // Address CRUD state
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [editingAddr, setEditingAddr] = useState(null);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['orders', 'addresses', 'profile'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfilePhone(user.phone || '');
    }
  }, [user]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    if (profileName.trim().length < 2) {
      return showToast('Please enter a valid name.', 'rose');
    }
    if (profilePhone.replace(/\D/g, '').length < 10) {
      return showToast('Please enter a valid 10-digit mobile number.', 'rose');
    }
    updateProfile({ name: profileName, phone: profilePhone });
  };

  const handleReorder = (order) => {
    order.items.forEach((item, idx) => {
      addToCart(item, item.size, item.initial, item.quantity, idx === order.items.length - 1);
    });
    setIsCartOpen(true);
    showToast(`Added items from ${order.id} back to your Bag!`, 'gold');
  };

  const firstName = user?.name?.split(' ')[0] || 'Member';
  const initials = (user?.name || 'A')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-16 max-w-7xl mx-auto space-y-8">
      
      {/* TOP MEMBER ATELIER HEADER CARD */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-gradient-to-br from-white via-ivory-50 to-[#F7EAE6]/60 border border-gold-300/80 p-6 sm:p-8 shadow-luxury relative overflow-hidden"
      >
        <div className="absolute -top-12 -right-12 w-52 h-52 rounded-full bg-gold-200/30 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-gold-400 via-gold-500 to-gold-700 text-white font-serif-lux text-2xl sm:text-3xl font-bold flex items-center justify-center shadow-md border border-white/40">
              {initials}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gold-100 border border-gold-300 text-gold-800 text-[10px] uppercase tracking-widest font-bold mb-1">
                <Sparkles className="w-3 h-3 text-gold-600" />
                <span>{user?.tier || 'Atelier Member'}</span>
              </div>
              <h1 className="font-serif-lux text-3xl sm:text-4xl font-bold text-espresso">
                Welcome, {firstName}
              </h1>
              <p className="text-xs text-espresso/65 mt-0.5">
                {user?.email} {user?.phone ? `• +91 ${user.phone}` : ''}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/wishlist"
              className="px-4 py-2.5 rounded-full bg-white border border-gold-200 hover:border-gold-400 text-xs font-bold text-espresso flex items-center gap-2 shadow-sm transition"
            >
              <Heart className="w-3.5 h-3.5 text-rosequartz-500 fill-rosequartz-400" />
              <span>Wishlist ({wishlist.length})</span>
            </Link>

            <button
              type="button"
              onClick={logout}
              className="px-5 py-2.5 rounded-full bg-white border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* ANIMATED TAB BAR */}
      <div className="inline-flex flex-wrap p-1.5 rounded-2xl bg-white border border-gold-200 shadow-sm gap-1">
        {[
          { id: 'orders', label: `My Orders (${orders.length})`, icon: Package },
          { id: 'addresses', label: `Saved Addresses (${addresses.length})`, icon: MapPin },
          { id: 'profile', label: 'Profile & Security', icon: User },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`relative px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-bold flex items-center gap-2 transition z-10 ${
                active ? 'text-white' : 'text-espresso/70 hover:text-espresso'
              }`}
            >
              {active && (
                <motion.div
                  layoutId="accountTabPill"
                  transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                  className="absolute inset-0 rounded-xl btn-gold-mockup -z-10"
                />
              )}
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      <AnimatePresence mode="wait">
        {/* TAB 1: ORDERS & LIVE TRACKING */}
        {activeTab === 'orders' && (
          <motion.div
            key="tab-orders"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-6"
          >
            {orders.length === 0 ? (
              <div className="text-center py-20 px-6 rounded-3xl bg-white border border-gold-200 shadow-sm max-w-lg mx-auto space-y-4">
                <div className="w-16 h-16 rounded-full bg-gold-50 border border-gold-200 text-gold-600 mx-auto flex items-center justify-center">
                  <Package className="w-8 h-8" />
                </div>
                <h2 className="font-serif-lux text-2xl font-bold text-espresso">
                  No Orders Placed Yet
                </h2>
                <p className="text-xs text-espresso/60 leading-relaxed">
                  Once you purchase a handcrafted bracelet, resin pendant, or custom band, you can track its live studio crafting and shipping right here.
                </p>
                <Link
                  to="/collections"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full glass-gold-btn text-xs uppercase tracking-widest font-bold"
                >
                  <span>Browse Collections</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              orders.map((order) => {
                const isCancelled = order.status === 'Cancelled' || order.statusStep < 0;
                const currentStep = Math.max(0, order.statusStep ?? 0);

                return (
                  <div
                    key={order.id}
                    className="rounded-3xl bg-white border border-gold-200/90 shadow-sm p-6 sm:p-8 space-y-6"
                  >
                    {/* Order Top Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gold-100">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="font-serif-lux text-2xl font-bold text-espresso">
                            Order {order.id}
                          </h3>
                          <span
                            className={`px-3 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold ${
                              isCancelled
                                ? 'bg-red-100 text-red-700'
                                : currentStep === 4
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-gold-100 text-gold-900'
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-espresso/60">
                          Placed on{' '}
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}{' '}
                          • {order.paymentMethod} ({order.paymentStatus})
                        </p>
                      </div>

                      <div className="sm:text-right">
                        <span className="text-[11px] text-espresso/55 uppercase font-bold block">
                          Order Total
                        </span>
                        <span className="text-2xl font-bold text-gold-800">
                          ₹{order.total.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* 5-Stage Tracking Timeline */}
                    {!isCancelled && (
                      <div className="py-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-espresso/65 mb-3">
                          <span className="flex items-center gap-1.5 text-emerald-700">
                            <Truck className="w-4 h-4" />
                            <span>Est. Delivery: {order.estimatedDelivery}</span>
                          </span>
                          {currentStep < 4 && (
                            <button
                              type="button"
                              onClick={() => advanceOrderStatus(order.id)}
                              className="text-[10px] px-3 py-1 rounded-full bg-ivory-100 hover:bg-gold-100 border border-gold-300 text-gold-800 transition"
                              title="Simulate next crafting/delivery milestone"
                            >
                              ↻ Simulate Next Tracking Stage
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-5 gap-1.5 sm:gap-3">
                          {ORDER_STAGES.map((stageLabel, idx) => {
                            const done = idx <= currentStep;
                            const isCurrent = idx === currentStep;
                            return (
                              <div key={stageLabel} className="space-y-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-500 ${
                                    done
                                      ? 'bg-gradient-to-r from-gold-400 to-emerald-500'
                                      : 'bg-ivory-200'
                                  } ${isCurrent ? 'animate-pulse' : ''}`}
                                />
                                <div className="flex items-center gap-1">
                                  {done && (
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0 hidden sm:inline" />
                                  )}
                                  <p
                                    className={`text-[9px] sm:text-[11px] leading-tight ${
                                      done ? 'font-bold text-espresso' : 'text-espresso/45'
                                    }`}
                                  >
                                    {stageLabel}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Items + Address Split */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                      <div className="lg:col-span-7 space-y-3">
                        {order.items.map((item, idx) => (
                          <div
                            key={`${item.id}-${idx}`}
                            className="flex items-center gap-3.5 p-3 rounded-2xl bg-ivory-50/70 border border-gold-200/60"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-14 h-14 rounded-xl object-cover border border-gold-200 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <Link
                                to={`/product/${item.id}`}
                                className="font-serif-lux text-base font-bold text-espresso hover:text-gold-700 truncate block"
                              >
                                {item.name}
                              </Link>
                              <p className="text-[11px] text-espresso/60">
                                Qty: {item.quantity} • {item.size}
                                {item.initial ? ` • Initial: "${item.initial}"` : ''}
                              </p>
                            </div>
                            <span className="font-bold text-xs text-gold-800">
                              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="lg:col-span-5 p-4 rounded-2xl bg-ivory-50 border border-gold-200/70 text-xs space-y-2">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-gold-700">
                          Shipping Address ({order.address?.type || 'Home'})
                        </p>
                        <p className="font-bold text-espresso">{order.address?.fullName}</p>
                        <p className="text-espresso/75 leading-relaxed">
                          {order.address?.houseNo}, {order.address?.area}, {order.address?.city},{' '}
                          {order.address?.state} — {order.address?.pincode}
                        </p>
                        <p className="text-espresso/75">Phone: +91 {order.address?.phone}</p>
                        {order.couponCode && (
                          <p className="text-emerald-700 font-semibold pt-1">
                            Promo Applied: {order.couponCode} (-₹{order.discount})
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Order Actions */}
                    <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-gold-100">
                      <button
                        type="button"
                        onClick={() => handleReorder(order)}
                        className="px-5 py-2.5 rounded-full glass-gold-btn text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 shadow-sm"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Reorder Items</span>
                      </button>

                      {!isCancelled && currentStep < 3 && (
                        <button
                          type="button"
                          onClick={() => cancelOrder(order.id)}
                          className="px-4 py-2.5 rounded-full border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold flex items-center gap-1.5 transition"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel Order</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </motion.div>
        )}

        {/* TAB 2: SAVED ADDRESS BOOK */}
        {activeTab === 'addresses' && (
          <motion.div
            key="tab-addresses"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif-lux text-2xl sm:text-3xl font-bold text-espresso">
                  Your Delivery Address Book
                </h2>
                <p className="text-xs text-espresso/60">
                  Add multiple home, work, or gift recipient addresses for 1-click checkout.
                </p>
              </div>
              {!showAddrForm && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingAddr(null);
                    setShowAddrForm(true);
                  }}
                  className="px-5 py-2.5 rounded-full glass-gold-btn text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Address</span>
                </button>
              )}
            </div>

            {showAddrForm && (
              <AddressForm
                initialData={editingAddr}
                defaultName={user?.name}
                defaultPhone={user?.phone}
                onCancel={() => {
                  setEditingAddr(null);
                  setShowAddrForm(false);
                }}
                onSave={(data) => {
                  if (editingAddr) {
                    updateAddress(editingAddr.id, data);
                  } else {
                    addAddress(data);
                  }
                  setEditingAddr(null);
                  setShowAddrForm(false);
                }}
              />
            )}

            {addresses.length === 0 && !showAddrForm ? (
              <div className="text-center py-16 px-6 rounded-3xl bg-white border border-gold-200 max-w-lg mx-auto space-y-4">
                <MapPin className="w-10 h-10 text-gold-500 mx-auto" />
                <h3 className="font-serif-lux text-2xl font-bold text-espresso">
                  No Addresses Saved Yet
                </h3>
                <p className="text-xs text-espresso/60">
                  Save your shipping address once to breeze through future handcrafted orders.
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddrForm(true)}
                  className="px-6 py-3 rounded-full glass-gold-btn text-xs uppercase font-bold tracking-wider"
                >
                  + Add First Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {addresses.map((addr) => {
                  const Icon =
                    addr.type === 'Work' ? Briefcase : addr.type === 'Gift' ? Gift : Home;
                  return (
                    <div
                      key={addr.id}
                      className={`p-6 rounded-3xl bg-white border-2 transition space-y-3 ${
                        addr.isDefault ? 'border-gold-500 shadow-luxury' : 'border-gold-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="p-2 rounded-xl bg-gold-50 text-gold-700 border border-gold-200">
                            <Icon className="w-4 h-4" />
                          </span>
                          <div>
                            <h4 className="font-bold text-sm text-espresso">{addr.fullName}</h4>
                            <span className="text-[10px] uppercase tracking-wider font-bold text-gold-700">
                              {addr.type} {addr.isDefault ? '• Default' : ''}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAddr(addr);
                              setShowAddrForm(true);
                            }}
                            className="p-2 rounded-full hover:bg-ivory-100 text-espresso/60 hover:text-gold-700 transition"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteAddress(addr.id)}
                            className="p-2 rounded-full hover:bg-red-50 text-espresso/50 hover:text-red-500 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="text-xs text-espresso/75 space-y-1">
                        <p>
                          {addr.houseNo}, {addr.area}
                          {addr.landmark ? `, Near ${addr.landmark}` : ''}
                        </p>
                        <p>
                          {addr.city}, {addr.state} — <strong>{addr.pincode}</strong>
                        </p>
                        <p className="font-semibold text-espresso pt-1">📞 +91 {addr.phone}</p>
                      </div>

                      {!addr.isDefault && (
                        <button
                          type="button"
                          onClick={() => setDefaultAddress(addr.id)}
                          className="text-xs font-bold text-gold-700 hover:underline pt-1"
                        >
                          Set as Default Address
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 3: PROFILE & ACCOUNT DETAILS */}
        {activeTab === 'profile' && (
          <motion.div
            key="tab-profile"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="max-w-2xl bg-white rounded-3xl p-6 sm:p-10 border border-gold-200 shadow-sm space-y-6"
          >
            <div>
              <h2 className="font-serif-lux text-2xl sm:text-3xl font-bold text-espresso">
                Personal Atelier Profile
              </h2>
              <p className="text-xs text-espresso/60">
                Keep your contact info up to date for dispatch alerts and WhatsApp updates.
              </p>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-espresso/75 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-gold-300 bg-ivory-50 text-xs text-espresso focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-espresso/75 mb-1">
                  Email Address (Primary Login ID)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-4 py-3 rounded-2xl border border-gold-200 bg-ivory-200/50 text-xs text-espresso/60 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-espresso/75 mb-1">
                  Mobile Number (+91)
                </label>
                <input
                  type="tel"
                  required
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-gold-300 bg-ivory-50 text-xs text-espresso focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-900">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>
                  Your account session & saved delivery details are active for faster checkout across the boutique.
                </span>
              </div>

              <button
                type="submit"
                className="px-7 py-3.5 rounded-full glass-gold-btn text-xs uppercase tracking-widest font-bold shadow-md"
              >
                Save Profile Changes
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
