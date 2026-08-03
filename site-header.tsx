"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { logoutAction } from "@/app/actions/auth";
import { useCart } from "@/components/cart-provider";
import { LiveClock } from "@/components/live-clock";
import { SideDrawer, type DrawerUser } from "@/components/side-drawer";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Pradžia" },
  { href: "/products", label: "Prekės" },
  { href: "/contact", label: "Kontaktai" },
];

export function SiteHeader({
  user,
  isAdmin,
  siteName,
  discord,
  announcement,
}: {
  user: DrawerUser;
  isAdmin: boolean;
  siteName: string;
  discord: string;
  announcement: string;
}) {
  const pathname = usePathname();
  const { count } = useCart();

  const navLink = (href: string, label: string) => {
    const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return (
      <Link
        key={href}
        href={href}
        className={cn(
          "rounded-lg px-3 py-2 text-sm font-medium transition",
          active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white",
        )}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      {announcement ? (
        <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 px-4 py-1.5 text-center text-xs font-medium text-white sm:text-sm">
          {announcement}
        </div>
      ) : null}

      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
        {/* ☰ Šoninis meniu — visada matomas */}
        <SideDrawer user={user} isAdmin={isAdmin} siteName={siteName} discord={discord} />

        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 text-lg shadow-lg shadow-indigo-500/30">
            ❄️
          </span>
          <span className="text-lg font-bold tracking-tight text-white">{siteName}</span>
        </Link>

        <nav className="ml-3 hidden items-center gap-1 lg:flex">
          {links.map((link) => navLink(link.href, link.label))}
          {isAdmin ? (
            <Link
              href="/admin"
              className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/20"
            >
              👑 Admin panelė
            </Link>
          ) : null}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden xl:block">
            <LiveClock compact />
          </span>

          <span className="hidden items-center gap-1.5 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-200 sm:inline-flex">
            <span aria-hidden>💬</span> Discord: {discord}
          </span>

          <Link
            href="/cart"
            className="relative rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10"
            aria-label="Krepšelis"
          >
            🛒
            {count > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[11px] font-bold text-white">
                {count}
              </span>
            ) : null}
          </Link>

          {user ? (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href="/profile"
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              >
                {user.username}
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-xl px-3 py-2 text-sm font-medium text-slate-300 transition hover:text-white"
                >
                  Atsijungti
                </button>
              </form>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href="/login"
                className="rounded-xl px-3 py-2 text-sm font-medium text-slate-200 transition hover:text-white"
              >
                Prisijungti
              </Link>
              <Link
                href="/signup"
                className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:opacity-90"
              >
                Registruotis
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
