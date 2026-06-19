import React, { useEffect, useState, useMemo } from "react";
import api, { imageUrl, formatINR } from "@/lib/api";
import { PUBLIC } from "@/constants/testIds";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";

export default function PublicCatalogPage() {
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    api.get("/public/products").then(({ data }) => setProducts(data));
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return products;
    return products.filter(p => p.code.toLowerCase().includes(s) || (p.items || "").toLowerCase().includes(s));
  }, [products, q]);

  return (
    <div data-testid={PUBLIC.catalogContainer} className="min-h-screen bg-white">
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/70 border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <Link to="/" className="logo-mark text-2xl">ONCOST</Link>
            <span className="overline text-[10px]">catalog 2026</span>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="pl-9 pr-3 py-2 border border-zinc-300 text-sm w-64 focus:border-[#002FA7] outline-none" />
          </div>
        </div>
      </div>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <p className="overline">Corporate Gifting · 2026</p>
        <h1 className="font-display text-5xl md:text-7xl font-light tracking-tight mt-3 max-w-3xl">
          Thoughtful gift sets <span className="text-[#002FA7]">priced for resale.</span>
        </h1>
        <p className="text-zinc-500 mt-6 max-w-xl">
          {products.length} curated gift sets. Send any selection as a polished quotation, instantly.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {filtered.map(p => (
            <article key={p.id} className="group">
              {p.image && (
                <div className="aspect-[4/3] overflow-hidden bg-white border border-zinc-200">
                  <img src={imageUrl(p.image)} alt={p.code} className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105" />
                </div>
              )}
              <div className="mt-3 flex items-center justify-between">
                <p className="font-mono text-[11px] font-bold">{p.code}</p>
                <p className="overline text-[10px]">MOQ {p.moq}</p>
              </div>
              <p className="font-display text-xl font-medium mt-1">{p.set_type}</p>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed line-clamp-2">{p.items}</p>
              <p className="font-display text-2xl font-medium mt-3">{formatINR(p.oncost_price)}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-zinc-200 py-10">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-zinc-500">
          <p className="font-mono">© ONCOST {new Date().getFullYear()}</p>
          <p>Bengaluru · India</p>
        </div>
      </footer>
    </div>
  );
}
