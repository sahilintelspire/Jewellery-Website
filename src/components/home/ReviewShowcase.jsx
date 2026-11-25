import React from 'react';
import { Star, CheckCircle, Quote } from 'lucide-react';

export default function ReviewShowcase() {
  const reviews = [
    {
      name: "Ananya Sharma",
      city: "Mumbai",
      product: "Rose Quartz & Pearl Bracelet",
      rating: 5,
      date: "2 days ago",
      text: "The finish is literally beyond expectations! The crystals feel so authentic, and the velvet gift box made it feel like receiving fine jewelry from Paris.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
    },
    {
      name: "Pooja Mehta",
      city: "Ahmedabad",
      product: "Pressed Botanical Resin Pendant",
      rating: 5,
      date: "1 week ago",
      text: "Real preserved flowers inside! You can see the delicate petals under sunlight. Got so many compliments at college. 10/10 craftsmanship!",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80"
    },
    {
      name: "Rohan & Simran",
      city: "Delhi",
      product: "Bespoke Magnetic Couple Pair",
      rating: 5,
      date: "3 weeks ago",
      text: "Ordered for our anniversary. The magnetic heart charm snaps so smoothly, and she was in tears when she saw our engraved initials. Beautiful work!",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80"
    }
  ];

  return (
    <section className="py-20 px-6 lg:px-16 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
        <span className="text-xs uppercase tracking-[0.25em] text-gold-600 font-semibold">
          Customer Love Stories
        </span>
        <h2 className="font-serif-lux text-4xl sm:text-5xl font-bold text-espresso">
          Treasured By 500+ Happy Hearts
        </h2>
        <p className="text-espresso/60 text-xs sm:text-sm font-light">
          Real words from people who wear our handmade creations every day.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {reviews.map((rev, idx) => (
          <div
            key={idx}
            className="p-6 rounded-3xl bg-white border border-gold-200/80 shadow-sm hover:shadow-card-lift transition duration-300 flex flex-col justify-between relative"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1 text-gold-500">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold-500" />
                  ))}
                </div>
                <span className="text-[10px] text-espresso/40 uppercase tracking-wider">{rev.date}</span>
              </div>

              <p className="text-xs sm:text-sm text-espresso/80 font-light leading-relaxed mb-6 italic">
                "{rev.text}"
              </p>
            </div>

            <div className="pt-4 border-t border-gold-100 flex items-center gap-3">
              <img
                src={rev.avatar}
                alt={rev.name}
                className="w-10 h-10 rounded-full object-cover border border-gold-300"
              />
              <div>
                <div className="flex items-center gap-1">
                  <h4 className="text-xs font-bold text-espresso">{rev.name}</h4>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <p className="text-[10px] text-espresso/50">
                  {rev.city} • <span className="text-gold-700">{rev.product}</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
