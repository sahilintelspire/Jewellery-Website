import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star,
  Heart,
  ShieldCheck,
  Truck,
  Gift,
  MessageCircle,
  Check,
  Sparkles,
  Zap,
  ChevronDown,
  Send,
} from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/common/ProductCard';

const INITIAL_REVIEWS = [
  {
    id: 'r1',
    author: 'Ananya S.',
    city: 'Mumbai',
    rating: 5,
    date: '3 days ago',
    comment:
      'The crystal finish and rose sheen look even more gorgeous in real sunlight. The velvet keepsake box felt truly luxurious!',
  },
  {
    id: 'r2',
    author: 'Meera K.',
    city: 'Ahmedabad',
    rating: 5,
    date: '1 week ago',
    comment:
      'Got the custom initial engraved cleanly. Worn it daily for 2 weeks with zero tarnishing. Love supporting handcrafted art!',
  },
];

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = PRODUCTS.find((p) => p.id === id) || PRODUCTS[0];

  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const { isAuthenticated, user, showToast } = useAuth();

  // Related Products
  const relatedProducts = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3);

  const [selectedImage, setSelectedImage] = useState(product.image);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'Standard (6.5 in)');
  const [selectedInitial, setSelectedInitial] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [careOpen, setCareOpen] = useState(false);

  // Customer Reviews state persisted per product
  const reviewsStorageKey = `aura_reviews_${product.id}`;
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  // Fix state sync when switching between products
  useEffect(() => {
    setSelectedImage(product.image);
    setSelectedSize(product.sizes[0] || 'Standard (6.5 in)');
    setSelectedInitial('');
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const saved = localStorage.getItem(reviewsStorageKey);
      setReviews(saved ? JSON.parse(saved) : INITIAL_REVIEWS);
    } catch {
      setReviews(INITIAL_REVIEWS);
    }
  }, [id, product.image, product.sizes, reviewsStorageKey]);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const handleAdd = () => {
    addToCart(product, selectedSize, selectedInitial, quantity, true);
    showToast(`Added ${product.shortName || product.name} to Bag ✨`, 'gold');
  };

  // Buy Now enforces Login & opens Checkout directly!
  const handleBuyNow = () => {
    addToCart(product, selectedSize, selectedInitial, quantity, false);
    if (!isAuthenticated) {
      showToast('Please sign in or register to purchase this heirloom.', 'gold');
      navigate('/auth', {
        state: {
          from: '/checkout',
          reason: `Sign in or register to buy "${product.shortName || product.name}" & add your delivery address.`,
        },
      });
      return;
    }
    navigate('/checkout');
  };

  const handleWhatsAppCustom = () => {
    if (!isAuthenticated) {
      showToast('Please sign in first before placing a custom order.', 'gold');
      navigate('/auth', {
        state: {
          from: `/product/${product.id}`,
          reason: 'Sign in first to discuss & place custom jewellery orders cleanly.',
        },
      });
      return;
    }

    const text =
      `Hi AURA Jewels! My name is ${user.name}. I am interested in ordering *${product.name}* (₹${product.price}).%0A` +
      `- Selected Size: ${selectedSize}%0A` +
      (selectedInitial ? `- Custom Initial: "${selectedInitial}"%0A` : '') +
      `- Quantity: ${quantity}%0A` +
      `Please let me know how to proceed!`;
    window.open(`https://wa.me/918780125711?text=${text}`, '_blank');
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please sign in to submit a verified review.', 'gold');
      navigate('/auth', {
        state: {
          from: `/product/${product.id}`,
          reason: 'Sign in to post your review on this handcrafted creation.',
        },
      });
      return;
    }
    if (!reviewText.trim()) return;

    const newRev = {
      id: `rev_${Date.now()}`,
      author: user.name,
      city: 'Verified Buyer',
      rating: reviewRating,
      date: 'Just now',
      comment: reviewText.trim(),
    };
    const next = [newRev, ...reviews];
    setReviews(next);
    setReviewText('');
    try {
      localStorage.setItem(reviewsStorageKey, JSON.stringify(next));
    } catch {}
    showToast('Thank you for your review! ♥', 'gold');
  };

  return (
    <div className="min-h-screen py-10 px-6 lg:px-16 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-espresso/60 mb-8 uppercase tracking-wider">
        <Link to="/" className="hover:text-gold-700">
          Home
        </Link>
        <span>/</span>
        <Link to="/collections" className="hover:text-gold-700">
          Collections
        </Link>
        <span>/</span>
        <span className="text-espresso font-semibold truncate">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Product Images Gallery */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-7 space-y-4"
        >
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-ivory-100 border border-gold-300/60 shadow-lg">
            <span className="absolute top-4 left-4 z-10 px-3.5 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-white/95 text-espresso shadow-sm border border-gold-300">
              {product.badge}
            </span>

            <button
              onClick={() => toggleWishlist(product.id)}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/95 text-espresso hover:text-rosequartz-500 shadow-sm transition"
              title="Save to Wishlist"
            >
              <Heart
                className={`w-5 h-5 ${
                  isWishlisted(product.id) ? 'fill-rosequartz-400 text-rosequartz-500' : ''
                }`}
              />
            </button>

            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500"
            />
          </div>

          {product.gallery && product.gallery.length > 1 && (
            <div className="flex gap-3">
              {product.gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition ${
                    selectedImage === img ? 'border-gold-500 shadow-md' : 'border-gold-200 opacity-70'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Right: Product Details & Customizer */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-5 space-y-6"
        >
          <div>
            <div className="flex items-center gap-2 text-gold-600 text-xs mb-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold-500 text-gold-500" />
                ))}
              </div>
              <span className="font-bold text-espresso">{product.rating}</span>
              <span className="text-espresso/50">
                ({product.reviewsCount + reviews.length - INITIAL_REVIEWS.length} verified customer reviews)
              </span>
            </div>

            <h1 className="font-serif-lux text-3xl sm:text-4xl font-bold text-espresso leading-tight">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-3xl font-bold text-gold-700">₹{product.price}</span>
              <span className="text-base text-espresso/40 line-through">₹{product.originalPrice}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-espresso/70 font-light leading-relaxed">
            {product.description}
          </p>

          {/* Lead Time Badge */}
          <div className="p-3 rounded-2xl bg-gold-50/80 border border-gold-300/50 flex items-center gap-2.5 text-xs text-gold-900 font-medium">
            <Sparkles className="w-4 h-4 text-gold-600 flex-shrink-0" />
            <span>{product.leadTime}</span>
          </div>

          {/* 1. Size Selector */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-espresso/80 font-bold block">
              1. Select Size / Length:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {product.sizes.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSelectedSize(sz)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border text-center transition ${
                    selectedSize === sz
                      ? 'border-gold-500 bg-gold-50 text-gold-900 shadow-sm'
                      : 'border-gold-200 bg-white text-espresso/70 hover:border-gold-300'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Custom Initial Alphabet */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-wider text-espresso/80 font-bold">
                2. Custom Initial Charm (Optional):
              </label>
              {selectedInitial && (
                <button
                  type="button"
                  onClick={() => setSelectedInitial('')}
                  className="text-[10px] text-red-500 hover:underline"
                >
                  Clear Initial
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 rounded-xl border border-gold-200 bg-white">
              {alphabet.map((letter) => (
                <button
                  key={letter}
                  type="button"
                  onClick={() => setSelectedInitial(letter)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                    selectedInitial === letter
                      ? 'bg-gold-500 text-white shadow-sm'
                      : 'bg-ivory-100 text-espresso/80 hover:bg-gold-100'
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
            {selectedInitial && (
              <p className="text-[11px] text-gold-700 font-semibold">
                ✓ Engraved Charm selected: "{selectedInitial}"
              </p>
            )}
          </div>

          {/* Quantity & Buy CTAs */}
          <div className="space-y-3 pt-4 border-t border-gold-200">
            <div className="flex gap-3">
              {/* Stepper */}
              <div className="flex items-center border border-gold-300 rounded-full px-3 py-1 bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 hover:text-gold-600 font-bold text-sm"
                >
                  -
                </button>
                <span className="px-3 text-xs font-bold text-espresso">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1 hover:text-gold-600 font-bold text-sm"
                >
                  +
                </button>
              </div>

              {/* Add to Bag Button */}
              <button
                type="button"
                onClick={handleAdd}
                className="flex-1 py-3.5 rounded-full border-2 border-gold-500 bg-white hover:bg-gold-50 text-gold-800 text-xs uppercase tracking-widest font-bold shadow-sm transition"
              >
                Add to Bag
              </button>
            </div>

            {/* Express Buy Now (Protected by Auth -> Address -> Checkout!) */}
            <button
              type="button"
              onClick={handleBuyNow}
              className="w-full py-4 rounded-full glass-gold-btn text-xs uppercase tracking-[0.18em] font-bold shadow-luxury flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Buy Now • ₹{(product.price * quantity).toLocaleString('en-IN')}</span>
            </button>

            {/* WhatsApp Custom Order */}
            <button
              type="button"
              onClick={handleWhatsAppCustom}
              className="w-full py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs uppercase tracking-wider font-bold shadow-sm flex items-center justify-center gap-2 transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Discuss & Order This on WhatsApp</span>
            </button>
          </div>

          {/* Materials & Care Accordion */}
          <div className="rounded-2xl border border-gold-200 bg-white overflow-hidden">
            <button
              type="button"
              onClick={() => setCareOpen(!careOpen)}
              className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-espresso hover:bg-ivory-50 transition"
            >
              <span>Materials & Care Guide</span>
              <ChevronDown
                className={`w-4 h-4 text-gold-600 transition-transform ${
                  careOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {careOpen && (
              <div className="px-4 pb-4 pt-1 text-xs text-espresso/75 space-y-2 border-t border-gold-100">
                <p className="font-semibold text-espresso">Authentic Materials Used:</p>
                <ul className="list-disc pl-4 space-y-1">
                  {product.materials.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
                <p className="pt-1 text-[11px] text-espresso/60">
                  Care Tip: Store inside your Velvet Keepsake Box away from direct moisture, perfume, or chlorine to maintain mirror luster for years.
                </p>
              </div>
            )}
          </div>

          {/* Trust Guarantees */}
          <div className="pt-4 border-t border-gold-200 grid grid-cols-2 gap-4 text-xs text-espresso/70 font-light">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-gold-600" />
              <span>Anti-Tarnish & Hypoallergenic</span>
            </div>
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-gold-600" />
              <span>Free Luxury Keepsake Box</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-gold-600" />
              <span>3-5 Business Days Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-gold-600" />
              <span>7-Day Replacement Guarantee</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* VERIFIED CUSTOMER REVIEWS & WRITE REVIEW SECTION */}
      <div className="mt-20 pt-14 border-t border-gold-300/40 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-gold-200 shadow-sm space-y-4">
          <h3 className="font-serif-lux text-2xl font-bold text-espresso">Write A Review</h3>
          <p className="text-xs text-espresso/60">
            Share how your handcrafted AURA piece looks and feels!
          </p>

          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-espresso/75 mb-1.5">
                Your Rating
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= reviewRating
                          ? 'fill-gold-500 text-gold-500'
                          : 'text-gold-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <textarea
                rows={3}
                required
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Write your honest experience with sizing, sparkle, and packaging..."
                className="w-full p-3.5 rounded-2xl border border-gold-200 bg-ivory-50 text-xs text-espresso focus:outline-none focus:border-gold-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-full glass-gold-btn text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isAuthenticated ? 'Publish Review' : 'Sign In to Review'}</span>
            </button>
          </form>
        </div>

        <div className="lg:col-span-7 space-y-4">
          <h3 className="font-serif-lux text-3xl font-bold text-espresso">
            Customer Love ({reviews.length})
          </h3>
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 rounded-3xl bg-white border border-gold-200/80 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {Array.from({ length: rev.rating }).map((_, idx) => (
                        <Star key={idx} className="w-3.5 h-3.5 fill-gold-500 text-gold-500" />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-espresso">{rev.author}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                      {rev.city}
                    </span>
                  </div>
                  <span className="text-[11px] text-espresso/45">{rev.date}</span>
                </div>
                <p className="text-xs sm:text-sm text-espresso/75 font-light leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RELATED HEIRLOOMS SECTION */}
      <div className="mt-20 pt-16 border-t border-gold-300/40">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <span className="text-xs uppercase tracking-[0.25em] text-gold-600 font-semibold flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-gold-500" />
            <span>Complete Your Atelier Look</span>
          </span>
          <h2 className="font-serif-lux text-3xl sm:text-4xl font-bold text-espresso">
            You May Also Adore
          </h2>
          <p className="text-xs sm:text-sm text-espresso/60 font-light">
            Handcrafted pieces harmoniously paired with {product.name}.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {relatedProducts.map((rel, index) => (
            <ProductCard key={rel.id} product={rel} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
