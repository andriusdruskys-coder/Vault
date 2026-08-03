import Link from "next/link";
import type { ReactNode } from "react";

import { lockPanelAction } from "@/app/actions/admin-access";
import { LiveClock } from "@/components/live-clock";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

const navItems = [
  { href: "/admin", label: "Apžvalga", icon: "📊" },
  { href: "/admin/products", label: "Prekės", icon: "📦" },
  { href: "/admin/categories", label: "Kategorijos", icon: "🏷️" },
  { href: "/admin/orders", label: "Užsakymai", icon: "🧾" },
  { href: "/admin/users", label: "Vartotojai", icon: "👥" },
  { href: "/admin/settings", label: "Nustatymai", icon: "⚙️" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-[110rem] px-4 py-8 sm:px-6">
      <div className="rounded-3xl border border-amber-400/20 bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-600/10 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-300">
              👑 Administratoriaus panelė
            </p>
            <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">{settings.siteName}</h1>
            <p className="text-sm text-slate-400">
              Prisijungęs kaip <strong className="text-white">{admin.username}</strong>
              {admin.viaCode ? " (per panelės kodą)" : ""} · Discord kontaktas: {settings.discord}
            </p>
            <p className="mt-1 text-xs text-emerald-300">
              ✓ Pilni leidimai: prekių įkėlimas, redagavimas, trynimas, nuolaidos, sandėlis,
              užsakymai, vartotojai ir nustatymai
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <LiveClock />
            <Link
              href="/admin/products/new"
              className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/25"
            >
              ➕ Įkelti prekę
            </Link>
            <Link
              href="/"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Į svetainę →
            </Link>
            <form action={lockPanelAction}>
              <button
                type="submit"
                className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-200 hover:bg-rose-500/20"
              >
                🔒 Užrakinti
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[15rem_1fr]">
        <nav className="h-fit rounded-3xl border border-white/10 bg-white/[0.03] p-3">
          <ul className="flex flex-row gap-1 overflow-x-auto lg:flex-col">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
