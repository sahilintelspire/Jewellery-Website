import React from 'react';
import {
  IndianRupee,
  ShoppingBag,
  Wand2,
  Mail,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { formatINR, getStatusPillClass } from './adminShared';

export default function AdminOverviewTab({ dashboard, onNavigateTab }) {
  if (!dashboard) {
    return (
      <div className="py-16 text-center text-sm text-[#8F8177]">
        Loading Studio Atelier metrics...
      </div>
    );
  }

  const { metrics, lowStockProducts = [], recentOrders = [], recentCustomRequests = [] } = dashboard;

  const kpis = [
    {
      label: 'Total Studio Revenue',
      value: formatINR(metrics.totalRevenue),
      sub: `${metrics.totalOrders} total orders`,
      icon: IndianRupee,
      tab: 'orders',
      accent: 'bg-[#F8EFE2] text-[#8E6C27]'
    },
    {
      label: 'Active Orders to Craft',
      value: metrics.activeOrders,
      sub: 'Placed, Crafting or Polishing',
      icon: ShoppingBag,
      tab: 'orders',
      accent: 'bg-[#F3DAD5]/60 text-[#9B5248]'
    },
    {
      label: 'Bespoke Custom Requests',
      value: metrics.pendingCustomRequests,
      sub: 'Awaiting review or crafting',
      icon: Wand2,
      tab: 'custom',
      accent: 'bg-[#FBF7F0] text-[#A6802C]'
    },
    {
      label: 'Inner Circle Subscribers',
      value: metrics.subscribersCount,
      sub: `${metrics.newInquiries} new inquiries`,
      icon: Mail,
      tab: 'marketing',
      accent: 'bg-emerald-50 text-emerald-700'
    }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((card) => (
          <button
            key={card.label}
            type="button"
            onClick={() => onNavigateTab(card.tab)}
            className="text-left rounded-2xl bg-white border border-[#E5DFD6] p-5 shadow-soft hover:border-[#D4AF37]/60 transition-all group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.accent}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#B5A99F] group-hover:text-[#8E6C27] transition-colors" />
            </div>
            <p className="mt-4 text-xs font-medium uppercase tracking-wider text-[#8F8177]">
              {card.label}
            </p>
            <p className="mt-1 font-serif text-2xl sm:text-3xl font-semibold text-[#2C2724]">
              {card.value}
            </p>
            <p className="mt-1 text-xs text-[#6E6259]">{card.sub}</p>
          </button>
        ))}
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Custom Orders Highlight */}
        <div className="rounded-2xl bg-white border border-[#E5DFD6] p-5 sm:p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <h3 className="font-serif text-xl font-semibold text-[#2C2724]">
                Latest Custom Jewellery Requests
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('custom')}
              className="text-xs font-medium text-[#8E6C27] hover:underline"
            >
              Manage Studio →
            </button>
          </div>

          {recentCustomRequests.length === 0 ? (
            <div className="rounded-xl bg-[#FAF6F0] border border-[#E5DFD6] p-6 text-center text-sm text-[#8F8177]">
              No bespoke commissions submitted yet. Customers can request custom pieces on{' '}
              <span className="font-medium text-[#2C2724]">/custom-order</span>.
            </div>
          ) : (
            <div className="space-y-3">
              {recentCustomRequests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => onNavigateTab('custom')}
                  className="cursor-pointer rounded-xl border border-[#EFE9E0] bg-[#FAF6F0]/60 p-3.5 hover:border-[#D4AF37]/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold tracking-wider text-[#8E6C27]">
                      {req.requestCode}
                    </span>
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full border ${getStatusPillClass(req.status)}`}>
                      {req.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-[#2C2724]">
                    {req.customerName} — {req.jewelryType}
                  </p>
                  <p className="text-xs text-[#6E6259] mt-0.5">
                    {req.crystal} • Budget: {req.budget}
                    {req.quotedPrice ? ` • Quote: ${formatINR(req.quotedPrice)}` : ''}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Store Orders */}
        <div className="rounded-2xl bg-white border border-[#E5DFD6] p-5 sm:p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
              <h3 className="font-serif text-xl font-semibold text-[#2C2724]">
                Recent Orders
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-medium text-[#8E6C27] hover:underline"
            >
              View All Orders →
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="rounded-xl bg-[#FAF6F0] border border-[#E5DFD6] p-6 text-center text-sm text-[#8F8177]">
              No store orders yet. Once customers check out, every Razorpay or COD order will appear here.
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => onNavigateTab('orders')}
                  className="cursor-pointer rounded-xl border border-[#EFE9E0] bg-[#FAF6F0]/60 p-3.5 hover:border-[#D4AF37]/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#2C2724]">
                      {order.orderNumber} • {order.customerName}
                    </span>
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full border ${getStatusPillClass(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-[#6E6259]">
                    <span>
                      {order.items?.length || 0} item(s) • {order.paymentMethod?.toUpperCase()}
                    </span>
                    <span className="font-semibold text-[#2C2724]">{formatINR(order.totalAmount)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Low Stock Watchlist & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-white border border-[#E5DFD6] p-5 sm:p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="font-serif text-xl font-semibold text-[#2C2724]">
                Low Stock Watchlist
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('products')}
              className="text-xs font-medium text-[#8E6C27] hover:underline"
            >
              Manage Stock →
            </button>
          </div>
          {lowStockProducts.length === 0 ? (
            <p className="text-sm text-[#6E6259]">All creations currently have healthy studio inventory.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {lowStockProducts.map((item) => (
                <div
                  key={item.dbId}
                  className="flex items-center justify-between rounded-xl border border-[#EFE9E0] px-4 py-3 bg-[#FAF6F0]/40"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-sm font-medium text-[#2C2724] truncate">{item.name}</p>
                    <p className="text-xs text-[#8F8177]">{formatINR(item.price)}</p>
                  </div>
                  <span
                    className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      item.stockQty <= 3
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {item.stockQty} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-[#2C2724] to-[#433A34] text-white p-5 sm:p-6 shadow-soft flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#F3DAD5] mb-3">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h3 className="font-serif text-xl font-semibold">Studio Daily Checklist</h3>
            <ul className="mt-3 space-y-2 text-xs text-white/80 leading-relaxed">
              <li>• Quote new Custom Requests promptly & notify via WhatsApp or Email.</li>
              <li>• Advance active orders to Crafting / Dispatched with tracking AWB.</li>
              <li>• Keep Featured Signature Drop products fresh on the homepage.</li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('settings')}
            className="mt-5 w-full rounded-xl bg-[#D4AF37] text-[#2C2724] font-semibold text-xs py-2.5 px-4 hover:bg-[#E2BE48] transition-colors"
          >
            Update Announcement & Delivery Rules
          </button>
        </div>
      </div>
    </div>
  );
}
