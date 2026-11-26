export const ORDER_STAGE_OPTIONS = [
  'Order Placed',
  'Crafting in Studio',
  'Quality & Polish',
  'Dispatched',
  'Delivered',
  'Cancelled'
];

export const CUSTOM_STATUS_OPTIONS = [
  'Pending Review',
  'Quote Sent',
  'Approved & Crafting',
  'Ready to Ship',
  'Completed',
  'Cancelled'
];

export function formatINR(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

export function getStatusPillClass(status) {
  switch (status) {
    case 'Delivered':
    case 'Completed':
    case 'paid':
    case 'Resolved':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Dispatched':
    case 'Ready to Ship':
    case 'Quote Sent':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'Crafting in Studio':
    case 'Approved & Crafting':
    case 'Quality & Polish':
    case 'demo_paid':
      return 'bg-[#F8EFE2] text-[#8E6C27] border-[#D4AF37]/40';
    case 'Cancelled':
    case 'failed':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-[#FAF6F0] text-[#6E6259] border-[#E5DFD6]';
  }
}
