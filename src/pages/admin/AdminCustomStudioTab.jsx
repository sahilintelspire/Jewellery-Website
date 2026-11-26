import React, { useEffect, useState } from 'react';
import {
  Wand2,
  Plus,
  Trash2,
  Check,
  ExternalLink,
  MessageCircle,
  Sparkles,
  Image as ImageIcon,
  Save
} from 'lucide-react';
import { adminApi } from '../../services/api';
import { CUSTOM_STATUS_OPTIONS, formatINR, getStatusPillClass } from './adminShared';

const GROUP_LABELS = {
  jewellery_type: 'Jewellery Types',
  crystal_element: 'Crystals & Botanicals',
  finish_style: 'Hardware & Finish',
  budget_tier: 'Budget Tiers'
};

export default function AdminCustomStudioTab({ showToast, whatsappNumber, onStoreChanged, onDataReload }) {
  const [subTab, setSubTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [options, setOptions] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState(null);
  const [quoteDraft, setQuoteDraft] = useState({ status: '', quotedPrice: '', adminReply: '' });
  const [savingQuote, setSavingQuote] = useState(false);

  const [newOption, setNewOption] = useState({
    optionGroup: 'jewellery_type',
    label: '',
    subtitle: '',
    extraPrice: '0',
    swatchColor: '#F3DAD5'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [reqRes, optRes] = await Promise.all([
        adminApi.getCustomOrders(statusFilter),
        adminApi.getCustomOptions()
      ]);
      const list = reqRes.customOrders || [];
      setRequests(list);
      setOptions(optRes.options || []);
      if (selectedReq) {
        const refreshed = list.find((r) => r.id === selectedReq.id);
        if (refreshed) {
          setSelectedReq(refreshed);
          setQuoteDraft({
            status: refreshed.status,
            quotedPrice: refreshed.quotedPrice ? String(refreshed.quotedPrice) : '',
            adminReply: refreshed.adminReply || ''
          });
        }
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleSelectRequest = (req) => {
    setSelectedReq(req);
    setQuoteDraft({
      status: req.status,
      quotedPrice: req.quotedPrice ? String(req.quotedPrice) : req.estimatedPrice ? String(req.estimatedPrice) : '',
      adminReply: req.adminReply || ''
    });
  };

  const handleSaveQuote = async (e) => {
    e.preventDefault();
    if (!selectedReq) return;
    setSavingQuote(true);
    try {
      const res = await adminApi.updateCustomOrder(selectedReq.id, {
        status: quoteDraft.status,
        quotedPrice: quoteDraft.quotedPrice === '' ? null : Number(quoteDraft.quotedPrice),
        adminReply: quoteDraft.adminReply
      });
      showToast(`Custom request ${res.customOrder.requestCode} updated! ✨`, 'success');
      await loadData();
      onDataReload?.();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingQuote(false);
    }
  };

  const handleAddOption = async (e) => {
    e.preventDefault();
    if (!newOption.label.trim()) return;
    try {
      await adminApi.createCustomOption({
        ...newOption,
        extraPrice: Number(newOption.extraPrice || 0)
      });
      setNewOption((prev) => ({ ...prev, label: '', subtitle: '', extraPrice: '0' }));
      showToast('Added new Customizer option! Live on storefront now ✨', 'success');
      await loadData();
      onStoreChanged?.();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleOption = async (opt) => {
    try {
      await adminApi.updateCustomOption(opt.id, { isActive: !opt.isActive });
      showToast(`${opt.label} ${!opt.isActive ? 'enabled' : 'hidden'}.`, 'info');
      await loadData();
      onStoreChanged?.();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteOption = async (opt) => {
    if (!window.confirm(`Remove "${opt.label}" from Custom Order Builder?`)) return;
    try {
      await adminApi.deleteCustomOption(opt.id);
      showToast(`Deleted "${opt.label}".`, 'info');
      await loadData();
      onStoreChanged?.();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const buildWhatsappHref = (req) => {
    const cleanPhone = (req.customerPhone || whatsappNumber || '918780125711').replace(/[^0-9]/g, '');
    const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const msg = encodeURIComponent(
      `Hi ${req.customerName} ✨ Regarding your AURA JEWELS Custom Request *${req.requestCode}* (${req.jewelryType} with ${req.crystal}): ${
        quoteDraft.quotedPrice ? `Studio Quote is ₹${quoteDraft.quotedPrice}. ` : ''
      }${quoteDraft.adminReply || ''}`
    );
    return `https://wa.me/${waPhone}?text=${msg}`;
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation switch */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white border border-[#E5DFD6] p-3 shadow-soft">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSubTab('requests')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              subTab === 'requests'
                ? 'bg-[#2C2724] text-white'
                : 'bg-[#FAF6F0] text-[#6E6259] hover:text-[#2C2724]'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 text-[#D4AF37]" />
            Customer Bespoke Requests ({requests.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab('options')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              subTab === 'options'
                ? 'bg-[#2C2724] text-white'
                : 'bg-[#FAF6F0] text-[#6E6259] hover:text-[#2C2724]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            Customizer Builder Options ({options.length})
          </button>
        </div>

        {subTab === 'requests' && (
          <div className="flex flex-wrap gap-1.5">
            {['All', ...CUSTOM_STATUS_OPTIONS].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                  statusFilter === st
                    ? 'bg-[#D4AF37] text-[#2C2724] border-[#D4AF37]'
                    : 'bg-[#FAF6F0] text-[#6E6259] border-[#E5DFD6]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SUBTAB 1: INCOMING BESPOKE REQUESTS */}
      {subTab === 'requests' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-3">
            {loading ? (
              <div className="rounded-2xl bg-white border border-[#E5DFD6] p-8 text-center text-sm text-[#8F8177]">
                Loading custom commissions...
              </div>
            ) : requests.length === 0 ? (
              <div className="rounded-2xl bg-white border border-[#E5DFD6] p-8 text-center text-sm text-[#8F8177]">
                No bespoke requests matching "{statusFilter}".
              </div>
            ) : (
              requests.map((req) => (
                <button
                  key={req.id}
                  type="button"
                  onClick={() => handleSelectRequest(req)}
                  className={`w-full text-left rounded-2xl border p-4 transition-all ${
                    selectedReq?.id === req.id
                      ? 'bg-[#FBF7F0] border-[#D4AF37] shadow-soft'
                      : 'bg-white border-[#E5DFD6] hover:border-[#D4AF37]/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold tracking-wider text-[#8E6C27]">
                      {req.requestCode}
                    </span>
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full border ${getStatusPillClass(req.status)}`}>
                      {req.status}
                    </span>
                  </div>
                  <p className="mt-1.5 font-serif text-lg font-semibold text-[#2C2724]">
                    {req.customerName} — {req.jewelryType}
                  </p>
                  <p className="text-xs text-[#6E6259] mt-0.5">
                    {req.crystal} • {req.finishStyle || 'Standard Finish'}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[#8F8177]">
                    <span>Phone: {req.customerPhone} • Budget: {req.budget}</span>
                    {req.quotedPrice ? (
                      <span className="font-semibold text-[#2C2724]">Quoted: {formatINR(req.quotedPrice)}</span>
                    ) : req.estimatedPrice ? (
                      <span>Est: {formatINR(req.estimatedPrice)}</span>
                    ) : null}
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="lg:col-span-6">
            {!selectedReq ? (
              <div className="rounded-2xl bg-white border border-[#E5DFD6] p-10 text-center text-sm text-[#8F8177]">
                Select any Custom Commission on the left to inspect uploaded inspiration photos, send a Studio Quote, or update crafting status.
              </div>
            ) : (
              <form
                onSubmit={handleSaveQuote}
                className="rounded-2xl bg-white border border-[#E5DFD6] p-5 sm:p-6 shadow-soft space-y-4 sticky top-24"
              >
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#EFE9E0]">
                  <div>
                    <span className="text-xs font-bold tracking-wider text-[#8E6C27]">
                      {selectedReq.requestCode}
                    </span>
                    <h3 className="font-serif text-2xl font-semibold text-[#2C2724]">
                      {selectedReq.customerName}
                    </h3>
                    <p className="text-xs text-[#6E6259]">
                      {selectedReq.customerPhone} {selectedReq.customerEmail ? `• ${selectedReq.customerEmail}` : ''}
                    </p>
                  </div>
                  <a
                    href={buildWhatsappHref(selectedReq)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold px-3 py-2 hover:bg-emerald-700 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    WhatsApp Customer
                  </a>
                </div>

                {/* Spec Details */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-[#FAF6F0] rounded-xl p-3.5 border border-[#EFE9E0]">
                  <div>
                    <span className="text-[#8F8177]">Piece Type:</span>
                    <p className="font-semibold text-[#2C2724]">{selectedReq.jewelryType}</p>
                  </div>
                  <div>
                    <span className="text-[#8F8177]">Crystal / Charm:</span>
                    <p className="font-semibold text-[#2C2724]">{selectedReq.crystal}</p>
                  </div>
                  <div>
                    <span className="text-[#8F8177]">Finish & Budget:</span>
                    <p className="font-semibold text-[#2C2724]">
                      {selectedReq.finishStyle || 'Studio Choice'} • {selectedReq.budget}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#8F8177]">Size / Engraving:</span>
                    <p className="font-semibold text-[#2C2724]">
                      {selectedReq.wristSize || 'Standard'} / {selectedReq.engravingText || 'None'}
                    </p>
                  </div>
                </div>

                {selectedReq.notes && (
                  <div className="text-xs bg-white rounded-xl p-3 border border-[#E5DFD6]">
                    <span className="font-semibold text-[#2C2724]">Customer Notes:</span>
                    <p className="mt-1 text-[#6E6259] whitespace-pre-line">{selectedReq.notes}</p>
                  </div>
                )}

                {selectedReq.referenceImageUrl && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-[#2C2724] flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#D4AF37]" /> Customer Inspiration Photo
                    </span>
                    <a
                      href={selectedReq.referenceImageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block relative rounded-xl overflow-hidden border border-[#E5DFD6] max-h-56 group"
                    >
                      <img
                        src={selectedReq.referenceImageUrl}
                        alt="Reference design"
                        className="w-full h-48 object-cover"
                      />
                      <span className="absolute bottom-2 right-2 bg-white/90 text-[#2C2724] text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
                        Open Full Size <ExternalLink className="w-3 h-3" />
                      </span>
                    </a>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-[#6E6259] mb-1">
                      Studio Quote Price (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={quoteDraft.quotedPrice}
                      onChange={(e) => setQuoteDraft((p) => ({ ...p, quotedPrice: e.target.value }))}
                      placeholder="e.g. 1499"
                      className="w-full rounded-xl border border-[#E5DFD6] px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#6E6259] mb-1">
                      Workflow Status
                    </label>
                    <select
                      value={quoteDraft.status}
                      onChange={(e) => setQuoteDraft((p) => ({ ...p, status: e.target.value }))}
                      className="w-full rounded-xl border border-[#E5DFD6] px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#D4AF37]"
                    >
                      {CUSTOM_STATUS_OPTIONS.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#6E6259] mb-1">
                    Reply / Studio Design Note (sent in customer email & account view)
                  </label>
                  <textarea
                    rows={3}
                    value={quoteDraft.adminReply}
                    onChange={(e) => setQuoteDraft((p) => ({ ...p, adminReply: e.target.value }))}
                    placeholder="e.g. We can pair AAA Rose Quartz with pressed sakura charms and dispatch in 3 days!"
                    className="w-full rounded-xl border border-[#E5DFD6] px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingQuote}
                  className="w-full rounded-xl bg-[#2C2724] text-white text-sm font-semibold py-2.5 px-4 hover:bg-[#3F3733] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Save className="w-4 h-4 text-[#D4AF37]" />
                  {savingQuote ? 'Saving Quote & Sending Email...' : 'Save Quote & Notify Customer'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: CUSTOMIZER OPTIONS MANAGER */}
      {subTab === 'options' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleAddOption}
            className="lg:col-span-4 rounded-2xl bg-white border border-[#E5DFD6] p-5 shadow-soft space-y-3 h-fit"
          >
            <h3 className="font-serif text-xl font-semibold text-[#2C2724]">
              Add Builder Option
            </h3>
            <p className="text-xs text-[#6E6259]">
              Anything you add or hide here updates the live <span className="font-semibold">/custom-order</span> studio builder instantly.
            </p>

            <div>
              <label className="block text-xs font-medium text-[#6E6259] mb-1">Option Group</label>
              <select
                value={newOption.optionGroup}
                onChange={(e) => setNewOption((p) => ({ ...p, optionGroup: e.target.value }))}
                className="w-full rounded-xl border border-[#E5DFD6] px-3 py-2 text-sm bg-white"
              >
                {Object.entries(GROUP_LABELS).map(([k, lbl]) => (
                  <option key={k} value={k}>{lbl}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6E6259] mb-1">Label Name *</label>
              <input
                type="text"
                required
                value={newOption.label}
                onChange={(e) => setNewOption((p) => ({ ...p, label: e.target.value }))}
                placeholder="e.g. Moonstone Celestial Stone"
                className="w-full rounded-xl border border-[#E5DFD6] px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6E6259] mb-1">Subtitle / Note</label>
              <input
                type="text"
                value={newOption.subtitle}
                onChange={(e) => setNewOption((p) => ({ ...p, subtitle: e.target.value }))}
                placeholder="Short description shown on card"
                className="w-full rounded-xl border border-[#E5DFD6] px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#6E6259] mb-1">Base / Add-on (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={newOption.extraPrice}
                  onChange={(e) => setNewOption((p) => ({ ...p, extraPrice: e.target.value }))}
                  className="w-full rounded-xl border border-[#E5DFD6] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6E6259] mb-1">Swatch Color</label>
                <input
                  type="color"
                  value={newOption.swatchColor}
                  onChange={(e) => setNewOption((p) => ({ ...p, swatchColor: e.target.value }))}
                  className="w-full h-[38px] rounded-xl border border-[#E5DFD6] p-1 bg-white cursor-pointer"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-[#D4AF37] text-[#2C2724] font-semibold text-sm py-2.5 flex items-center justify-center gap-2 hover:bg-[#E2BE48] transition-colors"
            >
              <Plus className="w-4 h-4" /> Add to Customizer
            </button>
          </form>

          <div className="lg:col-span-8 space-y-4">
            {Object.entries(GROUP_LABELS).map(([groupKey, groupTitle]) => {
              const items = options.filter((o) => o.optionGroup === groupKey);
              return (
                <div key={groupKey} className="rounded-2xl bg-white border border-[#E5DFD6] p-5 shadow-soft">
                  <h4 className="font-serif text-lg font-semibold text-[#2C2724] mb-3">
                    {groupTitle}
                  </h4>
                  <div className="space-y-2">
                    {items.map((opt) => (
                      <div
                        key={opt.id}
                        className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 ${
                          opt.isActive ? 'bg-[#FAF6F0]/50 border-[#EFE9E0]' : 'bg-stone-50 border-stone-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {opt.swatchColor && (
                            <span
                              className="w-4 h-4 rounded-full border border-[#D4AF37]/40 shrink-0"
                              style={{ backgroundColor: opt.swatchColor }}
                            />
                          )}
                          <div>
                            <p className="text-sm font-medium text-[#2C2724]">{opt.label}</p>
                            {opt.subtitle && <p className="text-xs text-[#8F8177]">{opt.subtitle}</p>}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[#8E6C27] bg-[#F8EFE2] px-2.5 py-1 rounded-full">
                            {opt.extraPrice > 0 ? `+${formatINR(opt.extraPrice)}` : 'Included'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleOption(opt)}
                            className={`text-xs px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1 ${
                              opt.isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-white text-[#6E6259] border-[#E5DFD6]'
                            }`}
                          >
                            <Check className="w-3 h-3" /> {opt.isActive ? 'Active' : 'Hidden'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteOption(opt)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                            title="Delete option"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
