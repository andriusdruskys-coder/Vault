import Link from "next/link";

import { LiveClock } from "@/components/live-clock";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-600/20 via-slate-900 to-sky-600/10 p-8 text-center">
        <span className="text-5xl">💬</span>
        <h1 className="mt-4 text-3xl font-black text-white sm:text-4xl">Susisiek su savininku</h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-300">
          Visos prekės {settings.siteName} parduotuvėje įsigyjamos susisiekus per Discord. Pateik
          užsakymą svetainėje ir parašyk savininkui — atsakysime kuo greičiau.
        </p>
        <div className="mx-auto mt-6 inline-flex flex-col items-center gap-2 rounded-3xl border border-indigo-400/40 bg-indigo-500/15 px-8 py-5">
          <span className="text-xs uppercase tracking-widest text-indigo-200">Discord kontaktas</span>
          <span className="text-3xl font-black text-white">{settings.discord}</span>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { icon: "🕒", title: "Darbo laikas", text: settings.supportHours },
          { icon: "⚡", title: "Atsakymo laikas", text: "Vidutiniškai 5–30 minučių darbo metu" },
          { icon: "🛡️", title: "Saugumas", text: "Jokių išankstinių mokėjimų be patvirtinimo" },
        ].map((item) => (
          <div key={item.title} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <span className="text-3xl">{item.icon}</span>
            <h2 className="mt-3 font-bold text-white">{item.title}</h2>
            <p className="mt-1 text-sm text-slate-400">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-lg font-bold text-white">Dabartinis laikas</h2>
          <p className="mt-1 text-sm text-slate-400">
            Prieš rašydamas patikrink, ar esame prisijungę.
          </p>
          <div className="mt-4">
            <LiveClock />
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-lg font-bold text-white">Pasiruošęs pirkti?</h2>
          <p className="mt-1 text-sm text-slate-400">
            Peržiūrėk katalogą ir pateik užsakymą — tai užtruks mažiau nei minutę.
          </p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-6 py-3 text-sm font-bold text-white"
          >
            Peržiūrėti prekes →
          </Link>
        </div>
      </div>
    </div>
  );
}
