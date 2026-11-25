import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Heart, ArrowUpRight, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function ProductCard({
  product,
  index = 0,
  wishlistMode = false,
  onMoveToBag,
}) {
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const { showToast } = useAuth();
  const wishlisted = isWishlisted(product.id);

  const handleToggleWishlist = () => {
    toggleWishlist(product.id);
    if (wishlistMode) {
      showToast(`${product.shortName || product.name} removed from Wishlist`, 'info');
    } else if (!wishlisted) {
      showToast(`Saved ${product.shortName || product.name} to Wishlist ♥`, 'rose');
    } else {
      showToast(`Removed from Wishlist`, 'info');
    }
  };

  const handleAdd = () => {
    addToCart(product);
    if (onMoveToBag) onMoveToBag(product.id);
    showToast(`Added ${product.shortName || product.name} to Bag ✨`, 'gold');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.3) }}
      className="group bg-white rounded-3xl p-4 border border-gold-200/80 hover:border-gold-400 shadow-sm hover:shadow-card-lift transition-all duration-500 flex flex-col justify-between"
    >
      {/* Image & Badges */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-ivory-100 mb-4">
        <span className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-white/95 backdrop-blur-md text-espresso shadow-sm border border-gold-200">
          {product.badge}
        </span>

        <button
          type="button"
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full bg-white/95 backdrop-blur-md transition ${
            wishlisted || wishlistMode
              ? 'text-rosequartz-500'
              : 'text-espresso/40 hover:text-rosequartz-400'
          }`}
          title={wishlistMode ? 'Remove from Wishlist' : 'Save to Wishlist'}
        >
          {wishlistMode ? (
            <Trash2 className="w-4 h-4" />
          ) : (
            <Heart className={`w-4 h-4 ${wishlisted ? 'fill-rosequartz-400' : ''}`} />
          )}
        </button>

        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </Link>
      </div>

      {/* Product Info */}
      <div className="space-y-1">
        <div className="flex items-center gap-1 text-gold-600 text-xs">
          <Star className="w-3.5 h-3.5 fill-gold-500 text-gold-500" />
          <span className="font-bold text-espresso text-[11px]">{product.rating}</span>
          <span className="text-espresso/40 text-[10px]">({product.reviewsCount} reviews)</span>
        </div>

        <Link to={`/product/${product.id}`} className="block">
          <h3 className="font-serif-lux text-xl font-bold text-espresso group-hover:text-gold-700 transition line-clamp-1">
            {product.name}
          </h3>
        </Link>

        <p className="text-xs text-espresso/60 font-light line-clamp-2 leading-relaxed">
          {product.description}
        </p>
      </div>

      {/* Price & Golden Add to Bag CTA */}
      <div className="mt-5 pt-4 border-t border-gold-100 flex items-center justify-between">
        <div>
          <span className="text-xs text-espresso/40 line-through">₹{product.originalPrice}</span>
          <p className="text-xl font-bold text-gold-700">₹{product.price}</p>
        </div>

        <div className="flex items-center gap-2">
          {!wishlistMode && (
            <Link
              to={`/product/${product.id}`}
              className="p-2.5 rounded-full border border-gold-300 text-espresso/70 hover:text-gold-700 hover:border-gold-500 transition"
              title="View Details"
            >
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          )}

          <button
            type="button"
            onClick={handleAdd}
            className="px-4 py-2.5 rounded-full glass-gold-btn text-xs uppercase font-bold tracking-wider shadow-sm flex items-center gap-1.5"
          >
            {wishlistMode && <ShoppingBag className="w-3.5 h-3.5" />}
            <span>{wishlistMode ? 'Move to Bag' : 'Add to Bag'}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
