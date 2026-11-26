import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/common/ProductCard';

export default function WishlistPage() {
  const { wishlist, toggleWishlist, clearWishlist } = useCart();
  const { showToast } = useAuth();
  const { products } = useStore();

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-16 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-espresso/60 mb-8 uppercase tracking-wider">
        <Link to="/" className="hover:text-gold-700">
          Home
        </Link>
        <span>/</span>
        <span className="text-espresso font-semibold">My Wishlist</span>
      </div>

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rosequartz-100 text-rosequartz-800 text-xs uppercase tracking-widest font-bold">
          <Heart className="w-3.5 h-3.5 fill-rosequartz-500 text-rosequartz-500" />
          <span>Your Saved Treasures</span>
        </div>
        <h1 className="font-serif-lux text-4xl sm:text-5xl font-bold text-espresso">
          My Treasured Wishlist
        </h1>
        <p className="text-espresso/60 text-xs sm:text-sm font-light leading-relaxed">
          Heirloom pieces you have fallen in love with. Each creation is hand-crafted with healing minerals, authentic baroque pearls, and artisanal love.
        </p>
      </div>

      {/* Empty State */}
      {wishlistedProducts.length === 0 ? (
        <div className="max-w-md mx-auto text-center py-20 px-6 rounded-3xl bg-white border border-gold-200 shadow-sm space-y-5">
          <div className="w-20 h-20 rounded-full bg-rosequartz-50 text-rosequartz-400 mx-auto flex items-center justify-center border border-rosequartz-200">
            <Heart className="w-10 h-10 stroke-[1.5]" />
          </div>

          <div className="space-y-2">
            <h3 className="font-serif-lux text-2xl font-bold text-espresso">
              Your Wishlist is Empty
            </h3>
            <p className="text-xs text-espresso/60 font-light leading-relaxed">
              Explore our handcrafted crystal bracelets, botanical resin charms, and baroque pearls to save your dream pieces.
            </p>
          </div>

          <Link
            to="/collections"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full glass-gold-btn text-xs uppercase tracking-widest font-bold shadow-md"
          >
            <span>Explore Collections</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gold-200">
            <span className="text-xs uppercase tracking-wider text-espresso/70 font-bold">
              Saved Items ({wishlistedProducts.length})
            </span>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  clearWishlist();
                  showToast('Wishlist cleared', 'info');
                }}
                className="text-xs text-red-500 hover:underline font-semibold"
              >
                Clear All
              </button>
              <Link
                to="/collections"
                className="text-xs text-gold-700 hover:underline font-bold flex items-center gap-1"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {wishlistedProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                wishlistMode={true}
                onMoveToBag={(pid) => toggleWishlist(pid)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
