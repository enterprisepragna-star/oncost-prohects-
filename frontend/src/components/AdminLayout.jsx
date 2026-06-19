import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { ADMIN, AUTH } from "@/constants/testIds";
import { Boxes, Package, Receipt, Settings2, LogOut, PlusSquare, Layers } from "lucide-react";

const NavItem = ({ to, label, icon: Icon, testid }) => {
  const loc = useLocation();
  const active = loc.pathname === to || loc.pathname.startsWith(to + "/");
  return (
    <Link
      to={to}
      data-testid={testid}
      className={`group flex items-center gap-3 px-4 py-3 border-l-2 transition-all ${
        active
          ? "bg-[#002FA7] text-white border-[#FF3B30]"
          : "border-transparent text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
      }`}
    >
      <Icon size={16} strokeWidth={active ? 2.4 : 1.6} />
      <span className="text-sm font-medium tracking-tight">{label}</span>
    </Link>
  );
};

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const onLogout = async () => {
    await logout();
    nav("/login");
  };
  return (
    <div className="min-h-screen flex bg-white text-zinc-900">
      {/* Sidebar */}
      <aside className="w-[260px] shrink-0 border-r border-zinc-200 bg-zinc-50/60 flex flex-col">
        <div className="px-5 py-6 border-b border-zinc-200">
          <Link to="/admin" className="flex items-baseline gap-2">
            <span className="logo-mark text-2xl">ONCOST</span>
            <span className="overline text-[10px]">Admin</span>
          </Link>
          <p className="mt-1 tag-strip">Catalog Console v1</p>
        </div>
        <nav className="flex-1 py-3">
          <p className="overline px-5 mb-2">Catalog</p>
          <NavItem to="/admin/products" label="Products" icon={Package} testid={ADMIN.navProducts} />
          <NavItem to="/admin/pricing-rule" label="Pricing Rules" icon={Settings2} testid={ADMIN.navPricing} />

          <p className="overline px-5 mt-6 mb-2">Sales</p>
          <NavItem to="/admin/quotations/new" label="New Quotation" icon={PlusSquare} testid={ADMIN.navNewQuote} />
          <NavItem to="/admin/quotations" label="Quotations" icon={Receipt} testid={ADMIN.navQuotations} />

          <p className="overline px-5 mt-6 mb-2">Public</p>
          <NavItem to="/catalog" label="View Catalog" icon={Boxes} testid="nav-public-catalog" />
        </nav>
        <div className="border-t border-zinc-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-[#002FA7] text-white flex items-center justify-center font-bold text-xs">
              {user?.email?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || "Admin"}</p>
              <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            data-testid={AUTH.logoutBtn}
            className="w-full flex items-center justify-center gap-2 border border-zinc-300 hover:border-zinc-900 px-3 py-2 text-sm transition-all"
          >
            <LogOut size={14} /> Log out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        <div className="border-b border-zinc-200 px-8 py-5 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 tag-strip">
              <Layers size={12} />
              <span>ONCOST / Admin Console</span>
            </div>
            <a
              href="/catalog"
              target="_blank"
              rel="noreferrer"
              className="text-xs underline underline-offset-4 hover:text-[#002FA7]"
            >
              Open public catalog ↗
            </a>
          </div>
        </div>
        <div className="p-8 max-w-[1400px] mx-auto animate-fade-up">{children}</div>
      </main>
    </div>
  );
}
