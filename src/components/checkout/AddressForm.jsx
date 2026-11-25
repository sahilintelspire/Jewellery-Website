import React, { useState, useEffect } from 'react';
import { Home, Briefcase, Gift, MapPin, Phone, User, Check, X } from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal',
];

export default function AddressForm({
  initialData = null,
  defaultName = '',
  defaultPhone = '',
  onSave,
  onCancel,
}) {
  const [form, setForm] = useState({
    fullName: initialData?.fullName || defaultName || '',
    phone: initialData?.phone || defaultPhone || '',
    pincode: initialData?.pincode || '',
    houseNo: initialData?.houseNo || '',
    area: initialData?.area || '',
    landmark: initialData?.landmark || '',
    city: initialData?.city || '',
    state: initialData?.state || 'Gujarat',
    type: initialData?.type || 'Home',
    isDefault: initialData?.isDefault ?? true,
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setForm({
        fullName: initialData.fullName || '',
        phone: initialData.phone || '',
        pincode: initialData.pincode || '',
        houseNo: initialData.houseNo || '',
        area: initialData.area || '',
        landmark: initialData.landmark || '',
        city: initialData.city || '',
        state: initialData.state || 'Gujarat',
        type: initialData.type || 'Home',
        isDefault: Boolean(initialData.isDefault),
      });
    }
  }, [initialData]);

  const handleChange = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const digitsPhone = form.phone.replace(/\D/g, '');
    const digitsPin = form.pincode.replace(/\D/g, '');

    if (form.fullName.trim().length < 2) {
      return setError('Please enter recipient full name.');
    }
    if (digitsPhone.length !== 10) {
      return setError('Please enter a valid 10-digit mobile number.');
    }
    if (digitsPin.length !== 6) {
      return setError('Please enter a valid 6-digit Indian pincode.');
    }
    if (!form.houseNo.trim() || !form.area.trim() || !form.city.trim()) {
      return setError('Please complete flat/house number, street area, and city.');
    }

    onSave({
      ...form,
      fullName: form.fullName.trim(),
      phone: digitsPhone,
      pincode: digitsPin,
      houseNo: form.houseNo.trim(),
      area: form.area.trim(),
      landmark: form.landmark.trim(),
      city: form.city.trim(),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-5 sm:p-6 rounded-3xl bg-ivory-50/90 border border-gold-300 space-y-4 shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-gold-200 pb-3">
        <h4 className="font-serif-lux text-xl font-bold text-espresso flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gold-600" />
          <span>{initialData ? 'Edit Delivery Address' : 'Add New Delivery Address'}</span>
        </h4>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-full hover:bg-gold-100 text-espresso/60 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3.5 py-2 rounded-xl font-medium">
          {error}
        </p>
      )}

      {/* Name & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-[11px] uppercase tracking-wider font-bold text-espresso/75 mb-1">
            Recipient Full Name *
          </label>
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gold-200 bg-white focus-within:border-gold-500">
            <User className="w-3.5 h-3.5 text-gold-600 flex-shrink-0" />
            <input
              type="text"
              required
              value={form.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              placeholder="e.g., Ananya Sharma"
              className="w-full text-xs text-espresso bg-transparent focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wider font-bold text-espresso/75 mb-1">
            10-Digit Mobile Number *
          </label>
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gold-200 bg-white focus-within:border-gold-500">
            <Phone className="w-3.5 h-3.5 text-gold-600 flex-shrink-0" />
            <input
              type="tel"
              required
              maxLength={13}
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="9876543210"
              className="w-full text-xs text-espresso bg-transparent focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Pincode, City, State */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div>
          <label className="block text-[11px] uppercase tracking-wider font-bold text-espresso/75 mb-1">
            Pincode *
          </label>
          <input
            type="text"
            required
            maxLength={6}
            value={form.pincode}
            onChange={(e) => handleChange('pincode', e.target.value.replace(/\D/g, ''))}
            placeholder="380015"
            className="w-full px-3.5 py-2.5 rounded-xl border border-gold-200 bg-white text-xs text-espresso focus:outline-none focus:border-gold-500"
          />
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wider font-bold text-espresso/75 mb-1">
            City / Town *
          </label>
          <input
            type="text"
            required
            value={form.city}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="Ahmedabad"
            className="w-full px-3.5 py-2.5 rounded-xl border border-gold-200 bg-white text-xs text-espresso focus:outline-none focus:border-gold-500"
          />
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wider font-bold text-espresso/75 mb-1">
            State *
          </label>
          <select
            value={form.state}
            onChange={(e) => handleChange('state', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gold-200 bg-white text-xs text-espresso focus:outline-none focus:border-gold-500"
          >
            {INDIAN_STATES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* House & Area */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-[11px] uppercase tracking-wider font-bold text-espresso/75 mb-1">
            Flat / House No. / Building *
          </label>
          <input
            type="text"
            required
            value={form.houseNo}
            onChange={(e) => handleChange('houseNo', e.target.value)}
            placeholder="402, Ivory Residences"
            className="w-full px-3.5 py-2.5 rounded-xl border border-gold-200 bg-white text-xs text-espresso focus:outline-none focus:border-gold-500"
          />
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wider font-bold text-espresso/75 mb-1">
            Street / Area / Colony *
          </label>
          <input
            type="text"
            required
            value={form.area}
            onChange={(e) => handleChange('area', e.target.value)}
            placeholder="Satellite Road, Prahlad Nagar"
            className="w-full px-3.5 py-2.5 rounded-xl border border-gold-200 bg-white text-xs text-espresso focus:outline-none focus:border-gold-500"
          />
        </div>
      </div>

      {/* Landmark */}
      <div>
        <label className="block text-[11px] uppercase tracking-wider font-bold text-espresso/75 mb-1">
          Landmark (Optional)
        </label>
        <input
          type="text"
          value={form.landmark}
          onChange={(e) => handleChange('landmark', e.target.value)}
          placeholder="Near Botanical Park"
          className="w-full px-3.5 py-2.5 rounded-xl border border-gold-200 bg-white text-xs text-espresso focus:outline-none focus:border-gold-500"
        />
      </div>

      {/* Address Type & Default */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          {[
            { id: 'Home', icon: Home },
            { id: 'Work', icon: Briefcase },
            { id: 'Gift', icon: Gift },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleChange('type', opt.id)}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 border transition ${
                form.type === opt.id
                  ? 'border-gold-500 bg-gold-100 text-gold-900 shadow-sm'
                  : 'border-gold-200 bg-white text-espresso/70 hover:border-gold-400'
              }`}
            >
              <opt.icon className="w-3 h-3" />
              <span>{opt.id}</span>
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-xs text-espresso/80 font-medium cursor-pointer">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(e) => handleChange('isDefault', e.target.checked)}
            className="accent-gold-600 w-4 h-4 rounded"
          />
          <span>Set as default delivery address</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-full border border-gold-300 text-xs font-bold text-espresso/70 hover:bg-white transition"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-6 py-2.5 rounded-full glass-gold-btn text-xs uppercase tracking-wider font-bold shadow-sm flex items-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5" />
          <span>{initialData ? 'Update Address' : 'Save & Use Address'}</span>
        </button>
      </div>
    </form>
  );
}
