import React, { useEffect, useState, useMemo, useRef } from "react";
import api, { imageUrl, formatINR } from "@/lib/api";
import { ADMIN } from "@/constants/testIds";
import { toast } from "sonner";
import { Search, Eye, EyeOff, Upload, ArrowUpDown, ArrowUp, ArrowDown, RefreshCw } from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("code"); // code | price_asc | price_desc
  const [edits, setEdits] = useState({}); // id -> {override_price}
  const [uploading, setUploading] = useState({}); // id -> bool
  const fileRefs = useRef({});

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/products");
      setProducts(data);
    } catch (e) {
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

  const onSave = async (p) => {
    const ed = edits[p.id] || {};
    const body = {};
    if (ed.override_price !== undefined) {
      body.override_price = ed.override_price === "" ? null : Number(ed.override_price);
    }
    if (Object.keys(body).length === 0) {
      toast.message("No changes");
      return;
    }
    try {
      await api.put(`/products/${p.id}`, body);
      setEdits(prev => { const n = { ...prev }; delete n[p.id]; return n; });
      toast.success(`Saved ${p.code}`);
      load();
    } catch {
      toast.error("Save failed");
    }
  };

  const onToggleVis = async (p) => {
    try {
      await api.put(`/products/${p.id}`, { visible: !p.visible });
      setProducts(prev => prev.map(x => x.id === p.id ? { ...x, visible: !p.visible } : x));
    } catch {
      toast.error("Failed");
    }
  };

  const onUpload = async (p, file) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image too large (max 8MB)");
      return;
    }
    setUploading(u => ({ ...u, [p.id]: true }));
    try {
      const fd = new FormData();
      fd.append("file", file);
      await api.post(`/products/${p.id}/image`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success(`Image updated for ${p.code}`);
      load();
    } catch (e) {
      toast.error("Upload failed");
    } finally {
      setUploading(u => { const n = { ...u }; delete n[p.id]; return n; });
    }
  };

  const SortBtn = ({ value, label }) => (
    <button
      onClick={() => setSort(value)}
      data-testid={`sort-${value}`}
      className={`text-xs px-2.5 py-1.5 border transition-all flex items-center gap-1 ${
        sort === value ? "border-[#002FA7] text-[#002FA7] bg-[#002FA7]/5" : "border-zinc-300 text-zinc-600 hover:border-zinc-900"
      }`}
    >
      {value === "price_asc" && <ArrowUp size={11} />}
      {value === "price_desc" && <ArrowDown size={11} />}
      {value === "code" && <ArrowUpDown size={11} />}
      {label}
    </button>
  );

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
        <div>
          <p className="overline">Catalog</p>
          <h1 className="font-display text-4xl font-light mt-1 tracking-tight">Products</h1>
          <p className="text-sm text-zinc-500 mt-2">{products.length} items. Type in the override column to set a custom price, or upload your own image to replace the supplier photo.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SortBtn value="code" label="Code" />
          <SortBtn value="price_asc" label="Price ↑" />
          <SortBtn value="price_desc" label="Price ↓" />
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
        <div className="border border-zinc-200 overflow-x-auto">
          <table className="w-full text-sm min-w-[1000px]">
            <thead>
              <tr className="text-left border-b border-zinc-900">
                <th className="p-3 overline">Image</th>
                <th className="p-3 overline">Code</th>
                <th className="p-3 overline">Items</th>
                <th className="p-3 overline text-right">MOQ</th>
                <th className="p-3 overline text-right">SG Cost</th>
                <th className="p-3 overline text-right">ONCOST</th>
                <th className="p-3 overline text-right">Override</th>
                <th className="p-3 overline text-center">Visible</th>
                <th className="p-3 overline text-right"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const ed = edits[p.id] || {};
                const overrideVal = ed.override_price !== undefined ? ed.override_price : (p.override_price ?? "");
                const dirty = ed.override_price !== undefined && String(ed.override_price) !== String(p.override_price ?? "");
                const isUploading = uploading[p.id];
                return (
                  <tr key={p.id} data-testid={ADMIN.productRow(p.code)} className="border-b border-zinc-200 hover:bg-zinc-50">
                    <td className="p-3 w-24">
                      <div className="relative w-16 h-16 border border-zinc-200 bg-white">
                        {p.image && (
                          <img src={imageUrl(p.image) + `?v=${p.image}`} alt={p.code} className="w-full h-full object-contain" />
                        )}
                        <button
                          onClick={() => fileRefs.current[p.id]?.click()}
                          data-testid={`product-upload-${p.code}`}
                          disabled={isUploading}
                          className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#002FA7] text-white flex items-center justify-center hover:bg-[#002277] transition-all shadow-md"
                          title="Replace image"
                        >
                          {isUploading ? <RefreshCw size={11} className="animate-spin" /> : <Upload size={11} />}
                        </button>
                        <input
                          type="file"
                          accept="image/*"
                          ref={(el) => (fileRefs.current[p.id] = el)}
                          className="hidden"
                          onChange={(e) => onUpload(p, e.target.files?.[0])}
                        />
                      </div>
                    </td>
                    <td className="p-3 font-mono font-semibold text-[13px]">{p.code}</td>
                    <td className="p-3 text-zinc-700">
                      <div className="font-medium">{p.set_type}</div>
                      <div className="text-xs text-zinc-500 line-clamp-1 max-w-md">{p.items}</div>
                    </td>
                    <td className="p-3 text-right font-mono">{p.moq}</td>
                    <td className="p-3 text-right font-mono text-zinc-500">{formatINR(p.sg_price)}</td>
                    <td className="p-3 text-right font-mono font-semibold">{formatINR(p.oncost_price)}</td>
                    <td className="p-3 text-right">
                      <input
                        data-testid={ADMIN.productOverride(p.code)}
                        type="number"
                        value={overrideVal}
                        placeholder="auto"
                        onChange={(e) => setEdits(prev => ({ ...prev, [p.id]: { ...prev[p.id], override_price: e.target.value } }))}
                        className={`w-24 px-2 py-1 border text-right font-mono text-sm outline-none ${dirty ? "border-[#002FA7]" : "border-zinc-300"}`}
                      />
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onToggleVis(p)}
                        data-testid={ADMIN.productVisibility(p.code)}
                        className="p-1 hover:bg-zinc-100"
                        title={p.visible ? "Hide from catalog" : "Show in catalog"}
                      >
                        {p.visible ? <Eye size={14} /> : <EyeOff size={14} className="text-zinc-400" />}
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        data-testid={ADMIN.productSave(p.code)}
                        onClick={() => onSave(p)}
                        disabled={!dirty}
                        className="text-xs px-3 py-1 border border-zinc-300 hover:border-[#002FA7] hover:text-[#002FA7] disabled:opacity-30 disabled:hover:border-zinc-300 disabled:hover:text-zinc-400 transition-all"
                      >
                        Save
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
