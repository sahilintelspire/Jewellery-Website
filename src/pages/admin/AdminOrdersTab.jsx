import React, { useEffect, useState } from 'react';
import { Search, Truck, Gift, Save, Package } from 'lucide-react';
import { adminApi } from '../../services/api';
import { ORDER_STAGE_OPTIONS, formatINR, getStatusPillClass } from './adminShared';

export default function AdminOrdersTab({ showToast, onDataReload }) {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [draft, setDraft] = useState({
    orderStatus: 'Order Placed',
    paymentStatus: 'paid',
    courierName: '',
    trackingNumber: '',
    trackingUrl: '',
    adminNotes: ''
  });
  const [saving, setSaving] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getOrders({ status: statusFilter, search });
      const list = res.orders || [];
      setOrders(list);
      if (selectedOrder) {
        const refreshed = list.find((o) => o.id === selectedOrder.id);
        if (refreshed) handleSelect(refreshed);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const handleSelect = (order) => {
    setSelectedOrder(order);
    setDraft({
      orderStatus: order.orderStatus || 'Order Placed',
      paymentStatus: order.paymentStatus || 'pending',
      courierName: order.courierName || '',
      trackingNumber: order.trackingNumber || '',
      trackingUrl: order.trackingUrl || '',
      adminNotes: order.adminNotes || ''
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setSaving(true);
    try {
      await adminApi.updateOrder(selectedOrder.id, draft);
      showToast(`Order ${selectedOrder.orderNumber} updated to "${draft.orderStatus}" ✨`, 'success');
      await loadOrders();
      onDataReload?.();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-2xl bg-white border border-[#E5DFD6] p-4 shadow-soft">
        <div className="flex flex-wrap gap-1.5">
          {['All', ...ORDER_STAGE_OPTIONS].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                statusFilter === st
                  ? 'bg-[#2C2724] text-white border-[#2C2724]'
                  : 'bg-[#FAF6F0] text-[#6E6259] border-[#E5DFD6]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadOrders();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative">
            <Search className="w-4 h-4 text-[#8F8177] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Order #, customer, phone..."
              className="pl-9 pr-3 py-2 rounded-xl border border-[#E5DFD6] text-xs w-56 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 rounded-xl bg-[#D4AF37] text-[#2C2724] text-xs font-semibold"
          >
            Search
          </button>
        </form>
      </div>

      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-3">
          {loading ? (
            <div className="rounded-2xl bg-white border border-[#E5DFD6] p-8 text-center text-sm text-[#8F8177]">
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-2xl bg-white border border-[#E5DFD6] p-8 text-center text-sm text-[#8F8177]">
              No orders found.
            </div>
          ) : (
            orders.map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() => handleSelect(order)}
                className={`w-full text-left rounded-2xl border p-4 transition-all ${
                  selectedOrder?.id === order.id
                    ? 'bg-[#FBF7F0] border-[#D4AF37] shadow-soft'
                    : 'bg-white border-[#E5DFD6] hover:border-[#D4AF37]/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold tracking-wider text-[#8E6C27]">
                    {order.orderNumber}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full border ${getStatusPillClass(order.paymentStatus)}`}>
                      {order.paymentMethod?.toUpperCase()} • {order.paymentStatus}
                    </span>
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full border ${getStatusPillClass(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-[#2C2724]">{order.customerName}</p>
                    <p className="text-xs text-[#6E6259]">
                      {order.shippingAddress?.city}, {order.shippingAddress?.state} • {order.customerPhone}
                    </p>
                  </div>
                  <p className="font-serif text-lg font-semibold text-[#2C2724]">
                    {formatINR(order.totalAmount)}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="lg:col-span-6">
          {!selectedOrder ? (
            <div className="rounded-2xl bg-white border border-[#E5DFD6] p-10 text-center text-sm text-[#8F8177]">
              Select any order to inspect items, handwritten gift notes, delivery address, and update fulfillment tracking.
            </div>
          ) : (
            <form
              onSubmit={handleSave}
              className="rounded-2xl bg-white border border-[#E5DFD6] p-5 sm:p-6 shadow-soft space-y-4 sticky top-24"
            >
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#EFE9E0]">
                <div>
                  <span className="text-xs font-bold tracking-wider text-[#8E6C27]">
                    {selectedOrder.orderNumber}
                  </span>
                  <h3 className="font-serif text-2xl font-semibold text-[#2C2724]">
                    {selectedOrder.customerName}
                  </h3>
                  <p className="text-xs text-[#6E6259]">
                    {selectedOrder.customerEmail} • {selectedOrder.customerPhone}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-serif text-xl font-bold text-[#2C2724]">
                    {formatINR(selectedOrder.totalAmount)}
                  </p>
                  <p className="text-[11px] text-[#8F8177] uppercase">
                    {selectedOrder.deliveryMethod} delivery
                  </p>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="rounded-xl bg-[#FAF6F0] border border-[#EFE9E0] p-3.5 text-xs space-y-1">
                <p className="font-semibold text-[#2C2724]">Delivery Address</p>
                <p className="text-[#6E6259]">
                  {selectedOrder.shippingAddress?.line1}
                  {selectedOrder.shippingAddress?.line2 ? `, ${selectedOrder.shippingAddress.line2}` : ''}
                </p>
                <p className="text-[#6E6259]">
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} —{' '}
                  {selectedOrder.shippingAddress?.pincode}
                </p>
              </div>

              {/* Gift Note / Velvet Box */}
              {(selectedOrder.giftNote || selectedOrder.velvetBoxUpgraded) && (
                <div className="rounded-xl bg-[#FBF7F0] border border-[#D4AF37]/40 p-3.5 text-xs space-y-1">
                  <p className="font-semibold text-[#8E6C27] flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5" /> Packaging & Gift Preferences
                  </p>
                  {selectedOrder.velvetBoxUpgraded && (
                    <p className="text-[#2C2724]">✓ Upgraded Velvet Keepsake Box Requested</p>
                  )}
                  {selectedOrder.giftNote && (
                    <p className="italic text-[#2C2724]">“{selectedOrder.giftNote}”</p>
                  )}
                </div>
              )}

              {/* Line Items */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#2C2724] flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-[#D4AF37]" /> Creations Ordered
                </p>
                {selectedOrder.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#EFE9E0] p-2.5 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-[#2C2724] truncate">{item.name}</p>
                        <p className="text-[#8F8177]">
                          {item.selectedSize} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-[#2C2724] shrink-0">
                      {formatINR(item.lineTotal)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Fulfillment Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-[#6E6259] mb-1">
                    Order Tracking Stage
                  </label>
                  <select
                    value={draft.orderStatus}
                    onChange={(e) => setDraft((p) => ({ ...p, orderStatus: e.target.value }))}
                    className="w-full rounded-xl border border-[#E5DFD6] px-3 py-2 text-sm bg-white"
                  >
                    {ORDER_STAGE_OPTIONS.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#6E6259] mb-1">
                    Payment Status
                  </label>
                  <select
                    value={draft.paymentStatus}
                    onChange={(e) => setDraft((p) => ({ ...p, paymentStatus: e.target.value }))}
                    className="w-full rounded-xl border border-[#E5DFD6] px-3 py-2 text-sm bg-white"
                  >
                    <option value="pending">Pending (COD)</option>
                    <option value="paid">Paid (Verified)</option>
                    <option value="demo_paid">Demo Paid</option>
                    <option value="refunded">Refunded</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#6E6259] mb-1 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" /> Courier Partner
                  </label>
                  <input
                    type="text"
                    value={draft.courierName}
                    onChange={(e) => setDraft((p) => ({ ...p, courierName: e.target.value }))}
                    placeholder="e.g. Delhivery / Bluedart"
                    className="w-full rounded-xl border border-[#E5DFD6] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6E6259] mb-1">
                    AWB / Tracking Code
                  </label>
                  <input
                    type="text"
                    value={draft.trackingNumber}
                    onChange={(e) => setDraft((p) => ({ ...p, trackingNumber: e.target.value }))}
                    placeholder="e.g. AWB12345678"
                    className="w-full rounded-xl border border-[#E5DFD6] px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6E6259] mb-1">
                  Tracking URL (optional)
                </label>
                <input
                  type="url"
                  value={draft.trackingUrl}
                  onChange={(e) => setDraft((p) => ({ ...p, trackingUrl: e.target.value }))}
                  placeholder="https://shiprocket.co/tracking/..."
                  className="w-full rounded-xl border border-[#E5DFD6] px-3 py-2 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-[#2C2724] text-white text-sm font-semibold py-2.5 flex items-center justify-center gap-2 hover:bg-[#3F3733] transition-colors disabled:opacity-60"
              >
                <Save className="w-4 h-4 text-[#D4AF37]" />
                {saving ? 'Updating Order...' : 'Save Fulfillment & Notify Customer'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
