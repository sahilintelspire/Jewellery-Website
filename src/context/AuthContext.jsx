import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi, getAuthToken, setAuthToken, storefrontApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customOrders, setCustomOrders] = useState([]);
  const [authReady, setAuthReady] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((prev) => (prev && prev.id === id ? null : prev));
    }, 3600);
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  const refreshAccountData = useCallback(async () => {
    if (!getAuthToken()) {
      setOrders([]);
      setCustomOrders([]);
      return;
    }
    try {
      const [ordersRes, customRes] = await Promise.all([
        storefrontApi.getMyOrders(),
        storefrontApi.getMyCustomOrders()
      ]);
      setOrders(ordersRes.orders || []);
      setCustomOrders(customRes.customOrders || []);
    } catch {
      // Non-fatal if background fetch fails
    }
  }, []);

  useEffect(() => {
    let active = true;
    const restoreSession = async () => {
      const token = getAuthToken();
      if (!token) {
        if (active) setAuthReady(true);
        return;
      }
      try {
        const res = await authApi.me();
        if (!active) return;
        setUser(res.user);
        setAddresses(res.addresses || []);
        refreshAccountData();
      } catch {
        setAuthToken(null);
        if (active) {
          setUser(null);
          setAddresses([]);
        }
      } finally {
        if (active) setAuthReady(true);
      }
    };
    restoreSession();
    return () => {
      active = false;
    };
  }, [refreshAccountData]);

  const register = async ({ name, email, phone = '', password }) => {
    try {
      const res = await authApi.register({ name, email, phone, password });
      setAuthToken(res.token);
      setUser(res.user);
      setAddresses(res.addresses || []);
      setOrders([]);
      setCustomOrders([]);
      showToast(`Welcome to AURA Atelier, ${res.user.name.split(' ')[0]}! ✨`, 'gold');
      return { ok: true, user: res.user };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  const login = async ({ email, password }) => {
    try {
      const res = await authApi.login({ email, password });
      setAuthToken(res.token);
      setUser(res.user);
      setAddresses(res.addresses || []);
      refreshAccountData();
      showToast(`Welcome back, ${res.user.name.split(' ')[0]}! ✨`, 'gold');
      return { ok: true, user: res.user };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  const loginWithGoogle = async ({ idToken, email, name, avatarUrl, googleSub }) => {
    try {
      const res = await authApi.googleSignIn({ idToken, email, name, avatarUrl, googleSub });
      setAuthToken(res.token);
      setUser(res.user);
      setAddresses(res.addresses || []);
      refreshAccountData();
      showToast(`Signed in with Google as ${res.user.name.split(' ')[0]}! ✨`, 'gold');
      return { ok: true, user: res.user };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setAddresses([]);
    setOrders([]);
    setCustomOrders([]);
    showToast('You have been signed out gracefully.', 'info');
  };

  const requestPasswordReset = async (email) => {
    try {
      const res = await authApi.forgotPassword(email);
      return { ok: true, ...res };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  const resetPassword = async ({ email, otp, newPassword }) => {
    try {
      await authApi.resetPassword({ email, otp, newPassword });
      showToast('Password updated! You can now sign in.', 'success');
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  const updateProfile = async ({ name, phone }) => {
    if (!user) return;
    try {
      const res = await authApi.updateProfile({ name, phone });
      setUser(res.user);
      showToast('Profile details updated!', 'success');
      return { ok: true, user: res.user };
    } catch (err) {
      showToast(err.message, 'error');
      return { ok: false, error: err.message };
    }
  };

  // ---------- Address Management ----------
  const addAddress = async (addrData) => {
    try {
      const res = await authApi.addAddress(addrData);
      const listRes = await authApi.getAddresses();
      setAddresses(listRes.addresses || []);
      showToast('Delivery address saved!', 'success');
      return res.address;
    } catch (err) {
      showToast(err.message, 'error');
      return null;
    }
  };

  const updateAddress = async (id, addrData) => {
    try {
      await authApi.updateAddress(id, addrData);
      const listRes = await authApi.getAddresses();
      setAddresses(listRes.addresses || []);
      showToast('Address updated!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const deleteAddress = async (id) => {
    try {
      await authApi.deleteAddress(id);
      const listRes = await authApi.getAddresses();
      setAddresses(listRes.addresses || []);
      showToast('Address removed', 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const setDefaultAddress = async (id) => {
    try {
      await authApi.updateAddress(id, { isDefault: true });
      const listRes = await authApi.getAddresses();
      setAddresses(listRes.addresses || []);
      showToast('Default delivery address updated', 'gold');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // ---------- Order Placement & Sync ----------
  const placeOrder = async (payload) => {
    const res = await storefrontApi.placeOrder(payload);
    const created = res.order;
    setOrders((prev) => [created, ...prev]);
    return created;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authReady,
        isAuthenticated: Boolean(user),
        addresses,
        orders,
        customOrders,
        toast,
        showToast,
        dismissToast,
        refreshAccountData,
        register,
        login,
        loginWithGoogle,
        logout,
        requestPasswordReset,
        resetPassword,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        placeOrder
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
