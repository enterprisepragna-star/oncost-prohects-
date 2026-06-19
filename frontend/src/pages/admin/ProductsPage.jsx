import React, { useEffect, useState, useMemo } from "react";
import api, { imageUrl, formatINR } from "@/lib/api";
import { ADMIN } from "@/constants/testIds";
import { toast } from "sonner";
import { Search, Eye, EyeOff, X, Check } from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [edits, setEdits] = useState({}); // id -> {override_price}

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
    if (!s) return products;
    return products.filter(p =>
      p.code.toLowerCase().includes(s) ||
      (p.items || "").toLowerCase().includes(s) ||
      (p.set_type || "").toLowerCase().includes(s)
    );
  }, [products, q]);

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
      const { data } = await api.put(`/products/${p.id}`, body);
      setProducts(prev => prev.map(x => x.id === p.id ? { ...x, ...data } : x));
      setEdits(prev => { const n = { ...prev }; delete n[p.id]; return n; });
      toast.success(`Saved ${p.code}`);
      // reload to recompute oncost_price
      load();
    } catch (e) {
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

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="overline">Catalog</p>
          <h1 className="font-display text-4xl font-light mt-1 tracking-tight">Products</h1>
          <p className="text-sm text-zinc-500 mt-2">{products.length} items imported from supplier catalog. Override individual prices or toggle visibility.</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search code, items…"
            className="pl-9 pr-3 py-2 border border-zinc-300 text-sm w-72 focus:border-[#002FA7] outline-none"
            data-testid="products-search"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : (
        <div className="border border-zinc-200">
          <table className="w-full text-sm">
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
                return (
                  <tr key={p.id} data-testid={ADMIN.productRow(p.code)} className="border-b border-zinc-200 hover:bg-zinc-50">
                    <td className="p-3 w-20">
                      {p.image && (
                        <img src={imageUrl(p.image)} alt={p.code} className="w-14 h-14 object-contain bg-white border border-zinc-200" />
                      )}
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
