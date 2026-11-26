import React, { useEffect, useState } from 'react';
import { Save, Sparkles, Truck, Globe, CheckCircle2, AlertCircle } from 'lucide-react';
import { adminApi } from '../../services/api';
import { useStore } from '../../context/StoreContext';

export default function AdminSettingsTab({ showToast }) {
  const { settings, integrations, refreshStore } = useStore();
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.updateSettings(form);
      await refreshStore();
      showToast('Storefront CMS & Delivery Rules saved live! ✨', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Integration Health Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white border border-[#E5DFD6] p-4 flex items-center gap-3 shadow-soft">
          {integrations.razorpayConfigured ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          )}
          <div>
            <p className="text-xs font-semibold text-[#2C2724]">
              Razorpay Payment Gateway:{' '}
              <span className={integrations.razorpayConfigured ? 'text-emerald-700' : 'text-amber-700'}>
                {integrations.razorpayConfigured ? 'Live Keys Connected' : 'Demo Mode (Add keys to server/.env)'}
              </span>
            </p>
            <p className="text-[11px] text-[#8F8177]">
              Set RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET in server/.env when ready to accept live UPI/cards.
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-[#E5DFD6] p-4 flex items-center gap-3 shadow-soft">
          {integrations.googleClientId ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          )}
          <div>
            <p className="text-xs font-semibold text-[#2C2724]">
              Google OAuth Sign-In:{' '}
              <span className={integrations.googleClientId ? 'text-emerald-700' : 'text-amber-700'}>
                {integrations.googleClientId ? 'Live Client ID Configured' : 'Local Dev Mode'}
              </span>
            </p>
            <p className="text-[11px] text-[#8F8177]">
              Set GOOGLE_CLIENT_ID in server/.env for production One-Tap Google login.
            </p>
          </div>
        </div>
      </div>

      {/* Homepage & Announcement CMS */}
      <div className="rounded-2xl bg-white border border-[#E5DFD6] p-5 sm:p-6 shadow-soft space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#EFE9E0]">
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          <h3 className="font-serif text-xl font-semibold text-[#2C2724]">
            Homepage & Announcement Banner
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-[#2C2724] cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(form.announcement_enabled)}
              onChange={(e) => setForm((p) => ({ ...p, announcement_enabled: e.target.checked }))}
            />
            Show Top Announcement Strip
          </label>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#6E6259] mb-1">Announcement Bar Text</label>
          <input
            type="text"
            value={form.announcement_text || ''}
            onChange={(e) => setForm((p) => ({ ...p, announcement_text: e.target.value }))}
            className="w-full rounded-xl border border-[#E5DFD6] px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#6E6259] mb-1">Hero Eyebrow Tag</label>
            <input
              type="text"
              value={form.hero_eyebrow || ''}
              onChange={(e) => setForm((p) => ({ ...p, hero_eyebrow: e.target.value }))}
              className="w-full rounded-xl border border-[#E5DFD6] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6E6259] mb-1">Hero Studio Badge</label>
            <input
              type="text"
              value={form.hero_badge_text || ''}
              onChange={(e) => setForm((p) => ({ ...p, hero_badge_text: e.target.value }))}
              className="w-full rounded-xl border border-[#E5DFD6] px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#6E6259] mb-1">Hero Main Headline</label>
          <input
            type="text"
            value={form.hero_title || ''}
            onChange={(e) => setForm((p) => ({ ...p, hero_title: e.target.value }))}
            className="w-full rounded-xl border border-[#E5DFD6] px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#6E6259] mb-1">Hero Subtitle</label>
          <textarea
            rows={2}
            value={form.hero_subtitle || ''}
            onChange={(e) => setForm((p) => ({ ...p, hero_subtitle: e.target.value }))}
            className="w-full rounded-xl border border-[#E5DFD6] px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Courier, Free Gift & Payments */}
      <div className="rounded-2xl bg-white border border-[#E5DFD6] p-5 sm:p-6 shadow-soft space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#EFE9E0]">
          <Truck className="w-4 h-4 text-[#D4AF37]" />
          <h3 className="font-serif text-xl font-semibold text-[#2C2724]">
            Shipping Fees, Free Velvet Box & Payment Methods
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#6E6259] mb-1">Free Gift Box Min (₹)</label>
            <input
              type="number"
              value={form.free_gift_threshold ?? 999}
              onChange={(e) => setForm((p) => ({ ...p, free_gift_threshold: e.target.value }))}
              className="w-full rounded-xl border border-[#E5DFD6] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6E6259] mb-1">Free Shipping Min (₹)</label>
            <input
              type="number"
              value={form.free_shipping_threshold ?? 999}
              onChange={(e) => setForm((p) => ({ ...p, free_shipping_threshold: e.target.value }))}
              className="w-full rounded-xl border border-[#E5DFD6] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6E6259] mb-1">Standard Courier (₹)</label>
            <input
              type="number"
              value={form.standard_shipping_fee ?? 80}
              onChange={(e) => setForm((p) => ({ ...p, standard_shipping_fee: e.target.value }))}
              className="w-full rounded-xl border border-[#E5DFD6] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6E6259] mb-1">Express Courier (₹)</label>
            <input
              type="number"
              value={form.express_shipping_fee ?? 120}
              onChange={(e) => setForm((p) => ({ ...p, express_shipping_fee: e.target.value }))}
              className="w-full rounded-xl border border-[#E5DFD6] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6E6259] mb-1">Velvet Upgrade (₹)</label>
            <input
              type="number"
              value={form.velvet_box_upgrade_fee ?? 99}
              onChange={(e) => setForm((p) => ({ ...p, velvet_box_upgrade_fee: e.target.value }))}
              className="w-full rounded-xl border border-[#E5DFD6] px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-6 pt-1">
          <label className="flex items-center gap-2 text-xs font-semibold text-[#2C2724] cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(form.razorpay_enabled)}
              onChange={(e) => setForm((p) => ({ ...p, razorpay_enabled: e.target.checked }))}
            />
            Enable Online UPI / Razorpay Payments
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold text-[#2C2724] cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(form.cod_enabled)}
              onChange={(e) => setForm((p) => ({ ...p, cod_enabled: e.target.checked }))}
            />
            Enable Cash on Delivery (COD)
          </label>
        </div>
      </div>

      {/* Contact & Social */}
      <div className="rounded-2xl bg-white border border-[#E5DFD6] p-5 sm:p-6 shadow-soft space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#EFE9E0]">
          <Globe className="w-4 h-4 text-[#D4AF37]" />
          <h3 className="font-serif text-xl font-semibold text-[#2C2724]">
            WhatsApp, Social & Atelier Contact Info
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#6E6259] mb-1">
              WhatsApp Number (with 91 country code, digits only)
            </label>
            <input
              type="text"
              value={form.whatsapp_number || ''}
              onChange={(e) => setForm((p) => ({ ...p, whatsapp_number: e.target.value }))}
              placeholder="918780125711"
              className="w-full rounded-xl border border-[#E5DFD6] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6E6259] mb-1">Support Email</label>
            <input
              type="email"
              value={form.support_email || ''}
              onChange={(e) => setForm((p) => ({ ...p, support_email: e.target.value }))}
              className="w-full rounded-xl border border-[#E5DFD6] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6E6259] mb-1">Instagram Handle</label>
            <input
              type="text"
              value={form.instagram_handle || ''}
              onChange={(e) => setForm((p) => ({ ...p, instagram_handle: e.target.value }))}
              className="w-full rounded-xl border border-[#E5DFD6] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6E6259] mb-1">Studio Location Text</label>
            <input
              type="text"
              value={form.studio_location || ''}
              onChange={(e) => setForm((p) => ({ ...p, studio_location: e.target.value }))}
              className="w-full rounded-xl border border-[#E5DFD6] px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-[#2C2724] text-white text-sm font-semibold px-6 py-3 flex items-center gap-2 hover:bg-[#3F3733] transition-colors disabled:opacity-60"
        >
          <Save className="w-4 h-4 text-[#D4AF37]" />
          {saving ? 'Saving Storefront Settings...' : 'Save All Settings Live'}
        </button>
      </div>
    </form>
  );
}
