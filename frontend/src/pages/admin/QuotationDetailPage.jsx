import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api, { imageUrl, formatINR, shareLink } from "@/lib/api";
import { ADMIN } from "@/constants/testIds";
import { toast } from "sonner";
import { Copy, FileDown, Power, ExternalLink, ArrowLeft, MessageCircle, Mail, CheckCircle2 } from "lucide-react";

export default function QuotationDetailPage() {
  const { id } = useParams();
  const [q, setQ] = useState(null);

  const load = async () => {
    const { data } = await api.get(`/quotations/${id}`);
    setQ(data);
  };
  useEffect(() => { load(); }, [id]);

  if (!q) return <p className="text-sm text-zinc-500">Loading…</p>;

  const toggle = async () => {
    const { data } = await api.patch(`/quotations/${q.id}/toggle`);
    setQ({ ...q, active: data.active });
  };
  const acceptQuotation = async () => {
    if (q.status === "accepted") return;
    if (!confirm(`Mark quotation ${q.quotation_id} as ACCEPTED and convert to a sale? The public link will be closed.`)) return;
    try {
      await api.post(`/quotations/${q.id}/accept`);
      toast.success(`Quotation ${q.quotation_id} accepted → converted to sale`);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Could not accept");
    }
  };
  const copyLink = async () => {
    await navigator.clipboard.writeText(shareLink(q.share_token));
    toast.success("Share link copied");
  };

  const whatsappMessage = () => {
    const link = shareLink(q.share_token);
    const text = `Hi ${q.customer_name},\n\nHere's your ONCOST quotation *${q.quotation_id}* — total ${formatINR(q.total)}.\n\nView details: ${link}\n\n— Team ONCOST`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };
  const emailLink = () => {
    const link = shareLink(q.share_token);
    const subject = `ONCOST Quotation ${q.quotation_id} — ${q.customer_name}`;
    const body = `Hi ${q.customer_name},\n\nPlease find your ONCOST quotation ${q.quotation_id} below.\n\nGrand total: ${formatINR(q.total)}\nValid until: ${q.valid_until || "—"}\n\nView quotation: ${link}\n\nDownload PDF: ${process.env.REACT_APP_BACKEND_URL}/api/share/${q.share_token}/pdf\n\nRegards,\nONCOST`;
    const to = q.customer_email ? encodeURIComponent(q.customer_email) : "";
    return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div>
      <Link to="/admin/quotations" className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1"><ArrowLeft size={12} /> Back to quotations</Link>
      <div className="mt-3 flex items-end justify-between gap-6 flex-wrap">
        <div>
          <p className="overline">Quotation</p>
          <h1 className="font-display text-4xl font-light mt-1 tracking-tight">{q.quotation_id}</h1>
          <p className="text-sm text-zinc-500 mt-2">For <span className="font-medium text-zinc-900">{q.customer_name}</span> • {q.place || "—"}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button data-testid="quote-copy-link" onClick={copyLink} className="border border-zinc-300 hover:border-[#002FA7] hover:text-[#002FA7] px-3 py-2 text-sm flex items-center gap-2"><Copy size={14} /> Copy link</button>
          <a
            href={whatsappMessage()}
            target="_blank"
            rel="noreferrer"
            data-testid="quote-share-whatsapp"
            className="border border-[#25D366] text-[#128C7E] hover:bg-[#25D366] hover:text-white px-3 py-2 text-sm flex items-center gap-2 transition-all"
          >
            <MessageCircle size={14} /> WhatsApp
          </a>
          <a
            href={emailLink()}
            data-testid="quote-share-email"
            className="border border-zinc-300 hover:border-[#002FA7] hover:text-[#002FA7] px-3 py-2 text-sm flex items-center gap-2"
          >
            <Mail size={14} /> Email
          </a>
          <a href={`${process.env.REACT_APP_BACKEND_URL}/api/share/${q.share_token}/pdf`} target="_blank" rel="noreferrer" className="border border-zinc-300 hover:border-[#002FA7] hover:text-[#002FA7] px-3 py-2 text-sm flex items-center gap-2"><FileDown size={14} /> PDF</a>
          <a href={`/q/${q.share_token}`} target="_blank" rel="noreferrer" className="border border-zinc-300 hover:border-[#002FA7] hover:text-[#002FA7] px-3 py-2 text-sm flex items-center gap-2"><ExternalLink size={14} /> Public view</a>
          <button onClick={toggle} className={`border px-3 py-2 text-sm flex items-center gap-2 ${q.active ? "border-emerald-600 text-emerald-600" : "border-zinc-300 text-zinc-500"}`}><Power size={14} /> {q.active ? "Active" : "Disabled"}</button>
          {q.status !== "accepted" ? (
            <button
              onClick={acceptQuotation}
              data-testid="quote-accept"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm flex items-center gap-2"
            >
              <CheckCircle2 size={14} /> Accept &amp; Convert to Sale
            </button>
          ) : (
            <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 text-sm flex items-center gap-2">
              <CheckCircle2 size={14} /> Accepted — sale recorded
            </span>
          )}
        </div>
      </div>

      <div className="mt-6 border border-zinc-200 p-5 bg-zinc-50 grid grid-cols-2 md:grid-cols-5 gap-px text-sm">
        <div className="bg-white p-4">
          <p className="overline text-[10px]">Customer email</p>
          <p className="font-mono text-xs mt-2 break-all">{q.customer_email || "—"}</p>
        </div>
        <div className="bg-white p-4">
          <p className="overline text-[10px]">Share link</p>
          <p className="font-mono text-xs mt-2 break-all">{shareLink(q.share_token)}</p>
        </div>
        <div className="bg-white p-4">
          <p className="overline text-[10px]">Valid until</p>
          <p className="mt-2">{q.valid_until || "—"}</p>
        </div>
        <div className="bg-white p-4">
          <p className="overline text-[10px]">Items</p>
          <p className="mt-2 font-display text-xl">{q.items.length}</p>
        </div>
        <div className="bg-white p-4">
          <p className="overline text-[10px]">Grand total</p>
          <p className="mt-2 font-display text-xl font-medium">{formatINR(q.total)}</p>
        </div>
      </div>

      <div className="mt-8 border border-zinc-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-zinc-900">
              <th className="p-3 overline">Image</th>
              <th className="p-3 overline">Code</th>
              <th className="p-3 overline">Description</th>
              <th className="p-3 overline text-right">MOQ</th>
              <th className="p-3 overline text-right">Qty</th>
              <th className="p-3 overline text-right">Unit</th>
              <th className="p-3 overline text-right">Line total</th>
            </tr>
          </thead>
          <tbody>
            {q.items.map((it, i) => (
              <tr key={`${it.product_id || it.code}-${i}`} className="border-b border-zinc-200">
                <td className="p-3 w-20">{it.image && <img src={imageUrl(it.image)} className="w-14 h-14 object-contain bg-white border border-zinc-200" />}</td>
                <td className="p-3 font-mono font-semibold">{it.code}</td>
                <td className="p-3"><span className="font-medium">{it.set_type}</span><div className="text-xs text-zinc-500">{it.items}</div></td>
                <td className="p-3 text-right font-mono">{it.moq}</td>
                <td className="p-3 text-right font-mono">{it.quantity}</td>
                <td className="p-3 text-right font-mono">{formatINR(it.unit_price)}</td>
                <td className="p-3 text-right font-mono font-semibold">{formatINR(it.line_total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={6} className="p-3 text-right text-zinc-500">Subtotal</td>
              <td className="p-3 text-right font-mono">{formatINR(q.subtotal ?? q.total)}</td>
            </tr>
            <tr>
              <td colSpan={6} className="p-3 text-right text-zinc-500">Shipping</td>
              <td className="p-3 text-right font-mono">{formatINR(q.shipping_charges || 0)}</td>
            </tr>
            <tr>
              <td colSpan={6} className="p-3 text-right text-zinc-500">GST ({q.gst_percent || 0}%)</td>
              <td className="p-3 text-right font-mono">{formatINR(q.gst_amount || 0)}</td>
            </tr>
            <tr className="border-t-2 border-zinc-900">
              <td colSpan={6} className="p-3 text-right overline">Grand total</td>
              <td className="p-3 text-right font-display text-xl font-medium">{formatINR(q.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {q.notes && (
        <div className="mt-6 border border-zinc-200 p-4">
          <p className="overline text-[10px]">Notes</p>
          <p className="mt-2 text-sm text-zinc-700">{q.notes}</p>
        </div>
      )}
    </div>
  );
}
