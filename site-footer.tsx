import Link from "next/link";

import { LiveClock } from "@/components/live-clock";

export function SiteFooter({
  siteName,
  discord,
  supportHours,
}: {
  siteName: string;
  discord: string;
  supportHours: string;
}) {
  return (
    <footer className="mt-20 border-t border-white/10 bg-slate-950">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 text-lg">
              ❄️
            </span>
            <span className="text-lg font-bold text-white">{siteName}</span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-400">
            Patikima skaitmeninių prekių parduotuvė. Visos prekės pristatomos rankiniu būdu per
            Discord — greitai, saugiai ir be tarpininkų.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Nuorodos</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li><Link className="hover:text-white" href="/products">Visos prekės</Link></li>
            <li><Link className="hover:text-white" href="/cart">Krepšelis</Link></li>
            <li><Link className="hover:text-white" href="/profile">Mano profilis</Link></li>
            <li><Link className="hover:text-white" href="/contact">Kontaktai</Link></li>
            <li>
              <Link className="text-amber-300/80 hover:text-amber-200" href="/admin-login">
                👑 Admin panelė
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
            Kontaktas
          </h3>
          <div className="mt-3 rounded-2xl border border-indigo-400/30 bg-indigo-500/10 p-4">
            <p className="text-sm text-indigo-100">
              Savininko Discord: <strong className="text-white">{discord}</strong>
            </p>
            <p className="mt-1 text-xs text-indigo-200/80">
              Norint įsigyti prekę, būtina susisiekti per Discord.
            </p>
            <p className="mt-2 text-xs text-slate-400">Darbo laikas: {supportHours}</p>
          </div>
          <div className="mt-4">
            <LiveClock />
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {siteName}. Visos teisės saugomos. · Discord: {discord}
      </div>
    </footer>
  );
}
