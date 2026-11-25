import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

const USERS_DB_KEY = 'aura_jewels_users_db';
const SESSION_KEY = 'aura_jewels_session';
const ADDRESSES_PREFIX = 'aura_jewels_addresses_';
const ORDERS_PREFIX = 'aura_jewels_orders_';

// Lightweight client-side hash for prototype storage hygiene (keeps raw password out of state)
const hashPass = (str) => btoa(unescape(encodeURIComponent(`aura_salt_${str}`)));

const DEFAULT_DEMO_USER = {
  id: 'usr_demo_01',
  name: 'Ananya Sharma',
  email: 'ananya@aurajewels.in',
  phone: '9876543210',
  passwordHash: hashPass('Aura@2026'),
  joinedAt: '2026-10-15T10:00:00.000Z',
  tier: 'Atelier Insider',
};

const DEFAULT_DEMO_ADDRESSES = [
  {
    id: 'addr_demo_01',
    fullName: 'Ananya Sharma',
    phone: '9876543210',
    pincode: '380015',
    houseNo: '402, Ivory Residences',
    area: 'Satellite Road, Prahlad Nagar',
    landmark: 'Near Botanical Park',
    city: 'Ahmedabad',
    state: 'Gujarat',
    type: 'Home',
    isDefault: true,
  },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [toast, setToast] = useState(null);

  // Seed demo customer in users DB on first load
  useEffect(() => {
    try {
      const existing = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
      if (!existing.some((u) => u.email === DEFAULT_DEMO_USER.email)) {
        const updated = [DEFAULT_DEMO_USER, ...existing];
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(updated));
        if (!localStorage.getItem(`${ADDRESSES_PREFIX}${DEFAULT_DEMO_USER.email}`)) {
          localStorage.setItem(
            `${ADDRESSES_PREFIX}${DEFAULT_DEMO_USER.email}`,
            JSON.stringify(DEFAULT_DEMO_ADDRESSES)
          );
        }
      }
    } catch {}
  }, []);

  // Load user-specific addresses & orders whenever user changes
  useEffect(() => {
    if (!user?.email) {
      setAddresses([]);
      setOrders([]);
      return;
    }
    try {
      const savedAddrs = localStorage.getItem(`${ADDRESSES_PREFIX}${user.email}`);
      setAddresses(savedAddrs ? JSON.parse(savedAddrs) : []);
      const savedOrders = localStorage.getItem(`${ORDERS_PREFIX}${user.email}`);
      setOrders(savedOrders ? JSON.parse(savedOrders) : []);
    } catch {
      setAddresses([]);
      setOrders([]);
    }
  }, [user?.email]);

  const showToast = useCallback((message, type = 'gold') => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((prev) => (prev && prev.id === id ? null : prev));
    }, 3600);
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  const persistSession = (publicUser) => {
    setUser(publicUser);
    try {
      if (publicUser) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(publicUser));
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
    } catch {}
  };

  const register = ({ name, email, phone, password }) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);

    try {
      const db = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
      if (db.some((u) => u.email === cleanEmail)) {
        return { ok: false, error: 'An account with this email already exists. Please sign in.' };
      }

      const newRecord = {
        id: `usr_${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        passwordHash: hashPass(password),
        joinedAt: new Date().toISOString(),
        tier: 'Atelier Member',
      };

      localStorage.setItem(USERS_DB_KEY, JSON.stringify([...db, newRecord]));

      const { passwordHash: _ignored, ...publicUser } = newRecord;
      persistSession(publicUser);
      showToast(`Welcome to AURA Atelier, ${cleanName.split(' ')[0]}! ✨`, 'gold');
      return { ok: true, user: publicUser };
    } catch {
      return { ok: false, error: 'Could not save account locally. Please check browser storage.' };
    }
  };

  const login = ({ email, password }) => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const db = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
      const found = db.find((u) => u.email === cleanEmail);

      if (!found) {
        return { ok: false, error: 'No account found for this email. Please create one first.' };
      }
      if (found.provider === 'google' && !found.passwordHash) {
        return {
          ok: false,
          error: 'This email is linked with Google Sign-In. Please click "Continue with Google".',
        };
      }
      if (found.passwordHash !== hashPass(password)) {
        return { ok: false, error: 'Incorrect password. Please try again.' };
      }

      const { passwordHash: _ignored, ...publicUser } = found;
      persistSession(publicUser);
      showToast(`Welcome back, ${publicUser.name.split(' ')[0]}! ✨`, 'gold');
      return { ok: true, user: publicUser };
    } catch {
      return { ok: false, error: 'Sign in failed. Please try again.' };
    }
  };

  const loginWithGoogle = ({ name, email }) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name || cleanEmail.split('@')[0]).trim();
    try {
      const db = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
      const existing = db.find((u) => u.email === cleanEmail);

      if (existing) {
        const { passwordHash: _ignored, ...publicUser } = existing;
        const merged = { ...publicUser, provider: existing.provider || 'google' };
        persistSession(merged);
        showToast(`Signed in with Google as ${merged.name.split(' ')[0]}! ✨`, 'gold');
        return { ok: true, isNew: false, user: merged };
      }

      const newRecord = {
        id: `usr_g_${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        phone: '',
        provider: 'google',
        joinedAt: new Date().toISOString(),
        tier: 'Atelier Member',
      };

      localStorage.setItem(USERS_DB_KEY, JSON.stringify([...db, newRecord]));
      persistSession(newRecord);
      showToast(`Registered with Google! Welcome, ${cleanName.split(' ')[0]} ✨`, 'gold');
      return { ok: true, isNew: true, user: newRecord };
    } catch {
      return { ok: false, error: 'Google sign-in failed locally. Please try again.' };
    }
  };

  const logout = () => {
    persistSession(null);
    showToast('Signed out safely. Visit again soon!', 'info');
  };

  const resetPassword = ({ email, newPassword }) => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const db = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
      const idx = db.findIndex((u) => u.email === cleanEmail);
      if (idx === -1) {
        return { ok: false, error: 'No account found with that email address.' };
      }
      db[idx] = { ...db[idx], passwordHash: hashPass(newPassword) };
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
      showToast('Password updated! You can now sign in.', 'success');
      return { ok: true };
    } catch {
      return { ok: false, error: 'Unable to reset password right now.' };
    }
  };

  const updateProfile = ({ name, phone }) => {
    if (!user) return;
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const updatedUser = { ...user, name: name.trim(), phone: cleanPhone };
    persistSession(updatedUser);
    try {
      const db = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
      const nextDb = db.map((u) =>
        u.email === user.email ? { ...u, name: updatedUser.name, phone: updatedUser.phone } : u
      );
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(nextDb));
    } catch {}
    showToast('Profile details updated!', 'success');
  };

  // ---------- Address Management ----------
  const saveAddresses = (next) => {
    setAddresses(next);
    if (user?.email) {
      try {
        localStorage.setItem(`${ADDRESSES_PREFIX}${user.email}`, JSON.stringify(next));
      } catch {}
    }
  };

  const addAddress = (addrData) => {
    const newId = `addr_${Date.now()}`;
    const shouldBeDefault = addresses.length === 0 || Boolean(addrData.isDefault);
    const cleaned = addresses.map((a) => (shouldBeDefault ? { ...a, isDefault: false } : a));
    const newAddr = { ...addrData, id: newId, isDefault: shouldBeDefault };
    saveAddresses([newAddr, ...cleaned]);
    showToast('Delivery address saved!', 'success');
    return newAddr;
  };

  const updateAddress = (id, addrData) => {
    const shouldBeDefault = Boolean(addrData.isDefault);
    const next = addresses.map((a) => {
      if (a.id === id) return { ...a, ...addrData, id };
      return shouldBeDefault ? { ...a, isDefault: false } : a;
    });
    saveAddresses(next);
    showToast('Address updated!', 'success');
  };

  const deleteAddress = (id) => {
    let next = addresses.filter((a) => a.id !== id);
    if (next.length > 0 && !next.some((a) => a.isDefault)) {
      next = next.map((a, idx) => (idx === 0 ? { ...a, isDefault: true } : a));
    }
    saveAddresses(next);
    showToast('Address removed', 'info');
  };

  const setDefaultAddress = (id) => {
    const next = addresses.map((a) => ({ ...a, isDefault: a.id === id }));
    saveAddresses(next);
    showToast('Default delivery address updated', 'gold');
  };

  // ---------- Order Management ----------
  const saveOrders = (next) => {
    setOrders(next);
    if (user?.email) {
      try {
        localStorage.setItem(`${ORDERS_PREFIX}${user.email}`, JSON.stringify(next));
      } catch {}
    }
  };

  const placeOrder = ({
    items,
    subtotal,
    discount = 0,
    shipping = 0,
    total,
    couponCode = '',
    giftNote = '',
    ribbonStyle = 'Champagne Gold',
    deliverySpeed = 'Standard Insured (3-5 Days)',
    paymentMethod,
    paymentStatus = 'Paid',
    address,
  }) => {
    const orderId = `AURA-${Math.floor(100000 + Math.random() * 900000)}`;
    const estDate = new Date();
    estDate.setDate(estDate.getDate() + (deliverySpeed.includes('Priority') ? 3 : 5));

    const newOrder = {
      id: orderId,
      createdAt: new Date().toISOString(),
      estimatedDelivery: estDate.toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
      items,
      subtotal,
      discount,
      shipping,
      total,
      couponCode,
      giftNote,
      ribbonStyle,
      deliverySpeed,
      paymentMethod,
      paymentStatus,
      address,
      status: 'Order Placed',
      statusStep: 0, // 0: Order Placed, 1: Crafting in Studio, 2: Quality Check, 3: Dispatched, 4: Delivered
    };

    saveOrders([newOrder, ...orders]);
    return newOrder;
  };

  const cancelOrder = (orderId) => {
    const next = orders.map((o) =>
      o.id === orderId ? { ...o, status: 'Cancelled', statusStep: -1 } : o
    );
    saveOrders(next);
    showToast(`Order ${orderId} has been cancelled.`, 'info');
  };

  // Demo helper to let the shop owner/customer preview order tracking progression
  const advanceOrderStatus = (orderId) => {
    const stages = [
      'Order Placed',
      'Crafting in Studio',
      'Quality & Polish',
      'Dispatched',
      'Delivered',
    ];
    const next = orders.map((o) => {
      if (o.id !== orderId || o.statusStep < 0) return o;
      const nextStep = Math.min(stages.length - 1, (o.statusStep ?? 0) + 1);
      return { ...o, statusStep: nextStep, status: stages[nextStep] };
    });
    saveOrders(next);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        addresses,
        orders,
        toast,
        showToast,
        dismissToast,
        register,
        login,
        loginWithGoogle,
        logout,
        resetPassword,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        placeOrder,
        cancelOrder,
        advanceOrderStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
