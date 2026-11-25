import React from 'react';
import { ShieldCheck, Truck, RefreshCw, FileText } from 'lucide-react';

export function ShippingPolicy() {
  return (
    <div className="min-h-screen py-16 px-6 lg:px-16 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 text-gold-700">
        <Truck className="w-8 h-8" />
        <h1 className="font-serif-lux text-4xl font-bold text-espresso">Shipping & Delivery Policy</h1>
      </div>
      <div className="p-8 rounded-3xl bg-white border border-gold-300 shadow-sm space-y-4 text-xs sm:text-sm text-espresso/80 font-light leading-relaxed">
        <p><strong>1. Handcrafting & Processing Time:</strong> Because our jewellery pieces are handcrafted with micro-precision on order, each piece requires <strong>24 to 48 hours</strong> of artisanal preparation and quality inspection.</p>
        <p><strong>2. Delivery Timelines:</strong> We partner with trusted premium courier services (BlueDart, DTDC, Delhivery). Orders across India typically arrive within <strong>3 to 5 business days</strong> after dispatch.</p>
        <p><strong>3. Shipping Charges:</strong> We provide <strong>FREE express doorstep delivery</strong> on all orders above ₹999. For orders below ₹999, a flat nominal courier charge of ₹80 applies.</p>
        <p><strong>4. Order Tracking:</strong> As soon as your order is dispatched, you will receive an SMS and WhatsApp tracking link with real-time updates.</p>
      </div>
    </div>
  );
}

export function ReturnsPolicy() {
  return (
    <div className="min-h-screen py-16 px-6 lg:px-16 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 text-gold-700">
        <RefreshCw className="w-8 h-8" />
        <h1 className="font-serif-lux text-4xl font-bold text-espresso">Returns & Refund Guarantee</h1>
      </div>
      <div className="p-8 rounded-3xl bg-white border border-gold-300 shadow-sm space-y-4 text-xs sm:text-sm text-espresso/80 font-light leading-relaxed">
        <p><strong>1. 7-Day Replacement Guarantee:</strong> We take immense pride in our craftsmanship. If you receive an item that is damaged during transit, defective, or incorrect, you are entitled to a free replacement within <strong>7 days</strong> of delivery.</p>
        <p><strong>2. How to Claim:</strong> Simply take a quick unboxing photo/video of the parcel and WhatsApp us at <strong>+91 8780125711</strong> or email <strong>support@aurajewels.in</strong>. Our team will arrange a reverse pickup or ship a fresh piece immediately.</p>
        <p><strong>3. Refunds:</strong> For eligible returns, refunds are initiated within 48 hours to the original payment method (or bank account for COD orders).</p>
      </div>
    </div>
  );
}

export function TermsPage() {
  return (
    <div className="min-h-screen py-16 px-6 lg:px-16 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 text-gold-700">
        <FileText className="w-8 h-8" />
        <h1 className="font-serif-lux text-4xl font-bold text-espresso">Terms of Service</h1>
      </div>
      <div className="p-8 rounded-3xl bg-white border border-gold-300 shadow-sm space-y-4 text-xs sm:text-sm text-espresso/80 font-light leading-relaxed">
        <p>Welcome to <strong>AURA JEWELS</strong>. By accessing our website and placing orders, you agree to our standard terms and conditions.</p>
        <p><strong>Product Variations:</strong> All items are handmade from natural minerals, authentic crystals, and organic dried flowers. Slight natural variations in stone veining and petal orientation are inherent features of artisanal authenticity.</p>
        <p><strong>Payment Security:</strong> All digital transactions are processed through encrypted 128-bit SSL gateways (Razorpay). We do not store sensitive credit/debit card numbers on our servers.</p>
      </div>
    </div>
  );
}

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen py-16 px-6 lg:px-16 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 text-gold-700">
        <ShieldCheck className="w-8 h-8" />
        <h1 className="font-serif-lux text-4xl font-bold text-espresso">Privacy Policy</h1>
      </div>
      <div className="p-8 rounded-3xl bg-white border border-gold-300 shadow-sm space-y-4 text-xs sm:text-sm text-espresso/80 font-light leading-relaxed">
        <p>Your privacy is deeply sacred to us. We only collect the minimal personal data required to fulfill and deliver your handcrafted orders (Name, Delivery Address, Phone Number, and Email).</p>
        <p>We do not sell, rent, or trade your personal information with third-party advertising companies. Your data is strictly used for order updates and customer service communications.</p>
      </div>
    </div>
  );
}
