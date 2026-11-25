import React, { useState } from 'react';
import { MessageCircle, Phone, Mail, MapPin, Send, HelpCircle } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    const text = `*Inquiry from Website Contact Form:*%0A` +
      `- *Name:* ${name}%0A` +
      `- *Email:* ${email}%0A` +
      `- *Message:* ${msg}`;
    window.open(`https://wa.me/918780125711?text=${text}`, '_blank');
  };

  const faqs = [
    {
      q: "How long does it take to make and deliver a handmade piece?",
      a: "Because each creation is handcrafted with micro-precision, crafting takes 24 to 48 hours. Express courier delivery across India takes 3 to 5 business days."
    },
    {
      q: "Can I customize the wrist size or cord color?",
      a: "Yes, absolutely! We love custom requests. You can select your wrist size directly on the product page or message us on WhatsApp with custom measurements."
    },
    {
      q: "Will the jewellery tarnish or turn black?",
      a: "We use high-grade 18K gold-plated brass, titanium hooks, and anti-tarnish stainless steel cords. To preserve the shine, keep items away from harsh perfumes, water, and direct chlorine."
    },
    {
      q: "Which payment methods are accepted?",
      a: "We accept Razorpay (UPI, Google Pay, PhonePe, Debit/Credit Cards, Netbanking) as well as Cash on Delivery (COD) for confirmed addresses."
    }
  ];

  return (
    <div className="min-h-screen py-16 px-6 lg:px-16 max-w-6xl mx-auto space-y-16">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="font-serif-lux text-4xl sm:text-6xl font-bold text-espresso">
          Get In Touch
        </h1>
        <p className="text-espresso/70 text-xs sm:text-sm font-light">
          Have questions about sizing, materials, or custom wedding favors? We are always happy to help.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
        
        {/* Left: Contact Info */}
        <div className="md:col-span-5 space-y-8">
          <div className="p-8 rounded-3xl bg-white border border-gold-300 shadow-sm space-y-6">
            <h3 className="font-serif-lux text-2xl font-bold text-espresso">
              Artisan Atelier Studio
            </h3>

            <div className="space-y-4 text-xs text-espresso/80">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-espresso">Studio Location</p>
                  <p className="text-espresso/60">Bespoke Artisan Studio, Gujarat, India</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-gold-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-espresso">Phone & WhatsApp</p>
                  <p className="text-espresso/60">+91 8780125711 (Mon-Sat, 10 AM - 7 PM)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-gold-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-espresso">Official Email</p>
                  <p className="text-espresso/60">support@aurajewels.in</p>
                </div>
              </div>
            </div>

            <a
              href="https://wa.me/918780125711"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs uppercase tracking-wider font-bold shadow-sm flex items-center justify-center gap-2 transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Direct WhatsApp Chat</span>
            </a>
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="md:col-span-7 p-8 sm:p-10 rounded-3xl bg-white border border-gold-300 shadow-sm">
          <h3 className="font-serif-lux text-2xl font-bold text-espresso mb-6">
            Send A Message
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-espresso/80 mb-1.5">
                Your Name:
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sahil Memon"
                className="w-full p-3 rounded-xl border border-gold-300 bg-ivory-50 text-xs text-espresso focus:outline-none focus:ring-1 focus:ring-gold-500"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-espresso/80 mb-1.5">
                Email Address:
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sahil@example.com"
                className="w-full p-3 rounded-xl border border-gold-300 bg-ivory-50 text-xs text-espresso focus:outline-none focus:ring-1 focus:ring-gold-500"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-espresso/80 mb-1.5">
                How can we help you?
              </label>
              <textarea
                rows={4}
                required
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="Write your message here..."
                className="w-full p-3 rounded-xl border border-gold-300 bg-ivory-50 text-xs text-espresso focus:outline-none focus:ring-1 focus:ring-gold-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-full glass-gold-btn text-xs uppercase tracking-widest font-bold shadow-md flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Inquiry</span>
            </button>
          </form>
        </div>

      </div>

      {/* Frequently Asked Questions */}
      <div className="pt-8 border-t border-gold-200">
        <h2 className="font-serif-lux text-3xl font-bold text-espresso text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqs.map((faq, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white border border-gold-200 space-y-2">
              <h4 className="font-bold text-sm text-espresso flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-gold-600 flex-shrink-0 mt-0.5" />
                <span>{faq.q}</span>
              </h4>
              <p className="text-xs text-espresso/70 font-light leading-relaxed pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
