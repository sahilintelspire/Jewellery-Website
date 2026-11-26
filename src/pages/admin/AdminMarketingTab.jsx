import React, { useEffect, useState } from 'react';
import {
  Tag,
  Percent,
  Star,
  MessageSquare,
  Mail,
  Plus,
  Trash2,
  Send,
  Check
} from 'lucide-react';
import { adminApi } from '../../services/api';
import { formatINR } from './adminShared';

export default function AdminMarketingTab({ showToast, onStoreChanged }) {
  const [subTab, setSubTab] = useState('coupons');
  const [categories, setCategories] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [subscribers, setSubscribers] = useState([]);

  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    description: '',
    discountType: 'percent',
    discountValue: '10',
    minOrder: '0'
  });
  const [broadcast, setBroadcast] = useState({ subject: '', message: '' });
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  const loadAll = async () => {
    try {
      const [catRes, cpnRes, revRes, inqRes, subRes] = await Promise.all([
        adminApi.getCategories(),
        adminApi.getCoupons(),
        adminApi.getReviews(),
        adminApi.getInquiries(),
        adminApi.getSubscribers()
      ]);
      setCategories(catRes.categories || []);
      setCoupons(cpnRes.coupons || []);
      setReviews(revRes.reviews || []);
      setInquiries(inqRes.inquiries || []);
      setSubscribers(subRes.subscribers || []);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createCategory(newCategory);
      setNewCategory({ name: '', description: '' });
      showToast('Category added! ✨', 'success');
      await loadAll();
      onStoreChanged?.();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleCategory = async (cat) => {
    try {
      await adminApi.updateCategory(cat.id, { isActive: !cat.isActive });
      await loadAll();
      onStoreChanged?.();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteCategory = async (cat) => {
    try {
      await adminApi.deleteCategory(cat.id);
      showToast('Category removed.', 'info');
      await loadAll();
      onStoreChanged?.();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createCoupon({
        ...newCoupon,
        discountValue: Number(newCoupon.discountValue || 0),
        minOrder: Number(newCoupon.minOrder || 0)
      });
      setNewCoupon({ code: '', description: '', discountType: 'percent', discountValue: '10', minOrder: '0' });
      showToast('Promo code activated! ✨', 'success');
      await loadAll();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleCoupon = async (coupon) => {
    try {
      await adminApi.updateCoupon(coupon.id, { isActive: !coupon.isActive });
      await loadAll();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteCoupon = async (id) => {
    try {
      await adminApi.deleteCoupon(id);
      await loadAll();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    setSendingBroadcast(true);
    try {
      const res = await adminApi.broadcastNewsletter(broadcast);
      showToast(
        res.previewCount > 0 && res.sentCount === 0
          ? `Prepared announcement preview for ${res.recipientCount} subscribers (add SMTP in .env for live inbox send).`
          : `Sent drop alert to ${res.sentCount} subscribers! ✨`,
        'success'
      );
      setBroadcast({ subject: '', message: '' });
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSendingBroadcast(false);
    }
  };

  const tabs = [
    { id: 'coupons', label: `Coupons (${coupons.length})`, icon: Percent },
    { id: 'categories', label: `Categories (${categories.length})`, icon: Tag },
    { id: 'reviews', label: `Reviews (${reviews.length})`, icon: Star },
    { id: 'inquiries', label: `Inquiries (${inquiries.length})`, icon: MessageSquare },
    { id: 'newsletter', label: `Subscribers (${subscribers.length})`, icon: Mail }
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 rounded-2xl bg-white border border-[#E5DFD6] p-3 shadow-soft">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSubTab(t.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              subTab === t.id
                ? 'bg-[#2C2724] text-white'
                : 'bg-[#FAF6F0] text-[#6E6259] hover:text-[#2C2724]'
            }`}
          >
            <t.icon className="w-3.5 h-3.5 text-[#D4AF37]" />
            {t.label}
          </button>
        ))}
      </div>

      {/* COUPONS */}
      {subTab === 'coupons' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form onSubmit={handleAddCoupon} className="lg:col-span-4 rounded-2xl bg-white border border-[#E5DFD6] p-5 shadow-soft space-y-3 h-fit">
            <h3 className="font-serif text-xl font-semibold text-[#2C2724]">Create Promo Code</h3>
            <input
              type="text"
              required
              value={newCoupon.code}
              onChange={(e) => setNewCoupon((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
              placeholder="Code (e.g. DIWALI20)"
              className="w-full rounded-xl border border-[#E5DFD6] px-3 py-2 text-sm uppercase"
            />
            <input
              type="text"
              value={newCoupon.description}
              onChange={(e) => setNewCoupon((p) => ({ ...p, description: e.target.value }))}
              placeholder="Description shown at checkout"
              className="w-full rounded-xl border border-[#E5DFD6] px-3 py-2 text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={newCoupon.discountType}
                onChange={(e) => setNewCoupon((p) => ({ ...p, discountType: e.target.value }))}
                className="rounded-xl border border-[#E5DFD6] px-3 py-2 text-sm bg-white"
              >
                <option value="percent">% Percentage Off</option>
                <option value="flat">₹ Flat Discount</option>
                <option value="freeship">Free Shipping</option>
              </select>
              <input
                type="number"
                min="0"
                disabled={newCoupon.discountType === 'freeship'}
                value={newCoupon.discountValue}
                onChange={(e) => setNewCoupon((p) => ({ ...p, discountValue: e.target.value }))}
                placeholder="Value"
                className="rounded-xl border border-[#E5DFD6] px-3 py-2 text-sm disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs text-[#6E6259] mb-1">Minimum Bag Subtotal (₹)</label>
              <input
                type="number"
                min="0"
                value={newCoupon.minOrder}
                onChange={(e) => setNewCoupon((p) => ({ ...p, minOrder: e.target.value }))}
                className="w-full rounded-xl border border-[#E5DFD6] px-3 py-2 text-sm"
              />
            </div>
            <button type="submit" className="w-full rounded-xl bg-[#D4AF37] text-[#2C2724] font-semibold text-sm py-2.5 flex items-center justify-center gap-1.5">
              <Plus className="w-4 h-4" /> Create Code
            </button>
          </form>

          <div className="lg:col-span-8 space-y-3">
            {coupons.map((c) => (
              <div key={c.id} className="rounded-2xl bg-white border border-[#E5DFD6] p-4 shadow-soft flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-[#8E6C27] bg-[#F8EFE2] px-2.5 py-0.5 rounded-lg">
                      {c.code}
                    </span>
                    <span className="text-xs text-[#6E6259]">
                      {c.discountType === 'percent'
                        ? `${c.discountValue}% Off`
                        : c.discountType === 'flat'
                          ? `${formatINR(c.discountValue)} Off`
                          : 'Free Courier Shipping'}
                    </span>
                  </div>
                  <p className="text-xs text-[#6E6259] mt-1">
                    {c.description || 'Promo code'} • Min order: {formatINR(c.minOrder)} • Used {c.usedCount}x
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleCoupon(c)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                      c.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {c.isActive ? 'Active' : 'Paused'}
                  </button>
                  <button type="button" onClick={() => handleDeleteCoupon(c.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CATEGORIES */}
      {subTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form onSubmit={handleAddCategory} className="lg:col-span-4 rounded-2xl bg-white border border-[#E5DFD6] p-5 shadow-soft space-y-3 h-fit">
            <h3 className="font-serif text-xl font-semibold text-[#2C2724]">Add Category</h3>
            <input
              type="text"
              required
              value={newCategory.name}
              onChange={(e) => setNewCategory((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Hair Pins"
              className="w-full rounded-xl border border-[#E5DFD6] px-3 py-2 text-sm"
            />
            <textarea
              rows={2}
              value={newCategory.description}
              onChange={(e) => setNewCategory((p) => ({ ...p, description: e.target.value }))}
              placeholder="Short collection summary"
              className="w-full rounded-xl border border-[#E5DFD6] px-3 py-2 text-sm"
            />
            <button type="submit" className="w-full rounded-xl bg-[#D4AF37] text-[#2C2724] font-semibold text-sm py-2.5 flex items-center justify-center gap-1.5">
              <Plus className="w-4 h-4" /> Add Category
            </button>
          </form>

          <div className="lg:col-span-8 space-y-2.5">
            {categories.map((cat) => (
              <div key={cat.id} className="rounded-2xl bg-white border border-[#E5DFD6] p-4 shadow-soft flex items-center justify-between gap-3">
                <div>
                  <p className="font-serif text-lg font-semibold text-[#2C2724]">
                    {cat.name} <span className="text-xs font-sans text-[#8F8177]">({cat.slug})</span>
                  </p>
                  <p className="text-xs text-[#6E6259]">
                    {cat.description || 'Storefront collection'} • {cat.productCount || 0} products
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs border ${
                      cat.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {cat.isActive ? 'Visible' : 'Hidden'}
                  </button>
                  <button type="button" onClick={() => handleDeleteCategory(cat)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REVIEWS */}
      {subTab === 'reviews' && (
        <div className="space-y-3">
          {reviews.length === 0 ? (
            <div className="rounded-2xl bg-white border border-[#E5DFD6] p-8 text-center text-sm text-[#8F8177]">
              No customer product reviews submitted yet.
            </div>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="rounded-2xl bg-white border border-[#E5DFD6] p-4 shadow-soft flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-[#8E6C27]">{rev.productName} • {rev.rating}/5 ★</p>
                  <p className="text-sm font-semibold text-[#2C2724] mt-0.5">{rev.authorName} — {rev.title || 'Customer Review'}</p>
                  <p className="text-xs text-[#6E6259] mt-1">{rev.comment}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await adminApi.toggleReviewApproval(rev.id, !rev.isApproved);
                      loadAll();
                    }}
                    className={`px-3 py-1 rounded-lg text-xs border ${
                      rev.isApproved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {rev.isApproved ? 'Approved' : 'Hidden'}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await adminApi.deleteReview(rev.id);
                      loadAll();
                    }}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* INQUIRIES */}
      {subTab === 'inquiries' && (
        <div className="space-y-3">
          {inquiries.length === 0 ? (
            <div className="rounded-2xl bg-white border border-[#E5DFD6] p-8 text-center text-sm text-[#8F8177]">
              No Contact Us messages yet.
            </div>
          ) : (
            inquiries.map((inq) => (
              <div key={inq.id} className="rounded-2xl bg-white border border-[#E5DFD6] p-4 shadow-soft flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-[#8E6C27]">{inq.subject}</span>
                  <p className="text-sm font-semibold text-[#2C2724]">{inq.name} ({inq.email} {inq.phone ? `• ${inq.phone}` : ''})</p>
                  <p className="text-xs text-[#6E6259] mt-1 whitespace-pre-line">{inq.message}</p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const nextStatus = inq.status === 'Resolved' ? 'New' : 'Resolved';
                    await adminApi.updateInquiry(inq.id, { status: nextStatus });
                    loadAll();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1 ${
                    inq.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-[#FAF6F0] text-[#2C2724] border-[#E5DFD6]'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" /> {inq.status}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* SUBSCRIBERS & BROADCAST */}
      {subTab === 'newsletter' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form onSubmit={handleBroadcast} className="lg:col-span-5 rounded-2xl bg-white border border-[#E5DFD6] p-5 shadow-soft space-y-3 h-fit">
            <h3 className="font-serif text-xl font-semibold text-[#2C2724]">
              Send Drop Alert Broadcast
            </h3>
            <p className="text-xs text-[#6E6259]">
              Notify all {subscribers.length} subscribers about a new handmade batch or festive offer.
            </p>
            <input
              type="text"
              required
              value={broadcast.subject}
              onChange={(e) => setBroadcast((p) => ({ ...p, subject: e.target.value }))}
              placeholder="Subject: Monsoon Rose Quartz Drop is Live ✨"
              className="w-full rounded-xl border border-[#E5DFD6] px-3 py-2 text-sm"
            />
            <textarea
              rows={4}
              required
              value={broadcast.message}
              onChange={(e) => setBroadcast((p) => ({ ...p, message: e.target.value }))}
              placeholder="Write a warm note + exclusive coupon code..."
              className="w-full rounded-xl border border-[#E5DFD6] px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={sendingBroadcast || subscribers.length === 0}
              className="w-full rounded-xl bg-[#2C2724] text-white text-sm font-semibold py-2.5 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Send className="w-4 h-4 text-[#D4AF37]" />
              {sendingBroadcast ? 'Sending...' : 'Send Broadcast Email'}
            </button>
          </form>

          <div className="lg:col-span-7 rounded-2xl bg-white border border-[#E5DFD6] p-5 shadow-soft">
            <h4 className="font-serif text-lg font-semibold text-[#2C2724] mb-3">
              Subscribers List ({subscribers.length})
            </h4>
            {subscribers.length === 0 ? (
              <p className="text-sm text-[#8F8177]">No newsletter subscribers yet.</p>
            ) : (
              <div className="divide-y divide-[#EFE9E0]">
                {subscribers.map((sub) => (
                  <div key={sub.id} className="py-2.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-[#2C2724]">{sub.email}</span>
                    <span className="text-[#8F8177]">{sub.source}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
