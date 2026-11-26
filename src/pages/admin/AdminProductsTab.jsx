import React, { useEffect, useState } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  Star,
  Eye,
  EyeOff,
  Upload,
  X,
  Image as ImageIcon,
  Save
} from 'lucide-react';
import { adminApi } from '../../services/api';
import { formatINR } from './adminShared';

const EMPTY_FORM = {
  dbId: null,
  name: '',
  category: 'bracelets',
  price: '1299',
  originalPrice: '',
  badge: '',
  tag: '',
  stockQty: '20',
  description: '',
  story: '',
  materialsText: 'AAA Rose Quartz, 18k Gold-Plated Brass, Silk Cord',
  sizesText: 'Small (6.0 in / 15 cm), Standard (6.5 in / 16.5 cm), Medium (7.0 in / 18 cm)',
  images: [],
  isFeatured: true,
  isActive: true
};

export default function AdminProductsTab({ showToast, onStoreChanged, onDataReload }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        adminApi.getAllProducts(),
        adminApi.getCategories()
      ]);
      setProducts(prodRes.products || []);
      setCategories(catRes.categories || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const openCreateModal = () => {
    setForm({
      ...EMPTY_FORM,
      category: categories[0]?.slug || 'bracelets'
    });
    setImageUrlInput('');
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setForm({
      dbId: product.dbId,
      name: product.name,
      category: product.categorySlug || product.category,
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : '',
      badge: product.badge || '',
      tag: product.tag || '',
      stockQty: String(product.stockQty ?? 0),
      description: product.description || '',
      story: product.story || '',
      materialsText: (product.materials || []).join(', '),
      sizesText: (product.sizes || []).join(', '),
      images: product.images || [],
      isFeatured: Boolean(product.isFeatured),
      isActive: Boolean(product.isActive)
    });
    setImageUrlInput('');
    setModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const res = await adminApi.uploadProductImages(files);
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...(res.urls || [])]
      }));
      showToast(`Uploaded ${res.urls?.length || 0} jewellery photo(s) ✨`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleAddImageUrl = () => {
    const clean = imageUrlInput.trim();
    if (!clean) return;
    setForm((prev) => ({ ...prev, images: [...prev.images, clean] }));
    setImageUrlInput('');
  };

  const handleRemoveImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        category: form.category,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        badge: form.badge,
        tag: form.tag,
        stockQty: Number(form.stockQty || 0),
        description: form.description,
        story: form.story,
        materials: form.materialsText,
        sizes: form.sizesText,
        images: form.images,
        isFeatured: form.isFeatured,
        isActive: form.isActive
      };

      if (form.dbId) {
        await adminApi.updateProduct(form.dbId, payload);
        showToast(`Updated "${form.name}" ✨`, 'success');
      } else {
        await adminApi.createProduct(payload);
        showToast(`Added "${form.name}" to your storefront! ✨`, 'success');
      }

      setModalOpen(false);
      await loadCatalog();
      onStoreChanged?.();
      onDataReload?.();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const quickToggle = async (product, field) => {
    try {
      await adminApi.updateProduct(product.dbId, {
        [field]: !product[field]
      });
      await loadCatalog();
      onStoreChanged?.();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Permanently delete "${product.name}"?`)) return;
    try {
      await adminApi.deleteProduct(product.dbId);
      showToast(`Deleted "${product.name}".`, 'info');
      await loadCatalog();
      onStoreChanged?.();
      onDataReload?.();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white border border-[#E5DFD6] p-4 shadow-soft">
        <div>
          <h3 className="font-serif text-xl font-semibold text-[#2C2724]">
            Jewellery Creations ({products.length})
          </h3>
          <p className="text-xs text-[#6E6259]">
            Upload handmade photos, adjust stock, mark Featured pieces for the Homepage Drop, or hide out-of-season batches.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="rounded-xl bg-[#2C2724] text-white text-xs font-semibold px-4 py-2.5 flex items-center gap-2 hover:bg-[#3E3732] transition-colors"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" /> Add New Jewellery
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white border border-[#E5DFD6] p-8 text-center text-sm text-[#8F8177]">
          Loading products...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.dbId}
              className={`rounded-2xl bg-white border p-4 shadow-soft flex flex-col justify-between transition-opacity ${
                product.isActive ? 'border-[#E5DFD6]' : 'border-stone-200 opacity-65'
              }`}
            >
              <div>
                <div className="flex items-start gap-3.5">
                  <img
                    src={product.images?.[0] || 'https://placehold.co/120x120/FAF6F0/2C2724?text=Aura'}
                    alt={product.name}
                    className="w-20 h-20 rounded-xl object-cover border border-[#EFE9E0] shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8E6C27]">
                        {product.categorySlug}
                      </span>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                          product.stockQty <= 5
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        Stock: {product.stockQty}
                      </span>
                    </div>
                    <h4 className="font-serif text-lg font-semibold text-[#2C2724] truncate mt-0.5">
                      {product.name}
                    </h4>
                    <div className="mt-1 flex items-center gap-2 text-sm">
                      <span className="font-semibold text-[#2C2724]">{formatINR(product.price)}</span>
                      {product.originalPrice && (
                        <span className="text-xs line-through text-[#8F8177]">
                          {formatINR(product.originalPrice)}
                        </span>
                      )}
                      {product.badge && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F8EFE2] text-[#8E6C27]">
                          {product.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#EFE9E0] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => quickToggle(product, 'isFeatured')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 border ${
                      product.isFeatured
                        ? 'bg-[#F8EFE2] text-[#8E6C27] border-[#D4AF37]/40'
                        : 'bg-[#FAF6F0] text-[#6E6259] border-[#E5DFD6]'
                    }`}
                    title="Show in Homepage Signature Drop"
                  >
                    <Star className={`w-3.5 h-3.5 ${product.isFeatured ? 'fill-[#D4AF37] text-[#D4AF37]' : ''}`} />
                    {product.isFeatured ? 'Featured' : 'Standard'}
                  </button>

                  <button
                    type="button"
                    onClick={() => quickToggle(product, 'isActive')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 border ${
                      product.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-stone-100 text-stone-600 border-stone-200'
                    }`}
                  >
                    {product.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    {product.isActive ? 'Visible' : 'Hidden'}
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(product)}
                    className="p-2 rounded-lg text-[#2C2724] hover:bg-[#FAF6F0]"
                    title="Edit Creation"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(product)}
                    className="p-2 rounded-lg text-rose-600 hover:bg-rose-50"
                    title="Delete Creation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#E5DFD6] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-5 sm:p-7">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFE9E0]">
              <h3 className="font-serif text-2xl font-semibold text-[#2C2724]">
                {form.dbId ? 'Edit Jewellery Creation' : 'Add New Jewellery Creation'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#FAF6F0]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#6E6259] mb-1">Creation Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Moonlight Rose Quartz Bracelet"
                    className="w-full rounded-xl border border-[#E5DFD6] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6E6259] mb-1">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full rounded-xl border border-[#E5DFD6] px-3 py-2 text-sm bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#6E6259] mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.price}
                    onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                    className="w-full rounded-xl border border-[#E5DFD6] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6E6259] mb-1">MRP / Strikethrough</label>
                  <input
                    type="number"
                    min="0"
                    value={form.originalPrice}
                    onChange={(e) => setForm((p) => ({ ...p, originalPrice: e.target.value }))}
                    placeholder="Optional"
                    className="w-full rounded-xl border border-[#E5DFD6] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6E6259] mb-1">Stock Qty</label>
                  <input
                    type="number"
                    min="0"
                    value={form.stockQty}
                    onChange={(e) => setForm((p) => ({ ...p, stockQty: e.target.value }))}
                    className="w-full rounded-xl border border-[#E5DFD6] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6E6259] mb-1">Badge Pill</label>
                  <input
                    type="text"
                    value={form.badge}
                    onChange={(e) => setForm((p) => ({ ...p, badge: e.target.value }))}
                    placeholder="e.g. New Drop"
                    className="w-full rounded-xl border border-[#E5DFD6] px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Photo Uploader */}
              <div className="rounded-2xl bg-[#FAF6F0] border border-[#E5DFD6] p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#2C2724] flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#D4AF37]" /> Studio Photos
                  </span>
                  <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-[#2C2724] text-white text-xs font-semibold px-3 py-1.5 hover:bg-[#3E3732]">
                    <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
                    {uploading ? 'Uploading...' : 'Upload from Phone / PC'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>

                {form.images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {form.images.map((url, idx) => (
                      <div key={`${url}-${idx}`} className="relative group rounded-xl overflow-hidden border border-[#E5DFD6] aspect-square bg-white">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-0.5 hover:bg-rose-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="Or paste an image URL..."
                    className="flex-1 rounded-xl border border-[#E5DFD6] bg-white px-3 py-1.5 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#E5DFD6] text-xs font-semibold text-[#2C2724]"
                  >
                    Add URL
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6E6259] mb-1">Description *</label>
                <textarea
                  rows={2}
                  required
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full rounded-xl border border-[#E5DFD6] px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6E6259] mb-1">Artisan Story Note</label>
                <textarea
                  rows={2}
                  value={form.story}
                  onChange={(e) => setForm((p) => ({ ...p, story: e.target.value }))}
                  className="w-full rounded-xl border border-[#E5DFD6] px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#6E6259] mb-1">
                    Materials (comma separated)
                  </label>
                  <input
                    type="text"
                    value={form.materialsText}
                    onChange={(e) => setForm((p) => ({ ...p, materialsText: e.target.value }))}
                    className="w-full rounded-xl border border-[#E5DFD6] px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6E6259] mb-1">
                    Available Sizes (comma separated)
                  </label>
                  <input
                    type="text"
                    value={form.sizesText}
                    onChange={(e) => setForm((p) => ({ ...p, sizesText: e.target.value }))}
                    className="w-full rounded-xl border border-[#E5DFD6] px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-1">
                <label className="flex items-center gap-2 text-xs font-medium text-[#2C2724] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm((p) => ({ ...p, isFeatured: e.target.checked }))}
                    className="rounded border-[#D4AF37]"
                  />
                  Show in Homepage Signature Drop
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-[#2C2724] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                    className="rounded border-[#D4AF37]"
                  />
                  Published / Visible on Store
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EFE9E0]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E5DFD6] text-xs font-semibold text-[#6E6259]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#D4AF37] text-[#2C2724] text-xs font-bold flex items-center gap-1.5 hover:bg-[#E2BE48] disabled:opacity-60"
                >
                  <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Jewellery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
