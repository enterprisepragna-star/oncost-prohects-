import React, { useEffect, useState, useMemo } from "react";
import api, { imageUrl, formatINR, shareLink } from "@/lib/api";
import { ADMIN } from "@/constants/testIds";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Search, Plus, Minus, Trash2, ArrowRight } from "lucide-react";

export default function NewQuotationPage() {
  const nav = useNavigate();
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState("");
  const [customer, setCustomer] = useState("");
  const [place, setPlace] = useState("");
  const [notes, setNotes] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [cart, setCart] = useState({}); // code -> {product, quantity}
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/products").then(({ data }) => setProducts(data));
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return products.filter(p =>
      p.visible !== false && (
        !s || p.code.toLowerCase().includes(s) || (p.items || "").toLowerCase().includes(s)
      )
    );
  }, [products, q]);

  const add = (p) => {
    setCart(prev => {
      const cur = prev[p.code];
      const qty = cur ? cur.quantity + 1 : p.moq || 50;
      return { ...prev, [p.code]: { product: p, quantity: qty } };
    });
  };

  const setQty = (code, qty) => {
    setCart(prev => {
      if (!prev[code]) return prev;
      const n = Math.max(0, Number(qty) || 0);
      if (n === 0) {
        const c = { ...prev }; delete c[code]; return c;
      }
      return { ...prev, [code]: { ...prev[code], quantity: n } };
    });
  };

  const remove = (code) => setCart(prev => { const c = { ...prev }; delete c[code]; return c; });

  const items = Object.values(cart);
  const subtotal = items.reduce((s, x) => s + x.quantity * x.product.oncost_price, 0);

  const submit = async () => {
    if (!customer.trim()) return toast.error("Customer name required");
    if (items.length === 0) return toast.error("Add at least one product");
    setBusy(true);
    try {
      const { data } = await api.post("/quotations", {
        customer_name: customer.trim(),
        place: place.trim(),
        notes: notes.trim(),
        valid_until: validUntil || null,
        items: items.map(x => ({ product_id: x.product.id, quantity: x.quantity })),
      });
      toast.success(`Quotation ${data.quotation_id} created`);
      nav(`/admin/quotations/${data.id}`);
    } catch (e) {
      toast.error("Could not create quotation");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <p className="overline">Sales</p>
      <h1 className="font-display text-4xl font-light mt-1 tracking-tight">New Quotation</h1>
      <p className="text-sm text-zinc-500 mt-2">Build a shareable quote: customer, items, MOQ. Save to generate a public link & PDF.</p>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-px bg-zinc-200 border border-zinc-200">
        {/* Customer block */}
        <div className="bg-white p-5">
          <p className="overline text-[10px]">Customer name</p>
          <input
            data-testid={ADMIN.newQuoteCustomer}
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            placeholder="e.g. Acme Corp"
            className="mt-2 w-full border-b border-zinc-300 focus:border-[#002FA7] py-2 font-display text-lg outline-none"
          />
        </div>
        <div className="bg-white p-5">
          <p className="overline text-[10px]">Place of order</p>
          <input
            data-testid={ADMIN.newQuotePlace}
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            placeholder="e.g. Bengaluru"
            className="mt-2 w-full border-b border-zinc-300 focus:border-[#002FA7] py-2 font-display text-lg outline-none"
          />
        </div>
        <div className="bg-white p-5">
          <p className="overline text-[10px]">Valid until</p>
          <input
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            className="mt-2 w-full border-b border-zinc-300 focus:border-[#002FA7] py-2 font-mono text-sm outline-none"
          />
        </div>
      </div>

      <div className="mt-2 border border-zinc-200 p-5 bg-white">
        <p className="overline text-[10px]">Notes (optional)</p>
        <textarea
          data-testid={ADMIN.newQuoteNotes}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Payment terms, delivery, customization etc."
          className="mt-2 w-full border-b border-zinc-200 focus:border-[#002FA7] py-2 text-sm outline-none resize-none"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        {/* Product picker */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-2xl font-medium tracking-tight">Pick products</h3>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search…"
                className="pl-9 pr-3 py-2 border border-zinc-300 text-sm w-64"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-zinc-200 border border-zinc-200 max-h-[600px] overflow-auto">
            {filtered.map(p => {
              const inCart = !!cart[p.code];
              return (
                <div key={p.id} className="bg-white p-3 flex gap-3">
                  {p.image && <img src={imageUrl(p.image)} alt={p.code} className="w-16 h-16 object-cover border border-zinc-200 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-xs font-bold">{p.code}</p>
                      <p className="font-display font-medium text-sm">{formatINR(p.oncost_price)}</p>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{p.set_type} — {p.items}</p>
                    <button
                      data-testid={ADMIN.newQuoteAddItem(p.code)}
                      onClick={() => add(p)}
                      className={`mt-2 text-[11px] px-2 py-1 border transition-all ${inCart ? "border-[#002FA7] text-[#002FA7]" : "border-zinc-300 hover:border-[#002FA7] hover:text-[#002FA7]"}`}
                    >
                      {inCart ? `Added • Qty ${cart[p.code].quantity}` : `+ Add (MOQ ${p.moq})`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cart summary */}
        <div className="border border-zinc-200 bg-white p-5 self-start sticky top-6">
          <p className="overline">Line items ({items.length})</p>
          {items.length === 0 && <p className="text-sm text-zinc-500 mt-4">No items yet. Pick from the catalog.</p>}
          <div className="mt-3 max-h-[420px] overflow-auto">
            {items.map(({ product: p, quantity }) => (
              <div key={p.code} className="py-3 border-b border-zinc-200 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-[11px] font-bold">{p.code}</p>
                  <p className="text-xs text-zinc-500 line-clamp-1">{p.set_type}</p>
                  <div className="mt-2 flex items-center gap-1">
                    <button onClick={() => setQty(p.code, quantity - 1)} className="w-6 h-6 border border-zinc-300 flex items-center justify-center hover:border-[#002FA7]"><Minus size={10} /></button>
                    <input
                      data-testid={ADMIN.newQuoteQty(p.code)}
                      type="number"
                      value={quantity}
                      onChange={(e) => setQty(p.code, e.target.value)}
                      className="w-14 text-center border border-zinc-300 py-1 font-mono text-xs"
                    />
                    <button onClick={() => setQty(p.code, quantity + 1)} className="w-6 h-6 border border-zinc-300 flex items-center justify-center hover:border-[#002FA7]"><Plus size={10} /></button>
                    {quantity < p.moq && <span className="text-[10px] text-amber-600 ml-1">below MOQ</span>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-semibold">{formatINR(p.oncost_price * quantity)}</p>
                  <button onClick={() => remove(p.code)} className="mt-1 text-zinc-400 hover:text-red-600"><Trash2 size={12} /></button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-3 border-t-2 border-zinc-900 flex items-center justify-between">
            <p className="overline">Subtotal</p>
            <p className="font-display text-2xl font-medium">{formatINR(subtotal)}</p>
          </div>
          <button
            data-testid={ADMIN.newQuoteSubmit}
            disabled={busy}
            onClick={submit}
            className="mt-4 w-full bg-[#002FA7] hover:bg-[#002277] text-white py-3 flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
          >
            {busy ? "Saving…" : (<>Create quotation <ArrowRight size={14} /></>)}
          </button>
        </div>
      </div>
    </div>
  );
}
