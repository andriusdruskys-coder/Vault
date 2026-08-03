"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

import { lockPanelAction, unlockPanelAction, type PanelState } from "@/app/actions/admin-access";
import { logoutAction } from "@/app/actions/auth";
import { useCart } from "@/components/cart-provider";
import { LiveClock } from "@/components/live-clock";
import { cn } from "@/lib/utils";

export type DrawerUser = { id: number; username: string; email: string; role: string } | null;

const shopLinks = [
  { href: "/", label: "Pradžia", icon: "🏠" },
  { href: "/products", label: "Prekės", icon: "🛍️" },
  { href: "/cart", label: "Krepšelis", icon: "🛒" },
  { href: "/contact", label: "Kontaktai", icon: "💬" },
];

const adminLinks = [
  { href: "/admin", label: "Apžvalga", icon: "📊", hint: "Statistika ir sandėlis" },
  { href: "/admin/products/new", label: "Įkelti prekę", icon: "➕", hint: "Nauja prekė" },
  { href: "/admin/products", label: "Prekės", icon: "📦", hint: "Redaguoti, trinti, nuolaidos" },
  { href: "/admin/categories", label: "Kategorijos", icon: "🏷️", hint: "Grupuoti prekes" },
  { href: "/admin/orders", label: "Užsakymai", icon: "🧾", hint: "Būsenos ir istorija" },
  { href: "/admin/users", label: "Vartotojai", icon: "👥", hint: "Teisės ir paskyros" },
  { href: "/admin/settings", label: "Nustatymai", icon: "⚙️", hint: "Discord, tekstai" },
];

function UnlockForm({ onDone }: { onDone: () => void }) {
  const [state, formAction] = useActionState<PanelState, FormData>(unlockPanelAction, {});
  const [show, setShow] = useState(false);

  return (
    <form action={formAction} className="mt-3 space-y-2" onSubmit={() => onDone()}>
      <input type="hidden" name="next" value="/admin" />
      <label className="block text-xs font-semibold uppercase tracking-wide text-amber-200">
        Panelės prisijungimo kodas
      </label>
      <div className="relative">
        <input
          name="code"
          type={show ? "text" : "password"}
          autoComplete="off"
          placeholder="Įvesk kodą..."
          className="w-full rounded-xl border border-amber-400/30 bg-slate-950/80 px-3 py-2.5 pr-16 font-mono text-sm text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setShow((value) => !value)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-slate-400 hover:text-white"
        >
          {show ? "🙈" : "👁️"}
        </button>
      </div>
      {state.error ? (
        <p className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:opacity-90"
      >
        🔓 Atrakinti admin panelę
      </button>
      <p className="text-[11px] leading-relaxed text-slate-500">
        Kodą žino tik svetainės savininkas. Atrakinus gausi visus leidimus: prekių įkėlimą,
        redagavimą, nuolaidas, sandėlio ir užsakymų valdymą.
      </p>
    </form>
  );
}

export function SideDrawer({
  user,
  isAdmin,
  siteName,
  discord,
}: {
  user: DrawerUser;
  isAdmin: boolean;
  siteName: string;
  discord: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { count } = useCart();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Atidaryti meniu"
        aria-expanded={open}
        className="group flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-[5px] rounded-xl border border-white/10 bg-white/5 transition hover:border-indigo-400/50 hover:bg-white/10"
      >
        <span className="h-0.5 w-5 rounded-full bg-slate-200 transition group-hover:bg-white" />
        <span className="h-0.5 w-5 rounded-full bg-slate-200 transition group-hover:bg-white" />
        <span className="h-0.5 w-5 rounded-full bg-slate-200 transition group-hover:bg-white" />
      </button>

      {/* Backdrop */}
      <div
        onClick={close}
        aria-hidden
        className={cn(
          "fixed inset-0 z-[60] bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-[70] flex w-[19rem] max-w-[86vw] flex-col border-r border-white/10 bg-slate-950 shadow-2xl transition-transform duration-300 ease-out sm:w-[21rem]",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <Link href="/" onClick={close} className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 text-lg">
              ❄️
            </span>
            <span className="text-base font-bold text-white">{siteName}</span>
          </Link>
          <button
            type="button"
            onClick={close}
            aria-label="Uždaryti meniu"
            className="rounded-lg px-2.5 py-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
          <LiveClock />

          {/* Vartotojas */}
          {user ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 text-lg font-black text-white">
                  {user.username.slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">{user.username}</p>
                  <p className="truncate text-xs text-slate-400">{user.email}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Link
                  href="/profile"
                  onClick={close}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-xs font-semibold text-white hover:bg-white/10"
                >
                  Profilis
                </Link>
                <form action={logoutAction} className="flex-1">
                  <button
                    type="submit"
                    className="w-full rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-500/20"
                  >
                    Atsijungti
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={close}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-white/10"
              >
                Prisijungti
              </Link>
              <Link
                href="/signup"
                onClick={close}
                className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-3 py-2.5 text-center text-sm font-semibold text-white"
              >
                Registruotis
              </Link>
            </div>
          )}

          {/* Parduotuvės nuorodos */}
          <nav>
            <p className="px-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Parduotuvė
            </p>
            <ul className="mt-2 space-y-1">
              {shopLinks.map((link) => {
                const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={close}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                        active
                          ? "bg-indigo-500/20 text-white"
                          : "text-slate-300 hover:bg-white/5 hover:text-white",
                      )}
                    >
                      <span>{link.icon}</span>
                      {link.label}
                      {link.href === "/cart" && count > 0 ? (
                        <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[11px] font-bold text-white">
                          {count}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* ADMIN PANELĖ */}
          <section className="rounded-2xl border border-amber-400/25 bg-gradient-to-b from-amber-500/10 to-slate-950 p-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-widest text-amber-300">
                👑 Admin panelė
              </p>
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[10px] font-bold",
                  isAdmin
                    ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-300"
                    : "border-slate-500/40 bg-slate-500/10 text-slate-400",
                )}
              >
                {isAdmin ? "ATRAKINTA" : "UŽRAKINTA"}
              </span>
            </div>

            {isAdmin ? (
              <>
                <ul className="mt-3 space-y-1">
                  {adminLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={close}
                        className="flex items-start gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
                      >
                        <span className="mt-0.5">{link.icon}</span>
                        <span className="min-w-0">
                          <span className="block">{link.label}</span>
                          <span className="block text-[11px] text-slate-500">{link.hint}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <form action={lockPanelAction} className="mt-3">
                  <button
                    type="submit"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white"
                  >
                    🔒 Užrakinti panelę
                  </button>
                </form>
              </>
            ) : (
              <UnlockForm onDone={close} />
            )}
          </section>

          <div className="rounded-2xl border border-indigo-400/25 bg-indigo-500/10 p-4">
            <p className="text-xs font-semibold text-white">💬 Savininko Discord</p>
            <p className="mt-1 text-lg font-black text-indigo-200">{discord}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-indigo-200/80">
              Norint įsigyti prekę, būtina susisiekti per Discord.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
