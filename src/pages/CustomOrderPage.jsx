import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  MessageCircle,
  Upload,
  CheckCircle2,
  X,
  Image as ImageIcon,
  Wand2
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { storefrontApi } from '../services/api';

const FALLBACK_TYPES = [
  { id: 'f1', label: 'Bracelet', extraPrice: 699 },
  { id: 'f2', label: 'Resin Pendant', extraPrice: 899 },
  { id: 'f3', label: 'Couple Bands', extraPrice: 1299 },
  { id: 'f4', label: 'Pearl Choker', extraPrice: 1399 }
];

const FALLBACK_CRYSTALS = [
  { id: 'c1', label: 'Rose Quartz (Love & Healing)', extraPrice: 150, swatchColor: '#F3DAD5' },
  { id: 'c2', label: 'Raw Amethyst (Peace)', extraPrice: 180, swatchColor: '#C7B8EA' },
  { id: 'c3', label: 'Freshwater Baroque Pearl', extraPrice: 250, swatchColor: '#F8F4EC' },
  { id: 'c4', label: 'Botanical Real Flower', extraPrice: 200, swatchColor: '#FADADD' },
  { id: 'c5', label: 'Custom Initials', extraPrice: 120, swatchColor: '#D4AF37' }
];

const FALLBACK_BUDGETS = [
  { id: 'b1', label: 'Under ₹999' },
  { id: 'b2', label: '₹1,000 - ₹2,000' },
  { id: 'b3', label: '₹2,000+ Luxury' }
];

export default function CustomOrderPage() {
  const { customConfig, settings } = useStore();
  const { user, showToast, refreshAccountData } = useAuth();

  const typeOptions = customConfig.jewelleryTypes?.length ? customConfig.jewelleryTypes : FALLBACK_TYPES;
  const crystalOptions = customConfig.crystals?.length ? customConfig.crystals : FALLBACK_CRYSTALS;
  const finishOptions = customConfig.finishes || [];
  const budgetOptions = customConfig.budgets?.length ? customConfig.budgets : FALLBACK_BUDGETS;

  const [jewelleryType, setJewelleryType] = useState(typeOptions[0]?.label || 'Bracelet');
  const [crystalType, setCrystalType] = useState(crystalOptions[0]?.label || 'Rose Quartz (Love & Healing)');
  const [finishStyle, setFinishStyle] = useState(finishOptions[0]?.label || '');
  const [budget, setBudget] = useState(budgetOptions[1]?.label || budgetOptions[0]?.label || '₹1,000 - ₹2,000');

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [wristSize, setWristSize] = useState('');
  const [engravingText, setEngravingText] = useState('');
  const [notes, setNotes] = useState('');

  const [referenceImageUrl, setReferenceImageUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState(null);

  useEffect(() => {
    if (typeOptions.length && !typeOptions.some((o) => o.label === jewelleryType)) {
      setJewelleryType(typeOptions[0].label);
    }
    if (crystalOptions.length && !crystalOptions.some((o) => o.label === crystalType)) {
      setCrystalType(crystalOptions[0].label);
    }
    if (finishOptions.length && !finishOptions.some((o) => o.label === finishStyle)) {
      setFinishStyle(finishOptions[0].label);
    }
    if (budgetOptions.length && !budgetOptions.some((o) => o.label === budget)) {
      setBudget(budgetOptions[0].label);
    }
  }, [typeOptions, crystalOptions, finishOptions, budgetOptions]);

  useEffect(() => {
    if (user) {
      setCustomerName((prev) => prev || user.name || '');
      setCustomerPhone((prev) => prev || user.phone || '');
      setCustomerEmail((prev) => prev || user.email || '');
    }
  }, [user]);

  const estimatedTotal = useMemo(() => {
    const t = typeOptions.find((o) => o.label === jewelleryType)?.extraPrice || 0;
    const c = crystalOptions.find((o) => o.label === crystalType)?.extraPrice || 0;
    const f = finishOptions.find((o) => o.label === finishStyle)?.extraPrice || 0;
    return Number(t) + Number(c) + Number(f);
  }, [typeOptions, crystalOptions, finishOptions, jewelleryType, crystalType, finishStyle]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const res = await storefrontApi.uploadCustomReference(file);
      setReferenceImageUrl(res.url);
      showToast('Inspiration photo attached to your request ✨', 'success');
    } catch (err) {
      showToast(err.message || 'Could not upload reference image.', 'error');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await storefrontApi.submitCustomOrder({
        customerName,
        customerPhone,
        customerEmail,
        jewelryType: jewelleryType,
        crystal: crystalType,
        finishStyle,
        budget,
        wristSize,
        engravingText,
        notes,
        referenceImageUrl
      });
      setSubmittedOrder(res.customOrder);
      refreshAccountData();
      showToast(`Custom request ${res.customOrder.requestCode} saved! ✨`, 'success');
    } catch (err) {
      showToast(err.message || 'Please check required fields and try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openWhatsappWithCode = (orderObj) => {
    const waNum = (settings.whatsapp_number || '918780125711').replace(/[^0-9]/g, '');
    const message =
      `*Hi AURA Jewels! My Custom Request Code is ${orderObj.requestCode}:*%0A%0A` +
      `- *Name:* ${orderObj.customerName}%0A` +
      `- *Type:* ${orderObj.jewelryType}%0A` +
      `- *Gemstone / Charm:* ${orderObj.crystal}%0A` +
      (orderObj.finishStyle ? `- *Finish:* ${orderObj.finishStyle}%0A` : '') +
      `- *Budget:* ${orderObj.budget}%0A` +
      (orderObj.wristSize ? `- *Size:* ${orderObj.wristSize}%0A` : '') +
      (orderObj.engravingText ? `- *Engraving / Initials:* ${orderObj.engravingText}%0A` : '') +
      `- *Details:* ${orderObj.notes || 'Standard'}%0A%0A` +
      `Excited to craft this bespoke piece together!`;

    window.open(`https://wa.me/${waNum}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen py-10 sm:py-16 px-4 sm:px-6 lg:px-16 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-100 text-gold-800 text-[11px] sm:text-xs uppercase tracking-widest font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-gold-600 animate-spin" />
          <span>Bespoke Atelier Commission</span>
        </div>

        <h1 className="font-serif-lux text-3xl sm:text-6xl font-bold text-espresso">
          Design Your Dream Piece
        </h1>

        <p className="text-espresso/70 text-xs sm:text-sm font-light max-w-xl mx-auto leading-relaxed">
          Choose your stones, finishes, and attach any Pinterest inspiration photo. Your commission is logged directly in our Studio queue for a bespoke quote!
        </p>
      </div>

      {submittedOrder ? (
        <div className="p-6 sm:p-12 rounded-3xl bg-white border border-gold-300 shadow-luxury text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-4 py-1 rounded-full bg-[#F8EFE2] text-[#8E6C27] text-xs font-bold tracking-wider uppercase">
              Request Code: {submittedOrder.requestCode}
            </span>
            <h2 className="font-serif-lux text-3xl sm:text-4xl font-bold text-espresso">
              Your Bespoke Commission is In Studio!
            </h2>
            <p className="text-xs sm:text-sm text-espresso/70 max-w-lg mx-auto">
              Our artisan studio has received your design specification for{' '}
              <strong>{submittedOrder.jewelryType}</strong> with <strong>{submittedOrder.crystal}</strong>. You will receive our quote & crafting timeline shortly.
            </p>
          </div>

          <div className="max-w-md mx-auto rounded-2xl bg-ivory-50 border border-gold-200 p-4 text-xs text-left space-y-1.5">
            <p><strong>Status:</strong> {submittedOrder.status}</p>
            {submittedOrder.estimatedPrice && (
              <p><strong>Starting Studio Estimate:</strong> ₹{submittedOrder.estimatedPrice.toLocaleString('en-IN')}</p>
            )}
            <p><strong>Budget Range:</strong> {submittedOrder.budget}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => openWhatsappWithCode(submittedOrder)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Share Code on WhatsApp</span>
            </button>

            <Link
              to="/account?tab=custom"
              className="w-full sm:w-auto px-6 py-3.5 rounded-full glass-gold-btn text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2"
            >
              <Wand2 className="w-4 h-4" />
              <span>Track Custom Request</span>
            </Link>

            <button
              type="button"
              onClick={() => setSubmittedOrder(null)}
              className="w-full sm:w-auto px-5 py-3 rounded-full border border-gold-300 text-xs font-semibold text-espresso"
            >
              Create Another
            </button>
          </div>
        </div>
      ) : (
        <div className="p-5 sm:p-10 rounded-3xl bg-white border border-gold-300 shadow-luxury">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Customer Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-espresso/80 mb-1.5">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g., Sahil Memon"
                  className="w-full p-3 rounded-2xl border border-gold-300 bg-ivory-50 text-xs text-espresso focus:outline-none focus:ring-1 focus:ring-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-espresso/80 mb-1.5">
                  WhatsApp / Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full p-3 rounded-2xl border border-gold-300 bg-ivory-50 text-xs text-espresso focus:outline-none focus:ring-1 focus:ring-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-espresso/80 mb-1.5">
                  Email (For Quote Alert)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full p-3 rounded-2xl border border-gold-300 bg-ivory-50 text-xs text-espresso focus:outline-none focus:ring-1 focus:ring-gold-500"
                />
              </div>
            </div>

            {/* 2. Jewellery Category */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-espresso/80 mb-2">
                Type of Jewellery:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {typeOptions.map((item) => (
                  <button
                    type="button"
                    key={item.id || item.label}
                    onClick={() => setJewelleryType(item.label)}
                    className={`py-3 px-3 rounded-xl text-xs font-semibold border transition text-center ${
                      jewelleryType === item.label
                        ? 'border-gold-500 bg-gold-50 text-gold-900 shadow-sm'
                        : 'border-gold-200 bg-white text-espresso/70 hover:border-gold-300'
                    }`}
                  >
                    <p>{item.label}</p>
                    {item.extraPrice > 0 && (
                      <p className="text-[10px] text-gold-700 font-normal mt-0.5">
                        From ₹{item.extraPrice}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Preferred Crystal or Mineral */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-espresso/80 mb-2">
                Preferred Gemstone / Element:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {crystalOptions.map((c) => (
                  <button
                    type="button"
                    key={c.id || c.label}
                    onClick={() => setCrystalType(c.label)}
                    className={`py-2.5 px-3.5 rounded-xl text-xs font-semibold border transition text-left flex items-center gap-2.5 ${
                      crystalType === c.label
                        ? 'border-gold-500 bg-gold-50 text-gold-900 shadow-sm'
                        : 'border-gold-200 bg-white text-espresso/70 hover:border-gold-300'
                    }`}
                  >
                    {c.swatchColor && (
                      <span
                        className="w-4 h-4 rounded-full border border-gold-300 shrink-0"
                        style={{ backgroundColor: c.swatchColor }}
                      />
                    )}
                    <div className="min-w-0">
                      <p className="truncate">{c.label}</p>
                      {c.extraPrice > 0 && (
                        <p className="text-[10px] text-gold-700 font-normal">+₹{c.extraPrice}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Finish Style (if Studio Options defined) */}
            {finishOptions.length > 0 && (
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-espresso/80 mb-2">
                  Hardware & Cord Finish:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {finishOptions.map((f) => (
                    <button
                      type="button"
                      key={f.id || f.label}
                      onClick={() => setFinishStyle(f.label)}
                      className={`py-2.5 px-3.5 rounded-xl text-xs font-semibold border transition text-left flex items-center gap-2.5 ${
                        finishStyle === f.label
                          ? 'border-gold-500 bg-gold-50 text-gold-900 shadow-sm'
                          : 'border-gold-200 bg-white text-espresso/70 hover:border-gold-300'
                      }`}
                    >
                      {f.swatchColor && (
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-gold-300 shrink-0"
                          style={{ backgroundColor: f.swatchColor }}
                        />
                      )}
                      <div>
                        <p>{f.label}</p>
                        <p className="text-[10px] text-gold-700 font-normal">
                          {f.extraPrice > 0 ? `+₹${f.extraPrice}` : 'Included'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Budget Range */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-espresso/80 mb-2">
                Approximate Budget:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {budgetOptions.map((b) => (
                  <button
                    type="button"
                    key={b.id || b.label}
                    onClick={() => setBudget(b.label)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition text-center ${
                      budget === b.label
                        ? 'border-gold-500 bg-gold-50 text-gold-900 shadow-sm'
                        : 'border-gold-200 bg-white text-espresso/70 hover:border-gold-300'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Size, Engraving & Photo Reference */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-espresso/80 mb-1.5">
                  Wrist / Chain Size (Optional)
                </label>
                <input
                  type="text"
                  value={wristSize}
                  onChange={(e) => setWristSize(e.target.value)}
                  placeholder="e.g., 6.5 inches wrist / 18 in chain"
                  className="w-full p-3 rounded-2xl border border-gold-300 bg-ivory-50 text-xs text-espresso focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-espresso/80 mb-1.5">
                  Initials / Engraving Tag (Optional)
                </label>
                <input
                  type="text"
                  value={engravingText}
                  onChange={(e) => setEngravingText(e.target.value)}
                  placeholder="e.g., A ♥ S or special date"
                  className="w-full p-3 rounded-2xl border border-gold-300 bg-ivory-50 text-xs text-espresso focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>

            {/* Reference Photo Upload */}
            <div className="rounded-2xl bg-ivory-50 border border-dashed border-gold-400/70 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {referenceImageUrl ? (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gold-300 shrink-0">
                    <img src={referenceImageUrl} alt="Inspiration" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setReferenceImageUrl('')}
                      className="absolute top-0.5 right-0.5 bg-black/70 text-white rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-white border border-gold-200 flex items-center justify-center text-gold-600 shrink-0">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-espresso">
                    Attach Inspiration / Sketch Photo (Optional)
                  </p>
                  <p className="text-[11px] text-espresso/60">
                    Upload a Pinterest screenshot or hand-drawn sketch (JPG/PNG/WebP up to 5 MB).
                  </p>
                </div>
              </div>

              <label className="cursor-pointer shrink-0 inline-flex items-center gap-1.5 rounded-full bg-white border border-gold-300 hover:bg-gold-50 px-4 py-2 text-xs font-semibold text-espresso shadow-sm transition">
                <Upload className="w-3.5 h-3.5 text-gold-600" />
                <span>{uploadingPhoto ? 'Uploading...' : referenceImageUrl ? 'Change Photo' : 'Upload Photo'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                  className="hidden"
                />
              </label>
            </div>

            {/* 7. Notes */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-espresso/80 mb-2">
                Describe your idea & special requests:
              </label>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g., Dual-layered bracelet with light pink rose quartz beads, blush silk cord, and tiny heart charm..."
                className="w-full p-3.5 rounded-2xl border border-gold-300 bg-ivory-50 text-xs text-espresso focus:outline-none focus:ring-1 focus:ring-gold-500"
              />
            </div>

            {/* Estimate & Submit */}
            {estimatedTotal > 0 && (
              <div className="rounded-2xl bg-[#FBF7F0] border border-gold-300/70 px-4 py-3 flex items-center justify-between text-xs">
                <span className="text-espresso/70">Estimated Bespoke Starting Price:</span>
                <span className="font-serif-lux text-xl font-bold text-espresso">
                  ~₹{estimatedTotal.toLocaleString('en-IN')}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-5 sm:px-6 rounded-full glass-gold-btn text-[11px] sm:text-xs uppercase tracking-[0.12em] sm:tracking-widest font-bold shadow-md flex items-center justify-center gap-2 text-center transition disabled:opacity-60"
            >
              <Sparkles className="w-4 h-4 flex-shrink-0" />
              <span>{submitting ? 'Submitting Bespoke Request...' : 'Submit Bespoke Request to Studio'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
