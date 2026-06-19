import React, { useEffect, useState, useMemo, useRef } from "react";
import api, { imageUrl, formatINR } from "@/lib/api";
import { ADMIN } from "@/constants/testIds";
import { toast } from "sonner";
import { Search, Eye, EyeOff, Upload, ArrowUpDown, ArrowUp, ArrowDown, RefreshCw, Pencil, X, Check, Image as ImageIcon } from "lucide-react";

/** Product table with prominent Upload Image + Edit Price actions per row. */
export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("code");
  const [editingId, setEditingId] = useState(null); // product id being price-edited
  const [editValue, setEditValue] = useState("");
  const [uploadingId, setUploadingId] = useState(null);
  const [dragId, setDragId] = useState(null);
  const fileRefs = useRef({});

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/products");
      setProducts(data);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    let arr = products;
    if (s) {
      arr = arr.filter(p =>
        p.code.toLowerCase().includes(s) ||
        (p.items || "").toLowerCase().includes(s) ||
        (p.set_type || "").toLowerCase().includes(s)
      );
    }
    arr = [...arr];
    if (sort === "price_asc") arr.sort((a, b) => (a.oncost_price || 0) - (b.oncost_price || 0));
    else if (sort === "price_desc") arr.sort((a, b) => (b.oncost_price || 0) - (a.oncost_price || 0));
    else arr.sort((a, b) => a.code.localeCompare(b.code));
    return arr;
  }, [products, q, sort]);

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditValue(p.override_price ?? p.oncost_price ?? "");
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };
  const saveEdit = async (p) => {
    const val = String(editValue).trim();
    const body = { override_price: val === "" ? null : Number(val) };
    if (body.override_price !== null && (isNaN(body.override_price) || body.override_price < 0)) {
      toast.error("Enter a valid price (or leave empty to clear)");
      return;
    }
    try {
      await api.put(`/products/${p.id}`, body);
      toast.success(body.override_price === null ? `Price reset to rule for ${p.code}` : `Price set to ₹${body.override_price} for ${p.code}`);
      setEditingId(null); setEditValue("");
      load();
    } catch {
      toast.error("Could not save price");
    }
  };

  const resetToRule = async (p) => {
    try {
      await api.put(`/products/${p.id}`, { override_price: null });
      toast.success(`Reset to auto for ${p.code}`);
      load();
    } catch { toast.error("Failed"); }
  };

  const onToggleVis = async (p) => {
    try {
      await api.put(`/products/${p.id}`, { visible: !p.visible });
      setProducts(prev => prev.map(x => x.id === p.id ? { ...x, visible: !p.visible } : x));
    } catch { toast.error("Failed"); }
  };

  const onUpload = async (p, file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image too large (max 8MB)");
      return;
    }
    setUploadingId(p.id);
    try {
      const fd = new FormData();
      fd.append("file", file);
      await api.post(`/products/${p.id}/image`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success(`Image updated for ${p.code}`);
      load();
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploadingId(null);
    }
  };

  const onDrop = (p, e) => {
    e.preventDefault();
    setDragId(null);
    const f = e.dataTransfer.files?.[0];
    if (f) onUpload(p, f);
  };

  const SortBtn = ({ value, label, icon: Icon }) => (
    <button
      onClick={() => setSort(value)}
      data-testid={`sort-${value}`}
      className={`text-xs px-3 py-1.5 border transition-all flex items-center gap-1.5 ${
        sort === value ? "border-[#002FA7] text-[#002FA7] bg-[#002FA7]/5" : "border-zinc-300 text-zinc-600 hover:border-zinc-900"
      }`}
    >
      <Icon size={11} />
      {label}
    </button>
  );

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
        <div>
          <p className="overline">Catalog</p>
          <h1 className="font-display text-4xl font-light mt-1 tracking-tight">Products</h1>
          <p className="text-sm text-zinc-500 mt-2">{products.length} items. Click <b className="text-zinc-900">Edit Price</b> to override a price or <b className="text-zinc-900">Upload Image</b> to replace the supplier photo.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SortBtn value="code" label="Code" icon={ArrowUpDown} />
          <SortBtn value="price_asc" label="Price ↑" icon={ArrowUp} />
          <SortBtn value="price_desc" label="Price ↓" icon={ArrowDown} />
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
              className="pl-9 pr-3 py-2 border border-zinc-300 text-sm w-60 focus:border-[#002FA7] outline-none"
              data-testid="products-search"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((p) => {
            const isEditing = editingId === p.id;
            const isUploading = uploadingId === p.id;
            const hasOverride = p.override_price !== null && p.override_price !== undefined;
            return (
              <div
                key={p.id}
                data-testid={ADMIN.productRow(p.code)}
                onDragOver={(e) => { e.preventDefault(); setDragId(p.id); }}
                onDragLeave={() => setDragId(null)}
                onDrop={(e) => onDrop(p, e)}
                className={`bg-white border ${dragId === p.id ? "border-[#002FA7] border-dashed bg-[#002FA7]/5" : "border-zinc-200"} p-3 flex items-stretch gap-4 transition-all`}
              >
                {/* Image */}
                <div className="relative w-20 h-20 shrink-0 border border-zinc-200 bg-white">
                  {p.image && (
                    <img src={imageUrl(p.image) + `?v=${p.image}`} alt={p.code} className="w-full h-full object-contain" />
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <RefreshCw size={16} className="animate-spin text-[#002FA7]" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    ref={(el) => (fileRefs.current[p.id] = el)}
                    className="hidden"
                    onChange={(e) => onUpload(p, e.target.files?.[0])}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-[12px] font-bold tracking-wider">{p.code}</p>
                    {!p.visible && <span className="text-[10px] uppercase tracking-wider border border-zinc-300 text-zinc-500 px-1.5">hidden</span>}
                    {hasOverride && <span className="text-[10px] uppercase tracking-wider bg-[#002FA7] text-white px-1.5">custom price</span>}
                  </div>
                  <p className="font-display text-base font-medium mt-0.5 truncate">{p.set_type}</p>
                  <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{p.items}</p>
                  <p className="overline text-[10px] mt-2">MOQ {p.moq} • SG cost <span className="font-mono">{formatINR(p.sg_price)}</span></p>
                </div>

                {/* Price + Actions */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-500 font-mono text-sm">₹</span>
                      <input
                        data-testid={`price-input-${p.code}`}
                        autoFocus
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") saveEdit(p); if (e.key === "Escape") cancelEdit(); }}
                        placeholder="auto"
                        className="w-28 px-2 py-1.5 border border-[#002FA7] text-right font-mono text-base outline-none focus:ring-2 focus:ring-[#002FA7]/20"
                      />
                      <button data-testid={`price-save-${p.code}`} onClick={() => saveEdit(p)} className="w-8 h-8 bg-[#002FA7] text-white flex items-center justify-center hover:bg-[#002277]" title="Save"><Check size={14} /></button>
                      <button data-testid={`price-cancel-${p.code}`} onClick={cancelEdit} className="w-8 h-8 border border-zinc-300 text-zinc-600 flex items-center justify-center hover:border-zinc-900" title="Cancel"><X size={14} /></button>
                    </div>
                  ) : (
                    <p className="font-display text-2xl font-medium leading-none">{formatINR(p.oncost_price)}</p>
                  )}

                  {!isEditing && (
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <button
                        data-testid={`edit-price-${p.code}`}
                        onClick={() => startEdit(p)}
                        className="text-xs px-3 py-1.5 border border-[#002FA7] text-[#002FA7] hover:bg-[#002FA7] hover:text-white flex items-center gap-1.5 transition-all"
                      >
                        <Pencil size={12} /> Edit Price
                      </button>
                      <button
                        data-testid={`product-upload-${p.code}`}
                        onClick={() => fileRefs.current[p.id]?.click()}
                        disabled={isUploading}
                        className="text-xs px-3 py-1.5 border border-zinc-300 hover:border-[#002FA7] hover:text-[#002FA7] flex items-center gap-1.5"
                      >
                        <Upload size={12} /> Upload Image
                      </button>
                      <button
                        onClick={() => onToggleVis(p)}
                        data-testid={ADMIN.productVisibility(p.code)}
                        className="w-8 h-8 border border-zinc-300 flex items-center justify-center hover:border-zinc-900"
                        title={p.visible ? "Hide from catalog" : "Show in catalog"}
                      >
                        {p.visible ? <Eye size={12} /> : <EyeOff size={12} className="text-zinc-400" />}
                      </button>
                      {hasOverride && (
                        <button
                          data-testid={`reset-price-${p.code}`}
                          onClick={() => resetToRule(p)}
                          className="text-[10px] uppercase tracking-wider text-zinc-500 hover:text-zinc-900 underline-offset-2 hover:underline"
                          title="Remove custom price, use rule"
                        >
                          reset
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 p-4 bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 leading-relaxed">
        <p className="overline text-[10px] mb-1">Tips</p>
        <ul className="space-y-1 list-disc list-inside">
          <li><b>Edit Price</b> sets a custom price for this item (overrides the global markup rule).</li>
          <li>Click <b>reset</b> next to a row to remove the custom price and follow the rule again.</li>
          <li><b>Upload Image</b> replaces the supplier photo. You can also <b>drag and drop</b> an image file onto any row.</li>
          <li>Allowed: JPG, PNG, WEBP — up to 8 MB. Images are auto-resized and centered on a white background.</li>
        </ul>
      </div>
    </div>
  );
}
