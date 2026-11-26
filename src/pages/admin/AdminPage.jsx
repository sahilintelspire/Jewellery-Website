import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Wand2,
  ShoppingBag,
  Gem,
  Megaphone,
  Settings,
  ExternalLink,
  RefreshCw,
  LogOut,
  Menu,
  X,
  Lock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { adminApi } from '../../services/api';
import AdminOverviewTab from './AdminOverviewTab';
import AdminCustomStudioTab from './AdminCustomStudioTab';
import AdminOrdersTab from './AdminOrdersTab';
import AdminProductsTab from './AdminProductsTab';
import AdminMarketingTab from './AdminMarketingTab';
import AdminSettingsTab from './AdminSettingsTab';

const NAV_ITEMS = [
  { id: 'overview', label: 'Studio Overview', icon: LayoutDashboard },
  { id: 'custom', label: 'Custom Orders Studio', icon: Wand2, badgeKey: 'pendingCustomRequests' },
  { id: 'orders', label: 'Orders & Dispatch', icon: ShoppingBag, badgeKey: 'activeOrders' },
  { id: 'products', label: 'Jewellery Catalog', icon: Gem },
  { id: 'marketing', label: 'Coupons, Reviews & Mail', icon: Megaphone },
  { id: 'settings', label: 'Storefront Settings', icon: Settings }
];

export default function AdminPage() {
  const { user, login, logout, showToast } = useAuth();
  const { settings, refreshStore } = useStore();

  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [loadingDash, setLoadingDash] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);

  const isAdmin = user?.role === 'admin';

  const loadDashboard = async () => {
    if (!isAdmin) return;
    setLoadingDash(true);
    try {
      const data = await adminApi.getDashboard();
      setDashboard(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoadingDash(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [isAdmin]);

  const handleAdminSignIn = async (e) => {
    e.preventDefault();
    setLoginBusy(true);
    try {
      const res = await login({ email, password });
      if (!res?.ok) {
        showToast(res?.error || 'Invalid email or password.', 'error');
      } else if (res?.user?.role !== 'admin') {
        showToast('This account is a customer account, not Studio Admin.', 'error');
      } else {
        showToast('Welcome back to AURA Atelier Studio ✨', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Sign in failed.', 'error');
    } finally {
      setLoginBusy(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl bg-white border border-[#E5DFD6] shadow-soft p-6 sm:p-8 space-y-5">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#F8EFE2] border border-[#D4AF37]/40 mx-auto flex items-center justify-center text-[#8E6C27]">
              <Lock className="w-5 h-5" />
            </div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#8E6C27] font-semibold">
              AURA JEWELS ATELIER
            </p>
            <h1 className="font-serif text-3xl font-semibold text-[#2C2724]">
              Studio Admin Login
            </h1>
            <p className="text-xs text-[#6E6259]">
              Manage custom jewellery commissions, products, prices, orders, and storefront announcements.
            </p>
          </div>

          {user && user.role !== 'admin' && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 flex items-center justify-between gap-2">
              <span>Signed in as customer ({user.email}). Please use an Admin account.</span>
              <button
                type="button"
                onClick={logout}
                className="underline font-semibold shrink-0"
              >
                Sign out
              </button>
            </div>
          )}

          <form onSubmit={handleAdminSignIn} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[#6E6259] mb-1">Admin Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@aurajewels.in"
                className="w-full rounded-xl border border-[#E5DFD6] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6E6259] mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter studio password"
                className="w-full rounded-xl border border-[#E5DFD6] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <button
              type="submit"
              disabled={loginBusy}
              className="w-full rounded-xl bg-[#2C2724] text-white text-sm font-semibold py-3 hover:bg-[#3F3733] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              {loginBusy ? 'Signing In...' : 'Enter Studio Workspace'}
            </button>
          </form>

          <div className="pt-2 text-center">
            <Link to="/" className="text-xs font-medium text-[#8E6C27] hover:underline">
              ← Back to Live Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeNavObj = NAV_ITEMS.find((n) => n.id === activeTab) || NAV_ITEMS[0];

  const SidebarContent = (
    <div className="flex flex-col h-full justify-between p-4">
      <div>
        <div className="px-2 py-3 border-b border-[#EFE9E0]">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#8E6C27] font-semibold">
            {settings.brand_name || 'AURA JEWELS'}
          </p>
          <h2 className="font-serif text-2xl font-semibold text-[#2C2724]">
            Atelier Admin
          </h2>
          <p className="text-xs text-[#8F8177] truncate mt-0.5">{user.email}</p>
        </div>

        <nav className="mt-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const count = item.badgeKey ? dashboard?.metrics?.[item.badgeKey] || 0 : 0;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-[#2C2724] text-white shadow-sm'
                    : 'text-[#6E6259] hover:bg-[#FAF6F0] hover:text-[#2C2724]'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <item.icon className={`w-4 h-4 ${active ? 'text-[#D4AF37]' : 'text-[#8F8177]'}`} />
                  {item.label}
                </span>
                {count > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      active ? 'bg-[#D4AF37] text-[#2C2724]' : 'bg-[#F3DAD5] text-[#2C2724]'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-2 pt-4 border-t border-[#EFE9E0]">
        <Link
          to="/"
          target="_blank"
          rel="noreferrer"
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#E5DFD6] bg-[#FAF6F0] px-3 py-2 text-xs font-semibold text-[#2C2724] hover:border-[#D4AF37]"
        >
          View Live Website <ExternalLink className="w-3.5 h-3.5 text-[#8E6C27]" />
        </Link>
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-white border-r border-[#E5DFD6] shrink-0 sticky top-0 h-screen">
        {SidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative w-72 max-w-[85vw] bg-white h-full z-10 shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-[#FAF6F0]"
            >
              <X className="w-5 h-5" />
            </button>
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-[#FAF6F0]/90 backdrop-blur-md border-b border-[#E5DFD6] px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white border border-[#E5DFD6]"
              aria-label="Open Studio Menu"
            >
              <Menu className="w-5 h-5 text-[#2C2724]" />
            </button>
            <div className="min-w-0">
              <h1 className="font-serif text-xl sm:text-2xl font-semibold text-[#2C2724] truncate">
                {activeNavObj.label}
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              loadDashboard();
              refreshStore();
            }}
            className="rounded-xl bg-white border border-[#E5DFD6] px-3 py-2 text-xs font-semibold text-[#2C2724] flex items-center gap-1.5 hover:border-[#D4AF37]"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#8E6C27] ${loadingDash ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <AdminOverviewTab dashboard={dashboard} onNavigateTab={setActiveTab} />
          )}
          {activeTab === 'custom' && (
            <AdminCustomStudioTab
              showToast={showToast}
              whatsappNumber={settings.whatsapp_number}
              onStoreChanged={refreshStore}
              onDataReload={loadDashboard}
            />
          )}
          {activeTab === 'orders' && (
            <AdminOrdersTab showToast={showToast} onDataReload={loadDashboard} />
          )}
          {activeTab === 'products' && (
            <AdminProductsTab
              showToast={showToast}
              onStoreChanged={refreshStore}
              onDataReload={loadDashboard}
            />
          )}
          {activeTab === 'marketing' && (
            <AdminMarketingTab showToast={showToast} onStoreChanged={refreshStore} />
          )}
          {activeTab === 'settings' && <AdminSettingsTab showToast={showToast} />}
        </main>
      </div>
    </div>
  );
}
