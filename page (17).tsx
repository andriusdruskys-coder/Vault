import Link from "next/link";
import { redirect } from "next/navigation";

import { SignupForm } from "@/components/auth-forms";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/profile");

  const params = await searchParams;
  const settings = await getSettings();
  const next = params.next && params.next.startsWith("/") ? params.next : "";

  return (
    <div className="glow-grid">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <div className="hidden lg:block">
          <h1 className="text-4xl font-black text-white">Nemokama registracija</h1>
          <p className="mt-4 max-w-md text-slate-300">
            Susikurk paskyrą per 30 sekundžių — jokių mokesčių, jokių įsipareigojimų. Pateik
            užsakymą ir susisiek su savininku per Discord.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-slate-300">
            {[
              "Visa užsakymų istorija vienoje vietoje",
              "Greitesnis pakartotinis užsakymas",
              "Informacija apie nuolaidas ir likučius",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> {item}
              </li>
            ))}
          </ul>
          <div className="mt-8 rounded-3xl border border-indigo-400/30 bg-indigo-500/10 p-5">
            <p className="text-sm font-semibold text-white">💬 Savininko Discord: {settings.discord}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-2xl sm:p-9">
          <h2 className="text-2xl font-bold text-white">Sukurti paskyrą</h2>
          <p className="mt-1 text-sm text-slate-400">Registracija visiškai nemokama.</p>
          <div className="mt-6">
            <SignupForm next={next} />
          </div>
          <p className="mt-6 text-center text-xs text-slate-500">
            Grįžti į{" "}
            <Link href="/" className="text-slate-300 hover:text-white">
              pagrindinį puslapį
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
